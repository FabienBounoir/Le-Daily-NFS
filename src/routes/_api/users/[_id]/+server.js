import { userService } from "$lib/server/services/user.service";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const PATCH = async ({ params, request }) => {
	const body = await request.json();
	const result = await userService.update(params._id, body);

	return json(result);
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const DELETE = async ({ params }) => {
	const result = await userService.delete(params._id);

	return json(result);
};
