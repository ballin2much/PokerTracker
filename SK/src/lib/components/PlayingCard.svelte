<script lang="ts">
	import type { Card } from '$lib/trainer/types';

	const SUIT_PATHS = {
		spades:
			'M50 4C42 20 10 38 10 61c0 18 21 24 34 10-1 10-6 18-14 25h40c-8-7-13-15-14-25 13 14 34 8 34-10C90 38 58 20 50 4Z',
		hearts:
			'M50 91C43 79 8 59 8 31 8 10 34 4 50 24 66 4 92 10 92 31c0 28-35 48-42 60Z',
		diamonds: 'M50 3 94 50 50 97 6 50 50 3Z',
		clubs: ''
	} as const;

	let { card, compact = false }: { card: Card; compact?: boolean } = $props();

	const suitPath = $derived(SUIT_PATHS[card.suit]);
</script>

<div
	class={[
		'playing-card',
		compact
			? 'h-20 w-14 sm:h-24 sm:w-16'
			: 'h-28 w-20',
		`suit-${card.suit}`
	]}
	role="img"
	aria-label={`${card.rank} of ${card.suit}`}
>
	<span class="rank">{card.rank}</span>
	<svg class="suit" viewBox="0 0 100 100" aria-hidden="true">
		{#if card.suit === 'clubs'}
			<circle cx="50" cy="25" r="22" />
			<circle cx="50" cy="53" r="18" />
			<circle cx="27" cy="56" r="23" />
			<circle cx="73" cy="56" r="23" />
			<path d="M42 55c4 17 2 29-7 39h30c-9-10-11-22-7-39Z" />
		{:else}
			<path d={suitPath} />
		{/if}
	</svg>
</div>

<style>
	.playing-card {
		position: relative;
		isolation: isolate;
		container-type: inline-size;
		flex-shrink: 0;
		overflow: hidden;
		border: 1px solid rgb(15 23 42 / 35%);
		border-radius: 0.45rem;
		color: #f4f1e8;
		box-shadow:
			0 0.3rem 0.6rem rgb(0 0 0 / 28%),
			inset 0 1px rgb(255 255 255 / 12%);
	}

	.rank {
		position: absolute;
		top: 50%;
		left: 0;
		z-index: 2;
		width: 100%;
		transform: translateY(-50%);
		text-align: center;
		font-family: Arial, Helvetica, sans-serif;
		font-size: clamp(2.65rem, 8vw, 3.65rem);
		font-weight: 800;
		line-height: 1;
		text-shadow: 0 1px 1px rgb(0 0 0 / 18%);
	}

	.suit {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 1;
		transform: translate(-50%, -50%);
		font-size: 150cqw;
		width: 1em;
		height: 1em;
		fill: currentColor;
		opacity: 0.48;
	}

	.suit-spades {
		background: #3e474d;
	}

	.suit-hearts {
		background: #a8322f;
	}

	.suit-diamonds {
		background: #2638ae;
	}

	.suit-clubs {
		background: #14734c;
	}
</style>
