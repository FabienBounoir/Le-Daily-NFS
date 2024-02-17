import { connection } from "$lib/server/db.server";
import { userService } from "$lib/server/services/user.service";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async () => {
	await connection;
	const users = await userService.getAll();

	return json(users);
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request }) => {
	const { username, password } = await request.json();

	const user = await userService.create(username, password, ["admin"], ["nfs"]);

	return json(user);
};
