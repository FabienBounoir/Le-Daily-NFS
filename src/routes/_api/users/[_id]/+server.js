import { userService } from "$lib/server/services/user.service";
import { error, json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const PATCH = async ({ params, request }) => {
	const token = request.headers.get("authorization").split(" ")[1];
	const user = await userService.getFromJWT(token);

	// @ts-ignore
	if (!user || !user.profiles.includes("admin")) {
		throw error(403, { id: "user.unauthorized", message: "Unauthorized" });
	}

	const body = await request.json();
	const result = await userService.update(params._id, body);

	return json(result);
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const DELETE = async ({ params, request }) => {
	const token = request.headers.get("authorization").split(" ")[1];
	const user = await userService.getFromJWT(token);

	// @ts-ignore
	if (!user || !user.profiles.includes("admin")) {
		throw error(403, { id: "user.unauthorized", message: "Unauthorized" });
	}

	const result = await userService.delete(params._id);

	return json(result);
};
