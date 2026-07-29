export const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const;
export const ACTIONS = ['Fold', 'Call', 'Raise'] as const;

export type Position = (typeof POSITIONS)[number];
export type TrainerAction = (typeof ACTIONS)[number];
export type SpotType = 'Open' | 'Facing open' | 'Facing limp' | 'Facing 3-bet' | 'Facing 4-bet';
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Card = { rank: string; suit: Suit };

export type ActionMix = {
	Fold: number;
	Call: number;
	Raise: number;
};

export type ActionMap = Record<string, ActionMix>;

export type Scenario = {
	id: string;
	label: string;
	type: SpotType;
	hero: Position;
	villain?: Position;
	pot: string;
	callLabel: string;
	raiseLabel: string;
	actions: ActionMap;
};

export type Question = {
	scenario: Scenario;
	hand: string;
	answer: TrainerAction;
};
