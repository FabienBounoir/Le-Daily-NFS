<script>
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';

	let names = $user.speakers;

	let timeByUser = $user.timer || 120;
	let randomized = true;
	let voiceSynthesis = true;

	const start = async () => {
		let randomisedNames = names;
		if (randomized) randomisedNames.sort(() => Math.random() - 0.5);

		await goto(
			`/daily/start?names=${randomisedNames.join(',')}&time=${timeByUser}&voice=${voiceSynthesis}`
		);
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
		<div class="toggler" on:click={() => (randomized = !randomized)}>
			<p>{randomized ? 'Ordre des participants: aléatoire' : 'Ordre des participants: fixe'}</p>
		</div>
	</div>

	<div class="container">
		<div class="toggler" on:click={() => (voiceSynthesis = !voiceSynthesis)}>
			<p>
				{voiceSynthesis ? 'Synthèse vocale: activée' : 'Synthèse vocale: désactivée'}
			</p>
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

	.participants {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		user-select: none;

		p {
			padding: 0.5em;
			border-radius: 0.5em;
			background-color: var(--primary-100);
			color: var(--color-white);
			cursor: pointer;
			transition: filter 0.2s;
		}

		p:hover,
		.active {
			filter: grayscale(1);
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
