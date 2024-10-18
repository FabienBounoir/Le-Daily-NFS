import { crypter } from "$lib/utils/crypter";
import { error } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { db } from "../db.server";

class UserService {
	#collection;

	/**
	 * @param {import("mongodb").Collection<import("mongodb").Document & {
	 *  profiles: string[];
	 *  username: string;
	 *  password: string;
	 *  teams: string[];
	 * 	speakers: string[];
	 *  color: string;
	 *  timer: number;
	 *  nicknames: Map<string, string>;
	 *  animation: Map<string, string>;
	 *	avatars: string;
	 *  users: object[];
	 * }>} collection
	 */
	constructor(collection) {
		this.#collection = collection;
	}

	getAll() {
		return this.#collection.find().toArray();
	}

	/**
	 * 
	 * @param {String} team 
	 * @returns 
	 */
	getByTeam(team) {
		return this.#collection.find({ teams: { $in: [team] } }).toArray();
	}

	/**
	 * 
	 * @param {String} username 
	 * @returns 
	 */
	getByUsername(username) {
		return this.#collection.findOne({ username });
	}


	/**
	 * @param {string?} jwtString
	 */
	async getFromJWT(jwtString) {
		try {
			if (typeof jwtString !== "string") {
				throw new Error("Invalid JWT");
			}

			const decoded = jwt.verify(jwtString, import.meta.env.VITE_JWT_SECRET);

			if (typeof decoded !== "string") {
				throw new Error("Invalid JWT");
			}

			//dont send password back
			return await this.#collection.findOne({
				_id: new ObjectId(decoded)
			}).then(({ password, ...user }) => user);
		} catch (error) {
			return {
				_id: "-1",
				profiles: ["anonymous"]
			};
		}
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 * @param {string[]} profiles
	 */
	async create(username, password, profiles, teams) {
		return await this.#collection.insertOne({
			username,
			password: await crypter.hash(password),
			profiles,
			teams,
			speakers: [],
			timer: 120,
			nicknames: new Map(),
			color: "#" + Math.floor(Math.random() * 16777215).toString(16),
			users: [],
		});
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 */
	async login(username, password) {
		const user = await this.#collection.findOne({
			username
		});

		if (!user) {
			throw error(404, { id: "user.not_found", message: "User not found" });
		}

		if (!(await crypter.verify(password, user.password))) {
			throw error(400, { id: "user.invalid_password", message: "Invalid password" });
		}

		return jwt.sign(user._id.toString(), import.meta.env.VITE_JWT_SECRET);
	}

	/**
	 * @param {string} _id
	 * @param {*} body
	 */
	async update(_id, body) {
		if (body.password) {
			body.password = await crypter.hash(body.password);
		}

		if (body.username) {
			const alreadyUsed = await this.#collection.findOne({
				username: body.username
			});

			if (alreadyUsed) {
				throw error(409, { id: "user.name_taken", message: "Username already taken" });
			}
		}

		return this.#collection.updateOne({ _id: new ObjectId(_id) }, { $set: body });
	}

	/**
	 * @param {string} _id
	 */
	delete(_id) {
		return this.#collection.deleteOne({ _id: new ObjectId(_id) });
	}
}

export const userService = new UserService(db.collection("users"));
