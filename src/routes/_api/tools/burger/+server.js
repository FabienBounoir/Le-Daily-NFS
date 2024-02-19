import { userService } from "$lib/server/services/user.service";
import { json, text } from "@sveltejs/kit";
import cheerio from 'cheerio';


/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ request }) => {
	const html = await fetch('https://www.truck-2-food.fr/').then(res => res.text());

	return text(html);
};
