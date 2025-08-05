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

		// Équilibre de parole - calculer l'écart-type des temps de parole
		const equilibre = await this.#collection.aggregate([
			{
				$match: { team }
			},
			{
				$unwind: "$users"
			},
			{
				$group: {
					_id: "$_id",
					userTimes: { $push: "$userTime" }
				}
			},
			{
				$project: {
					variance: {
						$divide: [
							{
								$sum: {
									$map: {
										input: "$userTimes",
										as: "time",
										in: {
											$pow: [
												{
													$subtract: [
														"$$time",
														{ $avg: "$userTimes" }
													]
												},
												2
											]
										}
									}
								}
							},
							{ $size: "$userTimes" }
						]
					}
				}
			},
			{
				$group: {
					_id: null,
					avgVariance: { $avg: "$variance" }
				}
			}
		]).toArray();

		// Score de ponctualité - pourcentage de dailys terminés en moins de X temps (par exemple 15 minutes = 900 secondes)
		const ponctualite = await this.#collection.aggregate([
			{
				$match: { team }
			},
			{
				$group: {
					_id: null,
					totalDailys: { $sum: 1 },
					punctualDailys: {
						$sum: {
							$cond: [{ $lte: ["$totalTime", 900] }, 1, 0]
						}
					}
				}
			},
			{
				$project: {
					score: {
						$multiply: [
							{ $divide: ["$punctualDailys", "$totalDailys"] },
							100
						]
					}
				}
			}
		]).toArray();

		// Efficacité - Ratio participants/temps
		const efficacite = await this.#collection.aggregate([
			{
				$match: { team }
			},
			{
				$project: {
					efficiency: {
						$divide: [
							{ $size: "$users" },
							{ $add: ["$totalTime", 1] }
						]
					}
				}
			},
			{
				$group: {
					_id: null,
					avgEfficiency: { $avg: "$efficiency" }
				}
			}
		]).toArray();

		const recent = await this.#collection.find({ team })
			.sort({ date: -1 })
			.limit(5)
			.toArray();

		const previous = await this.#collection.find({ team })
			.sort({ date: -1 })
			.skip(5)
			.limit(5)
			.toArray();

		const recentAvg = recent.length ? recent.reduce((sum, d) => sum + d.totalTime, 0) / recent.length : 0;
		const previousAvg = previous.length ? previous.reduce((sum, d) => sum + d.totalTime, 0) / previous.length : 0;

		let progression = 0;
		if (previousAvg > 0 && recentAvg > 0) {
			const difference = previousAvg - recentAvg;
			const baseLine = Math.max(previousAvg, recentAvg);
			progression = (difference / baseLine) * 100;

			progression = Math.max(-100, Math.min(100, progression));
		}

		// Streak - calculer les jours consécutifs sans dépassement (plus de 15 minutes)
		const allDailys = await this.#collection.find({ team })
			.sort({ date: -1 })
			.toArray();

		let streak = 0;
		for (const daily of allDailys) {
			if (daily.totalTime <= 900) {
				streak++;
			} else {
				break;
			}
		}

		return {
			moyen: moyen[0]?.average || 0,
			total: total[0]?.total || 0,
			moyenPersonne: moyenParticipants[0]?.average || 0,
			equilibre: Math.sqrt(equilibre[0]?.avgVariance || 0),
			ponctualite: ponctualite[0]?.score || 0,
			efficacite: (efficacite[0]?.avgEfficiency || 0) * 1000,
			progression: progression,
			streak: streak
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
