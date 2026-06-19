import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	Collections,
	type SessionPerformanceResponse,
	type SessionResponse,
	type UsersResponse
} from '$lib';

export const load: PageServerLoad = async ({ locals, params }) => {
	try {
		const session = await locals.pb
			.collection(Collections.Session)
			.getOne<SessionResponse>(params.id);

		// Fetch performance records and expand the user (relation2)
		const performances = await locals.pb
			.collection(Collections.SessionPerformance)
			.getFullList<SessionPerformanceResponse<{ relation2: UsersResponse }>>({
				filter: `relation = "${params.id}"`,
				expand: 'relation2'
			});

		// Calculate net winnings and sort by Net Chips descending
		const leaderboard = performances
			.map((p) => {
				const buy_in_count = p.buy_in_count || 0;
				const ending_stack = p.ending_stack || 0;
				const total_buy_in_chips = buy_in_count * (session.chip_buy_in_amount || 0);

				const net_chips = ending_stack - total_buy_in_chips;
				const net_dollars = net_chips * (session.dollar_multiplier || 0);

				return {
					...p,
					net_chips,
					net_dollars
				};
			})
			.sort((a, b) => b.net_chips - a.net_chips);

		// Fetch chip denominations for the calculator
		const chips = await locals.pb.collection(Collections.ChipCollection).getFullList({
			sort: 'denomination'
		});

		return { session, leaderboard, chips };
	} catch (err) {
		console.error('Fetch Session Detail Error:', err);
		// Throw the actual error status if available, otherwise default to 500
		const status = err && typeof err === 'object' && 'status' in err ? Number(err.status) : 500;
		const message = err instanceof Error ? err.message : 'Session not found';
		error(status || 500, message);
	}
};

export const actions: Actions = {
	toggleActive: async ({ locals, params }) => {
		if (!locals.user?.admin) {
			return fail(403, { message: 'Only admins can change session status.' });
		}

		try {
			const session = await locals.pb
				.collection(Collections.Session)
				.getOne<SessionResponse>(params.id);
			await locals.pb.collection(Collections.Session).update(params.id, {
				active: !session.active
			});
			return { success: true };
		} catch (err) {
			console.error('Toggle Active Error:', err);
			return fail(500, { message: 'Failed to update session status' });
		}
	},
	adjustBuyIn: async ({ locals, request }) => {
		const formData = await request.formData();
		const performanceId = formData.get('performanceId') as string;
		const delta = parseInt(formData.get('delta') as string);

		try {
			const perf = await locals.pb
				.collection(Collections.SessionPerformance)
				.getOne<SessionPerformanceResponse>(performanceId);

			// Optional: verify session is still active
			const session = await locals.pb
				.collection(Collections.Session)
				.getOne<SessionResponse>(perf.relation);
			if (!session.active) return fail(400, { message: 'Session is inactive' });

			const newCount = Math.max(0, (perf.buy_in_count || 0) + delta);
			await locals.pb.collection(Collections.SessionPerformance).update(performanceId, {
				buy_in_count: newCount
			});

			return { success: true };
		} catch (err) {
			console.error('Adjust Buy-In Error:', err);
			return fail(500, { message: 'Failed to update buy-in count' });
		}
	},
	updateStack: async ({ locals, request }) => {
		if (!locals.user?.admin) {
			return fail(403, { message: 'Only admins can update ending stacks.' });
		}

		const formData = await request.formData();
		const performanceId = formData.get('performanceId') as string;
		const endingStack = parseInt(formData.get('endingStack') as string);

		try {
			await locals.pb.collection(Collections.SessionPerformance).update(performanceId, {
				ending_stack: endingStack
			});
			return { success: true };
		} catch (err) {
			console.error('Update Stack Error:', err);
			return fail(500, { message: 'Failed to update ending stack' });
		}
	}
};
