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
	let addNicknameName = '';
	let addNicknameValue = '';

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
		{#if color !== 'random'}
			<input
				disabled={color === 'random'}
				type="color"
				bind:value={color}
				on:change={() => {
					user.change({
						...$user,
						color
					});
				}}
			/>
		{/if}
		<button
			on:click={() =>
				(color =
					color === 'random' ? `#${Math.floor(Math.random() * 16777215).toString(16)}` : 'random')}
		>
			{#if color === 'random'}
				Arrêter le mode aléatoire
			{:else}
				Activer le mode aléatoire
			{/if}
		</button>
	</div>
	<div class="container">
		<h1>Temps par participant (en secondes):</h1>
		<p>Prenez le contrôle absolu du temps de parole de chaque intervenant selon vos préférences:</p>
		<input type="number" bind:value={timer} min="10" max="3600" step="5" />
	</div>
	<div class="container">
		<h1>Animation de Speaker:</h1>
		<p>Ajouter des animations pour chaque speaker:</p>
		<div class="animation-container">
			{#if $user?.animation}
				{#each Object.entries($user?.animation) as [key, value]}
					<span
						>{key}<input
							type="text"
							bind:value
							placeholder="https://media.tenor.com/_ZTkC0689ucAAAAi/rainbow-stars-stars.gif"
							disabled
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
			{/if}
		</div>
		<div class="new-animation">
			{#if $user?.speakers?.length > 0}
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
			{:else}
				<p>ℹ️ Ajouter des participants pour pouvoir mettre des animations de speakers.</p>
			{/if}
		</div>
	</div>

	<div class="container">
		<h1>Nicknames:</h1>
		<p>Changez le nom enoncé lors du changement de speaker:</p>

		<div class="animation-container">
			{#if $user?.nicknames}
				{#each Object.entries($user?.nicknames) as [key, value]}
					<span
						>{key}<input
							type="text"
							bind:value
							placeholder="https://media.tenor.com/_ZTkC0689ucAAAAi/rainbow-stars-stars.gif"
							disabled
						/>
						<button
							on:click={() => {
								delete $user.nicknames[key];
								user.change({
									...$user,
									nicknames: $user.nicknames
								});
							}}>X</button
						>
					</span>
				{/each}
			{/if}
		</div>

		<div class="new-nickname">
			{#if $user?.speakers?.length > 0}
				<select bind:value={addNicknameName}>
					{#each $user.speakers as speaker}
						<option value={speaker}>{speaker}</option>
					{/each}
				</select>
				<input
					type="text"
					bind:value={addNicknameValue}
					placeholder="https://media.tenor.com/_ZTkC0689ucAAAAi/rainbow-stars-stars.gif"
				/>
				<button
					on:click={() => {
						if (!addNicknameValue) return snacks.error('Veuillez entrer un nickname');

						user.change({
							...$user,
							nicknames: {
								...$user.nicknames,
								[addNicknameName]: addNicknameValue
							}
						});

						addNicknameName = '';
						addNicknameValue = '';
					}}>Ajouter</button
				>
			{:else}
				<p>ℹ️ Ajouter des participants pour pouvoir mettre des nicknames à vos speakers.</p>
			{/if}
		</div>
	</div>

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
	.new-animation,
	.new-nickname {
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

	input:disabled {
		background-color: var(--primary-100);
		cursor: not-allowed;
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

			&:hover {
				animation: shake 0.5s ease infinite;
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
