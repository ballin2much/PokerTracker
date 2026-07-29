import { DEFAULT_ACTIONS } from './default-actions';
import { ACTIONS, type ActionMap, type Position, type Scenario, type TrainerAction } from './types';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

export const ALL_HANDS = RANKS.flatMap((high, highIndex) =>
	RANKS.map((low, lowIndex) => {
		if (highIndex === lowIndex) return `${high}${low}`;
		return highIndex < lowIndex ? `${high}${low}s` : `${low}${high}o`;
	})
);

function expandToken(token: string): string[] {
	if (!token.endsWith('+')) return [token];
	const base = token.slice(0, -1);
	if (base.length === 2 && base[0] === base[1]) {
		const start = RANKS.indexOf(base[0] as (typeof RANKS)[number]);
		return RANKS.slice(0, start + 1).map((rank) => `${rank}${rank}`);
	}

	const suitedness = base.at(-1);
	const high = base[0];
	const low = base[1];
	const highIndex = RANKS.indexOf(high as (typeof RANKS)[number]);
	const lowIndex = RANKS.indexOf(low as (typeof RANKS)[number]);
	if (highIndex < 0 || lowIndex < 0 || highIndex >= lowIndex) return [base];
	return RANKS.slice(highIndex + 1, lowIndex + 1).map((rank) => `${high}${rank}${suitedness}`);
}

function range(value: string): ReadonlySet<string> {
	return new Set(value.split(/\s+/).filter(Boolean).flatMap(expandToken));
}

function pureActions(callValue: string, raiseValue: string): ActionMap {
	const callRange = range(callValue);
	const raiseRange = range(raiseValue);
	return Object.fromEntries(
		ALL_HANDS.map((hand) => [
			hand,
			{
				Fold: callRange.has(hand) || raiseRange.has(hand) ? 0 : 1,
				Call: callRange.has(hand) && !raiseRange.has(hand) ? 1 : 0,
				Raise: raiseRange.has(hand) ? 1 : 0
			}
		])
	);
}

const openScenarios: Scenario[] = (['UTG', 'HJ', 'CO', 'BTN', 'SB'] as Position[]).map((hero) => ({
	id: `open-${hero.toLowerCase()}`,
	label: `${hero} first in`,
	type: 'Open',
	hero,
	pot:
		hero === 'UTG'
			? 'You are first to act · 100bb'
			: hero === 'HJ'
				? 'UTG folds · 100bb'
				: hero === 'CO'
					? 'UTG and HJ fold · 100bb'
					: hero === 'BTN'
						? 'UTG, HJ and CO fold · 100bb'
						: 'UTG, HJ, CO and BTN fold · 100bb',
	raiseLabel: hero === 'SB' ? 'Raise to 3.5bb' : 'Raise to 2.5bb',
	callLabel: hero === 'SB' ? 'Limp 0.5bb' : 'Call',
	actions: DEFAULT_ACTIONS[`open-${hero.toLowerCase()}`]
}));

const facingOpenSpots: ReadonlyArray<readonly [Position, Position]> = [
	['HJ', 'UTG'],
	['CO', 'UTG'],
	['CO', 'HJ'],
	['BTN', 'UTG'],
	['BTN', 'HJ'],
	['BTN', 'CO'],
	['SB', 'UTG'],
	['SB', 'HJ'],
	['SB', 'CO'],
	['SB', 'BTN'],
	['BB', 'UTG'],
	['BB', 'HJ'],
	['BB', 'CO'],
	['BB', 'BTN'],
	['BB', 'SB']
];

const facingOpenScenarios: Scenario[] = facingOpenSpots.map(([hero, villain]) => {
	const spotKey = `facing-open-${hero.toLowerCase()}-${villain.toLowerCase()}`;
	return {
		id: spotKey,
		label: `${hero} vs ${villain} open`,
		type: 'Facing open',
		hero,
		villain,
		pot: `${villain} raises to ${villain === 'SB' ? '3.5bb' : '2.5bb'} · 100bb`,
		callLabel:
			hero === 'SB'
				? 'Call 2bb'
				: hero === 'BB'
					? `Call ${villain === 'SB' ? '2.5bb' : '1.5bb'}`
					: 'Call 2.5bb',
		raiseLabel:
			hero === 'SB' || (hero === 'BB' && villain !== 'SB')
				? '3-bet to 10bb'
				: hero === 'BB' && villain === 'SB'
					? '3-bet to 10.5bb'
					: '3-bet to 9bb',
		actions: DEFAULT_ACTIONS[spotKey]
	};
});

const facingLimpScenarios: Scenario[] = [
	{
		id: 'facing-limp-bb-sb',
		label: 'BB vs SB limp',
		type: 'Facing limp',
		hero: 'BB',
		villain: 'SB',
		pot: 'SB limps to 1bb · 100bb',
		callLabel: 'Check',
		raiseLabel: 'Raise to 3.5bb',
		actions: DEFAULT_ACTIONS['facing-limp-bb-sb']
	}
];

