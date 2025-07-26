import { error } from '@sveltejs/kit';

// Disable prerendering for this dynamic route since it depends on user data
export const prerender = false;

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	if (params.speaker) {
		return {
			speaker: params.speaker
		};
	}

	error(404, 'Not found');
}