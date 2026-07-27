import type { Card, Suit } from './types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export function dealHand(hand: string): [Card, Card] {
	const firstSuitIndex = Math.floor(Math.random() * SUITS.length);
	const firstSuit = SUITS[firstSuitIndex];
	let secondSuit = firstSuit;

	if (!hand.endsWith('s')) {
		const offset = 1 + Math.floor(Math.random() * (SUITS.length - 1));
		secondSuit = SUITS[(firstSuitIndex + offset) % SUITS.length];
	}

	return [
		{ rank: hand[0], suit: firstSuit },
		{ rank: hand[1], suit: secondSuit }
	];
}