const postflopPressure: Scenario[] = [
	{
		id: 'utg-v-btn-3bet',
		label: 'UTG vs BTN 3-bet',
		type: 'Facing 3-bet',
		hero: 'UTG',
		villain: 'BTN',
		pot: 'You open 2.5bb · BTN 3-bets to 8bb',
		callLabel: 'Call 5.5bb',
		raiseLabel: '4-bet to 20bb',
		actions: pureActions('99+ AQs+ AKo', 'QQ+ AKs AKo')
	},
	{
		id: 'hj-v-btn-3bet',
		label: 'HJ vs BTN 3-bet',
		type: 'Facing 3-bet',
		hero: 'HJ',
		villain: 'BTN',
		pot: 'You open 2.5bb · BTN 3-bets to 8bb',
		callLabel: 'Call 5.5bb',
		raiseLabel: '4-bet to 20bb',
		actions: pureActions('88+ AJs+ KQs AQo+', 'QQ+ AKs AKo A5s')
	},
	{
		id: 'btn-v-sb-3bet',
		label: 'BTN vs SB 3-bet',
		type: 'Facing 3-bet',
		hero: 'BTN',
		villain: 'SB',
		pot: 'You open 2.5bb · SB 3-bets to 10bb',
		callLabel: 'Call 7.5bb',
		raiseLabel: '4-bet to 22bb',
		actions: pureActions('77+ ATs+ KJs+ QJs JTs T9s AJo+ KQo', 'QQ+ AKs AKo A5s')
	},
	{
		id: 'co-v-btn-3bet',
		label: 'CO vs BTN 3-bet',
		type: 'Facing 3-bet',
		hero: 'CO',
		villain: 'BTN',
		pot: 'You open 2.5bb · BTN 3-bets to 8bb',
		callLabel: 'Call 5.5bb',
		raiseLabel: '4-bet to 20bb',
		actions: pureActions('88+ AJs+ KQs AQo', 'QQ+ AKs AKo A5s')
	},
	{
		id: 'sb-v-bb-3bet',
		label: 'SB vs BB 3-bet',
		type: 'Facing 3-bet',
		hero: 'SB',
		villain: 'BB',
		pot: 'You open 3.5bb · BB 3-bets to 10.5bb',
		callLabel: 'Call 7bb',
		raiseLabel: '4-bet to 22bb',
		actions: pureActions('77+ ATs+ KJs+ QJs JTs T9s AJo+ KQo', 'QQ+ AKs AKo A5s')
	},
	{
		id: 'sb-v-btn-4bet',
		label: 'SB vs BTN 4-bet',
		type: 'Facing 4-bet',
		hero: 'SB',
		villain: 'BTN',
		pot: 'BTN opens · You 3-bet · BTN 4-bets to 22bb',
		callLabel: 'Call 12bb',
		raiseLabel: '5-bet all-in',
		actions: pureActions('JJ QQ AKs AKo', 'KK AA')
	}
];

export const STARTING_SCENARIOS = [
	...openScenarios,
	...facingOpenScenarios,
	...facingLimpScenarios
];
export const SCENARIOS = [...STARTING_SCENARIOS, ...postflopPressure];

export function getAction(scenario: Scenario, hand: string): TrainerAction {
	const mix = scenario.actions[hand];
	return ACTIONS.reduce((best, action) => (mix[action] > mix[best] ? action : best), 'Fold');
}

export function makeQuestion(scenarios: Scenario[], previous?: string) {
	const eligible = scenarios.length ? scenarios : STARTING_SCENARIOS;
	let scenario = eligible[Math.floor(Math.random() * eligible.length)];
	let hand = ALL_HANDS[Math.floor(Math.random() * ALL_HANDS.length)];
	for (let attempts = 0; attempts < 8 && `${scenario.id}:${hand}` === previous; attempts += 1) {
		scenario = eligible[Math.floor(Math.random() * eligible.length)];
		hand = ALL_HANDS[Math.floor(Math.random() * ALL_HANDS.length)];
	}
	return { scenario, hand, answer: getAction(scenario, hand) };
}

export function makeContinuation(
	scenario: Scenario,
	chosenAction: TrainerAction,
	hand: string,
	strategyScenarios: Scenario[] = SCENARIOS
) {
	if (chosenAction === 'Fold') return null;

	let candidates: Scenario[] = [];
	if (scenario.type === 'Open' && chosenAction === 'Raise') {
		candidates = strategyScenarios.filter(
			(candidate) => candidate.type === 'Facing 3-bet' && candidate.hero === scenario.hero
		);
	} else if (scenario.type === 'Facing open' && chosenAction === 'Raise') {
		candidates = strategyScenarios.filter(
			(candidate) =>
				candidate.type === 'Facing 4-bet' &&
				candidate.hero === scenario.hero &&
				candidate.villain === scenario.villain
		);
	}

	// Continuing ranges appear often enough to practice while still allowing
	// hands to end without another raise, as they would at a real table.
	if (candidates.length === 0 || Math.random() >= 0.5) return null;
	const nextScenario = candidates[Math.floor(Math.random() * candidates.length)];
	return { scenario: nextScenario, hand, answer: getAction(nextScenario, hand) };
}
