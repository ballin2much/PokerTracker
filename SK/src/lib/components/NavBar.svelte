<script lang="ts">
	import { resolve } from '$app/paths';
	import type { UsersResponse } from '$lib';

	let { user }: { user: UsersResponse | null } = $props();
</script>

<nav class="bg-nord1 text-nord6 px-4 sm:px-6 py-3 border-b border-nord2">
	<div class="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-4 sm:gap-6">
			<a
				href={resolve('/')}
				class="font-bold text-base sm:text-lg text-nord8 hover:text-nord7 transition"
				>Poker Tracker</a
			>
			<a href={resolve('/')} class="text-sm hover:text-nord8 transition">Leaderboard</a>
			<a href={resolve('/sessions')} class="text-sm hover:text-nord8 transition">Sessions</a>
		</div>
		{#if user}
			<div class="flex items-center gap-3 sm:gap-4 text-sm">
				<a
					href={resolve('/account')}
					class="text-nord4 hover:text-nord8 transition truncate max-w-32 sm:max-w-none"
				>
					{user.username || user.email}
					{#if user.admin}<span class="text-nord13 font-semibold">(Admin)</span>{/if}
				</a>
				<form method="POST" action="/?/logout">
					<button
						type="submit"
						class="bg-nord11 hover:bg-nord11/80 text-nord6 px-3 py-1.5 rounded font-semibold transition"
					>
						Logout
					</button>
				</form>
			</div>
		{/if}
	</div>
</nav>
