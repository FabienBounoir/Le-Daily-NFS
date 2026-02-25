<script>
	import { onMount } from 'svelte';
	import myshades from '$lib/myshades';
	import { snacks } from '$lib/stores/snacks';
	import { user } from '$lib/stores/user';
	import DecorationSelector from '$lib/components/DecorationSelector.svelte';
	import AvatarDecoration from '$lib/components/AvatarDecoration.svelte';
	import GifSearcher from '$lib/components/GifSearcher.svelte';
	import { loadDecorations } from '$lib/stores/decorations.js';

	let color = $user.color;
	let timer = $user.timer;
	let showGifSearcher = false;
	let currentEditingUserIndex = null;
	let uploadingAvatarIndex = null;

	const convertToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64Data = reader.result.split(',')[1];
				resolve(base64Data);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	const handleAvatarUpload = async (event, index) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (file.size > 2 * 1024 * 1024) {
			snacks.error('Fichier trop volumineux (max 2 Mo)');
			return;
		}

		uploadingAvatarIndex = index;
		try {
			const base64 = await convertToBase64(file);
			const response = await fetch('/_api/upload', {
				method: 'POST',
				body: base64
			}).then((res) => res.json());

			if (!response.url) throw new Error('No URL returned');

			updateElementWithIndex(response.url, index, 'avatar');
			snacks.success('Avatar uploadé avec succès');
		} catch (e) {
			snacks.error("Erreur lors de l'upload de l'avatar");
		} finally {
			uploadingAvatarIndex = null;
			event.target.value = '';
		}
	};

	onMount(() => {
		loadDecorations();
	});

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

	function testPronunciation(nickname, userName) {
		const textToSpeak = nickname || userName;
		if (textToSpeak && 'speechSynthesis' in window) {
			speechSynthesis.cancel();

			const utterance = new SpeechSynthesisUtterance(textToSpeak);
			utterance.lang = 'fr-FR';
			utterance.rate = 0.8;
			utterance.pitch = 1;

			speechSynthesis.speak(utterance);
		} else {
			alert("La synthèse vocale n'est pas supportée par votre navigateur");
		}
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

	let showDebugger = false;

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

	<!-- ── Participants ── -->
	<div class="card">
		<div class="card-header">
			<span class="card-icon">👥</span>
			<div>
				<h2>Participants</h2>
				<p class="card-desc">{$user?.users?.length || 0} participant{($user?.users?.length || 0) > 1 ? 's' : ''} configuré{($user?.users?.length || 0) > 1 ? 's' : ''}</p>
			</div>
		</div>
		<div class="chips-wrap">
			{#if $user?.users?.length === 0}
				<p class="empty-state">Aucun participant — ajoutez-en ci-dessous.</p>
			{/if}
			{#key $user?.users}
				{#each $user?.users || [] as speaker}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<span
						class="chip chip-active"
						on:click={() => {
							user.change({
								...$user,
								users: $user.users.filter((n) => n.name !== speaker.name)
							});
						}}
					>
						{speaker.name} <span class="chip-remove">×</span>
					</span>
				{/each}
			{/key}
			<input
				class="inline-input"
				type="text"
				placeholder="＋ Ajouter un participant"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						let formatted = e.target.value.trim();
						formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

						if (!$user?.users) {
							user.change({
								...$user,
								users: [{ name: formatted, nickname: '', animation: '', avatar: '', birthday: null, lastDayOnProject: null, role: 'user' }]
							});
							e.target.value = '';
							return;
						}

						if ($user.users.some((u) => u.name === formatted))
							return snacks.error('Ce participant est déjà dans la liste');

						user.change({
							...$user,
							users: [...$user.users, { name: formatted, nickname: '', animation: '', avatar: '', birthday: null, lastDayOnProject: null }]
						});
						e.target.value = '';
					}
				}}
			/>
		</div>
	</div>

	<!-- ── Thème + Timer (2 colonnes) ── -->
	<div class="row-2">
		<!-- Thème -->
		<div class="card">
			<div class="card-header">
				<span class="card-icon">🎨</span>
				<div>
					<h2>Thème</h2>
					<p class="card-desc">Couleur principale de l'interface</p>
				</div>
			</div>
			<div class="color-row">
				{#if color !== 'random'}
					<label class="color-swatch-btn" style="--c: {color}">
						<input
							type="color"
							bind:value={color}
							on:change={() => user.change({ ...$user, color })}
						/>
						<span class="swatch-dot"></span>
						<span class="swatch-hex">{color.toUpperCase()}</span>
						<span class="swatch-caret">✏️</span>
					</label>
					<div class="color-presets">
						{#each ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#06b6d4'] as preset}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<button
								class="preset-dot {color === preset ? 'active' : ''}"
								style="--pc: {preset}"
								on:click={() => { color = preset; user.change({ ...$user, color }); }}
								title={preset}
							></button>
						{/each}
					</div>
				{/if}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="option-row"
					on:click={() => (color = color === 'random' ? `#${Math.floor(Math.random() * 16777215).toString(16)}` : 'random')}
				>
					<div class="option-left">
						<span class="option-icon">🔀</span>
						<div>
							<p class="option-label">Mode aléatoire</p>
							<p class="option-sub">Change la couleur à chaque visite</p>
						</div>
					</div>
					<div class="toggle {color === 'random' ? 'on' : ''}"><div class="toggle-knob"></div></div>
				</div>
			</div>
		</div>

		<!-- Timer -->
		<div class="card">
			<div class="card-header">
				<span class="card-icon">⏱️</span>
				<div>
					<h2>Temps par participant</h2>
					<p class="card-desc">En secondes</p>
				</div>
			</div>
			<div class="timer-row">
				<button class="timer-btn" on:click={() => { if (timer > 10) timer -= 10; }}>−</button>
				<div class="timer-display">
					<input
						class="timer-value"
						type="number"
						bind:value={timer}
						min="10"
						max="3600"
						on:focus={(e) => e.currentTarget.select()}
					/>
					<span class="timer-unit">sec</span>
				</div>
				<button class="timer-btn" on:click={() => { if (timer < 3600) timer += 10; }}>+</button>
			</div>
		</div>
	</div>

	<!-- ── Météo ── -->
	<div class="card">
		<div class="card-header">
			<span class="card-icon">🌤️</span>
			<div>
				<h2>Météo</h2>
				<p class="card-desc">Villes affichées en fin de daily</p>
			</div>
		</div>
		<div class="chips-wrap">
			{#if $user.weather}
				{#each $user.weather as weather}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<span
						class="chip chip-active"
						on:click={() => user.change({ ...$user, weather: $user.weather.filter((w) => w !== weather) })}
					>
						{weather} <span class="chip-remove">×</span>
					</span>
				{/each}
			{/if}
			<input
				class="inline-input"
				placeholder="＋ Ajouter une ville"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						let formatted = e.target.value.trim();
						formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
						user.change({ ...$user, weather: [...($user.weather || []), formatted] });
						e.target.value = '';
					}
				}}
			/>
		</div>
	</div>

	<!-- ── Widgets (EuroMillion / TruckToFood / Qwertee) ── -->
	<div class="card">
		<div class="card-header">
			<span class="card-icon">🎰</span>
			<div>
				<h2>Widgets</h2>
				<p class="card-desc">Modules affichés dans vos daily</p>
			</div>
		</div>
		<div class="options-list">

			<!-- EuroMillion toggle -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="option-row option-row--expandable">
				<div class="option-left" on:click={() => user.change({ ...$user, euromillion: { ...$user.euromillion, enabled: !($user.euromillion?.enabled || false) } })}>
					<span class="option-icon">🍀</span>
					<div class="option-text">
						<p class="option-label">EuroMillion</p>
						<p class="option-sub">Tirage du jour dans les daily</p>
						{#if $user.euromillion?.enabled}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div class="days-inline" on:click|stopPropagation>
								{#each [{ label: 'Lundi', value: 1 }, { label: 'Mardi', value: 2 }, { label: 'Mercredi', value: 3 }, { label: 'Jeudi', value: 4 }, { label: 'Vendredi', value: 5 }, { label: 'Samedi', value: 6 }, { label: 'Dimanche', value: 0 }] as day}
									<button
										type="button"
										class="day-btn"
										class:selected={($user.euromillion?.days || []).includes(day.value)}
										on:click={() => {
											const currentDays = $user.euromillion?.days || [];
											const newDays = currentDays.includes(day.value) ? currentDays.filter((d) => d !== day.value) : [...currentDays, day.value];
											user.change({ ...$user, euromillion: { ...$user.euromillion, enabled: true, days: newDays } });
										}}
									>{day.label}</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<div class="toggle {$user.euromillion?.enabled ? 'on' : ''}" on:click={() => user.change({ ...$user, euromillion: { ...$user.euromillion, enabled: !($user.euromillion?.enabled || false) } })}><div class="toggle-knob"></div></div>
			</div>

			{#if $user.username === 'nfs'}
				<!-- TruckToFood toggle -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="option-row option-row--expandable">
					<div class="option-left" on:click={() => user.change({ ...$user, truckToFood: { ...$user.truckToFood, enabled: !($user.truckToFood?.enabled || false) } })}>
						<span class="option-icon">🚚</span>
						<div class="option-text">
							<p class="option-label">Truck to Food</p>
							<p class="option-sub">Menu du jour dans les stats de fin</p>
							{#if $user.truckToFood?.enabled}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<div class="days-inline" on:click|stopPropagation>
									{#each [{ label: 'Lundi', value: 1 }, { label: 'Mardi', value: 2 }, { label: 'Mercredi', value: 3 }, { label: 'Jeudi', value: 4 }, { label: 'Vendredi', value: 5 }, { label: 'Samedi', value: 6 }, { label: 'Dimanche', value: 0 }] as day}
										<button
											type="button"
											class="day-btn"
											class:selected={($user.truckToFood?.days || []).includes(day.value)}
											on:click={() => {
												const currentDays = $user.truckToFood?.days || [];
												const newDays = currentDays.includes(day.value) ? currentDays.filter((d) => d !== day.value) : [...currentDays, day.value];
												user.change({ ...$user, truckToFood: { ...$user.truckToFood, enabled: true, days: newDays } });
											}}
										>{day.label}</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>
					<div class="toggle {$user.truckToFood?.enabled ? 'on' : ''}" on:click={() => user.change({ ...$user, truckToFood: { ...$user.truckToFood, enabled: !($user.truckToFood?.enabled || false) } })}><div class="toggle-knob"></div></div>
				</div>
			{/if}

			<!-- Qwertee toggle -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="option-row" on:click={() => user.change({ ...$user, qwertee: !$user.qwertee })}>
				<div class="option-left">
					<span class="option-icon">👕</span>
					<div>
						<p class="option-label">Qwertee</p>
						<p class="option-sub">T-shirts du jour</p>
					</div>
				</div>
				<div class="toggle {$user.qwertee ? 'on' : ''}"><div class="toggle-knob"></div></div>
			</div>
		</div>
	</div>

	<!-- ── Speaker Information ── -->
	<div class="card">
		<div class="card-header">
			<span class="card-icon">🎤</span>
			<div>
				<h2>Informations speakers</h2>
				<p class="card-desc">Personnalisez chaque participant</p>
			</div>
		</div>

		{#if $user?.users?.length === 0}
			<p class="empty-state">Aucun participant configuré.</p>
		{/if}

		<div class="speakers-grid">
			{#if $user?.users}
				{#each $user?.users as user, index}
					<div class="speaker-card">
						<div class="speaker-avatar-row">
							<div class="avatar-preview-container">
								{#if user.avatar}
									<img
										src={user.avatar.startsWith('http') ? user.avatar : user.avatar === 'bouns.svelte' ? '/avatar/bouns.png' : '/avatar/' + user.avatar}
										alt="Avatar"
										class="avatar-preview-img"
									/>
								{:else}
									<img
										src={'https://api.dicebear.com/9.x/dylan/svg?seed=' + user.name}
										alt="Avatar"
										class="avatar-preview-img"
									/>
								{/if}
								{#if user.decoration}
									<AvatarDecoration decoration={user.decoration} avatarSize={67} />
								{/if}
							</div>
							<div class="speaker-name-badge">{user.name}</div>
						</div>

						<div class="form-grid">
							<div class="field-group">
								<label>Nom</label>
								<input type="text" bind:value={user.name} on:keyup={() => updateElementWithIndex(user.name, index, 'name')} />
							</div>

							<div class="field-group">
								<label>Prononciation</label>
								<div class="input-action">
									<input type="text" bind:value={user.nickname} placeholder="Prononciation personnalisée" on:keyup={() => updateElementWithIndex(user.nickname, user.name, 'nickname')} />
									<button type="button" class="icon-btn" on:click={() => testPronunciation(user.nickname, user.name)} title="Tester">
										<i class="fa-solid fa-volume-high"></i>
									</button>
								</div>
							</div>

							<div class="field-group">
								<label>Anniversaire</label>
								<input type="date" bind:value={user.birthday} on:change={() => updateElementWithIndex(user.birthday || null, index, 'birthday')} />
							</div>

							<div class="field-group">
								<label>Animation (GIF)</label>
								<div class="input-action">
									<input type="text" bind:value={user.animation} placeholder="URL ou recherche" on:keyup={() => updateElementWithIndex(user.animation, index, 'animation')} />
									<button type="button" class="icon-btn" on:click={() => openGifSearcher(index)}>🔍</button>
								</div>
							</div>

							<div class="field-group full">
								<label>Avatar</label>
								<div class="input-action">
									<input type="text" bind:value={user.avatar} placeholder="Nom de fichier ou URL" on:keyup={() => updateElementWithIndex(user.avatar, index, 'avatar')} />
									<label class="icon-btn upload-label" title="Uploader">
										{#if uploadingAvatarIndex === index}
											<i class="fa-solid fa-spinner fa-spin"></i>
										{:else}
											<i class="fa-solid fa-upload"></i>
										{/if}
										<input type="file" accept="image/*" style="display:none" disabled={uploadingAvatarIndex !== null} on:change={(e) => handleAvatarUpload(e, index)} />
									</label>
								</div>
							</div>

							<div class="field-group full">
								<label>Décoration d'avatar</label>
								<DecorationSelector
									selectedDecoration={user.decoration}
									on:decorationSelected={(e) => updateElementWithIndex(e.detail, index, 'decoration')}
								/>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- ── Dates programmées ── -->
	<div class="card">
		<div class="card-header">
			<span class="card-icon">📅</span>
			<div>
				<h2>Dates programmées</h2>
				<p class="card-desc">Événements, deadlines, congés…</p>
			</div>
		</div>

		{#if !$user?.programmedDates || $user.programmedDates.length === 0}
			<p class="no-dates">Aucune date programmée pour le moment</p>
		{/if}

		{#if $user?.programmedDates && $user.programmedDates.length > 0}
			<div class="dates-list">
				{#each $user.programmedDates as dateItem, index}
					<div class="date-item" class:recurring={dateItem.type === 'recurring'}>
						<span class="date-type-badge">{dateItem.type === 'recurring' ? '🔁' : '📌'}</span>

						<div class="date-fields">
							<div class="date-field">
								<label>Titre</label>
								<input type="text" bind:value={dateItem.title} placeholder="Ex: Déployment v2.0" on:input={() => updateProgrammedDates()} />
							</div>

							{#if dateItem.type === 'recurring'}
								<div class="date-field date-field--short">
									<label>Jour</label>
									<select bind:value={dateItem.weekday} on:change={() => updateProgrammedDates()}>
										{#each weekdayOptions as option}
											<option value={option.value}>{option.label}</option>
										{/each}
									</select>
								</div>
							{:else}
								<div class="date-field date-field--short">
									<label>Date</label>
									<input type="date" bind:value={dateItem.date} on:input={() => updateProgrammedDates()} />
								</div>
							{/if}

							<div class="date-field">
								<label>Description</label>
								<input type="text" bind:value={dateItem.description} placeholder="Optionnel" on:input={() => updateProgrammedDates()} />
							</div>

							{#if dateItem.type !== 'recurring'}
								<div class="date-field date-field--auto">
									<label>Auto-masquer</label>
									<label class="mini-toggle">
										<input type="checkbox" bind:checked={dateItem.autoRemove} on:change={() => updateProgrammedDates()} />
										<span class="mini-toggle__track">
											<span class="mini-toggle__knob"></span>
										</span>
									</label>
								</div>
							{/if}
						</div>

						<button class="delete-btn" on:click={() => removeProgrammedDate(index)} title="Supprimer">
							<i class="fa-solid fa-trash"></i>
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<div class="add-date-buttons">
			<button class="add-btn" on:click={() => addProgrammedDate(false)}>
				<i class="fa-solid fa-calendar-plus"></i> Date fixe
			</button>
			<button class="add-btn recurring" on:click={() => addProgrammedDate(true)}>
				<i class="fa-solid fa-repeat"></i> Date récurrente
			</button>
		</div>
	</div>

	<GifSearcher bind:isOpen={showGifSearcher} on:gifSelected={handleGifSelected} />

	<!-- ── Bouton Enregistrer ── -->
	<div class="button-manager">
		<button
			on:click={async () => {
				try {
					const dataToSave = {
						...$user,
						timer,
						programmedDates: $user.programmedDates || [],
						color,
						euromillion: $user.euromillion || { enabled: false, days: [] },
						truckToFood: $user.truckToFood || { enabled: false, days: [] }
					};
					await user.save(dataToSave);
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

	<!-- ── Débogueur ── -->
	<div class="card">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="card-header clickable" on:click={() => (showDebugger = !showDebugger)}>
			<span class="card-icon">🐛</span>
			<div>
				<h2>Débogueur {showDebugger ? '▲' : '▼'}</h2>
				<p class="card-desc">État brut du store utilisateur</p>
			</div>
		</div>
		{#if showDebugger}
			{#key $user}
				<pre class="debug-pre">{JSON.stringify($user, null, 2)}</pre>
			{/key}
		{/if}
	</div>

</section>

<style lang="scss">
	/* ── Layout ── */
	section {
		display: flex;
		flex-direction: column;
		gap: 1.5em;
	}

	.row-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25em;

		@media (max-width: 640px) {
			grid-template-columns: 1fr;
		}
	}

	/* ── Card ── */
	.card {
		background: var(--primary-50);
		border: 1px solid var(--primary-100);
		border-radius: 0.875em;
		padding: 1.25em 1.5em;
		display: flex;
		flex-direction: column;
		gap: 1.25em;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.75em;

		h2 {
			margin: 0;
			font-size: 1rem;
			font-weight: 700;
		}

		.card-desc {
			margin: 0;
			font-size: 0.78rem;
			opacity: 0.8;
		}

		&.clickable {
			cursor: pointer;
			user-select: none;
		}
	}

	.card-icon {
		font-size: 1.4rem;
		line-height: 1;
	}

	/* ── Chips ── */
	.chips-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
		align-items: center;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		padding: 0.4em 0.85em;
		border-radius: 2em;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		user-select: none;
		transition: opacity 0.15s, background 0.15s;

		&:hover { opacity: 0.75; }
	}

	.chip-active {
		background: var(--primary-600);
		color: white;
	}

	.chip-remove {
		font-size: 1rem;
		line-height: 1;
		opacity: 0.7;
	}

	.inline-input {
		background: transparent;
		border: 1.5px dashed var(--primary-300);
		border-radius: 2em;
		padding: 0.4em 0.85em;
		font-size: 0.875rem;
		color: inherit;
		outline: none;
		width: auto;
		min-width: 80px;
		max-width: 220px;
		transition: border-color 0.15s, max-width 0.2s;

		&:focus {
			border-color: var(--primary-500);
			border-style: solid;
			max-width: 260px;
		}

		&::placeholder { opacity: 0.6; }
	}

	/* ── Empty / info states ── */
	.empty-state {
		font-size: 0.85rem;
		opacity: 0.5;
		margin: 0;
	}

	/* ── Color picker ── */
	.color-row {
		display: flex;
		flex-direction: column;
		gap: 0.85em;
	}

	.color-swatch-btn {
		display: flex;
		align-items: center;
		gap: 0.75em;
		padding: 0.65em 1em;
		border-radius: 0.75em;
		border: 2px solid var(--c, #6366f1);
		background: color-mix(in srgb, var(--c, #6366f1) 10%, transparent);
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: box-shadow 0.2s, border-color 0.2s;

		&:hover {
			box-shadow: 0 0 0 4px color-mix(in srgb, var(--c, #6366f1) 25%, transparent);
		}

		input[type='color'] {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			opacity: 0;
			cursor: pointer;
			border: 0;
			padding: 0;
		}
	}

	.swatch-dot {
		width: 2em;
		height: 2em;
		border-radius: 0.45em;
		background: var(--c, #6366f1);
		flex-shrink: 0;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
	}

	.swatch-hex {
		flex: 1;
		font-size: 0.95rem;
		font-weight: 700;
		font-family: monospace;
		letter-spacing: 0.08em;
	}

	.swatch-caret {
		font-size: 0.85rem;
		opacity: 0.6;
	}

	.color-presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
	}

	.preset-dot {
		width: 1.9em;
		height: 1.9em;
		border-radius: 50%;
		background: var(--pc);
		border: 2.5px solid transparent;
		cursor: pointer;
		padding: 0;
		transition: transform 0.15s, box-shadow 0.15s;
		outline: none;

		&:hover {
			transform: scale(1.18);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		}

		&.active {
			border-color: white;
			box-shadow: 0 0 0 2.5px var(--pc), 0 2px 8px rgba(0, 0, 0, 0.25);
			transform: scale(1.18);
		}
	}

	/* ── Toggle switch (same as daily page) ── */
	.option-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75em 0;
		cursor: pointer;
		user-select: none;
		gap: 0.5em;
	}

	.option-left {
		display: flex;
		align-items: center;
		gap: 0.65em;
	}

	.option-icon {
		font-size: 1.1rem;
		width: 1.5em;
		text-align: center;
	}

	.option-label {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.option-sub {
		margin: 0;
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.toggle {
		width: 2.6em;
		height: 1.4em;
		border-radius: 2em;
		background: var(--primary-300);
		flex-shrink: 0;
		position: relative;
		transition: background 0.2s;

		&.on { background: var(--primary-600); }
	}

	.toggle-knob {
		position: absolute;
		top: 0.15em;
		left: 0.15em;
		width: 1.1em;
		height: 1.1em;
		border-radius: 50%;
		background: white;
		transition: transform 0.2s;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

		.toggle.on & { transform: translateX(1.2em); }
	}

	/* ── Options list (dividers) ── */
	.options-list {
		display: flex;
		flex-direction: column;
		gap: 0;

		.option-row:not(:last-child) {
			border-bottom: 1px solid var(--primary-100);
		}
	}

	/* ── Days inline ── */
	.option-row--expandable {
		align-items: flex-start;

		.option-left {
			flex: 1;
			align-items: flex-start;
		}

		.toggle {
			margin-top: 0.15em;
			flex-shrink: 0;
		}
	}

	.option-text {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
		flex: 1;
		min-width: 0;
	}

	.days-inline {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35em;
		margin-top: 0.4em;
	}

	.days-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;
	}

	.day-btn {
		padding: 0.35em 0.75em;
		border: 1.5px solid var(--primary-200);
		background: white;
		color: var(--primary-600);
		border-radius: 2em;
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 600;
		transition: all 0.15s ease;
		width: auto;
		flex-shrink: 0;

		&:hover { border-color: var(--primary-400); background: var(--primary-50); }

		&.selected {
			background: var(--primary-600);
			border-color: var(--primary-600);
			color: white;
		}
	}

	.warning {
		margin: 0.5em 0 0 0;
		font-size: 0.8rem;
		color: #d97706;
	}

	/* ── Timer ── */
	.timer-row {
		display: flex;
		align-items: center;
		gap: 0.75em;
	}

	.timer-btn {
		width: 2.2em;
		height: 2.2em;
		border-radius: 0.5em;
		border: none;
		background: var(--primary-200);
		color: var(--primary-800);
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s;
		user-select: none;

		&:hover { background: var(--primary-300); }
	}

	.timer-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 3.5em;
	}

	.timer-value {
		font-size: 1.6rem;
		font-weight: 700;
		line-height: 1;
		width: 3.5em;
		text-align: center;
		border: none;
		background: transparent;
		color: inherit;
		outline: none;
		cursor: pointer;
		border-radius: 0.3em;
		transition: background 0.15s;
		-moz-appearance: textfield;

		&::-webkit-outer-spin-button,
		&::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

		&:focus { background: var(--primary-100); cursor: text; }
	}

	.timer-unit {
		font-size: 0.7rem;
		opacity: 0.8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* ── Speakers grid ── */
	.speakers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 1em;

		@media (max-width: 640px) {
			grid-template-columns: 1fr;
		}
	}

	.speaker-card {
		background: white;
		border: 1px solid var(--primary-200);
		border-radius: 0.75em;
		padding: 1em;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.speaker-avatar-row {
		display: flex;
		align-items: center;
		gap: 0.75em;
	}

	.speaker-name-badge {
		font-weight: 700;
		font-size: 1rem;
	}

	.avatar-preview-container {
		position: relative;
		border-radius: 50%;
		border: 2px solid var(--primary-400);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--primary-50);
		flex-shrink: 0;
	}

	.avatar-preview-img {
		width: 56px;
		height: 56px;
		object-fit: cover;
		border-radius: 50%;
		position: relative;
		z-index: 1;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6em;

		@media (max-width: 480px) {
			grid-template-columns: 1fr;
		}
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.3em;

		&.full { grid-column: 1 / -1; }

		label {
			font-size: 0.75rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.04em;
			opacity: 0.6;
		}

		input {
			padding: 0.5em 0.65em;
			border: 1px solid var(--primary-200);
			border-radius: 0.4em;
			font-size: 0.875rem;
			background: var(--primary-50);
			color: inherit;
			outline: none;
			width: 100%;

			&:focus {
				border-color: var(--primary-500);
				background: white;
			}
		}
	}

	.input-action {
		display: flex;
		gap: 0.4em;
		align-items: center;

		input { flex: 1; }
	}

	.icon-btn {
		background: var(--primary-500);
		color: white;
		border: none;
		border-radius: 0.4em;
		width: 34px;
		height: 34px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.875rem;
		flex-shrink: 0;
		transition: background 0.15s;

		&:hover { background: var(--primary-600); }
	}

	.upload-label { cursor: pointer; }

	/* ── Dates programmées ── */
	.dates-list {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.date-item {
		background: white;
		border: 1px solid var(--primary-200);
		border-radius: 0.6em;
		padding: 0.6em 0.75em;
		display: flex;
		align-items: center;
		gap: 0.75em;

		&.recurring { border-left: 3px solid #06b6d4; }
	}

	.date-type-badge {
		font-size: 1rem;
		flex-shrink: 0;
		line-height: 1;
		opacity: 0.8;
	}

	.date-fields {
		flex: 1;
		display: flex;
		align-items: flex-end;
		gap: 0.5em;
		flex-wrap: wrap;
	}

	.date-field {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		flex: 1;
		min-width: 120px;

		&--short { flex: 0 0 130px; }
		&--auto  { flex: 0 0 auto; min-width: unset; }
		label:first-child {
			font-size: 0.7rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.04em;
			opacity: 0.55;
		}

		input[type='text'],
		input[type='date'],
		select {
			padding: 0.45em 0.6em;
			border: 1px solid var(--primary-200);
			border-radius: 0.4em;
			font-size: 0.85rem;
			background: var(--primary-50);
			color: inherit;
			outline: none;
			width: 100%;

			&:focus {
				border-color: var(--primary-500);
				background: white;
			}
		}
	}

	.date-field--auto {
		flex: 0 0 auto;
		min-width: unset;
		align-items: center;
	}

	.mini-toggle {
		display: flex;
		align-items: center;
		cursor: pointer;
		margin: 0.35em 0 0.2em;

		input[type='checkbox'] {
			display: none;
		}

		&__track {
			position: relative;
			width: 32px;
			height: 18px;
			background: var(--primary-200);
			border-radius: 999px;
			transition: background 0.2s;
		}

		&__knob {
			position: absolute;
			top: 2px;
			left: 2px;
			width: 14px;
			height: 14px;
			background: white;
			border-radius: 50%;
			transition: transform 0.2s;
			box-shadow: 0 1px 3px rgba(0,0,0,0.2);
		}

		input:checked + .mini-toggle__track {
			background: var(--primary-500);
		}

		input:checked + .mini-toggle__track .mini-toggle__knob {
			transform: translateX(14px);
		}
	}

	.delete-btn {
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.15s, transform 0.15s;
		flex-shrink: 0;

		&:hover { background: #dc2626; transform: scale(1.05); }

		i { font-size: 0.85rem; }
	}

	.no-dates {
		text-align: center;
		color: var(--primary-600);
		font-style: italic;
		padding: 1.5rem;
		background: var(--primary-50);
		border-radius: 0.5rem;
		border: 2px dashed var(--primary-200);
		font-size: 0.875rem;
		margin: 0;
	}

	.add-date-buttons {
		display: flex;
		gap: 0.75em;
		flex-wrap: wrap;
	}

	.add-btn {
		background: var(--primary-600);
		color: white;
		border: none;
		border-radius: 0.5em;
		padding: 0.6em 1.1em;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4em;
		transition: background 0.15s, transform 0.15s;

		&:hover { background: var(--primary-700); transform: translateY(-1px); }

		&.recurring { background: #06b6d4; &:hover { background: #0891b2; } }
	}

	/* ── Debug pre ── */
	.debug-pre {
		font-size: 0.75rem;
		background: var(--primary-100);
		border-radius: 0.5em;
		padding: 1em;
		overflow: auto;
		max-height: 400px;
	}

	/* ── Save button ── */
	.button-manager {
		display: flex;
		justify-content: center;
		position: sticky;
		bottom: 0;
		text-align: center;
		background: linear-gradient(to top, #ffffff 60%, transparent);
		padding: 1.5em 1em;
		z-index:10;

		button {
			width: 50%;
			padding: 0.9em 2em;
			font-size: 1.05em;
			font-weight: 600;
			border-radius: 2em;
			background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
			color: white;
			border: none;
			cursor: pointer;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
			transition: transform 0.15s ease, box-shadow 0.15s ease;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 22px rgba(0, 0, 0, 0.25);
			}

			&:active {
				transform: translateY(0);
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
			}
		}

		@media (max-width: 768px) {
			padding: 1em 0.75em;

			button {
				width: 100%;
				font-size: 1em;
				padding: 0.85em 1.5em;
			}
		}
}
</style>
