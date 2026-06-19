<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<div class="min-h-screen bg-nord0 p-4 sm:p-8">
	<div class="max-w-md mx-auto">
		<h1 class="text-3xl font-bold text-nord6 mb-2">Account</h1>
		<p class="text-nord4 mb-8">
			Signed in as <span class="font-semibold text-nord6">{data.user?.username}</span>
		</p>

		<div class="bg-nord1 rounded-lg shadow-lg p-6">
			<h2 class="text-lg font-bold text-nord5 mb-4">Change Password</h2>

			{#if form?.message}
				<p class="text-nord11 mb-4 p-2 bg-nord11/10 rounded border border-nord11/30 text-sm">
					{form.message}
				</p>
			{/if}
			{#if form?.success}
				<p class="text-nord14 mb-4 p-2 bg-nord14/10 rounded border border-nord14/30 text-sm">
					Password updated successfully.
				</p>
			{/if}

			<form method="POST" action="?/changePassword" use:enhance class="space-y-4">
				<div>
					<label for="oldPassword" class="block text-sm font-medium text-nord4 mb-1"
						>Current Password</label
					>
					<input
						type="password"
						name="oldPassword"
						id="oldPassword"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-nord4 mb-1"
						>New Password</label
					>
					<input
						type="password"
						name="password"
						id="password"
						minlength="8"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
				<div>
					<label for="passwordConfirm" class="block text-sm font-medium text-nord4 mb-1"
						>Confirm New Password</label
					>
					<input
						type="password"
						name="passwordConfirm"
						id="passwordConfirm"
						minlength="8"
						class="bg-nord0 border border-nord3 text-nord6 p-2 rounded w-full focus:ring-2 focus:ring-nord8 outline-none"
						required
					/>
				</div>
				<button
					type="submit"
					class="bg-nord10 hover:bg-nord9 text-nord6 font-bold py-2 px-4 rounded w-full transition"
				>
					Update Password
				</button>
			</form>
		</div>
	</div>
</div>
