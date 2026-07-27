import type { Position, Scenario, TrainerAction } from './types';

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

const openRanges: Record<Position, string> = {
	UTG: '66+ A3s+ K8s+ Q9s+ J9s+ T9s ATo+ KJo+ QJo',
	HJ: '55+ A2s+ K6s+ Q9s+ J9s+ T9s 98s 87s 76s 65s ATo+ KTo+ QTo+',
	CO: '33+ A2s+ K3s+ Q6s+ J8s+ T7s+ 97s+ 87s 76s A8o+ KTo+ QTo+ JTo',
	BTN: '22+ A2s+ K2s+ Q3s+ J4s+ T6s+ 96s+ 85s+ 75s+ 64s+ 53s+ A4o+ K8o+ Q9o+ J9o+ T8o+ 98o',
	SB: 'AKs ATs A9s A8s A7s A5s KK KJs KTs K8s K5s K3s K2s AQo QQ QJs QTs Q5s Q4s Q3s Q2s AJo KJo JJ JTs J7s J6s J5s J4s T9s T6s T5s K9o Q9o J9o 96s A8o K8o T8o 98o A7o K7o A6o 65s 64s 54s 53s A4o 33 22',
	BB: ''
};

const openCallRanges: Record<Position, string> = {
	UTG: '',
	HJ: '',
	CO: '',
	BTN: '',
	SB: 'AA AQs AJs A6s A4s A3s A2s AKo KQs K9s K7s K6s K4s KQo Q9s Q8s Q7s Q6s QJo J9s J8s J3s J2s ATo KTo QTo JTo TT T8s T7s T4s T3s A9o T9o 99 98s 97s 95s 94s Q8o J8o 88 87s 86s 85s 84s Q7o J7o T7o 97o 87o 77 76s 75s 74s K6o Q6o 86o 76o 66 63s A5o K5o Q5o 55 K4o 44 43s A3o A2o',
	BB: ''
};

const threeBetRanges: Record<string, string> = {
	'BTN-v-CO':
		'AA AKs AQs A8s A7s A6s A4s A3s AKo KK KQs K9s KQo QQ QJs Q9s AJo KJo QJo JJ JTs J9s ATo TT 55',
	'SB-v-BTN':
		'AA AKs AQs AJs ATs A9s A8s A7s A5s A4s AKo KK KQs KJs KTs K9s AQo KQo QQ QJs QTs Q9s AJo KJo JJ JTs J9s TT T9s T8s 99 88 77 66 55',
	'BB-v-BTN':
		'AA AKs AQs AJs ATs A6s A5s A4s AKo KK KQs KJs KTs K9s AQo KQo QQ QJs QTs Q9s JJ JTs J9s J8s TT T9s T8s 99 98s 97s 88 87s 76s 65s 54s',
	'BB-v-SB':
		'AA AKs AQs AJs ATs A5s A4s AKo KK KQs KJs KTs AQo QQ QJs JJ J5s TT T5s 99 95s J8o 88 87s J7o T7o 76s A6o K6o Q6o 65s K5o 54s',
	'CO-v-HJ': '88+ A9s+ A5s A4s KTs+ QJs AJo+ KQo',
	'BTN-v-HJ': 'AA AKs AQs A9s A8s A7s A4s A3s AKo KK KTs K9s K8s KQo QQ QTs Q9s AJo JJ T9s 66'
};

