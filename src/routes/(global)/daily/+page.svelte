<script>
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	let users = $user.users;

	let timeByUser = $user.timer || 120;
	let randomized = true;
	let voiceSynthesis = true;
	let animationSpeakers = true;

	let dailyExists = false;

	onMount(() => {
		if (window.localStorage.getItem('daily')) {
			const daily = JSON.parse(window.localStorage.getItem('daily'));
			if (daily.state === 'IN_PROGRESS') {
				dailyExists = true;
			}
		}
	});

	const start = async () => {
		let randomisedNames = users;
		if (randomized) randomisedNames = randomizedArray(users);

		window.localStorage.setItem(
			'daily',
			JSON.stringify({
				users: randomisedNames,
				voice: voiceSynthesis,
				animation: animationSpeakers,
				time: timeByUser,
				exclude: $user.users.filter((n) => !randomisedNames.some((u) => u.name === n.name))
			})
		);

		await goto(`/daily/start`);
	};

	/**
	 *
	 * @param {string[]} array
	 */
	const randomizedArray = (array) => {
		let currentIndex = array.length,
			temporaryValue,
			randomIndex;

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	};
</script>

<svelte:head>
	<title>Configuration - {$user?.username || ''}</title>
	<meta name="description" content="Lancer un daily" />
</svelte:head>

<section>
	{#if dailyExists}
		<div class="container">
			<h1 style="text-align: center;">On dirait que tu as déjà un daily en cours ! 👀</h1>
			<button
				class="continue"
				on:click={() => {
					goto('/daily/start');
				}}
			>
				Continuer le daily en cours
			</button>

			<p class="separator"></p>
		</div>
	{/if}

	<div class="container">
		<h1>Participants:</h1>
		<div class="participants">
			{#if !$user.users || $user.users.length === 0}
				<p>Pas encore de speaker ! Tu peux en ajouter dans les paramètres.</p>
			{/if}
			{#each $user.users || [] as user}
				<p
					class={users.some((userObj) => userObj.name === user.name) ? '' : 'active'}
					on:click={() => {
						if (users.some((userObj) => userObj.name === user.name)) {
							users = users.filter((n) => n.name !== user.name);
						} else {
							users = [...users, user];
						}
					}}
				>
					{user.name}
				</p>
			{/each}
		</div>
	</div>

	<div class="container">
		<h1>Configuration:</h1>
		<div style="display: flex; flex-direction: row; gap: 1em;">
			<div
				class={'toggler' + (randomized ? '' : ' disabled')}
				on:click={() => (randomized = !randomized)}
			>
				<p>{randomized ? 'Ordre des participants: aléatoire' : 'Ordre des participants: fixe'}</p>
			</div>
			<div
				class={'toggler' + (voiceSynthesis ? '' : ' disabled')}
				on:click={() => (voiceSynthesis = !voiceSynthesis)}
			>
				<p>
					{voiceSynthesis ? 'Synthèse vocale: activée' : 'Synthèse vocale: désactivée'}
				</p>
			</div>
			<div
				class={'toggler' + (animationSpeakers ? '' : ' disabled')}
				on:click={() => (animationSpeakers = !animationSpeakers)}
			>
				<p>
					{animationSpeakers
						? 'Animation des participants: activée'
						: 'Animation des participants: désactivée'}
				</p>
			</div>
		</div>
	</div>

	<div class="container">
		<h1>Temps par participant (en secondes):</h1>
		<input type="number" bind:value={timeByUser} min="30" max="300" step="30" />
	</div>

	<button on:click={() => start()} disabled={users?.length === 0 || !timeByUser || !$user.users}
		>{dailyExists ? 'Démarrer un nouveau daily' : 'Démarrer le daily'}</button
	>
</section>

<style lang="scss">
	button.continue {
		animation: backgroundChange 1s infinite;
	}

	@keyframes backgroundChange {
		0% {
			background-color: var(--primary-600);
		}
		25% {
			background-color: var(--primary-700);
		}
		50% {
			background-color: var(--primary-800);
		}
		75% {
			background-color: var(--primary-900);
		}
		100% {
			background-color: var(--primary-600);
		}
	}

	.separator {
		margin: 1em 0;
		border-bottom: 3px solid var(--primary-100);
		width: 100%;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 2em;
	}

	.toggler {
		background-color: var(--primary-600);
		color: var(--on-primary-600);
		width: fit-content;
		padding: 0.5em;
		border-radius: 0.5em;
		cursor: pointer;
		user-select: none;
	}

	.toggler.disabled {
		background-color: var(--primary-100);
		color: var(--primary-600);
	}

	.participants {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		user-select: none;

		p {
			text-decoration: none;
			padding: 0.5em;
			border-radius: 0.5em;
			background-color: var(--primary-100);
			color: var(--color-white);
			cursor: pointer;
			transition: filter 0.2s;

			&:hover {
				animation: shake 0.5s infinite;
			}

			@keyframes shake {
				0% {
					transform: rotate(0deg);
				}
				25% {
					transform: rotate(5deg);
				}
				50% {
					transform: rotate(-5deg);
				}
				75% {
					transform: rotate(5deg);
				}
				100% {
					transform: rotate(-5deg);
				}
			}
		}

		p:hover,
		.active {
			filter: grayscale(1);
			text-decoration: line-through !important;
		}

		input {
			width: min-content;
		}
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 1em;

		h1 {
			user-select: none;
		}
	}

	button {
		user-select: none;
	}
</style>
