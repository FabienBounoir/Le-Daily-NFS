import { crypter } from "$lib/utils/crypter";
import { error } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { db } from "../db.server";

class SpeakerService {
	#collection;

	/**
	 * @param {import("mongodb").Collection<import("mongodb").Document & {
	 *  name: string;
	 *  team: string;
	 *  moyenTime: number;
	 *  totalDaily: number;
	 *  history: Array<{date: Date, time: number}>
	 * }>} collection
	 */
	constructor(collection) {
		this.#collection = collection;
	}

	/**
	 * @param {string} team
	 */
	getAll(team) {
		return this.#collection.find({
			team
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
	 * @param {string} name
	 * @param {string} team
	 */
	async create(name, team) {
		return await this.#collection.insertOne({
			name,
			team,
			moyenTime: 0,
			totalDaily: 0,
			history: []
		});
	}

	async addSpeakerTime(name, team, time) {
		let speaker = await this.#collection.findOne({ name, team });

		if (!speaker) {
			await this.create(name, team);
			speaker = await this.#collection.findOne({ name, team })
		}

		if (!speaker) {
			return console.error("Error creating speaker");
		}

		const history = [...speaker.history, { date: new Date(), time }];
		const totalDaily = history.length;
		const moyenTime = history.reduce((acc, curr) => acc + curr.time, 0) / totalDaily;


		await this.#collection.updateOne({ name, team }, {
			$set: {
				totalDaily,
				history,
				moyenTime
			}
		});
	}

	/**
	 * @param {string} _id
	 */
	delete(_id) {
		return this.#collection.deleteOne({ _id: new ObjectId(_id) });
	}
}

export const speakerService = new SpeakerService(db.collection("speakers"));
