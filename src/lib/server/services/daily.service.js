import { crypter } from "$lib/utils/crypter";
import { error } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { db } from "../db.server";
import { speakerService } from "./speaker.service";

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
	async getAll(teams, size = 50, page = 0) {
		const dailies = await this.#collection.find({
			team: { $in: teams }
		}).sort({ date: -1 }).skip(page * size).limit(size).toArray();

		const count = await this.#collection.countDocuments({
			team: { $in: teams }
		});

		return { dailies, count };
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
	 * @param {string} timer
	 * @param {string} totalTimer
	 */
	async create(users, team, timer, totalTimer) {

		let names = []

		let totalTime = 0;

		for (let user of users) {
			if (user.name) {
				names.push(user.name);
			}
		}


		return await this.#collection.insertOne({
			users: users.map(user => user.name),
			team,
			totalTime: parseInt(`${totalTimer}`),
			userTime: parseInt(`${timer}`),
			date: new Date(new Date().getTime() - (parseInt(`${totalTimer}`) * 1000))
		});
	}

	/**
	 * @param {string} _id
	 */
	async delete(_id) {
		return await this.#collection.deleteOne({ _id: new ObjectId(_id) });
	}
}

export const dailyService = new DailyService(db.collection("daily"));
