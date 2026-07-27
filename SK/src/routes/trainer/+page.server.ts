import type { PageServerLoad } from './$types';
import { dealHand } from '$lib/trainer/cards';
import { makeQuestion, SCENARIOS } from '$lib/trainer/ranges';
import { loadUserStrategy } from '$lib/server/trainer-strategy';
import { applyRangeOverrides } from '$lib/trainer/strategy';

export const load: PageServerLoad = async ({ locals }) => {
	const strategy = await loadUserStrategy(locals.pb, locals.user!.id);
	const scenarios = applyRangeOverrides(SCENARIOS, strategy.overrides);
	const startingScenarios = scenarios.filter(
		(scenario) => scenario.type === 'Open' || scenario.type === 'Facing open'
	);
	const question = makeQuestion(startingScenarios);

	return {
		scenarioId: question.scenario.id,
		hand: question.hand,
		cards: dealHand(question.hand),
		strategy: strategy.pack ? { name: strategy.pack.name, version: strategy.pack.version } : null,
		rangeOverrides: strategy.overrides
	};
};
