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
	 * 
	 * @param {String} _id 
	 * @returns 
	 */
	get(_id) {
		return this.#collection.findOne({ _id: new ObjectId(_id) });
	}

	/**
	 * 
	 * @param {String} team 
	 */
	async getStats(team) {

		//Moyen total daily for a team
		const moyen = await this.#collection.aggregate([
			{
				$match: {
					team
				}
			},
			{
				$group: {
					_id: "$team",
					average: { $avg: "$totalTime" }
				}
			}
		]).toArray();

		//Total Time all daily for a team
		const total = await this.#collection.aggregate([
			{
				$match: {
					team
				}
			},
			{
				$group: {
					_id: "$team",
					total: { $sum: "$totalTime" }
				}
			}
		]).toArray();

		//Moyen de participants par daily
		const moyenParticipants = await this.#collection.aggregate([
			{
				$match: {
					team
				}
			},
			{
				$group: {
					_id: "$team",
					totalParticipants: { $sum: { $size: "$users" } },
					totalDays: { $sum: 1 }
				}
			},
			{
				$project: {
					average: { $divide: ["$totalParticipants", "$totalDays"] }
				}
			}
		]).toArray();

		return {
			moyen: moyen[0]?.average || 0,
			total: total[0]?.total || 0,
			moyenPersonne: moyenParticipants[0]?.average || 0
		};
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
			date: new Date(new Date().getTime() - (parseInt(`${totalTime}`) * 1000))
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
