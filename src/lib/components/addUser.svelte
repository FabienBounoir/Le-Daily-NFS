<script>
	import { bin, transition } from 'd3';
	import { fade, scale, slide } from 'svelte/transition';

	/**
	 * @type {string | any[]}
	 */
	export let userExclude = [];

	/**
	 * @type {string | any[]}
	 */
	export let speaker;

	/**
	 * @type {boolean}
	 */
	export let openMenu;

	let query = '';

	let searchElement = [];

	$: includeQuery(query);

	const includeQuery = (query) => {
		searchElement = [];

		if (query === '') return (searchElement = []);

		for (const user of userExclude) {
			if (user.name?.toLowerCase?.()?.includes?.(query?.toLowerCase?.())) {
				searchElement.push(user);
			}
		}
	};

	const addUserToSpeaker = (user) => {
		if (!user.timer) {
			user.timer = 0;
		}

		userExclude = [...userExclude.filter((n) => n.name !== user.name)];
		speaker = [...speaker, user];
		openMenu = false;
	};

	const addNewUserToSpeaker = (name) => {
		let valid = true;

		let newUsersObj = {
			name: `${name[0].toUpperCase()}${name.slice(1)}`,
			avatars: null,
			timer: 0,
			nickname: null,
			animation: null
		};

		for (let user of speaker) {
			if (user.name?.toLowerCase?.() === name?.toLowerCase?.()) {
				valid = false;
			}
		}

		if (!valid) return console.error('User already in speaker list');

		speaker = [...speaker, newUsersObj];
		openMenu = false;
	};

	const includeName = (query) => {
		if (query === '') return false;

		for (let user of userExclude) {
			if (user.name?.toLowerCase?.() == query?.toLowerCase?.()) {
				return true;
			}
		}

		for (let user of speaker) {
			if (user.name?.toLowerCase?.() == query?.toLowerCase?.()) {
				return true;
			}
		}

		return false;
	};
</script>

<div
	class="AddUserBackground"
	out:fade={{ duration: 100, delay: 80 }}
	on:click={() => (openMenu = false)}
></div>

<div class="AddUserContainer">
	<input
		on:keydown={(e) => {
			if (e.key === 'Enter') {
				addNewUserToSpeaker(query?.trim?.() || query);
			}
		}}
		type="text"
		placeholder="Username"
		in:scale
		bind:value={query}
	/>
	{#if query !== ''}
		<div class="user-list" in:slide={{ axis: 'y', duration: 100 }}>
			{#each searchElement as user}
				<p on:click={() => addUserToSpeaker(user)}>
					{#if user.avatars}
						<img
							src={'/avatar/' + user.avatars}
							alt="Jira Avatar"
							on:error={() => {
								user.avatars = null;
							}}
						/>
					{/if}
					{user.name}
				</p>
			{/each}

			<button
				disabled={includeName(query)}
				on:click={() => addNewUserToSpeaker(query?.trim?.() || query)}
				>Add "{query?.trim?.() || query}"</button
			>
		</div>
	{/if}
</div>

<style lang="scss">
	.AddUserBackground {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		backdrop-filter: blur(4px);
		background-color: rgba(0, 0, 0, 0.3);
		z-index: 10;
	}

	.AddUserContainer {
		z-index: 11;
		position: absolute;
		top: 20%;
		left: 50%;
		transform: translate(-50%, 0%);
		display: flex;
		flex-direction: column;
		gap: 0.5em;

		input {
			width: 30vw;
		}

		.user-list {
			display: flex;
			flex-direction: column;
			background-color: white;
			border: 1px solid var(--primary-300);
			border-radius: 0.5em;
			padding: 0.5em;
			gap: 0.3em;

			p {
				padding: 0.5em;
				cursor: pointer;
				transition: background-color 0.2s;
				border-radius: 0.5em;
				display: flex;
				flex-direction: row;
				gap: 0.5em;
				align-items: center;

				&:hover {
					background-color: var(--primary-200);
				}

				img {
					width: 25px;
					height: 25px;
					border-radius: 50%;
				}
			}

			button {
				cursor: pointer;
				border: none;
				background-color: var(--primary-600);
				color: white;
				border-radius: 0.5em;
				transition: background-color 0.2s;

				&:hover {
					background-color: var(--primary-700);
				}
			}
		}
	}
</style>
