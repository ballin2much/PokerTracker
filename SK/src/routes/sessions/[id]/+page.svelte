<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatCalendarDate } from '$lib';
	let { data } = $props();
	let { session, leaderboard, chips } = $derived(data);

	let expandedId = $state<string | null>(null);
	let chipCounts = $state<Record<string, number>>({});

	function toggleExpand(perfId: string) {
		expandedId = expandedId === perfId ? null : perfId;
		chipCounts = {}; // Reset counts when switching players
	}

	const calculatedTotal = $derived(
		chips.reduce((sum, chip) => sum + (chipCounts[chip.id] || 0) * (chip.denomination || 0), 0)
	);

	const totalBuyInChips = $derived(
		leaderboard.reduce((sum, p) => sum + (p.buy_in_count || 0), 0) *
			(session.chip_buy_in_amount || 0)
	);
	const totalEndingStack = $derived(leaderboard.reduce((sum, p) => sum + (p.ending_stack || 0), 0));
	// Only meaningful once the session has ended and every player's final stack is recorded
	const chipsImbalanced = $derived(!session.active && totalBuyInChips !== totalEndingStack);
</script>

<div class="min-h-screen bg-nord0 p-4 sm:p-8">
	<header class="max-w-5xl mx-auto mb-8">
		<div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
			<div class="space-y-2">
				<div class="flex items-center gap-3">
					<h1 class="text-2xl sm:text-3xl font-bold text-nord6">
						Session: {formatCalendarDate(session.date)}
					</h1>
					{#if session.active}
						<span
							class="bg-nord14/15 text-nord14 text-xs font-medium px-2.5 py-0.5 rounded-full border border-nord14/40"
							>Active</span
						>
					{:else}
						<span
							class="bg-nord3/20 text-nord4 text-xs font-medium px-2.5 py-0.5 rounded-full border border-nord3"
							>Inactive</span
						>
					{/if}
				</div>
			</div>
			<div class="flex flex-col items-start sm:items-end gap-4">
				{#if data.user?.admin}
					<form method="POST" action="?/toggleActive" use:enhance>
						<button
							type="submit"
							class="text-sm font-semibold px-4 py-2 rounded shadow-sm transition-colors {session.active
								? 'bg-nord13/20 text-nord13 hover:bg-nord13/30'
								: 'bg-nord14 text-nord0 hover:bg-nord14/80'}"
						>
							{session.active ? 'End Session' : 'Resume Session'}
						</button>
					</form>
				{/if}

				<div class="text-left sm:text-right text-nord4 text-sm">
					<p>
						Blinds: <span class="text-nord6 font-semibold"
							>${session.SB_amount*session.dollar_multiplier} / ${session.BB_amount*session.dollar_multiplier}</span
						>
					</p>
					<p>
						Buy-in: <span class="text-nord6 font-semibold">{session.chip_buy_in_amount} chips / ${session.dollar_multiplier*session.chip_buy_in_amount}</span>
					</p>
					<p>
						Mult: <span class="text-nord6 font-semibold">1 chip = ${session.dollar_multiplier}</span>
					</p>
				</div>
			</div>
		</div>
	</header>

	{#if chipsImbalanced}
		<div
			class="max-w-5xl mx-auto mb-6 bg-nord13/10 border border-nord13/40 text-nord13 px-4 py-3 rounded-lg text-sm"
		>
			⚠ Chip count mismatch: total buy-ins ({totalBuyInChips.toLocaleString()} chips) don't match total
			ending stacks ({totalEndingStack.toLocaleString()} chips). Difference: {Math.abs(
				totalBuyInChips - totalEndingStack
			).toLocaleString()} chips.
		</div>
	{/if}

	<div class="bg-nord1 rounded-xl shadow-lg overflow-x-auto max-w-5xl mx-auto">
		<div class="px-6 py-4 bg-nord2 border-b border-nord3">
			<h2 class="text-lg font-bold text-nord5">Leaderboard</h2>
		</div>
		<table class="min-w-full divide-y divide-nord2">
			<thead class="bg-nord2">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium text-nord4 uppercase tracking-wider"
						>Rank</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium text-nord4 uppercase tracking-wider"
						>Player</th
					>
					<th class="px-6 py-3 text-center text-xs font-medium text-nord4 uppercase tracking-wider"
						>Buy-ins</th
					>
					<th class="px-6 py-3 text-center text-xs font-medium text-nord4 uppercase tracking-wider"
						>End Stack</th
					>
					<th class="px-6 py-3 text-right text-xs font-medium text-nord4 uppercase tracking-wider"
						>Net (Chips)</th
					>
					<th class="px-6 py-3 text-right text-xs font-medium text-nord4 uppercase tracking-wider"
						>Profit/Loss</th
					>
				</tr>
			</thead>
			<tbody class="bg-nord1 divide-y divide-nord2">
				{#each leaderboard as perf, i (perf.id)}
					<tr
						class="hover:bg-nord8/10 transition {data.user?.admin
							? 'cursor-pointer'
							: ''} {expandedId === perf.id ? 'bg-nord8/15' : ''}"
						onclick={() => data.user?.admin && toggleExpand(perf.id)}
					>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-nord4">
							{i + 1}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-nord6">
							{perf.expand?.relation2?.username || perf.expand?.relation2?.email || 'Unknown'}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-center text-nord4">
							{#if session.active}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="flex items-center justify-center gap-3"
									onclick={(e) => e.stopPropagation()}
								>
									<form method="POST" action="?/adjustBuyIn" use:enhance class="inline">
										<input type="hidden" name="performanceId" value={perf.id} />
										<button
											type="submit"
											name="delta"
											value="-1"
											class="w-6 h-6 flex items-center justify-center rounded-full bg-nord11/20 text-nord11 hover:bg-nord11/30 transition-colors disabled:opacity-30"
											disabled={perf.buy_in_count <= 0}>-</button
										>
									</form>
									<span class="w-4 text-center font-bold text-nord6">{perf.buy_in_count}</span>
									<form method="POST" action="?/adjustBuyIn" use:enhance class="inline">
										<input type="hidden" name="performanceId" value={perf.id} />
										<button
											type="submit"
											name="delta"
											value="1"
											class="w-6 h-6 flex items-center justify-center rounded-full bg-nord14/20 text-nord14 hover:bg-nord14/30 transition-colors"
											>+</button
										>
									</form>
								</div>
							{:else}
								{perf.buy_in_count}
							{/if}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-center text-nord4">
							{perf.ending_stack.toLocaleString()}
						</td>
						<td
							class="px-6 py-4 whitespace-nowrap text-sm text-right font-mono {perf.net_chips >= 0
								? 'text-nord14'
								: 'text-nord11'}"
						>
							{perf.net_chips > 0 ? '+' : '('}{Math.abs(perf.net_chips).toLocaleString()}{perf.net_chips > 0 ? '' : ')'}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
							<span class={perf.net_dollars >= 0 ? 'text-nord14' : 'text-nord11'}>
								{perf.net_dollars > 0 ? '$' : '($'}{Math.abs(perf.net_dollars).toLocaleString(
									undefined,
									{ minimumFractionDigits: 2, maximumFractionDigits: 2 }
								)}{perf.net_dollars >= 0 ? '' : ')'}
							</span>
						</td>
					</tr>

					{#if expandedId === perf.id && session.active}
						<tr class="bg-nord2">
							<td colspan="6" class="px-4 sm:px-8 py-4 sm:py-6">
								<div
									class="max-w-2xl mx-auto bg-nord1 p-4 sm:p-6 rounded-lg shadow-inner border border-nord3"
								>
									<h3 class="text-sm font-bold text-nord5 mb-4 uppercase tracking-wider">
										Chip Calculator
									</h3>
									<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
										{#each chips as chip (chip.id)}
											<div class="flex flex-col">
												<label for="chip-{chip.id}" class="text-xs text-nord4 mb-1">
													Denom: <span class="font-bold text-nord6">${chip.denomination}</span>
												</label>
												<input
													type="number"
													id="chip-{chip.id}"
													placeholder="0"
													min="0"
													bind:value={chipCounts[chip.id]}
													class="bg-nord0 border border-nord3 text-nord6 p-2 rounded text-sm focus:ring-2 focus:ring-nord8 outline-none"
												/>
											</div>
										{/each}
									</div>
									<div
										class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-nord2"
									>
										<div class="text-lg font-bold text-nord6">
											Total: <span class="text-nord8">{calculatedTotal.toLocaleString()} chips / ${calculatedTotal * session.dollar_multiplier}</span
											>
										</div>
										<form
											method="POST"
											action="?/updateStack"
											use:enhance={() => {
												expandedId = null;
											}}
										>
											<input type="hidden" name="performanceId" value={perf.id} />
											<input type="hidden" name="endingStack" value={calculatedTotal} />
											<button
												type="submit"
												class="bg-nord10 hover:bg-nord9 text-nord6 px-6 py-2 rounded font-bold transition shadow-sm"
											>
												Update Stack
											</button>
										</form>
									</div>
								</div>
							</td>
						</tr>
					{/if}
				{:else}
					<tr>
						<td colspan="6" class="px-6 py-10 text-center text-nord4 italic">
							No performance records for this session.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
		<div class="bg-nord9/10 border border-nord9/30 p-4 rounded-lg">
			<h3 class="text-nord8 font-bold mb-1">Session Summary</h3>
			<p class="text-nord4 text-sm">
				Total buy-in volume: {totalBuyInChips.toLocaleString()} chips
			</p>
		</div>
	</div>
</div>
