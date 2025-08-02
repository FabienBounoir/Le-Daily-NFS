import { userService } from "$lib/server/services/user.service";
import { error, json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ request }) => {
	const authorization = request.headers.get("Authorization");
	const jwt = authorization?.replace("Bearer ", "") || null;
	const user = await userService.getFromJWT(jwt);

	return json(user);
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const PUT = async ({ request }) => {
	const authorization = request.headers.get("Authorization");
	const jwt = authorization?.replace("Bearer ", "") || null;
	const user = await userService.getFromJWT(jwt);

	if (!user) {
		throw error(401, "Unauthorized");
	}

	const { color, timer, users, weather, qwertee, euromillion, programmedDates } = await request.json();
	const newUser = await userService.update(user._id, { color, timer, users, weather, qwertee, euromillion, programmedDates });

	return json(newUser);
};
