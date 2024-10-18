import { connection } from "$lib/server/db.server";
import { dailyService } from "$lib/server/services/daily.service";
import { speakerService } from "$lib/server/services/speaker.service";
import { userService } from "$lib/server/services/user.service";
import { error, json } from "@sveltejs/kit";

/**
 * @type {import("../$types").RequestHandler}
 */
export const GET = async ({ request, params }) => {
	await connection;
	try {
		// @ts-ignore
		const token = request.headers.get("authorization").split(" ")[1];

		const team = params.team;

		if (!team || !params.speaker) {
			throw error(404, { id: "request.invalid", message: "Invalid request" });
		}

		const user = await userService.getFromJWT(token);

		// @ts-ignore
		if (!user || !user.teams.includes(team)) {
			throw error(403, { id: "user.unauthorized", message: "Unauthorized" });
		}

		const speakerStats = await speakerService.getByName(team, params.speaker);

		return json(speakerStats);

	}
	catch (e) {
		return json({ error: e.message }, { status: 500 });
	}
};