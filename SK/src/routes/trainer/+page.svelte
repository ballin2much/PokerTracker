<script lang="ts">
	import { SCENARIOS, getAction, makeContinuation, makeQuestion } from '$lib/trainer/ranges';
	import { dealHand } from '$lib/trainer/cards';
	import PokerTable from '$lib/components/PokerTable.svelte';
	import {
		ACTIONS,
		type Card,
		type Question,
		type SpotType,
		type TrainerAction
	} from '$lib/trainer/types';
	import { applyRangeOverrides } from '$lib/trainer/strategy';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const SPOT_TYPES: Array<SpotType | 'All spots'> = ['All spots', 'Open', 'Facing open'];

	let spotType = $state<SpotType | 'All spots'>('All spots');
	let generatedQuestion = $state<Question | null>(null);
	let generatedCards = $state<[Card, Card] | null>(null);
	const availableScenarios = $derived(applyRangeOverrides(SCENARIOS, data.rangeOverrides));
	const startingScenarios = $derived(
		availableScenarios.filter(
			(scenario) => scenario.type === 'Open' || scenario.type === 'Facing open'
		)
	);
	const initialScenario = $derived(
		availableScenarios.find((scenario) => scenario.id === data.scenarioId) ?? availableScenarios[0]
	);
	const question = $derived(
		generatedQuestion ?? {
			scenario: initialScenario,
			hand: data.hand,
			answer: getAction(initialScenario, data.hand)
		}
	);
	const cards = $derived(generatedCards ?? data.cards);
	let selected = $state<TrainerAction | null>(null);
	let pendingContinuation = $state<Question | null>(null);
	let correct = $state(0);
	let answered = $state(0);
	let streak = $state(0);

	const filteredScenarios = $derived(
		spotType === 'All spots'
			? startingScenarios
			: startingScenarios.filter((scenario) => scenario.type === spotType)
	);
	const accuracy = $derived(answered === 0 ? 0 : Math.round((correct / answered) * 100));

	function choose(action: TrainerAction) {
		if (selected) return;
		selected = action;
		pendingContinuation = makeContinuation(
			question.scenario,
			action,
			question.hand,
			availableScenarios
		);
		answered += 1;
		if (action === question.answer) {
			correct += 1;
			streak += 1;
		} else {
			streak = 0;
		}
	}

	function nextQuestion() {
		if (pendingContinuation) {
			generatedQuestion = pendingContinuation;
			pendingContinuation = null;
			selected = null;
			return;
		}

		const previous = `${question.scenario.id}:${question.hand}`;
		generatedQuestion = makeQuestion(filteredScenarios, previous);
		generatedCards = dealHand(generatedQuestion.hand);
		selected = null;
	}

	function changeSpotType() {
		selected = null;
		pendingContinuation = null;
		generatedQuestion = makeQuestion(filteredScenarios);
		generatedCards = dealHand(generatedQuestion.hand);
	}

	function actionDescription(action: TrainerAction) {
		if (action === 'Raise') return question.scenario.raiseLabel;
		if (action === 'Call') return question.scenario.callLabel;
		return 'Fold';
	}
</script>

<svelte:head>
	<title>6-Max Preflop Trainer · Poker Tracker</title>
	<meta
		name="description"
		content="Practice 100bb 6-max preflop opening, calling, 3-bet and 4-bet decisions."
	/>
</svelte:head>

