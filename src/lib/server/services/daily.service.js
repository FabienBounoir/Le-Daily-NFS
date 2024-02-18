import { crypter } from "$lib/utils/crypter";
import { error } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { db } from "../db.server";

class DailyService {
	#collection;

	/**
	 * @param {import("mongodb").Collection<import("mongodb").Document & {
	 *  users: string[];
	 *  team: string;
	 *  totalTime: number;
	 *  userTime: number;
	 *  date: Date;
	 * }>} collection
	 */
	constructor(collection) {
		this.#collection = collection;
	}

	/**
	 * @param {string[]} teams
	 */
	getAll(teams) {
		return this.#collection.find({
			team: { $in: teams }
		}).toArray();
	}

	/**
	 * @param {string[]} users
	 * @param {string} team
	 * @param {string} totalTime
	 * @param {string} userTime
	 */
	async create(users, team, totalTime, userTime) {
		return await this.#collection.insertOne({
			users,
			team,
			totalTime: parseInt(`${totalTime}`),
			userTime: parseInt(`${userTime}`),
			date: new Date()
		});
	}

	/**
	 * @param {string} _id
	 */
	delete(_id) {
		return this.#collection.deleteOne({ _id: new ObjectId(_id) });
	}
}

export const dailyService = new DailyService(db.collection("daily"));
