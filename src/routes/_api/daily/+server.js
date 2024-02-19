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
		const { users, team, totalTime, userTime, speakerTime } = await request.json();

		if (!users || !team || !totalTime || !userTime) {
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

		const daily = await dailyService.create(users, team, totalTime, userTime);


		if (speakerTime && speakerTime.length > 0) {
			let promises = [];
			for (let speaker of speakerTime) {
				promises.push(speakerService.addSpeakerTime(speaker.name, team, speaker.time));
			}

			await Promise.all(promises);
		}

		return json(daily);
	}
	catch (e) {
		return json({ error: e.message }, { status: 500 });
	}
};
