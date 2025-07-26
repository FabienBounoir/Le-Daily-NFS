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

		if (!team) {
			throw error(404, { id: "request.invalid", message: "Invalid request" });
		}

		const user = await userService.getFromJWT(token);

		// @ts-ignore
		if (!user || !user.teams.includes(team)) {
			throw error(403, { id: "user.unauthorized", message: "Unauthorized" });
		}

		const dailySpeakers = await speakerService.getAll(team)



		const ordered = dailySpeakers.sort((a, b) => {
			// D'abord trier par statut removed (non-removed en premier)
			const aRemoved = a.removed === true;
			const bRemoved = b.removed === true;

			if (aRemoved !== bRemoved) {
				return aRemoved ? 1 : -1; // removed=true à la fin
			}

			// Ensuite trier par moyenTime décroissant
			if (a.moyenTime !== b.moyenTime) {
				return b.moyenTime - a.moyenTime;
			}

			// En cas d'égalité de moyenTime, trier par totalDaily décroissant
			return b.totalDaily - a.totalDaily;
		})

		return json(ordered);

	}
	catch (e) {
		return json({ error: e.message }, { status: 500 });
	}
};