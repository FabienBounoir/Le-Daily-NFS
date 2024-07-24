import { userService } from "$lib/server/services/user.service";
import { json, text } from "@sveltejs/kit";


/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ request }) => {
	const jsonData = await fetch('http://site.qwertee.com/api/daily').then(res => res.json());

	return json(jsonData);
};
