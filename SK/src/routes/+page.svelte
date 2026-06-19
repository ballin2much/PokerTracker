<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showTransactionForm = $state(false);
	let showPlayerForm = $state(false);
</script>

<div class="min-h-screen bg-nord0 p-4 sm:p-8">
	<header
		class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 max-w-5xl mx-auto"
	>
		<div>
			<h1 class="text-3xl font-bold text-nord6">Leaderboard</h1>
			<p class="text-nord4">
				Playing as: <span class="font-semibold text-nord6">{data.user?.username}</span>
			</p>
		</div>
		{#if data.user?.admin}
			<div class="flex flex-wrap gap-3">
				<button
					type="button"
					onclick={() => (showPlayerForm = !showPlayerForm)}
					class="bg-nord9 hover:bg-nord8 text-nord0 font-bold py-2 px-4 rounded transition"
				>
					{showPlayerForm ? 'Cancel' : 'Add Player'}
				</button>
				<button
					type="button"
					onclick={() => (showTransactionForm = !showTransactionForm)}
					class="bg-nord10 hover:bg-nord9 text-nord6 font-bold py-2 px-4 rounded transition"
				>
					{showTransactionForm ? 'Cancel' : 'Add Transaction'}
				</button>
			</div>
		{/if}
	</header>

	{#if showPlayerForm}
		<div class="bg-nord1 rounded-lg shadow-lg p-6 mb-6 max-w-5xl mx-auto">
			<h2 class="text-lg font-bold text-nord5 mb-4">Add Player</h2>
			{#if form?.message}
				<p class="text-nord11 mb-4 p-2 bg-nord11/10 rounded border border-nord11/30 text-sm">
					{form.message}
				</p>
			{/if}
			<form
				method="POST"
				action="?/addPlayer"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showPlayerForm = false;
					};
				}}
				class="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-end"
			>
				<div class="w-full sm:w-auto">
					<label for="newUsername" class="block text-sm font-medium text-nord4 mb-1">Username</label
					>
					<input
						type="text"
						name="username"
						id="newUsername"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full sm:w-auto focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
				<div class="w-full sm:w-auto">
					<label for="newPassword" class="block text-sm font-medium text-nord4 mb-1">Password</label
					>
					<input
						type="password"
						name="password"
						id="newPassword"
						minlength="8"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full sm:w-auto focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
				<div class="w-full sm:w-auto">
					<label for="newPasswordConfirm" class="block text-sm font-medium text-nord4 mb-1"
						>Confirm Password</label
					>
					<input
						type="password"
						name="passwordConfirm"
						id="newPasswordConfirm"
						minlength="8"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full sm:w-auto focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
				<label class="flex items-center gap-2 text-sm text-nord4 pb-2">
					<input
						type="checkbox"
						name="admin"
						class="w-4 h-4 text-nord10 rounded focus:ring-nord8"
					/>
					Admin
				</label>
				<button
					type="submit"
					class="bg-nord14 hover:bg-nord14/80 text-nord0 font-bold py-2 px-4 rounded transition w-full sm:w-auto"
				>
					Create Player
				</button>
			</form>
		</div>
	{/if}

	{#if showTransactionForm}
		<div class="bg-nord1 rounded-lg shadow-lg p-6 mb-6 max-w-5xl mx-auto">
			<h2 class="text-lg font-bold text-nord5 mb-4">Add Transaction</h2>
			{#if form?.message}
				<p class="text-nord11 mb-4 p-2 bg-nord11/10 rounded border border-nord11/30 text-sm">
					{form.message}
				</p>
			{/if}
			<form
				method="POST"
				action="?/addTransaction"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showTransactionForm = false;
					};
				}}
				class="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-end"
			>
				<div class="w-full sm:w-auto">
					<label for="userId" class="block text-sm font-medium text-nord4 mb-1">Player</label>
					<select
						name="userId"
						id="userId"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full sm:w-auto focus:ring-2 focus:ring-nord8 outline-none"
						required
					>
						{#each data.users as user (user.id)}
							<option value={user.id}>{user.username || user.email}</option>
						{/each}
					</select>
				</div>
				<div class="w-full sm:w-auto">
					<label for="type" class="block text-sm font-medium text-nord4 mb-1">Type</label>
					<select
						name="type"
						id="type"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full sm:w-auto focus:ring-2 focus:ring-nord8 outline-none"
						required
					>
						<option value="deposit">Deposit</option>
						<option value="withdrawal">Withdrawal</option>
					</select>
				</div>
				<div class="w-full sm:w-auto">
					<label for="amount" class="block text-sm font-medium text-nord4 mb-1">Amount ($)</label>
					<input
						type="number"
						step="0.01"
						min="0.01"
						name="amount"
						id="amount"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full sm:w-32 focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
				<button
					type="submit"
					class="bg-nord14 hover:bg-nord14/80 text-nord0 font-bold py-2 px-4 rounded transition w-full sm:w-auto"
				>
					Submit
				</button>
			</form>
		</div>
	{/if}

	<div class="bg-nord1 rounded-lg shadow-lg overflow-x-auto max-w-5xl mx-auto">
		<table class="min-w-full divide-y divide-nord2">
			<thead class="bg-nord2">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium text-nord4 uppercase tracking-wider"
						>Player</th
					>
					<th class="px-6 py-3 text-right text-xs font-medium text-nord4 uppercase tracking-wider"
						>Career Buy-In</th
					>
					<th class="px-6 py-3 text-right text-xs font-medium text-nord4 uppercase tracking-wider"
						>Career Earnings</th
					>
					<th class="px-6 py-3 text-right text-xs font-medium text-nord4 uppercase tracking-wider"
						>Deposits</th
					>
					<th class="px-6 py-3 text-right text-xs font-medium text-nord4 uppercase tracking-wider"
						>Withdrawals</th
					>
					<th class="px-6 py-3 text-right text-xs font-medium text-nord4 uppercase tracking-wider"
						>Owed / Due</th
					>
				</tr>
			</thead>
			<tbody class="bg-nord1 divide-y divide-nord2">
				{#each data.users as user (user.id)}
					<tr class={user.id === data.user?.id ? 'bg-nord10/15' : ''}>
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm font-medium text-nord6">{user.username || user.email}</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-right">
							<div class="text-sm font-mono text-nord4">
								${(user.career_buy_in_dollars ?? 0).toLocaleString()}
							</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-right">
							{#if (user.career_earnings ?? 0) < 0}
								<div class="text-sm font-mono font-bold text-nord11">
									(${Math.abs(user.career_earnings ?? 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})})
								</div>
							{:else}
								<div class="text-sm font-mono font-bold text-nord14">
									${(user.career_earnings ?? 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})}
								</div>
							{/if}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-right">
							<div class="text-sm font-mono text-nord4">
								${(user.total_deposits ?? 0).toLocaleString()}
							</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-right">
							<div class="text-sm font-mono text-nord4">
								${(user.total_withdrawals ?? 0).toLocaleString()}
							</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-right">
							{#if (user.money_owed_due ?? 0) >= 0}
								<span class="text-sm font-mono font-bold text-nord14">
									Owed ${(user.money_owed_due ?? 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})}
								</span>
							{:else}
								<span class="text-sm font-mono font-bold text-nord11">
									Due ${Math.abs(user.money_owed_due ?? 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})}
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
