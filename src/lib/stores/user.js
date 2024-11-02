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

		if (user && user.color) {
			let primary = user.color;

			if (user.color.toLowerCase() == 'random') {
				primary = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

				if (primary.length < 7) {
					primary = primary.padEnd(7, '0');
				}
			}

			console.log('primary', primary);

			myshades({
				primary
			});
		}

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
			color: "#725AC1",
			time: 0,
			speakers: [],
			users: []
		});

		myshades({
			primary: "#725AC1"
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
