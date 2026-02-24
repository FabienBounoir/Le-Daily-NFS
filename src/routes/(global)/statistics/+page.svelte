<script>
	import { api } from '$lib/utils/api';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { slide } from 'svelte/transition';
	import { user } from '$lib/stores/user';
	import { snacks } from '$lib/stores/snacks';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	/**
	 * @type {any[]}
	 */
	let data = [];
	let speakers = [];
	let dailies = [];
	let totalCount = 0;
	let isLoading = false;
	let hasMoreData = true;

	let displayUserRemoved = false;

	let page = 0;
	const pageSize = 20;

	// Load initial data
	const loadInitialData = async () => {
		try {
			const response = await api.get(`/daily?page=${page}&size=${pageSize}`);
			dailies = response.dailies;
			totalCount = response.count;
			hasMoreData = dailies.length < totalCount;
		} catch (error) {
			console.error('Error loading initial data:', error);
		}
	};

	// Load more data for pagination
	const loadMoreData = async () => {
		if (isLoading || !hasMoreData) return;

		isLoading = true;
		page++;

		try {
			const response = await api.get(`/daily?page=${page}&size=${pageSize}`);
			dailies = [...dailies, ...response.dailies];
			hasMoreData = dailies.length < totalCount;
		} catch (error) {
			console.error('Error loading more data:', error);
			page--; // Revert page increment on error
		} finally {
			isLoading = false;
		}
	};

	// Intersection observer for infinite scroll
	let lastElement;
	let observer;

	const setupObserver = () => {
		if (observer) observer.disconnect();

		if (lastElement && hasMoreData) {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						loadMoreData();
					}
				},
				{ threshold: 0.1 }
			);
			observer.observe(lastElement);
		}
	};

	$: if (lastElement) {
		setupObserver();
	}

	onDestroy(() => {
		if (observer) observer.disconnect();
	});

	data = loadInitialData();
	speakers = api.get(`/daily/stats/${$user.teams[0]}/speakers`);

	const timeFormater = (time) => {
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = time % 60;

		return `${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''} ${seconds}s`;
	};

	const formatNumber = (number) => {
		if (number % 1 === 0) return number;
		return number.toFixed(1);
	};
</script>

<svelte:head>
	<title>Statistics - {$user?.username || ''}</title>
	<meta name="description" content="Voici le statistique des daily passé" />
</svelte:head>

