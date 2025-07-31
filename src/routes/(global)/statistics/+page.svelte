<script>
	import { api } from '$lib/utils/api';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { scale, slide } from 'svelte/transition';
	import { user } from '$lib/stores/user';
	import { snacks } from '$lib/stores/snacks';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

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

<main>
	<section class="speakers">
		<div class="section-header">
			<h2>❖ Les Statistiques par speakers</h2>
			<a href="/recap" class="recap-button"> 🎯 Générer un récap </a>
		</div>
		<div>
			{#await speakers}
				<p>loading...</p>
			{:then speakers}
				{#if speakers.length === 0}
					<p>Lancer un daily pour voir les statistiques</p>
				{:else}
					{#key displayUserRemoved}
						{#each speakers as speaker, i (speaker._id)}
							{#if !speaker.removed || displayUserRemoved}
								<div
									out:slide={{ duration: 300 }}
									on:click={() => goto(`/statistics/${speaker.name}`)}
									class:grayscale={speaker.removed}
								>
									<h1>{speaker.name}</h1>
									<p>
										<i class="fa-solid fa-stopwatch-20"></i>
										~{formatNumber(speaker.moyenTime)} secondes
									</p>
									<p><i class="fa-solid fa-hashtag"></i> {speaker.totalDaily} dailies</p>
								</div>
							{/if}
						{/each}
					{/key}

					{#if speakers.some((s) => s.removed)}
						<button
							on:click={() => {
								displayUserRemoved = !displayUserRemoved;
							}}
						>
							{displayUserRemoved
								? 'Cacher les utilisateurs supprimés'
								: 'Afficher les utilisateurs supprimés'}
						</button>
					{/if}
				{/if}
			{:catch error}
				<p>{error}</p>
			{/await}
		</div>
	</section>

	<section class="dailies">
		<h2>❖ Historique des dailies</h2>
		<div>
			{#await data}
				{#each Array(Math.floor(Math.random() * 5) + 3).fill(0) as _}
					<div class="daily-squeleton">
						<p><span>➜ Daily team</span></p>
						<span class="spacer"></span>
						<p><span>00:00:00</span> <i class="fa-solid fa-clock"></i></p>
						<p><span>0</span> <i class="fa-solid fa-user" /></p>
						<p><span>00:00 - 00/00/0000</span> <i class="fa-solid fa-calendar-days"></i></p>
						<i class="fa-solid fa-trash"></i>
					</div>
				{/each}
			{:then _}
				{#each dailies as daily, i}
					<div
						class="daily"
						on:mouseover={(e) => {
							if (e.target.tagName === 'I' && e.target.classList.contains('fa-trash'))
								e.fromElement.style.filter = 'grayscale(1)';
							else if (e.target.tagName === 'DIV') e.target.style.filter = 'grayscale(0)';
						}}
						on:mouseout={(e) => {
							e.fromElement.style.filter = 'grayscale(0)';
						}}
					>
						<p>➜ Daily {daily.team} n°{totalCount - i}</p>
						<span class="spacer"></span>
						<p>{timeFormater(daily.totalTime)} <i class="fa-solid fa-clock"></i></p>

						<p>{daily?.users?.length} <i class="fa-solid fa-user" /></p>

						<p>
							{`${new Date(daily?.date).getHours()}`.padStart(2, '0') +
								':' +
								`${new Date(daily?.date).getMinutes()}`.padStart(2, '0')} -
							{`${new Date(daily?.date).getDate()}`.padStart(2, '0') +
								'/' +
								`${new Date(daily?.date).getMonth() + 1}`.padStart(2, '0') +
								'/' +
								new Date(daily?.date).getFullYear()} <i class="fa-solid fa-calendar-days"></i>
						</p>

						<i
							on:click={async () => {
								try {
									await api.delete(`/daily/${daily._id}`);
									dailies = dailies.filter((_, index) => index !== i);
									totalCount--;
								} catch (e) {
									snacks.error(e.message);
								}
							}}
							class="fa-solid fa-trash"
						></i>
					</div>

					<!-- Intersection observer target for the last few items -->
					{#if i === dailies.length - 3 && hasMoreData}
						<div bind:this={lastElement} style="height: 1px;"></div>
					{/if}
				{/each}

				{#if isLoading}
					{#each Array(3).fill(0) as _}
						<div class="daily-squeleton">
							<p><span>➜ Daily team</span></p>
							<span class="spacer"></span>
							<p><span>00:00:00</span> <i class="fa-solid fa-clock"></i></p>
							<p><span>0</span> <i class="fa-solid fa-user" /></p>
							<p><span>00:00 - 00/00/0000</span> <i class="fa-solid fa-calendar-days"></i></p>
							<i class="fa-solid fa-trash"></i>
						</div>
					{/each}
				{/if}

				{#if dailies.length === 0 && !isLoading}
					<p>Aucun daily pour le moment</p>
				{/if}

				{#if !hasMoreData && dailies.length > 0}
					<p style="text-align: center; color: var(--primary-400); margin-top: 2em;">
						Fin de la liste - {totalCount} dailies au total
					</p>
				{/if}
			{:catch error}
				<h1>Oopsie... 🥸</h1>
				<p>{error}</p>
			{/await}
		</div>
	</section>
</main>

<style lang="scss">
	main {
		user-select: none;
		display: flex;
		flex-direction: column;
		gap: 3em;
	}
	h2 {
		font-size: 1.2em;
		font-weight: 600;
		text-align: left;
	}

	button {
		user-select: initial;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1em;

		.recap-button {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			text-decoration: none;
			padding: 0.8em 1.5em;
			border-radius: 12px;
			font-weight: 600;
			font-size: 0.9em;
			display: flex;
			align-items: center;
			gap: 0.5em;
			transition:
				transform 0.2s,
				box-shadow 0.2s;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
			}
		}
	}

	.speakers {
		.grayscale {
			filter: grayscale(1);
		}

		& > div {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 1em;
			flex-wrap: wrap;

			h1 {
				font-size: 1.7em;
				font-weight: 700;
			}

			div {
				display: flex;
				flex-direction: column;
				border: 0px solid black;
				border-radius: 0.5em;
				padding: 1em;
				gap: 0.5em;
				background-color: var(--primary-100);
				width: 100%;
				align-items: left;
				transition: filter 0.5s;
				width: fit-content;
				transition: transform 0.5s;
				cursor: pointer;

				&:hover {
					transform: scale(1.05);
				}

				.spacer {
					flex: 1;
				}

				> i {
					cursor: pointer;
					background-color: var(--primary-300);
					padding: 0.5em;
					border-radius: 0.5em;
				}
			}
		}
	}

	.dailies {
		& > div {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1em;

			div {
				display: flex;
				flex-direction: row;
				border: 0px solid black;
				border-radius: 0.5em;
				padding: 1em;
				gap: 2em;
				background-color: var(--primary-100);
				width: 100%;
				align-items: center;
				transition: filter 0.5s;

				.spacer {
					flex: 1;
				}

				> i {
					cursor: pointer;
					background-color: var(--primary-300);
					padding: 0.5em;
					border-radius: 0.5em;
				}
			}
		}

		h1 {
			font-size: 2em;
			font-weight: 700;
		}

		.daily-squeleton {
			filter: opacity(0.7);

			p {
				span {
					background-color: var(--primary-600);
					border-radius: 0.5em;
					color: transparent;
					animation: breathe 2s infinite;
				}
			}

			@keyframes breathe {
				0% {
					filter: opacity(0.5);
				}
				50% {
					filter: opacity(1);
				}
				100% {
					filter: opacity(0.5);
				}
			}
		}
	}
</style>
