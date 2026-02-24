<script>
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	const DAILY_START_SETTINGS_KEY = 'daily-start-settings';

	let users = $user.users;

	let timeByUser = $user.timer || 120;
	let randomized = true;
	let voiceSynthesis = true;
	let animationSpeakers = true;

	let dailyExists = false;

	let fullScreen = true;

	const persistDailyStartSettings = () => {
		window.localStorage.setItem(
			DAILY_START_SETTINGS_KEY,
			JSON.stringify({ randomized, voiceSynthesis, animationSpeakers, fullScreen })
		);
	};

	onMount(() => {
		if (window.localStorage.getItem('daily')) {
			const daily = JSON.parse(window.localStorage.getItem('daily'));
			if (daily.state === 'IN_PROGRESS') {
				dailyExists = true;
			}
		}

		const settings = window.localStorage.getItem(DAILY_START_SETTINGS_KEY);
		if (settings) {
			try {
				const parsedSettings = JSON.parse(settings);
				if (typeof parsedSettings.randomized === 'boolean') randomized = parsedSettings.randomized;
				if (typeof parsedSettings.voiceSynthesis === 'boolean')
					voiceSynthesis = parsedSettings.voiceSynthesis;
				if (typeof parsedSettings.animationSpeakers === 'boolean')
					animationSpeakers = parsedSettings.animationSpeakers;
				if (typeof parsedSettings.fullScreen === 'boolean') fullScreen = parsedSettings.fullScreen;
			} catch (e) {
				console.error(e);
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
				fullScreen: fullScreen,
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
		<div class="banner-resume">
			<div class="banner-resume-left">
				<span class="banner-icon">⚡</span>
				<div>
					<p class="banner-title">Daily en cours</p>
					<p class="banner-sub">Tu as une session non terminée</p>
				</div>
			</div>
			<button class="btn-resume" on:click={() => goto('/daily/start')}>
				Reprendre
			</button>
		</div>
	{/if}

	<div class="page-grid">
		<!-- Participants -->
		<div class="card">
			<div class="card-header">
				<span class="card-icon">👥</span>
				<div>
					<h2>Participants</h2>
					<p class="card-desc">{users.length} / {$user.users?.length || 0} sélectionnés</p>
				</div>
			</div>
			<div class="participants">
				{#if !$user.users || $user.users.length === 0}
					<p class="empty-state">Aucun participant — ajoute-en dans les paramètres.</p>
				{/if}
				{#each $user.users || [] as u}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<span
						class="chip {users.some((obj) => obj.name === u.name) ? 'chip-active' : 'chip-off'}"
						on:click={() => {
							if (users.some((obj) => obj.name === u.name)) {
								users = users.filter((n) => n.name !== u.name);
							} else {
								users = [...users, u];
							}
						}}
					>
						{#if !users.some((obj) => obj.name === u.name)}<s>{u.name}</s>{:else}{u.name}{/if}
					</span>
				{/each}
			</div>
		</div>

		<!-- Configuration -->
		<div class="card">
			<div class="card-header">
				<span class="card-icon">⚙️</span>
				<div>
					<h2>Configuration</h2>
					<p class="card-desc">Paramètres de la session</p>
				</div>
			</div>
			<div class="options-list">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="option-row" on:click={() => { randomized = !randomized; persistDailyStartSettings(); }}>
					<div class="option-left">
						<span class="option-icon">🔀</span>
						<div>
							<p class="option-label">Ordre aléatoire</p>
							<p class="option-sub">Mélange les participants</p>
						</div>
					</div>
					<div class="toggle {randomized ? 'on' : ''}"><div class="toggle-knob"></div></div>
				</div>

				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="option-row" on:click={() => { voiceSynthesis = !voiceSynthesis; persistDailyStartSettings(); }}>
					<div class="option-left">
						<span class="option-icon">🔊</span>
						<div>
							<p class="option-label">Synthèse vocale</p>
							<p class="option-sub">Annonce le nom du speaker</p>
						</div>
					</div>
					<div class="toggle {voiceSynthesis ? 'on' : ''}"><div class="toggle-knob"></div></div>
				</div>

				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="option-row" on:click={() => { animationSpeakers = !animationSpeakers; persistDailyStartSettings(); }}>
					<div class="option-left">
						<span class="option-icon">✨</span>
						<div>
							<p class="option-label">Animations</p>
							<p class="option-sub">Animations des participants</p>
						</div>
					</div>
					<div class="toggle {animationSpeakers ? 'on' : ''}"><div class="toggle-knob"></div></div>
				</div>

				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="option-row" on:click={() => { fullScreen = !fullScreen; persistDailyStartSettings(); }}>
					<div class="option-left">
						<span class="option-icon">🖥️</span>
						<div>
							<p class="option-label">Plein écran</p>
							<p class="option-sub">Lance en mode immersif</p>
						</div>
					</div>
					<div class="toggle {fullScreen ? 'on' : ''}"><div class="toggle-knob"></div></div>
				</div>
			</div>
		</div>

		<!-- Temps -->
		<div class="card card-timer">
			<div class="card-header">
				<span class="card-icon">⏱️</span>
				<div>
					<h2>Temps par participant</h2>
					<p class="card-desc">En secondes</p>
				</div>
			</div>
			<div class="timer-row">
				<button class="timer-btn" on:click={() => { if (timeByUser > 10) timeByUser -= 10; }}>−</button>
				<div class="timer-display">
					<input
						class="timer-value"
						type="number"
						bind:value={timeByUser}
						min="10"
						on:focus={(e) => e.currentTarget.select()}
					/>
					<span class="timer-unit">sec</span>
				</div>
				<button class="timer-btn" on:click={() => { timeByUser += 10; }}>+</button>
			</div>
		</div>
	</div>

	<button
		class="btn-start"
		on:click={() => start()}
		disabled={users?.length === 0 || !timeByUser || !$user.users}
	>
		{dailyExists ? '🚀 Nouveau daily' : '🚀 Démarrer le daily'}
	</button>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		gap: 1.5em;
	}

	/* ── Banner reprise ── */
	.banner-resume {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
		padding: 1em 1.5em;
		background: var(--primary-600);
		border-radius: 0.75em;
		color: white;
	}

	.banner-resume-left {
		display: flex;
		align-items: center;
		gap: 0.75em;
	}

	.banner-icon {
		font-size: 1.6rem;
		line-height: 1;
	}

	.banner-title {
		font-weight: 700;
		font-size: 1rem;
		margin: 0;
	}

	.banner-sub {
		font-size: 0.8rem;
		opacity: 0.85;
		margin: 0;
	}

	.btn-resume {
		width: auto;
		background: white;
		color: var(--primary-600);
		border: none;
		border-radius: 0.5em;
		padding: 0.5em 1.25em;
		font-weight: 700;
		cursor: pointer;
		font-size: 0.9rem;
		transition: opacity 0.2s;
		user-select: none;

		&:hover {
			opacity: 0.85;
		}
	}

	/* ── Grid ── */
	.page-grid {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: 1.25em;
		align-items: stretch;

		.card-timer {
			grid-column: 1 / -1;
		}

		@media (max-width: 600px) {
			grid-template-columns: 1fr;

			.card-timer {
				grid-column: auto;
			}
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
			opacity: 0.80;
		}
	}

	.card-icon {
		font-size: 1.4rem;
		line-height: 1;
	}

	/* ── Participants ── */
	.participants {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6em;
		user-select: none;
		flex: 1;
		align-content: flex-start;
		overflow-y: auto;
	}

	.empty-state {
		font-size: 0.85rem;
		opacity: 0.5;
		margin: 0;
	}

	.chip {
		padding: 0.4em 0.9em;
		border-radius: 2em;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.15s,
			opacity 0.15s;

		&:hover {
			opacity: 0.75;
		}
	}

	.chip-active {
		background: var(--primary-600);
		color: white;
	}

	.chip-off {
		background: var(--primary-100);
		color: var(--primary-400);
	}

	/* ── Options / toggles ── */
	.options-list {
		display: flex;
		flex-direction: column;
		gap: 0;

		.option-row:not(:last-child) {
			border-bottom: 1px solid var(--primary-100);
		}
	}

	.option-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75em 0;
		cursor: pointer;
		user-select: none;
		gap: 0.5em;

		&:hover .toggle-knob {
			opacity: 0.85;
		}
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
		opacity: 0.70;
	}

	/* Toggle switch */
	.toggle {
		width: 2.6em;
		height: 1.4em;
		border-radius: 2em;
		background: var(--primary-300);
		flex-shrink: 0;
		position: relative;
		transition: background 0.2s;

		&.on {
			background: var(--primary-600);
		}
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

		.toggle.on & {
			transform: translateX(1.2em);
		}
	}

	/* ── Timer ── */
	.card-timer {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

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

		&:hover {
			background: var(--primary-200);
		}
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
		&::-webkit-inner-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}

		&:focus {
			background: var(--primary-100);
			cursor: text;
		}
	}

	.timer-unit {
		font-size: 0.7rem;
		opacity: 0.80;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* ── Start button ── */
	.btn-start {
		width: 100%;
		padding: 0.9em;
		background: var(--primary-600);
		color: white;
		border: none;
		border-radius: 0.75em;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			background 0.2s,
			opacity 0.2s;
		user-select: none;

		&:hover:not(:disabled) {
			background: var(--primary-700);
		}

		&:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}
	}
</style>