<section>
	<!-- Speakers -->
	<div class="card">
		<div class="card-header">
			<span class="card-icon">👤</span>
			<div>
				<h2>Statistiques par speaker</h2>
				<p class="card-desc">Temps moyen et nombre de dailies</p>
			</div>
		</div>

		{#await speakers}
			<div class="speakers-grid">
				{#each Array(4).fill(0) as _}
					<div class="speaker-card skeleton">
						<span class="speaker-name skeleton-text">████████</span>
						<span class="speaker-stat skeleton-text">███ secondes</span>
						<span class="speaker-stat skeleton-text">██ dailies</span>
					</div>
				{/each}
			</div>
		{:then speakers}
			{#if speakers.length === 0}
				<p class="empty-state">Lance un daily pour voir les statistiques.</p>
			{:else}
				<div class="speakers-grid">
					{#key displayUserRemoved}
						{#each speakers as speaker (speaker._id)}
							{#if (!speaker.removed && $user.users?.some((u) => u.name === speaker.name)) || displayUserRemoved}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<div
									class="speaker-card {speaker.removed || !$user.users?.some((u) => u.name === speaker.name) ? 'speaker-card--off' : ''}"
									out:slide={{ duration: 300 }}
									on:click={() => goto(`/statistics/${speaker.name}`)}
								>
									<span class="speaker-name">{speaker.name}</span>
									<span class="speaker-stat">
										<i class="fa-solid fa-stopwatch-20"></i>
										~{formatNumber(speaker.moyenTime)} sec
									</span>
									<span class="speaker-stat">
										<i class="fa-solid fa-hashtag"></i>
										{speaker.totalDaily} dailies
									</span>
								</div>
							{/if}
						{/each}
					{/key}
				</div>

				{#if speakers.some((s) => s.removed || !$user.users?.some((u) => u.name === s.name))}
					<button class="btn-toggle-removed" on:click={() => { displayUserRemoved = !displayUserRemoved; }}>
						{displayUserRemoved ? 'Masquer les utilisateurs supprimés' : 'Afficher les utilisateurs supprimés'}
					</button>
				{/if}
			{/if}
		{:catch error}
			<p class="empty-state">{error}</p>
		{/await}
	</div>

	<!-- Historique -->
	<div class="card">
		<div class="card-header">
			<span class="card-icon">📋</span>
			<div>
				<h2>Historique des dailies</h2>
				<p class="card-desc">{totalCount} sessions enregistrées</p>
			</div>
		</div>

		<div class="dailies-list">
			{#await data}
				{#each Array(4).fill(0) as _}
					<div class="daily-row skeleton">
						<span class="skeleton-text">➜ Daily team nº00</span>
						<span class="spacer"></span>
						<span class="daily-meta skeleton-text">00:00:00</span>
						<span class="daily-meta skeleton-text">0</span>
						<span class="daily-meta skeleton-text">00:00 - 00/00/0000</span>
					</div>
				{/each}
			{:then _}
				{#each dailies as daily, i}
					<div class="daily-row">
						<span class="daily-index">➜ Daily {daily.team} <strong>n°{totalCount - i}</strong></span>
						<span class="spacer"></span>
						<span class="daily-meta"><i class="fa-solid fa-clock"></i> {timeFormater(daily.totalTime)}</span>
						<span class="daily-meta"><i class="fa-solid fa-user"></i> {daily?.users?.length}</span>
						<span class="daily-meta">
							<i class="fa-solid fa-calendar-days"></i>
							{`${new Date(daily?.date).getHours()}`.padStart(2, '0') +
								':' +
								`${new Date(daily?.date).getMinutes()}`.padStart(2, '0')} —
							{`${new Date(daily?.date).getDate()}`.padStart(2, '0') +
								'/' +
								`${new Date(daily?.date).getMonth() + 1}`.padStart(2, '0') +
								'/' +
								new Date(daily?.date).getFullYear()}
						</span>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<span
							class="daily-trash"
							on:click={async () => {
								try {
									await api.delete(`/daily/${daily._id}`);
									dailies = dailies.filter((_, index) => index !== i);
									totalCount--;
								} catch (e) {
									snacks.error(e.message);
								}
							}}
						>
							<i class="fa-solid fa-trash"></i>
						</span>
					</div>

					{#if i === dailies.length - 3 && hasMoreData}
						<div class="intersection-observer" bind:this={lastElement}></div>
					{/if}
				{/each}

				{#if isLoading}
					{#each Array(3).fill(0) as _}
						<div class="daily-row skeleton">
							<span class="skeleton-text">➜ Daily team nº00</span>
							<span class="spacer"></span>
							<span class="daily-meta skeleton-text">00:00:00</span>
							<span class="daily-meta skeleton-text">0</span>
							<span class="daily-meta skeleton-text">00:00 - 00/00/0000</span>
						</div>
					{/each}
				{/if}

				{#if dailies.length === 0 && !isLoading}
					<p class="empty-state">Aucun daily pour le moment.</p>
				{/if}

				{#if !hasMoreData && dailies.length > 0}
					<p class="end-of-list">Fin de la liste · {totalCount} dailies au total</p>
				{/if}
			{:catch error}
				<p class="empty-state">Oopsie… 🥸 {error}</p>
			{/await}
		</div>
	</div>
</section>

<style lang="scss">
	/* ── Layout ── */
	section {
		display: flex;
		flex-direction: column;
		gap: 1.5em;
		user-select: none;
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
			font-size: 1.1rem;
			font-weight: 700;
		}

		.card-desc {
			margin: 0;
			font-size: 0.875rem;
			opacity: 0.70;
		}
	}

	.card-icon {
		font-size: 1.4rem;
		line-height: 1;
	}

	/* ── Speakers grid ── */
	.speakers-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75em;
	}

	.speaker-card {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		padding: 1em 1.25em;
		background: var(--primary-100);
		border: 1px solid var(--primary-200);
		border-radius: 0.75em;
		cursor: pointer;
		transition: transform 0.15s, opacity 0.15s;

		&:hover {
			transform: translateY(-2px);
		}

		&--off {
			opacity: 0.45;
			filter: grayscale(1);
		}
	}

	.speaker-name {
		font-size: 1.1rem;
		font-weight: 700;
	}

	.speaker-stat {
		font-size: 0.9rem;
		opacity: 0.70;

		i {
			margin-right: 0.3em;
		}
	}

	/* ── Toggle removed button ── */
	.btn-toggle-removed {
		align-self: flex-start;
		background: var(--primary-100);
		border: 1px solid var(--primary-200);
		border-radius: 2em;
		padding: 0.5em 1.25em;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		color: inherit;
		user-select: none;
		transition: background 0.15s;

		&:hover {
			background: var(--primary-200);
		}
	}

	/* ── Dailies list ── */
	.dailies-list {
		display: flex;
		flex-direction: column;
		gap: 0;

		.daily-row:not(:last-child) {
			border-bottom: 1px solid var(--primary-100);
		}
	}

	.daily-row {
		display: flex;
		align-items: center;
		gap: 1.25em;
		padding: 0.9em 0;
		font-size: 1rem;
		flex-wrap: wrap;

		&.skeleton {
			opacity: 0.5;
			animation: breathe 2s infinite;
		}
	}

	.spacer {
		flex: 1;
	}

	.daily-index {
		font-weight: 500;
		white-space: nowrap;
	}

	.daily-meta {
		display: flex;
		align-items: center;
		gap: 0.35em;
		opacity: 0.70;
		white-space: nowrap;
		font-size: 0.9rem;

		i {
			font-size: 0.85rem;
		}
	}

	.daily-trash {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2em;
		height: 2.2em;
		border-radius: 0.5em;
		background: var(--primary-100);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
		flex-shrink: 0;

		&:hover {
			background: #fee2e2;
			color: #dc2626;
		}

		i {
			font-size: 0.9rem;
		}
	}

	/* ── Skeleton text ── */
	.skeleton-text {
		background: var(--primary-200);
		border-radius: 0.3em;
		color: transparent;
		pointer-events: none;
	}

	/* ── States ── */
	.empty-state {
		font-size: 0.95rem;
		opacity: 0.5;
		margin: 0;
	}

	.end-of-list {
		text-align: center;
		font-size: 0.875rem;
		color: var(--primary-400);
		padding: 0.75em 0 0;
	}

	.intersection-observer {
		height: 1px;
		visibility: hidden;
	}

	@keyframes breathe {
		0%, 100% { opacity: 0.4; }
		50%       { opacity: 0.8; }
	}
</style>
