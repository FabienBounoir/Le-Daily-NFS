import { connection } from "$lib/server/db.server";
import { dailyService } from "$lib/server/services/daily.service";
import { userService } from "$lib/server/services/user.service";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ request }) => {
	await connection;
	try {
		// @ts-ignore
		const token = request.headers.get("authorization").split(" ")[1];

		const user = await userService.getFromJWT(token);

		// @ts-ignore
		if (!user) {
			throw new Error("Unauthorized");
		}

		const dailies = await dailyService.getAll(user.teams);

		return json(dailies.reverse());
	}
	catch (e) {
		console.error(e);
		return json({ error: e.message }, { status: 500 });
	}
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request }) => {
	try {
		const { users, team, totalTime, userTime } = await request.json();

		if (!users || !team || !totalTime || !userTime) {
			throw new Error("Invalid request");
		}

		if (!request.headers || !request.headers.get("authorization")) {
			throw new Error("Unauthorized");
		}

		// @ts-ignore
		const token = request.headers.get("authorization").split(" ")[1];

		const user = await userService.getFromJWT(token);

		if (!user.teams.includes(team)) {
			throw new Error("Unauthorized");
		}

		const daily = await dailyService.create(users, team, totalTime, userTime);

		return json(daily);
	}
	catch (e) {
		console.error(e);
		return json({ error: e.message }, { status: 500 });
	}
};
