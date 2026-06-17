import type { PageServerLoad } from './$types';
import { Collections } from '$lib/pocketbase-types';

export const load: PageServerLoad = async ({ locals }) => {
	// Using 'Session' as defined in pb_schema.json
	const sessions = await locals.pb.collection(Collections.Session).getFullList({
		sort: '-date'
	});

	return {
		sessions: sessions
	};
};
