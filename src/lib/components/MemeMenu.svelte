<script>
	import { scale, fade } from 'svelte/transition';

	export let visible = false;
	export let animationData = {};

	function getKeyDisplay(code) {
		if (code.startsWith('Key')) return code.slice(3);
		if (code === 'Semicolon') return ';';
		if (code === 'Space') return 'Space';
		return code;
	}

	$: memes = Object.entries(animationData).map(([code, data]) => ({
		code,
		keyName: '⇧ + ' + getKeyDisplay(code),
		url: data.url,
		sound: data.sound
	}));
</script>

{#if visible}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="meme-menu-backdrop"
		on:click={() => (visible = false)}
		transition:fade={{ duration: 150 }}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="meme-menu"
			on:click|stopPropagation
			transition:scale={{ duration: 200, start: 0.9 }}
		>
			<div class="meme-menu-header">
				<h2>🎭 Memes disponibles</h2>
				<button on:click={() => (visible = false)}>✕</button>
			</div>
			<div class="meme-grid">
				{#each memes as meme}
					<div class="meme-card">
						<img src={meme.url} alt={meme.sound} loading="lazy" />
						<div class="meme-info">
							<span class="key-badge">{meme.keyName}</span>
							<span class="sound-name">{meme.sound}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.meme-menu-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		padding: 2em;
	}

	.meme-menu {
		background: var(--bg-color, #1a1a2e);
		border: 1px solid var(--primary-600);
		border-radius: 1rem;
		padding: 1.5em;
		max-width: 700px;
		width: 100%;
		max-height: 80vh;
		overflow-y: auto;
	}

	.meme-menu-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5em;

		h2 {
			margin: 0;
			font-size: 1.4rem;
			color: var(--primary-300);
		}

		button {
			background: none;
			border: 1px solid var(--primary-600);
			border-radius: 0.4em;
			color: var(--primary-300);
			font-size: 1rem;
			width: 2em;
			height: 2em;
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				background: var(--primary-600);
				color: white;
			}
		}
	}

	.meme-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1em;
	}

	.meme-card {
		border: 1px solid var(--primary-700);
		border-radius: 0.75em;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.05);
		transition:
			transform 0.2s,
			border-color 0.2s;

		&:hover {
			transform: translateY(-3px);
			border-color: var(--primary-500);
		}

		img {
			width: 100%;
			height: 130px;
			object-fit: cover;
			display: block;
		}

		.meme-info {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.5em 0.75em;
			gap: 0.5em;
		}
	}

	.key-badge {
		background: var(--primary-600);
		color: white;
		padding: 0.2em 0.5em;
		border-radius: 0.3em;
		font-size: 0.85rem;
		font-weight: bold;
		font-family: monospace;
		min-width: 1.8em;
		text-align: center;
	}

	.sound-name {
		color: var(--primary-300);
		font-size: 0.85rem;
		text-transform: capitalize;
	}
</style>
