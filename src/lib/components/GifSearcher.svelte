<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let isOpen = false;

	let searchQuery = '';
	let gifs = [];
	let loading = false;
	let error = null;

	async function searchGifs() {
		if (!searchQuery.trim()) {
			return;
		}

		loading = true;
		error = null;

		try {
			const response = await fetch(
				`/_api/tools/gifs?q=${encodeURIComponent(searchQuery)}&limit=50`
			);

			if (!response.ok) {
				throw new Error('Erreur lors de la recherche de GIFs');
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error);
			}

			gifs = data.results || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Une erreur est survenue';
			console.error('Erreur API Tenor:', err);
		} finally {
			loading = false;
		}
	}

	function selectGif(gif) {
		const gifUrl = gif.url;
		dispatch('gifSelected', { url: gifUrl });
		closeModal();
	}

	function closeModal() {
		isOpen = false;
		searchQuery = '';
		gifs = [];
		error = null;
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			searchGifs();
		}
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Rechercher un GIF</h2>
				<button class="close-btn" on:click={closeModal}>×</button>
			</div>

			<div class="search-section">
				<input
					type="text"
					bind:value={searchQuery}
					on:keydown={handleKeydown}
					placeholder="Rechercher un GIF..."
					class="search-input"
				/>
				<button on:click={searchGifs} disabled={loading || !searchQuery.trim()}>
					{loading ? 'Recherche...' : 'Rechercher'}
				</button>
			</div>

			{#if error}
				<div class="error">
					{error}
				</div>
			{/if}

			{#if loading}
				<div class="loading">Recherche en cours...</div>
			{/if}

			{#if gifs.length > 0}
				<div class="gifs-grid">
					{#each gifs as gif}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="gif-item" on:click={() => selectGif(gif)}>
							<img
								src={gif.preview_url || gif.url}
								alt={gif.content_description || 'GIF'}
								loading="lazy"
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background-color: var(--primary-50);
		border-radius: 1rem;
		max-width: 90vw;
		max-height: 90vh;
		width: 800px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid var(--primary-200);

		h2 {
			margin: 0;
			color: var(--primary-800);
		}

		.close-btn {
			background: none;
			border: none;
			font-size: 1.5rem;
			cursor: pointer;
			color: var(--primary-600);
			padding: 0;
			width: 30px;
			height: 30px;
			display: flex;
			align-items: center;
			justify-content: center;

			&:hover {
				color: var(--primary-800);
			}
		}
	}

	.search-section {
		padding: 1rem;
		display: flex;
		gap: 0.5rem;
		border-bottom: 1px solid var(--primary-200);
		align-items: center;

		.search-input {
			flex: 1;
			padding: 0.75rem;
			border: 1px solid var(--primary-300);
			border-radius: 0.5rem;
			font-size: 1rem;
			height: 44px;
			box-sizing: border-box;

			&:focus {
				outline: none;
				border-color: var(--primary-500);
			}
		}

		button {
			padding: 0.75rem 1.5rem;
			background-color: var(--primary-500);
			color: white;
			border: none;
			border-radius: 0.5rem;
			cursor: pointer;
			font-size: 1rem;
			height: 44px;
			box-sizing: border-box;
			white-space: nowrap;
			min-width: 120px;
			max-width: 200px;

			&:hover:not(:disabled) {
				background-color: var(--primary-600);
			}

			&:disabled {
				background-color: var(--primary-300);
				cursor: not-allowed;
			}
		}
	}

	.error {
		padding: 1rem;
		color: #dc2626;
		background-color: #fef2f2;
		border-left: 4px solid #dc2626;
		margin: 1rem;
		border-radius: 0.25rem;
	}

	.loading {
		padding: 2rem;
		text-align: center;
		color: var(--primary-600);
	}

	.gifs-grid {
		padding: 1rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
		overflow-y: auto;
		max-height: 65vh;
	}

	.gif-item {
		cursor: pointer;
		border-radius: 0.5rem;
		overflow: hidden;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		border: 2px solid transparent;

		&:hover {
			transform: scale(1.02);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			border-color: var(--primary-500);
		}

		img {
			width: 100%;
			height: 110px;
			object-fit: cover;
			display: block;
		}
	}
</style>
