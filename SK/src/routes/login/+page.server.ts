import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}
};

export const actions: Actions = {
	login: async ({ locals, request }) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const password = data.get('password') as string;

		try {
			await locals.pb.collection('users').authWithPassword(username, password);
		} catch (error: unknown) {
			console.error('Login Error:', error);
			return fail(400, { username, message: 'Invalid username or password' });
		}

		throw redirect(303, '/');
	},
	logout: async ({ locals }) => {
		locals.pb.authStore.clear();
		throw redirect(303, '/login');
	}
};
