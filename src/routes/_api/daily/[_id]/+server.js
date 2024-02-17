import { dailyService } from "$lib/server/services/daily.service";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const DELETE = async ({ params }) => {
	const result = await dailyService.delete(params._id);

	return json(result);
};
