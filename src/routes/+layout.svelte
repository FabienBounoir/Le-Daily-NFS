<script>
	import Snacks from '$lib/components/Snacks.svelte';
	import myshades from '$lib/myshades/index.js';
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/user';
	import '../app.scss';
	import { fade } from 'svelte/transition';
	import { navigating } from '$app/stores';

	onMount(async () => {
		if ($user && $user.color) {
			let primary = $user.color;

			if ($user.color.toLowerCase() == 'random') {
				primary = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

				if (primary.length < 7) {
					primary = primary.padEnd(7, '0');
				}
			}

			myshades({
				primary
			});
		}
	});
</script>

{#if $navigating}
	<div class="loading-effect" in:fade out:fade />
{/if}

<slot />
<Snacks />

<style lang="scss">
	.loading-effect {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		pointer-events: none;
		animation: breathing 4s infinite;
		box-sizing: border-box;
		padding: 20px;
		opacity: 0.5;
	}

	@keyframes breathing {
		0% {
			box-shadow: inset 0 0 10px 5px var(--primary-200);
		}
		50% {
			box-shadow: inset 0 0 40px 20px var(--primary-500);
		}
		100% {
			box-shadow: inset 0 0 10px 5px var(--primary-200);
		}
	}
</style>
