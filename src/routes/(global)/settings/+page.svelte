<script>
	import { updated } from '$app/stores';
	import Weather from '$lib/components/Weather.svelte';
	import myshades from '$lib/myshades';
	import { snacks } from '$lib/stores/snacks';
	import { user } from '$lib/stores/user';
	import { some } from 'd3';
	import DecorationSelector from '$lib/components/DecorationSelector.svelte';
	import AvatarDecoration from '$lib/components/AvatarDecoration.svelte';
	import GifSearcher from '$lib/components/GifSearcher.svelte';

	let color = $user.color;
	let timer = $user.timer;
	let showGifSearcher = false;
	let currentEditingUserIndex = null;

	$: color &&
		myshades({
			primary: color === 'random' ? `#${Math.floor(Math.random() * 16777215).toString(16)}` : color
		});
	$: timer && user.change({ ...$user, timer });

	const updateElementWithIndex = (valeur, index, key) => {
		let usersElement = $user.users;

		usersElement[index][key] = valeur;

		user.change({
			...$user,
			users: usersElement
		});
	};

	function openGifSearcher(userIndex) {
		currentEditingUserIndex = userIndex;
		showGifSearcher = true;
	}

	function handleGifSelected(event) {
		if (currentEditingUserIndex !== null) {
			updateElementWithIndex(event.detail.url, currentEditingUserIndex, 'animation');
		}
		showGifSearcher = false;
		currentEditingUserIndex = null;
	}

	function addProgrammedDate(isRecurring = false) {
		const newDate = isRecurring
			? {
					title: '',
					type: 'recurring',
					weekday: 1,
					description: '',
					autoRemove: false
				}
			: {
					title: '',
					type: 'regular',
					date: '',
					description: '',
					autoRemove: true
				};

		const currentDates = $user?.programmedDates || [];
		user.change({
			...$user,
			programmedDates: [...currentDates, newDate]
		});
	}

	function removeProgrammedDate(index) {
		const currentDates = $user?.programmedDates || [];
		const updatedDates = currentDates.filter((_, i) => i !== index);
		user.change({
			...$user,
			programmedDates: updatedDates
		});
	}

	function updateProgrammedDates() {
		if (!$user.programmedDates) {
			user.change({
				...$user,
				programmedDates: []
			});
		} else {
			user.change({ ...$user });
		}
	}

	const weekdayOptions = [
		{ value: 1, label: 'Lundi' },
		{ value: 2, label: 'Mardi' },
		{ value: 3, label: 'Mercredi' },
		{ value: 4, label: 'Jeudi' },
		{ value: 5, label: 'Vendredi' },
		{ value: 6, label: 'Samedi' },
		{ value: 0, label: 'Dimanche' }
	];
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
		<h1>EuroMillion</h1>
		<p>Afficher le tirage EuroMillion du jour dans vos daily:</p>
		<button
			on:click={() => user.change({ ...$user, euromillion: !$user.euromillion })}
			class:disabled={!$user.euromillion}
		>
			{#if $user.euromillion}
				Status: Activé
			{:else}
				Status: Désactivé
			{/if}
		</button>
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
					<div class="animation-input-section">
						<input
							type="text"
							bind:value={user.animation}
							placeholder="URL du GIF ou recherchez avec le bouton"
							on:keyup={() => {
								updateElementWithIndex(user.animation, index, 'animation');
							}}
						/>
						<button type="button" class="gif-search-btn" on:click={() => openGifSearcher(index)}>
							🔍 GIF
						</button>
					</div>

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

	<div class="container">
		<h1>Dates programmées</h1>
		<p>
			Configurez des dates importantes à afficher dans vos daily (événements, deadlines, congés,
			etc.)
		</p>

		<div class="dates-section">
			{#if !$user?.programmedDates || $user.programmedDates.length === 0}
				<p class="no-dates">Aucune date programmée pour le moment</p>
			{/if}

			{#if $user?.programmedDates && $user.programmedDates.length > 0}
				<div class="dates-list">
					{#each $user.programmedDates as dateItem, index}
						<div class="date-item">
							<div class="date-form">
								<h2>Type {dateItem.type === 'recurring' ? 'Récurrente' : 'Fixe'}</h2>

								<div class="form-row">
									<label>Titre:</label>
									<input
										type="text"
										bind:value={dateItem.title}
										placeholder="Ex: Déployment v2.0"
										on:input={() => updateProgrammedDates()}
									/>
								</div>

								{#if dateItem.type === 'recurring'}
									<div class="form-row">
										<label>Jour de la semaine:</label>
										<select bind:value={dateItem.weekday} on:change={() => updateProgrammedDates()}>
											{#each weekdayOptions as option}
												<option value={option.value}>{option.label}</option>
											{/each}
										</select>
									</div>
								{:else}
									<div class="form-row">
										<label>Date:</label>
										<input
											type="date"
											bind:value={dateItem.date}
											on:input={() => updateProgrammedDates()}
										/>
									</div>
								{/if}

								<div class="form-row">
									<label>Description (optionnel):</label>
									<input
										type="text"
										bind:value={dateItem.description}
										placeholder="Ex: Déployment de la nouvelle version"
										on:input={() => updateProgrammedDates()}
									/>
								</div>

								{#if dateItem.type !== 'recurring'}
									<div class="form-row checkbox-row">
										<label>
											<input
												type="checkbox"
												bind:checked={dateItem.autoRemove}
												on:change={() => updateProgrammedDates()}
											/>
											Masquer automatiquement après la date
										</label>
									</div>
								{/if}
							</div>

							<button
								class="delete-date-btn"
								on:click={() => removeProgrammedDate(index)}
								title="Supprimer cette date"
							>
								<i class="fa-solid fa-trash"></i>
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<div class="add-date-buttons">
				<button class="add-date-btn" on:click={() => addProgrammedDate(false)}>
					<i class="fa-solid fa-calendar-plus"></i>
					Ajouter une date fixe
				</button>
				<button class="add-date-btn recurring" on:click={() => addProgrammedDate(true)}>
					<i class="fa-solid fa-repeat"></i>
					Ajouter une date récurrente
				</button>
			</div>
		</div>
	</div>

	<GifSearcher bind:isOpen={showGifSearcher} on:gifSelected={handleGifSelected} />

	<div class="button-manager">
		<button
			style=" width: 80%;"
			on:click={async () => {
				try {
					console.log('Données avant sauvegarde:', {
						user: $user,
						programmedDates: $user.programmedDates,
						color,
						timer
					});

					const dataToSave = {
						...$user,
						timer,
						programmedDates: $user.programmedDates || [],
						color,
						euromillion: $user.euromillion || false
					};

					console.log('Données à sauvegarder:', dataToSave);

					const result = await user.save(dataToSave);

					console.log('Résultat sauvegarde:', result);

					snacks.success('Modifications enregistrées');
				} catch (error) {
					console.error('Erreur sauvegarde:', error);
					snacks.error(error.message);
				}
			}}
		>
			Enregistrer
		</button>
	</div>

	<div class="container">
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

	input:disabled {
		background-color: var(--primary-100);
		cursor: not-allowed;
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

		p:hover {
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

	.animation-input-section {
		display: flex;
		gap: 0.5rem;
		align-items: center;

		input {
			flex: 1;
		}

		.gif-search-btn {
			background-color: var(--primary-500);
			color: white;
			border: none;
			padding: 0.5rem 1rem;
			border-radius: 0.5rem;
			cursor: pointer;
			font-size: 0.9rem;
			white-space: nowrap;
			transition: background-color 0.2s;

			&:hover {
				background-color: var(--primary-600);
			}

			&:active {
				background-color: var(--primary-700);
			}
		}
	}

	// Styles pour les dates programmées
	.dates-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.no-dates {
		text-align: center;
		color: var(--primary-600);
		font-style: italic;
		padding: 2rem;
		background: var(--primary-50);
		border-radius: 0.5rem;
		border: 2px dashed var(--primary-200);
	}

	.dates-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.date-item {
		background: white;
		border: 1px solid var(--primary-200);
		border-radius: 0.75rem;
		padding: 1.5rem;
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

		&:hover {
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		}
	}

	.date-form {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-row {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;

		label {
			font-weight: 600;
			color: var(--primary-700);
			font-size: 0.9rem;
		}

		input[type='text'],
		input[type='date'] {
			padding: 0.6rem;
			border: 1px solid var(--primary-300);
			border-radius: 0.4rem;
			font-size: 0.9rem;

			&:focus {
				outline: none;
				border-color: var(--primary-500);
				box-shadow: 0 0 0 2px rgba(var(--primary-500-rgb), 0.2);
			}
		}

		&.checkbox-row {
			flex-direction: row;
			align-items: center;
			gap: 0.5rem;

			label {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				font-weight: normal;
				cursor: pointer;
			}

			input[type='checkbox'] {
				width: auto;
				margin: 0;
			}
		}
	}

	.delete-date-btn {
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;

		&:hover {
			background: #dc2626;
			transform: scale(1.05);
		}

		i {
			font-size: 0.9rem;
		}
	}

	.add-date-btn {
		background: var(--primary-500);
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.8rem 1.2rem;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		align-self: flex-start;

		&:hover {
			background: var(--primary-600);
			transform: translateY(-1px);
		}

		&.recurring {
			background: #06b6d4;

			&:hover {
				background: #0891b2;
			}
		}

		i {
			font-size: 0.8rem;
		}
	}

	.add-date-buttons {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.date-item.recurring {
		border-left: 4px solid #06b6d4;

		.date-form {
			background: linear-gradient(135deg, #cffafe 0%, #67e8f9 5%, white 5%);
		}
	}

	@media (max-width: 768px) {
		.date-item {
			flex-direction: column;
			align-items: stretch;

			.delete-date-btn {
				align-self: flex-end;
			}
		}

		.form-row {
			&.checkbox-row {
				flex-direction: column;
				align-items: flex-start;
			}
		}
	}
</style>
