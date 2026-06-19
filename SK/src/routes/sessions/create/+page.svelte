<script lang="ts">
	import { resolve } from '$app/paths';

	let { form, data } = $props();
	// Default to today's date
	let today = new Date().toISOString().split('T')[0];
	let selectedDate = $state(today);

	// Anchor at local noon (not midnight) before sending to the server. PocketBase stores
	// this as a UTC timestamp, and noon gives a ~12 hour buffer so that formatting it back
	// in the viewer's local timezone never rolls over to the previous or next calendar day.
	const dateToSubmit = $derived.by(() => {
		const [year, month, day] = selectedDate.split('-').map(Number);
		return new Date(year, month - 1, day, 12, 0, 0).toISOString();
	});
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-nord0 p-4">
	<form method="POST" class="bg-nord1 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
		<h1 class="text-2xl font-bold mb-6 text-nord6">Create Poker Session</h1>

		{#if form?.message}
			<p class="text-nord11 mb-4 p-2 bg-nord11/10 rounded border border-nord11/30 text-sm">
				{form.message}
			</p>
		{/if}

		<div class="space-y-4">
			<div>
				<label for="date" class="block text-sm font-medium text-nord4 mb-1">Session Date</label>
				<input
					type="date"
					id="date"
					bind:value={selectedDate}
					class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full focus:ring-2 focus:ring-nord8 outline-none"
					required
				/>
				<input type="hidden" name="date" value={dateToSubmit} />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="SB_amount" class="block text-sm font-medium text-nord4 mb-1"
						>Small Blind ($)</label
					>
					<input
						type="number"
						step="0.01"
						name="SB_amount"
						id="SB_amount"
						value="1"
						placeholder="1.00"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
				<div>
					<label for="BB_amount" class="block text-sm font-medium text-nord4 mb-1"
						>Big Blind ($)</label
					>
					<input
						type="number"
						step="0.01"
						name="BB_amount"
						id="BB_amount"
						value="2"
						placeholder="2.00"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
			</div>

			<div>
				<label for="chip_buy_in_amount" class="block text-sm font-medium text-nord4 mb-1"
					>Standard Chip Buy-in</label
				>
				<input
					type="number"
					name="chip_buy_in_amount"
					id="chip_buy_in_amount"
					value="200"
					placeholder="200"
					class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full focus:ring-2 focus:ring-nord8 outline-none"
					required
				/>
			</div>

			<div>
				<label for="dollar_multiplier" class="block text-sm font-medium text-nord4 mb-1"
					>Dollar Multiplier (Value of 1 chip)</label
				>
				<input
					type="number"
					step="0.001"
					name="dollar_multiplier"
					id="dollar_multiplier"
					value="0.01"
					placeholder="0.01"
					class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full focus:ring-2 focus:ring-nord8 outline-none"
					required
				/>
				<p class="text-xs text-nord3 mt-1">e.g. 0.01 means 1000 chips = $10.00</p>
			</div>

			<div>
				<label for="participants" class="block text-sm font-medium text-nord4 mb-2"
					>Participants</label
				>
				<div
					id="participants"
					class="border border-nord3 rounded-md p-2 max-h-48 overflow-y-auto bg-nord0 space-y-1"
				>
					{#each data.users as user (user.id)}
						<label
							class="flex items-center space-x-3 p-2 hover:bg-nord2 rounded border border-transparent hover:border-nord3 cursor-pointer transition"
						>
							<input
								type="checkbox"
								name="users"
								value={user.id}
								class="w-4 h-4 text-nord10 rounded focus:ring-nord8"
							/>
							<span class="text-sm text-nord5">{user.username || user.email}</span>
						</label>
					{:else}
						<p class="text-sm text-nord4 p-2 italic">No users found.</p>
					{/each}
				</div>
			</div>
		</div>

		<div class="mt-8 flex gap-3">
			<a
				href={resolve('/sessions')}
				class="flex-1 text-center py-2 px-4 border border-nord3 rounded text-nord4 hover:bg-nord2 transition"
			>
				Cancel
			</a>
			<button
				type="submit"
				class="flex-1 bg-nord14 hover:bg-nord14/80 text-nord0 font-bold py-2 px-4 rounded transition"
			>
				Create Session
			</button>
		</div>
	</form>
</div>