const callRanges: Record<string, string> = {
	'BTN-v-CO': 'AJs ATs A9s A5s KJs KTs AQo QTs T9s 99 98s 88 77 66',
	'SB-v-BTN': '',
	'BB-v-BTN':
		'A9s A8s A7s A3s A2s K8s K7s K6s K5s K4s K3s K2s Q8s Q7s Q6s Q5s Q4s Q3s Q2s AJo KJo QJo J7s J6s J5s J4s J3s J2s ATo KTo QTo JTo T7s T6s T5s T4s T3s T2s A9o K9o Q9o J9o T9o 96s 95s 94s A8o K8o Q8o J8o T8o 98o 86s 85s 84s A7o K7o 87o 77 75s 74s 73s A6o K6o 76o 66 64s 63s 62s A5o 65o 55 53s 52s A4o 54o 44 43s 42s A3o 33 32s 22',
	'BB-v-SB':
		'A9s A8s A7s A6s A3s A2s K9s K8s K7s K6s K5s K4s K3s K2s KQo QTs Q9s Q8s Q7s Q6s Q5s Q4s Q3s Q2s AJo KJo QJo JTs J9s J8s J7s J6s J4s J3s J2s ATo KTo QTo JTo T9s T8s T7s T6s T4s T3s T2s A9o K9o Q9o J9o T9o 98s 97s 96s 94s 93s 92s A8o K8o Q8o T8o 98o 86s 85s 84s A7o K7o Q7o 97o 87o 77 75s 74s 73s 86o 76o 66 64s 63s 62s A5o 65o 55 53s 52s A4o 54o 44 43s 42s A3o 33 32s A2o 22',
	'CO-v-HJ': '',
	'BTN-v-HJ': 'AJs ATs A5s KQs KJs AQo QJs JTs TT 99 98s 88 87s 77 55 44'
};

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
	raiseLabel: hero === 'SB' ? 'Raise to 3bb' : 'Raise to 2.5bb',
	callLabel: hero === 'SB' ? 'Limp 0.5bb' : 'Call',
	callRange: range(openCallRanges[hero]),
	raiseRange: range(openRanges[hero])
}));

const facingOpenScenarios: Scenario[] = Object.keys(threeBetRanges).map((key) => {
	const [hero, , villain] = key.split('-') as [Position, string, Position];
	return {
		id: `facing-open-${hero.toLowerCase()}-${villain.toLowerCase()}`,
		label: `${hero} vs ${villain} open`,
		type: 'Facing open',
		hero,
		villain,
		pot: `${villain} raises to ${villain === 'SB' ? '3bb' : '2.5bb'} · 100bb`,
		callLabel:
			hero === 'SB'
				? 'Call 2bb'
				: hero === 'BB'
					? `Call ${villain === 'SB' ? '2bb' : '1.5bb'}`
					: 'Call 2.5bb',
		raiseLabel:
			hero === 'SB' || hero === 'BB'
				? `3-bet to ${villain === 'SB' ? '12bb' : '10bb'}`
				: '3-bet to 9bb',
		callRange: range(callRanges[key]),
		raiseRange: range(threeBetRanges[key])
	};
});

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
		callRange: range('99+ AQs+ AKo'),
		raiseRange: range('QQ+ AKs AKo')
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
		callRange: range('88+ AJs+ KQs AQo+'),
		raiseRange: range('QQ+ AKs AKo A5s')
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
		callRange: range('77+ ATs+ KJs+ QJs JTs T9s AJo+ KQo'),
		raiseRange: range('QQ+ AKs AKo A5s')
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
		callRange: range('88+ AJs+ KQs AQo'),
		raiseRange: range('QQ+ AKs AKo A5s')
	},
	{
		id: 'sb-v-bb-3bet',
		label: 'SB vs BB 3-bet',
		type: 'Facing 3-bet',
		hero: 'SB',
		villain: 'BB',
		pot: 'You open 3bb · BB 3-bets to 10.5bb',
		callLabel: 'Call 7.5bb',
		raiseLabel: '4-bet to 22bb',
		callRange: range('77+ ATs+ KJs+ QJs JTs T9s AJo+ KQo'),
		raiseRange: range('QQ+ AKs AKo A5s')
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
		callRange: range('JJ QQ AKs AKo'),
		raiseRange: range('KK AA')
	}
];

export const STARTING_SCENARIOS = [...openScenarios, ...facingOpenScenarios];
export const SCENARIOS = [...STARTING_SCENARIOS, ...postflopPressure];

export function getAction(scenario: Scenario, hand: string): TrainerAction {
	if (scenario.raiseRange.has(hand)) return 'Raise';
	if (scenario.callRange.has(hand)) return 'Call';
	return 'Fold';
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
