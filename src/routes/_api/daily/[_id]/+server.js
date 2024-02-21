import { dailyService } from "$lib/server/services/daily.service";
import { speakerService } from "$lib/server/services/speaker.service";
import { userService } from "$lib/server/services/user.service";
import { json } from "@sveltejs/kit";
import { error } from "console";

/**
 * @type {import("./$types").RequestHandler}
 */
export const DELETE = async ({ params, request }) => {
	//check if daily exists
	const daily = await dailyService.get(params._id);

	if (!daily) {
		throw error(404, { id: "daily.notfound", message: "Daily not found" });
	}

	//check if user is authorized to delete
	// @ts-ignore
	const token = request.headers.get("authorization").split(" ")[1];

	const user = await userService.getFromJWT(token);
	// @ts-ignore
	if (!user || !user.teams.includes(daily.team)) {
		throw error(403, { id: "user.unauthorized", message: "Unauthorized" });
	}

	await speakerService.removeDaily(params._id, daily.team);

	const result = await dailyService.delete(params._id);
	return json(result);
};
