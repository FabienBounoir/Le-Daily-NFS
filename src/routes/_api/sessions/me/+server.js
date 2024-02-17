import { userService } from "$lib/server/services/user.service";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ request }) => {
	const authorization = request.headers.get("Authorization");
	const jwt = authorization?.replace("Bearer ", "") || null;
	const user = await userService.getFromJWT(jwt);

	return json(user);
};
