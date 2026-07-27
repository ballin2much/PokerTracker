<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import RangeGrid from '$lib/components/RangeGrid.svelte';
	import { SCENARIOS } from '$lib/trainer/ranges';
	import { pureActionMix, scenarioToActionMap, type ActionMap } from '$lib/trainer/strategy';
	import { ACTIONS, type TrainerAction } from '$lib/trainer/types';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let selectedSpot = $state(SCENARIOS[0].id);
	let brush = $state<TrainerAction>('Raise');
	let edits = $state<Record<string, ActionMap>>({});

	const selectedScenario = $derived(
		SCENARIOS.find((scenario) => scenario.id === selectedSpot) ?? SCENARIOS[0]
	);
	const savedActions = $derived(
		data.overrides.find((override) => override.spotKey === selectedSpot)?.actions ??
			scenarioToActionMap(selectedScenario)
	);
	const actions = $derived(edits[selectedSpot] ?? savedActions);
	const isDirty = $derived(Boolean(edits[selectedSpot]));

	function paint(hand: string, action: TrainerAction) {
		edits = {
			...edits,
			[selectedSpot]: {
				...actions,
				[hand]: pureActionMix(action)
			}
		};
	}

	function discard() {
		const next = { ...edits };
		delete next[selectedSpot];
		edits = next;
	}
</script>

<svelte:head>
	<title>Range Editor · Poker Tracker</title>
	<meta
		name="description"
		content="Edit the published six-max preflop strategy using a graphical hand matrix."
	/>
</svelte:head>

<main class="min-h-screen bg-nord0 px-4 py-6 sm:px-8 sm:py-10">
	<div class="mx-auto max-w-6xl">
		<header class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="mb-1 text-xs font-bold tracking-[0.2em] text-nord13 uppercase">
					Personal strategy
				</p>
				<h1 class="text-3xl font-bold text-nord6">My Preflop Ranges</h1>
				<p class="mt-2 text-sm text-nord4">
					{#if data.pack}
						Editing {data.pack.name} v{data.pack.version}
					{:else}
						Using bundled defaults. Your first save will create your personal range.
					{/if}
				</p>
			</div>
			<a
				href={resolve('/trainer')}
				class="rounded-lg border border-nord3 px-4 py-2 text-center text-sm font-bold text-nord6 transition hover:bg-nord2"
			>
				Back to trainer
			</a>
		</header>

		{#if form?.message}
			<p
				class={[
					'mb-5 rounded-lg border p-3 text-sm',
					form.success
						? 'border-nord14/40 bg-nord14/10 text-nord14'
						: 'border-nord11/40 bg-nord11/10 text-nord11'
				]}
				aria-live="polite"
			>
				{form.message}
			</p>
		{/if}

		<section class="rounded-xl border border-nord2 bg-nord1 p-4 shadow-xl sm:p-6">
			<div class="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
				<label class="text-sm font-medium text-nord4">
					<span class="mb-1 block">Preflop spot</span>
					<select
						bind:value={selectedSpot}
						class="w-full rounded-lg border border-nord3 bg-nord0 px-3 py-2.5 text-nord6 outline-none focus:ring-2 focus:ring-nord8"
					>
						{#each SCENARIOS as scenario (scenario.id)}
							<option value={scenario.id}>{scenario.label}</option>
						{/each}
					</select>
				</label>

				<div>
					<p class="mb-1 text-sm font-medium text-nord4">Paint action</p>
					<div class="grid grid-cols-3 gap-2" aria-label="Range paint action">
						{#each ACTIONS as action (action)}
							<button
								type="button"
								onclick={() => (brush = action)}
								aria-pressed={brush === action}
								class={[
									'rounded-lg border px-4 py-2 text-sm font-bold transition',
									brush === action
										? action === 'Raise'
											? 'border-nord14 bg-nord14/25 text-nord14'
											: action === 'Call'
												? 'border-nord9 bg-nord9/25 text-nord8'
												: 'border-nord4 bg-nord3 text-nord6'
										: 'border-nord3 bg-nord0 text-nord4 hover:bg-nord2'
								]}
							>
								{action === 'Call' ? selectedScenario.callLabel : action}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="mb-4 rounded-lg border border-nord2 bg-nord0/40 p-3">
				<p class="font-bold text-nord6">{selectedScenario.label}</p>
				<p class="mt-1 text-sm text-nord4">{selectedScenario.pot}</p>
			</div>

			<RangeGrid {actions} {brush} onpaint={paint} />

			<div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-nord4">
				<span><span class="mr-1 inline-block h-3 w-3 rounded bg-nord14/60"></span>Raise</span>
				<span
					><span class="mr-1 inline-block h-3 w-3 rounded bg-nord9/60"
					></span>{selectedScenario.type === 'Open' && selectedScenario.hero === 'SB'
						? 'Limp'
						: 'Call'}</span
				>
				<span><span class="mr-1 inline-block h-3 w-3 rounded bg-nord3"></span>Fold</span>
				<span class="ml-auto">{isDirty ? 'Unsaved changes' : 'Saved/default range'}</span>
			</div>

			<div
				class="mt-6 flex flex-col gap-3 border-t border-nord2 pt-5 lg:flex-row lg:justify-between"
			>
				<div class="flex flex-col gap-3 sm:flex-row">
					<form method="POST" action="?/resetSpot">
						<input type="hidden" name="spotKey" value={selectedSpot} />
						<button
							type="submit"
							class="w-full rounded-lg border border-nord13/60 px-5 py-2.5 font-bold text-nord13 transition hover:bg-nord13/10"
						>
							Reset selected spot
						</button>
					</form>
					<form
						method="POST"
						action="?/resetAll"
						onsubmit={(event) => {
							if (!window.confirm('Reset every preflop spot to the bundled defaults?')) {
								event.preventDefault();
							}
						}}
					>
						<button
							type="submit"
							class="w-full rounded-lg border border-nord11/60 px-5 py-2.5 font-bold text-nord11 transition hover:bg-nord11/10"
						>
							Reset all spots
						</button>
					</form>
				</div>

				<form
					method="POST"
					action="?/save"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update({ reset: false });
							if (result.type === 'success') discard();
						};
					}}
					class="flex flex-col-reverse gap-3 sm:flex-row"
				>
					<input type="hidden" name="spotKey" value={selectedSpot} />
					<input type="hidden" name="actions" value={JSON.stringify(actions)} />
					<button
						type="button"
						onclick={discard}
						disabled={!isDirty}
						class="rounded-lg border border-nord3 px-5 py-2.5 font-bold text-nord4 transition hover:bg-nord2 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Discard changes
					</button>
					<button
						type="submit"
						class="rounded-lg bg-nord8 px-5 py-2.5 font-bold text-nord0 transition hover:bg-nord7"
					>
						Save personal spot
					</button>
				</form>
			</div>
		</section>
	</div>
</main>
