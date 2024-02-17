export class API {
	#host;

	/**
	 * @param {string} host
	 */
	constructor(host) {
		this.#host = host;
	}

	/**
	 * @param {string} endpoint
	 * @param {RequestInit=} init
	 */
	async #request(endpoint, init = {}) {
		const url = `${this.#host}${endpoint}`;

		const response = await fetch(url, {
			method: init.method,
			headers: {
				Authorization: `Bearer ${localStorage.getItem("jwt")}`,
				"Content-Type": "application/json",
				...(init.headers || {})
			},
			body: JSON.stringify(init.body)
		});

		const body = await response.json();

		if (response.status >= 400)
			throw {
				status: response.status,
				id: "unknown",
				...body
			};

		return body;
	}

	/**
	 * @param {string} endpoint
	 */
	get(endpoint) {
		return this.#request(endpoint, { method: "GET" });
	}

	/**
	 * @param {string} endpoint
	 * @param {*=} body
	 */
	post(endpoint, body) {
		return this.#request(endpoint, { method: "POST", body });
	}

	/**
	 * @param {string} endpoint
	 * @param {*=} body
	 */
	patch(endpoint, body) {
		return this.#request(endpoint, { method: "PATCH", body });
	}

	/**
	 * @param {string} endpoint
	 * @param {*=} body
	 */
	put(endpoint, body) {
		return this.#request(endpoint, { method: "PUT", body });
	}

	/**
	 * @param {string} endpoint
	 * @param {*=} body
	 */
	delete(endpoint, body) {
		return this.#request(endpoint, { method: "DELETE", body });
	}
}

export const api = new API("/_api");
