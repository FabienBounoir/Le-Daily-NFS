import { connection } from "$lib/server/db.server";
import { userService } from "$lib/server/services/user.service";
import { error, json } from "@sveltejs/kit";

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
	const { username, password, team } = await request.json();

	//check if user exists 
	const existingUser = await userService.getByUsername(username);

	if (existingUser) {
		throw error(400, "Username already taken");
	}

	const existingTeam = await userService.getByTeam(team);

	if (existingTeam && existingTeam.length > 0) {
		throw error(400, "Team already exists");
	}

	const user = await userService.create(username, password, ["user"], [team]);

	return json(user);
};
