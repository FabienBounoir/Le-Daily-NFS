import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	if (params.speaker) {
		return {
			speaker: params.speaker
		};
	}

	error(404, 'Not found');
}