<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatCalendarDate } from '$lib';

	let { data } = $props();
</script>

<div class="min-h-screen bg-nord0 p-4 sm:p-8">
	<header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 max-w-5xl mx-auto">
		<h1 class="text-3xl font-bold text-nord6">Poker Sessions</h1>
		<a href={resolve('/sessions/create')} class="bg-nord10 hover:bg-nord9 text-nord6 font-bold py-2 px-4 rounded transition text-center">
			New Session
		</a>
	</header>

	<div class="bg-nord1 rounded-lg shadow-lg overflow-x-auto max-w-5xl mx-auto">
		<table class="min-w-full divide-y divide-nord2">
			<thead class="bg-nord2">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium text-nord4 uppercase tracking-wider">Date</th>
					<th class="px-6 py-3 text-center text-xs font-medium text-nord4 uppercase tracking-wider">Blinds (SB/BB)</th>
					<th class="px-6 py-3 text-center text-xs font-medium text-nord4 uppercase tracking-wider">Chip Buy-in</th>
					<th class="px-6 py-3 text-center text-xs font-medium text-nord4 uppercase tracking-wider">Multiplier</th>
					<th class="px-6 py-3 text-right text-xs font-medium text-nord4 uppercase tracking-wider">Created</th>
				</tr>
			</thead>
			<tbody class="bg-nord1 divide-y divide-nord2">
				{#each data.sessions as session (session.id)}
					<tr class="hover:bg-nord2 transition cursor-pointer" onclick={() => window.location.href = `/sessions/${session.id}`}>
						<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-nord6">
							<a href={resolve('/sessions/[id]', { id: session.id })} class="text-nord8 hover:text-nord7 hover:underline">
								{formatCalendarDate(session.date)}
							</a>
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-center text-nord4">
							${session.SB_amount} / ${session.BB_amount}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-center text-nord4">
							{session.chip_buy_in_amount} chips
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-center text-nord4 font-mono">
							x{session.dollar_multiplier}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-nord3">
							{new Date(session.created).toLocaleDateString()}
						</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="px-6 py-10 text-center text-nord4 italic">No sessions found.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
