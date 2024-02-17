import { userService } from "$lib/server/services/user.service";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request }) => {
	const { username, password } = await request.json();
	const jwt = await userService.login(username, password);

	return json(jwt);
};
