<script lang="ts">
	import type { Card } from '$lib/trainer/types';

	const SUIT_SYMBOLS = {
		spades: '♠',
		hearts: '♥',
		diamonds: '♦',
		clubs: '♣'
	} as const;

	let { card, compact = false }: { card: Card; compact?: boolean } = $props();

	const symbol = $derived(SUIT_SYMBOLS[card.suit]);
	const suitColor = $derived(
		card.suit === 'hearts'
			? 'text-red-600'
			: card.suit === 'diamonds'
				? 'text-blue-600'
				: card.suit === 'clubs'
					? 'text-green-600'
					: 'text-slate-900'
	);
</script>

<div
	class={[
		'playing-card relative flex shrink-0 flex-col rounded-md border border-slate-300 bg-white font-black shadow-lg',
		compact
			? 'h-20 w-14 p-1.5 text-xl sm:h-24 sm:w-16 sm:p-2 sm:text-2xl'
			: 'h-28 w-20 p-2 text-2xl',
		suitColor
	]}
	role="img"
	aria-label={`${card.rank} of ${card.suit}`}
>
	<span class="leading-none">{card.rank}</span>
	<span class="leading-none">{symbol}</span>
	<span
		class="absolute right-1 bottom-1 rotate-180 text-2xl leading-none sm:right-1.5 sm:bottom-1.5"
	>
		{symbol}
	</span>
</div>
