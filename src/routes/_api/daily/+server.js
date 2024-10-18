import { connection } from "$lib/server/db.server";
import { dailyService } from "$lib/server/services/daily.service";
import { speakerService } from "$lib/server/services/speaker.service";
import { userService } from "$lib/server/services/user.service";
import { error, json } from "@sveltejs/kit";

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
			throw error(404, { id: "user.unauthorized", message: "Unauthorized" });
		}

		const dailies = await dailyService.getAll(user.teams);

		return json(dailies.reverse());
	}
	catch (e) {
		return json({ error: e.message }, { status: 500 });
	}
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request }) => {
	try {
		const { users, time, team } = await request.json();

		if (!users || users.length === 0 || !time) {
			throw error(404, { id: "request.invalid", message: "Invalid request" });
		}

		if (!request.headers || !request.headers.get("authorization")) {
			throw error(404, { id: "user.unauthorized", message: "Unauthorized" });
		}

		// @ts-ignore
		const token = request.headers.get("authorization").split(" ")[1];

		const user = await userService.getFromJWT(token);

		if (!user.teams.includes(team)) {
			throw error(404, { id: "user.unauthorized", message: "Unauthorized" });
		}

		const daily = await dailyService.create(users, team, time);

		if (users && users.length > 0) {
			let promises = [];
			for (let user of users) {
				promises.push(speakerService.addSpeakerTime(user.name, team, user.timer, daily.insertedId.toString()));
			}

			await Promise.all(promises);
		}

		return json(daily);
	}
	catch (e) {
		return json({ error: e.message }, { status: 500 });
	}
};
