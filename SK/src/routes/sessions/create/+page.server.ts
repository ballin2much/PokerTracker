import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Collections } from '$lib/pocketbase-types';

export const load: PageServerLoad = async ({ locals }) => {
	const users = await locals.pb.collection(Collections.Users).getFullList({
		sort: 'username'
	});

	return { users };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const formData = await request.formData();

		const date = formData.get('date');
		const BB_amount = formData.get('BB_amount');
		const SB_amount = formData.get('SB_amount');
		const chip_buy_in_amount = formData.get('chip_buy_in_amount');
		const dollar_multiplier = formData.get('dollar_multiplier');
		const selectedUsers = formData.getAll('users') as string[];

		if (selectedUsers.length === 0) {
			return fail(400, { message: 'At least one participant must be selected.' });
		}

		try {
			// 1. Create the session
			const session = await locals.pb.collection(Collections.Session).create({
				date,
				BB_amount: Number(BB_amount),
				SB_amount: Number(SB_amount),
				chip_buy_in_amount: Number(chip_buy_in_amount),
				dollar_multiplier: Number(dollar_multiplier)
			});

			// 2. Create session performance records for each user
			const batch = locals.pb.createBatch();
			for (const userId of selectedUsers) {
				batch.collection(Collections.SessionPerformance).create({
					relation: session.id, // Links to Session (per pb_schema.json)
					relation2: userId, // Links to User (per pb_schema.json)
					buy_in_count: 1, // Starting with 1 buy-in
					ending_stack: 0 // Initial stack
				});
			}
			await batch.send();
		} catch (err) {
			console.error('Create Session Error:', err);
			const message = err instanceof Error ? err.message : 'Failed to create session.';
			return fail(400, { message });
		}

		throw redirect(303, '/sessions');
	}
};
