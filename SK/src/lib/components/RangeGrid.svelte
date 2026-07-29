<script lang="ts">
	import { dominantAction, type ActionMap, type ActionMix } from '$lib/trainer/strategy';
	import type { TrainerAction } from '$lib/trainer/types';

	const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

	let {
		actions,
		brush,
		onpaint
	}: {
		actions: ActionMap;
		brush: TrainerAction;
		onpaint: (hand: string, action: TrainerAction) => void;
	} = $props();

	function handFor(row: number, column: number) {
		if (row === column) return `${RANKS[row]}${RANKS[column]}`;
		if (row < column) return `${RANKS[row]}${RANKS[column]}s`;
		return `${RANKS[column]}${RANKS[row]}o`;
	}

	function colorFor(action: TrainerAction) {
		if (action === 'Raise') return 'border-nord14/80';
		if (action === 'Call') return 'border-nord9/80';
		return 'border-nord3';
	}

	function backgroundFor(mix: ActionMix) {
		const foldEnd = mix.Fold * 100;
		const callEnd = (mix.Fold + mix.Call) * 100;
		return `linear-gradient(to right, #4c566a 0% ${foldEnd}%, #81a1c1 ${foldEnd}% ${callEnd}%, #a3be8c ${callEnd}% 100%)`;
	}

	function mixLabel(hand: string, mix: ActionMix) {
		const frequencies = (['Fold', 'Call', 'Raise'] as const)
			.filter((action) => mix[action] > 0)
			.map((action) => `${action} ${Math.round(mix[action] * 100)}%`)
			.join(', ');
		return `${hand}: ${frequencies}. Paint ${brush}.`;
	}
</script>

<div class="overflow-x-auto rounded-xl border border-nord2 bg-nord0/40 p-2 sm:p-3">
	<div class="grid min-w-[42rem] grid-cols-13 gap-1" aria-label="Starting hand range chart">
		{#each RANKS, row}
			{#each RANKS, column}
				{@const hand = handFor(row, column)}
				{@const mix = actions[hand]}
				{@const action = dominantAction(mix)}
				<button
					type="button"
					aria-label={mixLabel(hand, mix)}
					aria-pressed={action === brush}
					title={mixLabel(hand, mix)}
					onclick={() => onpaint(hand, brush)}
					class={[
						'aspect-square rounded border text-xs font-bold text-white shadow-sm transition hover:brightness-125 focus:z-10 focus:ring-2 focus:ring-nord6 focus:outline-none sm:text-sm',
						colorFor(action)
					]}
					style:background={backgroundFor(mix)}
				>
					{hand}
				</button>
			{/each}
		{/each}
	</div>
</div>
