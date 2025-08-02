<script>
	/** @type {string | null} */
	export let decoration = null;
	/** @type {number} */
	export let avatarSize = 110; // Taille de l'avatar en pixels

	// URL de base pour les décorations Discord
	const DECORATION_BASE_URL =
		'https://raw.githubusercontent.com/ItsPi3141/discord-fake-avatar-decorations/main/public/decorations/';

	$: decorationUrl = decoration ? `${DECORATION_BASE_URL}${decoration}.png` : null;
</script>

{#if decorationUrl}
	<div class="avatar-decoration" style="--avatarSize: {avatarSize}px">
		<img
			src={decorationUrl}
			alt="Avatar decoration"
			on:error={() => {
				console.warn(`Failed to load decoration: ${decoration}`);
			}}
		/>
	</div>
{/if}

<style>
	.avatar-decoration {
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--avatarSize);
		height: var(--avatarSize);
		pointer-events: none;
		z-index: 10;
		transform: translate(-50%, -50%);
	}

	.avatar-decoration img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
