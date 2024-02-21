import myshades from "$lib/myshades";
import { api } from "$lib/utils/api";
import { writable } from "svelte/store";

function init() {
	const { set, update, subscribe } = writable(
		/** @type {User} */({
			_id: "-1",
			profiles: ["anonymous"]
		})
	);

	async function refresh() {
		const user = await api.get("/sessions/me");
		set(user);

		myshades({
			primary: user.color
		})

		return user;
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 */
	async function login(username, password) {
		try {
			const jwt = await api.post("/sessions", {
				username,
				password
			});

			localStorage.setItem("jwt", jwt);

			await refresh();
		}
		catch (e) {
			throw e;
		}
	}

	function logout() {
		localStorage.removeItem("jwt");
		set({
			_id: "-1",
			profiles: ["anonymous"],
			username: "",
			teams: [],
			color: "#FF7900",
			time: 0,
			speakers: []
		});

		myshades({
			primary: "#FF7900"
		});
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 */
	async function register(username, password, team) {
		try {
			const jwt = await api.post("/users", {
				username,
				password,
				team
			});




			localStorage.setItem("jwt", jwt);

			await refresh();
		}
		catch (e) {
			throw e;
		}
	}

	function change(user) {
		set(user);
	}

	async function save(user) {
		return await api.put("/sessions/me", user);
	}

	return {
		subscribe,
		refresh,
		change,
		login,
		save,
		register,
		logout
	};
}

export const user = init();
