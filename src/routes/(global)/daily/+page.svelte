<script>
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';

	let names = $user.speakers;

	let timeByUser = $user.timer || 120;
	let randomized = true;
	let voiceSynthesis = true;
	let animationSpeakers = true;

	const start = async () => {
		let randomisedNames = names;
		if (randomized) randomisedNames = randomizedArray(names);

		await goto(
			`/daily/start?names=${randomisedNames.join(',')}&time=${timeByUser}&voice=${voiceSynthesis}&animation=${animationSpeakers}&exclude=${$user.speakers.filter((n) => !names.includes(n)).join(',')}`
		);
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
	<title>Configuration</title>
	<meta name="description" content="Configure le daily NFS" />
</svelte:head>

<section>
	<div class="container">
		<h1>Participants:</h1>
		<div class="participants">
			{#if !$user.speakers || $user.speakers.length === 0}
				<p>Pas encore de speaker ! Tu peux en ajouter dans les paramètres.</p>
			{/if}
			{#each $user.speakers || [] as name}
				<p
					class={names.includes(name) ? '' : 'active'}
					on:click={() => {
						if (names.includes(name)) {
							names = names.filter((n) => n !== name);
						} else {
							names = [...names, name];
						}
					}}
				>
					{name}
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

	<button on:click={() => start()} disabled={names?.length === 0 || !timeByUser || !$user.speakers}
		>Démarrer le daily</button
	>
</section>

<style lang="scss">
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
