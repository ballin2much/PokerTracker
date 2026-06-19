import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import type { UsersResponse } from '$lib/pocketbase-types';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Initialize PocketBase using the internal Docker DNS name
	// (This matches the service name defined in your docker-compose.yml)
	// $env/dynamic/private (not /static/) is required here: it's resolved at container
	// startup rather than at build time, so the production image doesn't need this value
	// baked in at `docker build` time.
	event.locals.pb = new PocketBase(env.SECRET_POCKETBASE_URL || 'http://pocketbase:8080');

	// 2. Load the authentication store state from the incoming browser cookies
	const cookieHeader = event.request.headers.get('cookie') || '';
	event.locals.pb.authStore.loadFromCookie(cookieHeader);

	try {
		// 3. Refresh the auth token if it's valid to keep the user logged in smoothly
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
		}
	} catch {
		// If the token is expired or invalid, wipe the authentication state cleanly
		event.locals.pb.authStore.clear();
	}

	// 3.5. Set the user local for easy access in other server files
	event.locals.user = event.locals.pb.authStore.model as UsersResponse | null;

	// Define routes that are accessible without authentication
	const publicRoutes = ['/login'];

	// Check if the user is not logged in AND the current route is not a public route
	if (!event.locals.user && !publicRoutes.includes(event.url.pathname)) {
		// Redirect to the login page if not authenticated and trying to access a protected route
		redirect(303, '/login');
	}

	// If the user is logged in or accessing a public route, continue with the request

	// 4. Continue executing the rest of your SvelteKit server routes
	const response = await resolve(event);

	// 5. Securely send any updated authentication cookies back to the browser
	// secure: false in dev since local development usually operates over plain HTTP;
	// production is always served over HTTPS (via the Cloudflare Tunnel), so it's enforced there.
	const updatedCookie = event.locals.pb.authStore.exportToCookie({
		secure: !dev,
		httpOnly: true,
		sameSite: 'lax',
		path: '/'
	});

	response.headers.append('set-cookie', updatedCookie);

	return response;
};