<main class="min-h-screen bg-nord0 px-4 py-6 sm:px-8 sm:py-10">
	<div class="mx-auto max-w-5xl">
		<header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="mb-1 text-xs font-bold tracking-[0.2em] text-nord8 uppercase">Study mode</p>
				<h1 class="text-3xl font-bold text-nord6 sm:text-4xl">6-Max Preflop Trainer</h1>
				<p class="mt-2 max-w-2xl text-sm text-nord4">
					100bb cash · no ante · 2.5bb opens (3bb from SB) ·
					{data.strategy
						? `${data.strategy.name} v${data.strategy.version}`
						: 'bundled baseline strategy'}
				</p>
			</div>

			<label class="text-sm font-medium text-nord4">
				<span class="mb-1 block">Practice</span>
				<select
					bind:value={spotType}
					onchange={changeSpotType}
					class="min-w-48 rounded-lg border border-nord3 bg-nord1 px-3 py-2 text-nord6 outline-none focus:ring-2 focus:ring-nord8"
				>
					{#each SPOT_TYPES as type (type)}
						<option value={type}>{type}</option>
					{/each}
				</select>
			</label>
		</header>

		<section class="mb-5 grid grid-cols-3 gap-3" aria-label="Session score">
			<div class="rounded-lg border border-nord2 bg-nord1 p-3 text-center">
				<p class="text-xs tracking-wide text-nord4 uppercase">Score</p>
				<p class="mt-1 text-xl font-bold text-nord6">{correct}/{answered}</p>
			</div>
			<div class="rounded-lg border border-nord2 bg-nord1 p-3 text-center">
				<p class="text-xs tracking-wide text-nord4 uppercase">Accuracy</p>
				<p class="mt-1 text-xl font-bold text-nord8">{accuracy}%</p>
			</div>
			<div class="rounded-lg border border-nord2 bg-nord1 p-3 text-center">
				<p class="text-xs tracking-wide text-nord4 uppercase">Streak</p>
				<p class="mt-1 text-xl font-bold text-nord13">{streak}</p>
			</div>
		</section>

		<section class="overflow-hidden rounded-xl border border-nord2 bg-nord1 shadow-xl">
			<div class="border-b border-nord2 bg-nord2/60 px-5 py-4 sm:px-8">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p class="text-xs font-bold tracking-widest text-nord8 uppercase">
							{question.scenario.type}
						</p>
						<h2 class="mt-1 text-xl font-bold text-nord6">{question.scenario.label}</h2>
					</div>
					<span class="rounded-full bg-nord0/60 px-3 py-1 text-xs font-semibold text-nord4">
						Hero: {question.scenario.hero}
					</span>
				</div>
				<p class="mt-3 text-sm text-nord4">{question.scenario.pot}</p>
			</div>

			<div class="px-2 py-5 sm:px-8 sm:py-8">
				<PokerTable scenario={question.scenario} {cards} />
				<p class="-mt-3 mb-6 text-center text-xs font-semibold tracking-wide text-nord4 uppercase">
					{question.hand} ·
					{#if question.hand.endsWith('s')}
						Suited
					{:else if question.hand.endsWith('o')}
						Offsuit
					{:else}
						Pocket pair
					{/if}
				</p>

				<div class="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3">
					{#each ACTIONS as action (action)}
						<button
							type="button"
							onclick={() => choose(action)}
							disabled={selected !== null}
							class={[
								'rounded-lg border px-4 py-3 font-bold transition focus:ring-2 focus:ring-nord8 focus:outline-none disabled:cursor-default',
								selected === null && action === 'Fold'
									? 'border-nord11/60 bg-nord11/15 text-nord6 hover:bg-nord11/30'
									: '',
								selected === null && action === 'Call'
									? 'border-nord9/60 bg-nord9/15 text-nord6 hover:bg-nord9/30'
									: '',
								selected === null && action === 'Raise'
									? 'border-nord14/60 bg-nord14/15 text-nord6 hover:bg-nord14/30'
									: '',
								selected !== null && action === question.answer
									? 'border-nord14 bg-nord14/25 text-nord14'
									: '',
								selected !== null && action === selected && action !== question.answer
									? 'border-nord11 bg-nord11/25 text-nord11'
									: '',
								selected !== null && action !== selected && action !== question.answer
									? 'border-nord2 bg-nord0/30 text-nord3'
									: ''
							]}
						>
							{actionDescription(action)}
						</button>
					{/each}
				</div>

				{#if selected}
					<div
						class={[
							'mx-auto mt-6 max-w-2xl rounded-lg border p-4',
							selected === question.answer
								? 'border-nord14/50 bg-nord14/10'
								: 'border-nord11/50 bg-nord11/10'
						]}
						aria-live="polite"
					>
						<p class={['font-bold', selected === question.answer ? 'text-nord14' : 'text-nord11']}>
							{selected === question.answer ? 'Correct' : 'Not quite'}
						</p>
						<p class="mt-1 text-sm text-nord4">
							Baseline action: <strong class="text-nord6"
								>{actionDescription(question.answer)}</strong
							>
						</p>
						{#if pendingContinuation}
							<p class="mt-2 text-sm font-semibold text-nord13">
								The action continues — {pendingContinuation.scenario.villain} raises.
							</p>
						{:else if question.scenario.type === 'Open' && selected === 'Raise'}
							<p class="mt-2 text-sm text-nord4">No one 3-bets this time. The hand ends here.</p>
						{/if}
						<button
							type="button"
							onclick={nextQuestion}
							class="mt-4 w-full rounded-lg bg-nord8 px-4 py-2.5 font-bold text-nord0 transition hover:bg-nord7 focus:ring-2 focus:ring-nord6 focus:outline-none"
						>
							{pendingContinuation ? 'Continue hand' : 'Next hand'}
						</button>
					</div>
				{/if}
			</div>
		</section>
	</div>
</main>
