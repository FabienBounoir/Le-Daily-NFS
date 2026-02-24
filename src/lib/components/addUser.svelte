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
	let selectedIndex = 0;

	$: includeQuery(query);

	$: totalItems = searchElement.length + (query !== '' && !includeName(query) ? 1 : 0);

	const includeQuery = (query) => {
		searchElement = [];
		selectedIndex = 0;

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
			avatar: null,
			timer: 0,
			nickname: null,
			animation: null,
			decoration: null
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
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedIndex = (selectedIndex + 1) % totalItems;
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedIndex = (selectedIndex - 1 + totalItems) % totalItems;
			} else if (e.key === 'Escape') {
				openMenu = false;
			} else if (e.key === 'Enter') {
				if (searchElement.length > 0 && selectedIndex < searchElement.length) {
					addUserToSpeaker(searchElement[selectedIndex]);
				} else if (!includeName(query)) {
					addNewUserToSpeaker(query?.trim?.() || query);
				}
			}
		}}
		type="text"
		placeholder="Username"
		in:scale
		bind:value={query}
	/>
	{#if query !== ''}
		<div class="user-list" in:slide={{ axis: 'y', duration: 100 }}>
			{#each searchElement as user, i}
				<p class={i === selectedIndex ? 'active' : ''} on:click={() => addUserToSpeaker(user)}>
					{#if user.avatar}
						<img
							src={'/avatar/' + user.avatar}
							alt="Jira Avatar"
							on:error={() => {
								user.avatar = null;
							}}
						/>
					{/if}
					{user.name}
				</p>
			{/each}

			{#if !includeName(query)}
				<p
					class="add-new {selectedIndex === searchElement.length ? 'active' : ''}"
					on:click={() => addNewUserToSpeaker(query?.trim?.() || query)}
				>
					<span class="plus">+</span>
					Créer le user "{query?.trim?.() || query}"
				</p>
			{/if}
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

				&.active {
					background-color: var(--primary-100);
					outline: 2px solid var(--primary-400);
				}

				img {
					width: 25px;
					height: 25px;
					border-radius: 50%;
				}
			}

			.add-new {
				color: var(--primary-700);
				font-style: italic;

				.plus {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 25px;
					height: 25px;
					border-radius: 50%;
					background-color: var(--primary-200);
					font-style: normal;
					font-size: 1.2em;
					flex-shrink: 0;
				}
			}
		}
	}
</style>
