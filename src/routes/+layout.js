import { user } from "$lib/stores/user";
import { redirect } from "@sveltejs/kit";

export const prerender = true;
export const ssr = false;

/**
 * @type {import("./$types").LayoutLoad}
 */
export const load = async ({ url }) => {
	const $user = await user.refresh();

	/**
	 * @param {string} id
	 */
	const is = (id) => $user.profiles.includes(id);

	if (is("anonymous") && url.pathname !== "/") {
		throw redirect(302, "/");
	}
};
