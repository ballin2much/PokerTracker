<script lang="ts">
	import { dominantAction, type ActionMap } from '$lib/trainer/strategy';
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
		if (action === 'Raise') return 'border-nord14/70 bg-nord14/25 text-nord14';
		if (action === 'Call') return 'border-nord9/70 bg-nord9/25 text-nord8';
		return 'border-nord3 bg-nord0/70 text-nord4';
	}
</script>

<div class="overflow-x-auto rounded-xl border border-nord2 bg-nord0/40 p-2 sm:p-3">
	<div class="grid min-w-[42rem] grid-cols-13 gap-1" aria-label="Starting hand range chart">
		{#each RANKS, row}
			{#each RANKS, column}
				{@const hand = handFor(row, column)}
				{@const action = dominantAction(actions[hand])}
				<button
					type="button"
					aria-label={`${hand}: ${action}. Paint ${brush}.`}
					aria-pressed={action === brush}
					onclick={() => onpaint(hand, brush)}
					class={[
						'aspect-square rounded border text-xs font-bold transition hover:brightness-125 focus:z-10 focus:ring-2 focus:ring-nord6 focus:outline-none sm:text-sm',
						colorFor(action)
					]}
				>
					{hand}
				</button>
			{/each}
		{/each}
	</div>
</div>
