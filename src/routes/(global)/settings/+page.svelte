<script>
	import { updated } from '$app/stores';
	import Weather from '$lib/components/Weather.svelte';
	import myshades from '$lib/myshades';
	import { snacks } from '$lib/stores/snacks';
	import { user } from '$lib/stores/user';
	import { some } from 'd3';
	import DecorationSelector from '$lib/components/DecorationSelector.svelte';
	import AvatarDecoration from '$lib/components/AvatarDecoration.svelte';

	let color = $user.color;
	let timer = $user.timer;

	$: color && myshades({ primary: color });
	$: timer && user.change({ ...$user, timer });

	const updateElementWithIndex = (valeur, index, key) => {
		let usersElement = $user.users;

		usersElement[index][key] = valeur;

		user.change({
			...$user,
			users: usersElement
		});
	};
</script>

<svelte:head>
	<title>Settings - {$user?.username || ''}</title>
	<meta name="description" content="Page de configuration pour vos daily" />
</svelte:head>

<section>
	<div class="container">
		<h1>Participants:</h1>
		<p>
			soyez le maître de votre daily en ajoutant ou retirant des participants selon les besoins,
			pour une flexibilité optimale et des débuts de journée toujours bien orchestrés !
		</p>
		<div class="participants">
			{#if $user?.users?.length === 0}
				<p>Aucun participant configuré pour vos daily</p>
			{/if}
			{#if $user?.users?.length > 0}
				{#key $user?.users}
					{#each $user?.users as speaker}
						<p
							on:click={() => {
								user.change({
									...$user,
									users: $user.users.filter((n) => n.name !== speaker.name)
								});
							}}
						>
							{speaker.name}
						</p>
					{/each}
				{/key}
			{/if}
			<input
				type="text"
				placeholder="Ajouter un participant"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						let formatted = e.target.value.trim();
						formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

						if (!$user?.users) {
							user.change({
								...$user,
								users: [
									{
										name: formatted,
										nickname: '',
										animation: '',
										avatar: '',
										birthday: null,
										lastDayOnProject: null
									}
								]
							});
							e.target.value = '';
							return;
						}

						if ($user.users.some((user) => user.name === formatted))
							return snacks.error('Ce participant est déjà dans la liste');

						user.change({
							...$user,
							users: [
								...$user.users,
								{
									name: formatted,
									nickname: '',
									animation: '',
									avatar: '',
									birthday: null,
									lastDayOnProject: null
								}
							]
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
		<h1>Meteo</h1>
		<p>Afficher la meteo de certaine ville à la fin de votre daily:</p>
		<div class="participants">
			{#if $user.weather}
				{#each $user.weather as weather}
					<p
						on:click={() => {
							user.change({
								...$user,
								weather: $user.weather.filter((w) => w !== weather)
							});
						}}
					>
						{weather}
					</p>
				{/each}
			{/if}
			<input
				placeholder="Ajouter une ville"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						let formatted = e.target.value.trim();
						formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

						if ($user.users.some((user) => user.name === formatted))
							return snacks.error('Ce ville est déjà selectionné');

						user.change({
							...$user,
							weather: [...($user.weather || []), formatted]
						});

						e.target.value = '';
					}
				}}
			/>
		</div>
	</div>

	<div class="container">
		<h1>Qwertee</h1>
		<p>Afficher les Tshirt du jour du site Qwertee:</p>
		<button
			on:click={() => user.change({ ...$user, qwertee: !$user.qwertee })}
			class:disabled={!$user.qwertee}
		>
			{#if $user.qwertee}
				Status: Activer
			{:else}
				Status: Désactiver
			{/if}
		</button>
	</div>

	<div class="container speaker">
		<h1>Speaker Information:</h1>

		{#if $user?.users?.length == 0}
			<p>Aucun n'utilisateur configurer pour vos daily</p>
		{/if}

		{#if $user?.users}
			{#each $user?.users as user, index}
				<div class="speaker-information">
					<label>Nom:</label>
					<input
						type="text"
						bind:value={user.name}
						on:keyup={(e) => {
							updateElementWithIndex(user.name, index, 'name');
						}}
					/>

					<label>Nickname:</label>
					<input
						type="text"
						bind:value={user.nickname}
						on:keyup={() => {
							updateElementWithIndex(user.nickname, user.name, 'nickname');
						}}
					/>

					<label>Animation:</label>
					<input
						type="text"
						bind:value={user.animation}
						on:keyup={() => {
							updateElementWithIndex(user.animation, index, 'animation');
						}}
					/>

					<label>Avatar:</label>
					<input
						type="text"
						bind:value={user.avatar}
						on:keyup={() => {
							updateElementWithIndex(user.avatar, index, 'avatar');
						}}
					/>

					<label>Décoration d'avatar:</label>
					<div class="decoration-section">
						<div class="avatar-preview-container">
							{#if user.avatar}
								<img
									src={'/avatar/' + user.avatar}
									alt="Avatar preview"
									class="avatar-preview-img"
									on:error={() => {
										// Fallback to generated avatar
									}}
								/>
							{:else}
								<img
									src={'https://api.dicebear.com/9.x/dylan/svg?seed=' + user.name}
									alt="Avatar preview"
									class="avatar-preview-img"
								/>
							{/if}
							{#if user.decoration}
								<AvatarDecoration decoration={user.decoration} avatarSize={73} />
							{/if}
						</div>
						<DecorationSelector
							selectedDecoration={user.decoration}
							on:decorationSelected={(e) => {
								updateElementWithIndex(e.detail, index, 'decoration');
							}}
						/>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<div class="button-manager">
		<button
			style=" width: 80%;"
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
	</div>

	<div class="container" style="display: none;">
		<h1>Débogueur</h1>
		{#key $user}
			<pre>{JSON.stringify($user, null, 2)}</pre>
		{/key}
	</div>
</section>

<style lang="scss">
	.disabled {
		background-color: var(--primary-100);
		color: var(--color-white);
	}

	.button-manager {
		display: flex;
		justify-content: center;
		position: sticky;
		bottom: 0;
		text-align: center;
		backdrop-filter: blur(5px);
		padding: 1em;
	}
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

		&.speaker {
			display: flex;
			flex-direction: column;
			gap: 1em;

			.speaker-information {
				background-color: var(--primary-200);
				padding: 0.5em;
				border-radius: 0.5em;
			}
		}

		button {
			width: max-content;
		}

		h1 {
			user-select: none;
			font-size: 1.5em;
		}
	}

	.decoration-section {
		display: flex;
		align-items: center;
		gap: 1em;
		margin-top: 0.5em;
		/* Ajouté un padding pour éviter que les décorations soient coupées */
		padding: 10px 0;
	}

	.avatar-preview-container {
		position: relative;
		border-radius: 50%;
		/* Enlevé overflow: hidden pour permettre aux décorations de dépasser */
		border: 2px solid var(--primary-400);
		/* Ajouté un padding pour laisser de l'espace aux décorations */
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--primary-50);
	}

	.avatar-preview-img {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 50%;
		position: relative;
		z-index: 1;
	}
</style>
