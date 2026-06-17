import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	changePassword: async ({ locals, request }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'You must be logged in.' });
		}

		const formData = await request.formData();
		const oldPassword = formData.get('oldPassword') as string;
		const password = formData.get('password') as string;
		const passwordConfirm = formData.get('passwordConfirm') as string;

		if (!oldPassword || !password || !passwordConfirm) {
			return fail(400, { message: 'Please fill out all fields.' });
		}

		if (password !== passwordConfirm) {
			return fail(400, { message: 'New passwords do not match.' });
		}

		try {
			await locals.pb.collection('users').update(user.id, {
				oldPassword,
				password,
				passwordConfirm
			});
			// Changing the password invalidates the existing auth token, so re-authenticate
			await locals.pb.collection('users').authWithPassword(user.username, password);
		} catch (err) {
			console.error('Change Password Error:', err);
			const message = err instanceof Error ? err.message : 'Failed to change password.';
			return fail(400, { message });
		}

		return { success: true };
	}
};
