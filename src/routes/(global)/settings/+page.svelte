<script>
	import { updated } from '$app/stores';
	import myshades from '$lib/myshades';
	import { snacks } from '$lib/stores/snacks';
	import { user } from '$lib/stores/user';

	let color = $user.color;
	let timer = $user.timer;

	$: color && myshades({ primary: color });
	$: timer && user.change({ ...$user, timer });

	let addAnimationName = '';
	let addAnimationValue = '';

	let nicknames = new Map([...$user.speakers.map((name) => [name, name])]);

	const updateElementMap = (map, key, value) => {
		map.set(key, value);

		user.change({
			...$user,
			nicknames: Object.fromEntries(map)
		});

		return map;
	};
</script>

<section>
	<div class="container">
		<h1>Participants:</h1>
		<p>
			soyez le maître de votre daily en ajoutant ou retirant des participants selon les besoins,
			pour une flexibilité optimale et des débuts de journée toujours bien orchestrés !
		</p>
		<div class="participants">
			{#each $user.speakers as speaker}
				<p
					on:click={() => {
						user.change({
							...$user,
							speakers: $user.speakers.filter((n) => n !== speaker)
						});
					}}
				>
					{speaker}
				</p>
			{/each}
			<input
				type="text"
				placeholder="Ajouter un participant"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						let formatted = e.target.value.trim();
						formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

						if ($user.speakers.includes(formatted))
							return snacks.error('Ce participant est déjà dans la liste');

						user.change({
							...$user,
							speakers: [...$user.speakers, formatted]
						});

						e.target.value = '';
					}
				}}
			/>
		</div>
	</div>
	<div class="container">
		<h1>Thème:</h1>
		<p>
			Transformez votre site web en véritable caméléon numérique en modifiant les teintes comme bon
			vous semble, offrant ainsi à votre page une palette de couleurs aussi changeante que votre
			humeur du moment !
		</p>
		<input
			type="color"
			bind:value={color}
			on:change={() => {
				user.change({
					...$user,
					color
				});
			}}
		/>
	</div>
	<div class="container">
		<h1>Temps par participant (en secondes):</h1>
		<p>Prenez le contrôle absolu du temps de parole de chaque intervenant selon vos préférences</p>
		<input type="number" bind:value={timer} min="10" max="3600" step="5" />
	</div>
	<div class="container">
		<h1>Animation de Speaker:</h1>
		<div class="animation-container">
			{#each Object.entries($user.animation) as [key, value]}
				<span
					>{key}<input
						type="text"
						bind:value
						placeholder="https://media.tenor.com/_ZTkC0689ucAAAAi/rainbow-stars-stars.gif"
					/>
					<button
						on:click={() => {
							delete $user.animation[key];
							user.change({
								...$user,
								animation: $user.animation
							});
						}}>X</button
					>
				</span>
			{/each}
		</div>
		<div class="new-animation">
			<select bind:value={addAnimationName}>
				{#each $user.speakers as speaker}
					<option value={speaker}>{speaker}</option>
				{/each}
			</select>
			<input
				type="text"
				bind:value={addAnimationValue}
				placeholder="https://media.tenor.com/_ZTkC0689ucAAAAi/rainbow-stars-stars.gif"
			/>
			<button
				on:click={() => {
					//check if addAnimationValue is link tenor
					if (!addAnimationValue.includes('tenor.com')) return snacks.error('Lien non valide');

					user.change({
						...$user,
						animation: {
							...$user.animation,
							[addAnimationName]: addAnimationValue
						}
					});

					addAnimationName = '';
					addAnimationValue = '';
				}}>Ajouter</button
			>
		</div>
	</div>

	<!-- <div class="container">
		<h1>Nicknames:</h1>
		<p>Changez le nom de vos participants pour une expérience plus personnalisée</p>
		{#each Array.from(nicknames, ([key, value]) => ({ key, value })) as { key, value }}
			<div class="nickname">
				<p>{key}</p>
				<input
					type="text"
					value={nicknames.get(key)}
					on:change={(e) => {
						console.log('e', e);
						// nicknames = updateElementMap(nicknames, key, '');
					}}
				/>
			</div>
		{/each}
	</div> -->

	<button
		on:click={async () => {
			try {
				await user.save({
					...$user,
					timer
				});

				snacks.success('Modifications enregistrées');
			} catch (error) {
				snacks.error(error.message);
			}
		}}
	>
		Enregistrer
	</button>

	<div class="container">
		<h1>Débogueur</h1>
		<pre>{JSON.stringify($user, null, 2)}</pre>
	</div>
</section>

<style lang="scss">
	.new-animation {
		display: flex;
		gap: 1em;
		align-items: center;
		padding-top: 1em;
		border-top: 1px solid var(--primary-100);

		button {
			width: min-content !important;
		}

		select {
			width: min-content !important;
		}
	}
	.animation-container {
		margin-bottom: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 1em;

		span {
			display: flex;
			gap: 1em;
			align-items: center;
			justify-content: center;
		}

		button {
			width: min-content !important;
		}
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
	section {
		display: flex;
		flex-direction: column;
		gap: 2em;
	}

	.nickname {
		display: flex;
		gap: 1em;
		align-items: center;
		p {
			min-width: 5em;
		}
	}

	input[type='color'] {
		appearance: none;
		-moz-appearance: none;
		-webkit-appearance: none;
		background: none;
		border: 0;
		cursor: pointer;
		height: 3em;
		padding: 0;
		width: 6em;
	}

	.container {
		display: flex;
		flex-direction: column;

		h1 {
			user-select: none;
			font-size: 1.5em;
		}
	}
</style>
