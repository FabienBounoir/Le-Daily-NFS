<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AvatarDecoration from '$lib/components/AvatarDecoration.svelte';

	/** @type {Array<{name: string, value: string, url: string}>} */
	let allDecorations = [];
	/** @type {Array<{name: string, value: string, url: string}>} */
	let displayedDecorations = [];
	let loading = true;
	let loadingMore = false;
	let searchTerm = '';
	let currentPage = 0;
	const itemsPerPage = 50;
	let hasMoreItems = true;
	let scrollContainer;

	const DECORATION_BASE_URL =
		'https://raw.githubusercontent.com/fabienbounoir/avatar-decorations/main/public/decorations/';

	// Fonction pour générer l'URL de l'avatar DiceBear
	function getAvatarUrl(decorationValue) {
		return `https://api.dicebear.com/7.x/avataaars/svg?seed=${decorationValue}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
	}

	$: filteredDecorations =
		searchTerm.trim() === ''
			? allDecorations
			: allDecorations.filter((decoration) =>
					decoration.name.toLowerCase().includes(searchTerm.toLowerCase())
				);

	async function loadAllDecorations() {
		try {
			const response = await fetch('/_api/tools/decorations');
			const data = await response.json();

			if (data.success && Array.isArray(data.decorations)) {
				allDecorations = data.decorations.map((decoration) => ({
					name: decoration.formattedName,
					value: decoration.name,
					url: `${DECORATION_BASE_URL}${decoration.name}.png`
				}));

				if (data.fallback) {
					console.warn('API GitHub indisponible, utilisation du fallback');
				}

				// Charger les premiers éléments automatiquement
				loadMoreItems();
			} else {
				throw new Error(data.error || 'Réponse invalide du serveur');
			}
		} catch (error) {
			console.warn('Erreur lors du chargement des décorations:', error);
			// Fallback en cas d'erreur
			allDecorations = [
				{ name: 'Angel', value: 'angel', url: `${DECORATION_BASE_URL}angel.png` },
				{ name: 'Cat Ears', value: 'cat_ears', url: `${DECORATION_BASE_URL}cat_ears.png` },
				{ name: 'Devil', value: 'devil', url: `${DECORATION_BASE_URL}devil.png` },
				{ name: 'Fire', value: 'fire', url: `${DECORATION_BASE_URL}fire.png` },
				{ name: 'Lightning', value: 'lightning', url: `${DECORATION_BASE_URL}lightning.png` },
				{ name: 'Butterflies', value: 'butterflies', url: `${DECORATION_BASE_URL}butterflies.png` },
				{ name: 'Flower Clouds', value: 'flower_clouds', url: `${DECORATION_BASE_URL}flower_clouds.png` },
				{ name: 'Stardust', value: 'stardust', url: `${DECORATION_BASE_URL}stardust.png` },
				{ name: 'Hugh The Rainbow', value: 'hugh_the_rainbow', url: `${DECORATION_BASE_URL}hugh_the_rainbow.png` },
				{ name: 'Sunflowers', value: 'sunflowers', url: `${DECORATION_BASE_URL}sunflowers.png` },
				{ name: 'Snowfall', value: 'snowfall', url: `${DECORATION_BASE_URL}snowfall.png` },
				{ name: 'Pirate Captain', value: 'pirate_captain', url: `${DECORATION_BASE_URL}pirate_captain.png` }
			];
			loadMoreItems();
		} finally {
			loading = false;
		}
	}

	function loadMoreItems() {
		if (loadingMore || !hasMoreItems) return;

		loadingMore = true;
		const startIndex = currentPage * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const newItems = filteredDecorations.slice(startIndex, endIndex);

		if (newItems.length === 0) {
			hasMoreItems = false;
		} else {
			displayedDecorations = [...displayedDecorations, ...newItems];
			currentPage++;
		}

		loadingMore = false;
	}

	function onSearch() {
		// Réinitialiser lors d'une recherche
		displayedDecorations = [];
		currentPage = 0;
		hasMoreItems = true;
		loadMoreItems();
	}

	function handleScroll() {
		if (!scrollContainer) return;

		const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
		if (scrollTop + clientHeight >= scrollHeight - 100) {
			loadMoreItems();
		}
	}

	function copyDecorationUrl(decoration) {
		navigator.clipboard.writeText(decoration.url);
		// Vous pouvez ajouter une notification ici
		console.log(`URL copiée: ${decoration.url}`);
	}

	onMount(() => {
		loadAllDecorations();
	});

	// Réagir aux changements de recherche
	$: if (searchTerm !== undefined && allDecorations.length > 0) {
		onSearch();
	}
</script>

<svelte:head>
	<title>Galerie de Décorations d'Avatar - Le Daily NFS</title>
</svelte:head>

<div class="decorations-page">
	<header class="page-header">
		<div class="header-content">
			<h1>
				<i class="fa-solid fa-palette"></i>
				Galerie de Décorations d'Avatar
			</h1>
			<div class="stats">
				{#if loading}
					<span class="loading-text">Chargement...</span>
				{:else}
					<span class="total-count">{allDecorations.length} décorations disponibles</span>
				{/if}
			</div>
		</div>
	</header>

	<div class="search-section">
		<div class="search-container">
			<i class="fa-solid fa-search"></i>
			<input
				type="text"
				placeholder="Rechercher une décoration..."
				bind:value={searchTerm}
				class="search-input"
			/>
			{#if searchTerm}
				<button class="clear-search" on:click={() => (searchTerm = '')}>
					<i class="fa-solid fa-times"></i>
				</button>
			{/if}
		</div>
		{#if searchTerm && !loading}
			<div class="search-results">
				{filteredDecorations.length} résultat(s) pour "{searchTerm}"
			</div>
		{/if}
	</div>

	<div class="decorations-container" bind:this={scrollContainer} on:scroll={handleScroll}>
		{#if loading}
			<div class="loading-grid">
				{#each Array(20) as _, i}
					<div class="decoration-skeleton">
						<div class="skeleton-image"></div>
						<div class="skeleton-text"></div>
					</div>
				{/each}
			</div>
		{:else if displayedDecorations.length === 0}
			<div class="no-results">
				<i class="fa-solid fa-search"></i>
				<h3>Aucune décoration trouvée</h3>
				<p>Essayez de modifier votre recherche</p>
			</div>
		{:else}
			<div class="decorations-grid">
				{#each displayedDecorations as decoration (decoration.value)}
					<div class="decoration-card">
						<div class="decoration-preview">
							<img
								src={getAvatarUrl(decoration.value)}
								alt="Avatar pour {decoration.name}"
								class="avatar-base"
								loading="lazy"
							/>
							<AvatarDecoration decoration={decoration.value} avatarSize={90} />
						</div>
						<div class="decoration-info">
							<h3 class="decoration-name">{decoration.name}</h3>
							<div class="decoration-actions">
								<button
									class="action-button copy-button"
									on:click={() => copyDecorationUrl(decoration)}
									title="Copier l'URL"
								>
									<i class="fa-solid fa-copy"></i>
								</button>
								<button
									class="action-button download-button"
									on:click={() => window.open(decoration.url, '_blank')}
									title="Télécharger"
								>
									<i class="fa-solid fa-download"></i>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if loadingMore}
				<div class="loading-more">
					<i class="fa-solid fa-spinner fa-spin"></i>
					Chargement de plus de décorations...
				</div>
			{/if}

			{#if !hasMoreItems && displayedDecorations.length > 0}
				<div class="end-message">
					<i class="fa-solid fa-check-circle"></i>
					Toutes les décorations ont été chargées !
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.decorations-page {
		min-height: 100vh;
	}

	.page-header {
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.back-button {
		padding: 0.75rem 1.5rem;
		background: var(--primary-500);
		color: white;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.back-button:hover {
		background: var(--primary-600);
		transform: translateY(-2px);
	}

	h1 {
		color: var(--primary-800);
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.stats {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.total-count {
		color: var(--primary-600);
		font-weight: 600;
		font-size: 1.1rem;
	}

	.loading-text {
		color: var(--primary-500);
		font-style: italic;
	}

	.search-section {
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.search-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: 500px;
		margin: 0 auto;
	}

	.search-container i {
		color: var(--primary-500);
		font-size: 1.2rem;
	}

	.search-input {
		flex: 1;
		padding: 1rem 1.5rem;
		border: 2px solid var(--primary-200);
		border-radius: 0.75rem;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--primary-500);
		box-shadow: 0 0 0 3px var(--primary-100);
	}

	.clear-search {
		background: var(--primary-200);
		border: none;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.clear-search:hover {
		background: var(--primary-300);
	}

	.search-results {
		text-align: center;
		margin-top: 1rem;
		color: var(--primary-600);
		font-weight: 500;
	}

	.decorations-container {
		height: calc(100vh - 300px);
		overflow-y: auto;
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.decorations-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.decoration-card {
		background: var(--primary-50);
		border-radius: 1rem;
		padding: 1.5rem;
		text-align: center;
		transition: all 0.3s ease;
		border: 2px solid transparent;
	}

	.decoration-card:hover {
		background: var(--primary-100);
		border-color: var(--primary-300);
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	.decoration-preview {
		position: relative;
		width: 80px;
		height: 80px;
		margin: 0 auto 1rem;
	}

	.avatar-base {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 3px solid var(--primary-500);
		object-fit: cover;
	}

	.decoration-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.decoration-name {
		color: var(--primary-800);
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		word-break: break-word;
		line-height: 1.3;
	}

	.decoration-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.action-button {
		padding: 0.5rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.copy-button {
		background: var(--primary-500);
		color: white;
	}

	.copy-button:hover {
		background: var(--primary-600);
		transform: scale(1.1);
	}

	.download-button {
		background: var(--primary-200);
		color: var(--primary-700);
	}

	.download-button:hover {
		background: var(--primary-300);
		transform: scale(1.1);
	}

	.loading-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.decoration-skeleton {
		background: var(--primary-50);
		border-radius: 1rem;
		padding: 1.5rem;
		text-align: center;
	}

	.skeleton-image {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(
			90deg,
			var(--primary-200) 25%,
			var(--primary-300) 50%,
			var(--primary-200) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
		margin: 0 auto 1rem;
		border: 3px solid var(--primary-400);
	}

	.skeleton-text {
		height: 1rem;
		background: linear-gradient(
			90deg,
			var(--primary-200) 25%,
			var(--primary-300) 50%,
			var(--primary-200) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
		border-radius: 0.5rem;
		margin: 0 auto;
		width: 80%;
	}

	@keyframes skeleton-loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.loading-more {
		text-align: center;
		padding: 2rem;
		color: var(--primary-600);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		font-weight: 500;
	}

	.loading-more i {
		font-size: 1.5rem;
	}

	.end-message {
		text-align: center;
		padding: 2rem;
		color: var(--primary-600);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		font-weight: 500;
	}

	.end-message i {
		font-size: 2rem;
		color: var(--primary-500);
	}

	.no-results {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--primary-600);
	}

	.no-results i {
		font-size: 3rem;
		margin-bottom: 1rem;
		color: var(--primary-400);
	}

	.no-results h3 {
		margin: 1rem 0 0.5rem;
		color: var(--primary-700);
	}

	.no-results p {
		margin: 0;
		color: var(--primary-500);
	}

	@media (max-width: 768px) {
		.decorations-page {
			padding: 1rem;
		}

		.page-header {
			padding: 1.5rem;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.decorations-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 1rem;
		}

		.decoration-card {
			padding: 1rem;
		}

		.decoration-preview {
			width: 60px;
			height: 60px;
		}
	}
</style>
