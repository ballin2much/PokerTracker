import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { SCENARIOS } from '$lib/trainer/ranges';
import {
	loadUserStrategy,
	resetAllScenarioRanges,
	resetScenarioRange,
	saveScenarioRange
} from '$lib/server/trainer-strategy';
import { parseActionMap } from '$lib/trainer/strategy';

function requireUser(user: App.Locals['user']) {
	if (!user) redirect(303, '/login');
	return user;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals.user);
	const strategy = await loadUserStrategy(locals.pb, user.id);
	return {
		pack: strategy.pack
			? {
					id: strategy.pack.id,
					name: strategy.pack.name,
					version: strategy.pack.version,
					description: strategy.pack.description
				}
			: null,
		overrides: strategy.overrides
	};
};

export const actions: Actions = {
	save: async ({ locals, request }) => {
		const user = requireUser(locals.user);
		const formData = await request.formData();
		const spotKey = String(formData.get('spotKey') ?? '');
		const scenario = SCENARIOS.find((candidate) => candidate.id === spotKey);
		if (!scenario) return fail(400, { message: 'Unknown preflop spot.' });

		let rawActions: unknown;
		try {
			rawActions = JSON.parse(String(formData.get('actions') ?? ''));
		} catch {
			return fail(400, { message: 'The submitted range is not valid JSON.' });
		}
		const actions = parseActionMap(rawActions);
		if (!actions) {
			return fail(400, { message: 'Every hand must have valid action frequencies totaling 100%.' });
		}

		try {
			const pack = await saveScenarioRange(locals.pb, user.id, scenario, actions);
			return {
				success: true,
				message: `${scenario.label} saved to ${pack.name} v${pack.version}.`
			};
		} catch (error) {
			console.error('Save preflop range error:', error);
			return fail(500, {
				message: 'Unable to save the range. Confirm the PocketBase migration has been applied.'
			});
		}
	},
	resetSpot: async ({ locals, request }) => {
		const user = requireUser(locals.user);
		const formData = await request.formData();
		const spotKey = String(formData.get('spotKey') ?? '');
		const scenario = SCENARIOS.find((candidate) => candidate.id === spotKey);
		if (!scenario) return fail(400, { message: 'Unknown preflop spot.' });

		try {
			await resetScenarioRange(locals.pb, user.id, spotKey);
			return {
				success: true,
				message: `${scenario.label} reset to the bundled default.`
			};
		} catch (error) {
			console.error('Reset preflop range error:', error);
			return fail(500, { message: 'Unable to reset this range.' });
		}
	},
	resetAll: async ({ locals }) => {
		const user = requireUser(locals.user);
		try {
			await resetAllScenarioRanges(locals.pb, user.id);
			return {
				success: true,
				message: 'All preflop spots reset to the bundled defaults.'
			};
		} catch (error) {
			console.error('Reset all preflop ranges error:', error);
			return fail(500, { message: 'Unable to reset all ranges.' });
		}
	}
};
