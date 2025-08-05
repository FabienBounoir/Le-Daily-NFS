<script>
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	/** @type {string | null} */
	export let selectedDecoration = null;
	/** @type {boolean} */
	export let isOpen = false;

	/** @type {Array<{name: string, value: string | null}>} */
	let decorations = [{ name: 'Aucune', value: null }];
	let loading = true;
	let searchTerm = '';

	/** @type {Array<{name: string, value: string | null}>} */
	$: filteredDecorations = decorations.filter((decoration) =>
		decoration.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	async function loadAllDecorations() {
		try {
			const response = await fetch('/_api/tools/decorations');
			const data = await response.json();

			if (data.success && Array.isArray(data.decorations)) {
				const allDecorations = data.decorations.map((decoration) => ({
					name: decoration.formattedName,
					value: decoration.name
				}));

				decorations = [
					{ name: 'Aucune', value: null },
					...allDecorations
				];

				if (data.fallback) {
					console.warn('API GitHub indisponible, utilisation du fallback');
				}
			} else {
				throw new Error(data.error || 'Réponse invalide du serveur');
			}
		} catch (error) {
			console.warn('Erreur lors du chargement des décorations:', error);
			// Fallback sur les décorations populaires en cas d'erreur
			decorations = [
				{ name: 'Aucune', value: null },
				{ name: 'Angel', value: 'angel' },
				{ name: 'Cat Ears', value: 'cat_ears' },
				{ name: 'Devil', value: 'devil' },
				{ name: 'Fire', value: 'fire' },
				{ name: 'Lightning', value: 'lightning' },
				{ name: 'Butterflies', value: 'butterflies' },
				{ name: 'Flowers', value: 'flower_clouds' },
				{ name: 'Stars', value: 'stardust' },
				{ name: 'Rainbow', value: 'hugh_the_rainbow' },
				{ name: 'Sunflowers', value: 'sunflowers' },
				{ name: 'Snowflake', value: 'snowfall' },
				{ name: 'Pirate', value: 'pirate_captain' }
			];
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadAllDecorations();
	});

	const DECORATION_BASE_URL =
		'https://raw.githubusercontent.com/ItsPi3141/discord-fake-avatar-decorations/main/public/decorations/';

	/**
	 * @param {{ name: string, value: string | null }} decoration
	 */
	function selectDecoration(decoration) {
		selectedDecoration = decoration.value;
		dispatch('decorationSelected', decoration.value);
		isOpen = false;
	}

	function toggleSelector() {
		isOpen = !isOpen;
	}
</script>

<div class="decoration-selector">
	<button class="selector-toggle" on:click={toggleSelector}>
		<i class="fa-solid fa-palette"></i>
		Décorations {loading ? '(Chargement...)' : `(${decorations.length - 1})`}
	</button>

	{#if isOpen}
		<div class="decoration-dropdown">
			{#if !loading}
				<div class="search-box">
					<i class="fa-solid fa-search"></i>
					<input
						type="text"
						placeholder="Rechercher une décoration..."
						bind:value={searchTerm}
						on:input={() => {}}
					/>
				</div>
			{/if}

			<div class="decoration-grid">
				{#if loading}
					<div class="loading-message">
						<i class="fa-solid fa-spinner fa-spin"></i>
						Chargement des décorations...
					</div>
				{:else}
					{#each filteredDecorations as decoration}
						<button
							class="decoration-option"
							class:selected={selectedDecoration === decoration.value}
							on:click={() => selectDecoration(decoration)}
						>
							{#if decoration.value}
								<div class="decoration-preview">
									<div class="avatar-preview"></div>
									<img
										src="{DECORATION_BASE_URL}{decoration.value}.png"
										alt={decoration.name}
										loading="lazy"
										on:error={() => {
											console.warn(`Failed to load decoration preview: ${decoration.value}`);
										}}
									/>
								</div>
							{:else}
								<div class="decoration-preview">
									<div class="avatar-preview"></div>
								</div>
							{/if}
							<span class="decoration-name">{decoration.name}</span>
						</button>
					{/each}

					{#if filteredDecorations.length === 1}
						<div class="no-results">
							<i class="fa-solid fa-search"></i>
							Aucune décoration trouvée pour "{searchTerm}"
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.decoration-selector {
		position: relative;
		display: inline-block;
	}

	.selector-toggle {
		padding: 0.5em 1em;
		background-color: var(--primary-200);
		border: 2px solid var(--primary-400);
		border-radius: 0.5em;
		color: var(--primary-800);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5em;
		font-size: 0.9em;
		transition: all 0.2s ease;
	}

	.selector-toggle:hover {
		background-color: var(--primary-300);
		transform: translateY(-1px);
	}

	.decoration-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 1000;
		background-color: var(--primary-100);
		border: 2px solid var(--primary-400);
		border-radius: 0.5em;
		min-width: 350px;
		max-height: 500px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
	}

	.search-box {
		padding: 1em;
		border-bottom: 1px solid var(--primary-300);
		display: flex;
		align-items: center;
		gap: 0.5em;
		background-color: var(--primary-50);
	}

	.search-box i {
		color: var(--primary-600);
	}

	.search-box input {
		flex: 1;
		padding: 0.5em;
		border: 1px solid var(--primary-300);
		border-radius: 0.25em;
		background-color: white;
		font-size: 0.9em;
	}

	.search-box input:focus {
		outline: none;
		border-color: var(--primary-500);
		box-shadow: 0 0 0 2px var(--primary-200);
	}

	.decoration-grid {
		padding: 1em;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 0.5em;
		overflow-y: auto;
		max-height: 350px;
	}

	.decoration-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5em;
		border: 2px solid transparent;
		border-radius: 0.5em;
		background-color: transparent;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 80px;
	}

	.decoration-option:hover {
		background-color: var(--primary-200);
		border-color: var(--primary-300);
	}

	.decoration-option.selected {
		background-color: var(--primary-300);
		border-color: var(--primary-600);
	}

	.decoration-preview {
		position: relative;
		width: 40px;
		height: 40px;
		margin-bottom: 0.25em;
	}

	.avatar-preview {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: var(--primary-400);
		border: 2px solid var(--primary-600);
	}

	.decoration-preview img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}

	.decoration-name {
		font-size: 0.7em;
		text-align: center;
		color: var(--primary-800);
		line-height: 1.2;
		word-break: break-word;
	}

	.loading-message {
		grid-column: 1 / -1;
		text-align: center;
		padding: 2em;
		color: var(--primary-600);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
	}

	.loading-message i {
		font-size: 1.5em;
	}

	.no-results {
		grid-column: 1 / -1;
		text-align: center;
		padding: 2em;
		color: var(--primary-600);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
		font-style: italic;
	}
</style>
