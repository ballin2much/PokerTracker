<script lang="ts">
	let { form } = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-nord0 p-4">
	<form
		method="POST"
		action="?/login"
		class="bg-nord1 p-6 sm:p-8 rounded shadow-lg w-full max-w-sm"
	>
		<h1 class="text-2xl font-bold mb-4 text-nord6">Login</h1>

		{#if form?.message}
			<p class="text-nord11 mb-4">{form.message}</p>
		{/if}

		<input
			type="text"
			name="username"
			value={form?.username ?? ''}
			placeholder="Username"
			class="bg-nord0 border border-nord3 text-nord6 p-2 mb-4 w-full rounded focus:ring-2 focus:ring-nord8 outline-none"
			required
		/>
		<input
			type="password"
			name="password"
			placeholder="Password"
			class="bg-nord0 border border-nord3 text-nord6 p-2 mb-4 w-full rounded focus:ring-2 focus:ring-nord8 outline-none"
			required
		/>

		<button
			type="submit"
			class="bg-nord14 hover:bg-nord14/80 text-nord0 font-bold p-2 rounded w-full transition"
			>Login</button
		>
	</form>
</div>
