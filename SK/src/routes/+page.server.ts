import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	Collections,
	TransactionsSelectOptions,
	type SessionPerformanceResponse,
	type SessionResponse,
	type TransactionsResponse,
	type UsersResponse
} from '$lib';

export const load = (async ({ locals }) => {
	// 1. Fetch all users
	// 2. Fetch all session performances and expand the related session (parallelizing for speed)
	// 3. Fetch all transactions (deposits/withdrawals)
	const [users, performances, transactions] = await Promise.all([
		locals.pb.collection(Collections.Users).getFullList<UsersResponse>(),
		locals.pb
			.collection(Collections.SessionPerformance)
			.getFullList<SessionPerformanceResponse<{ session: SessionResponse }>>({
				expand: 'session'
			}),
		locals.pb.collection(Collections.Transactions).getFullList<TransactionsResponse>()
	]);

	// Group performances by user ID to optimize calculation from O(N*M) to O(N+M)
	const perfsByUserId = performances.reduce(
		(acc, p) => {
			if (!p.user) return acc;
			if (!acc[p.user]) acc[p.user] = [];
			acc[p.user].push(p);
			return acc;
		},
		{} as Record<string, typeof performances>
	);

	// Group transactions by user ID
	const transactionsByUserId = transactions.reduce(
		(acc, t) => {
			if (!t.user) return acc;
			if (!acc[t.user]) acc[t.user] = [];
			acc[t.user].push(t);
			return acc;
		},
		{} as Record<string, typeof transactions>
	);

	// 4. Calculate career stats for each user
	const usersWithStats = users.map((user) => {
		let career_buy_in_dollars = Number(user.beginning_buy_in_dollars || 0);
		let total_ending_stack_dollars = 0;

		const userPerformances = perfsByUserId[user.id] || [];

		for (const p of userPerformances) {
			const session = p.expand?.session;

			// Only count stats from sessions that are no longer active
			if (session && !session.active) {
				career_buy_in_dollars +=
					(p.buy_in_count || 0) *
					(session.chip_buy_in_amount || 0) *
					(session.dollar_multiplier || 0);
				total_ending_stack_dollars += (p.ending_stack || 0) * (session.dollar_multiplier || 0);
			}
		}

		const career_earnings =
			Number(user.beginning_earnings || 0) + total_ending_stack_dollars - career_buy_in_dollars;

		// Deposits/withdrawals = beginning balance from the user record plus any
		// matching transactions logged against them
		const userTransactions = transactionsByUserId[user.id] || [];
		const total_deposits =
			Number(user.beginning_deposits || 0) +
			userTransactions
				.filter((t) => t.select === TransactionsSelectOptions.deposit)
				.reduce((sum, t) => sum + (t.amount || 0), 0);
		const total_withdrawals =
			Number(user.beginning_withdrawals || 0) +
			userTransactions
				.filter((t) => t.select === TransactionsSelectOptions.withdrawal)
				.reduce((sum, t) => sum + (t.amount || 0), 0);

		// Positive = the bank owes the player money; negative = the player owes the bank
		const money_owed_due = career_earnings + total_deposits - total_withdrawals;

		return {
			...user,
			career_buy_in_dollars,
			career_earnings,
			total_deposits,
			total_withdrawals,
			money_owed_due
		};
	});

	// 5. Sort by career earnings (net profit) descending
	usersWithStats.sort((a, b) => b.career_earnings - a.career_earnings);

	return {
		user: locals.user,
		users: usersWithStats
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async ({ locals }) => {
		locals.pb.authStore.clear();
		redirect(303, '/login');
	},
	addTransaction: async ({ locals, request }) => {
		if (!locals.user?.admin) {
			return fail(403, { message: 'Only admins can add transactions.' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const type = formData.get('type') as string;
		const amount = Number(formData.get('amount'));

		if (
			!userId ||
			(type !== TransactionsSelectOptions.deposit &&
				type !== TransactionsSelectOptions.withdrawal) ||
			!amount ||
			amount <= 0
		) {
			return fail(400, { message: 'Please select a player, a type, and a positive amount.' });
		}

		try {
			await locals.pb.collection(Collections.Transactions).create({
				user: userId,
				select: type,
				amount
			});
		} catch (err) {
			console.error('Add Transaction Error:', err);
			const message = err instanceof Error ? err.message : 'Failed to add transaction.';
			return fail(400, { message });
		}

		return { success: true };
	},
	addPlayer: async ({ locals, request }) => {
		if (!locals.user?.admin) {
			return fail(403, { message: 'Only admins can add players.' });
		}

		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		const passwordConfirm = formData.get('passwordConfirm') as string;
		const admin = formData.get('admin') === 'on';

		if (!username || !password || !passwordConfirm) {
			return fail(400, { message: 'Please fill out all fields.' });
		}

		if (password !== passwordConfirm) {
			return fail(400, { message: 'Passwords do not match.' });
		}

		try {
			await locals.pb.collection(Collections.Users).create({
				username,
				password,
				passwordConfirm,
				admin
			});
		} catch (err) {
			console.error('Add Player Error:', err);
			const message = err instanceof Error ? err.message : 'Failed to add player.';
			return fail(400, { message });
		}

		return { success: true };
	}
};
