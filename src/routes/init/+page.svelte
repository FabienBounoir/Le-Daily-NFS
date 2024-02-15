<script>
	import { goto } from '$app/navigation';
	import { snacks } from '$lib/stores/snacks';

	import Trash from '$lib/components/Trash.svelte';

	let names = [
		'Emilie',
		'Fabien',
		'Ihor',
		'Cédric',
		'Maxime',
		'Guillaume',
		'Samuel',
		'Eoghann',
		'Thomas',
		'Damien',
		'Benjamin'
	];

	let timeByUser = 120;
	let randomized = true;
	let voiceSynthesis = true;

	const start = async () => {
		let randomisedNames = names;
		if (randomized) randomisedNames.sort(() => Math.random() - 0.5);

		await goto(
			`/start?names=${randomisedNames.join(',')}&time=${timeByUser}&voice=${voiceSynthesis}`
		);
	};
</script>

<svelte:head>
	<title>Configuration</title>
	<meta name="description" content="Configure le daily NFS" />
</svelte:head>

<section>
	<h1>Configuration</h1>

	<div class="configuration">
		<div class="names">
			<h3>Participants:</h3>
			<div>
				{#each names as name}
					<p>
						{name}
						<button on:click={() => (names = names.filter((n) => n !== name))}><Trash /> </button>
					</p>
				{/each}
			</div>

			<input
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						if (
							e.target.value &&
							names.includes((n) => n.toLowerCase() == e.target.value.toLowerCase())
						) {
							return snacks.error('Ce nom est déjà dans la liste');
						}

						names = [...names, e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)];
						e.target.value = '';
					}
				}}
				placeholder="Ajouter un nom"
			/>
		</div>
		<div class="options">
			<h3>Options:</h3>
			<div>
				<label for="time">Temps par personne (en secondes):</label>
				<input
					type="number"
					id="time"
					value={timeByUser}
					on:input={(e) => (timeByUser = e.target.value)}
				/>
			</div>

			<div style="display: flex; justify-content: space-between;">
				<label for="randomized">Randomiser l'ordre:</label>
				<button
					on:click={() => {
						randomized = !randomized;
					}}
				>
					{randomized ? 'Oui' : 'Non'}
				</button>
			</div>

			<div style="display: flex; justify-content: space-between;">
				<label for="randomized">Utiliser la synthèse vocale:</label>
				<button
					on:click={() => {
						voiceSynthesis = !voiceSynthesis;
					}}
				>
					{voiceSynthesis ? 'Oui' : 'Non'}
				</button>
			</div>
		</div>
	</div>

	<button on:click={() => start()}>Start Daily</button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		gap: 4em;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.configuration {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1em;
		justify-content: center;
	}

	.names {
		border: 1px solid var(--primary);
		border-radius: 5px;
		padding: 10px;
		min-width: 35vw;

		& > div {
			max-height: 50vh;
			overflow-y: auto;
		}
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 1em;
		border: 1px solid var(--primary);
		border-radius: 5px;
		padding: 10px;
		min-width: 35vw;
	}

	.names p {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 5px;
		justify-content: space-between;
		padding: 0.25em 0.5em;
		border-radius: 0.25em;

		&:hover {
			background-color: var(--primary-hover);
		}
	}

	.names button {
		width: min-content !important;
	}

	h1 {
		width: 100%;
		text-align: center;
	}

	button {
		max-width: 150px;
	}
</style>
