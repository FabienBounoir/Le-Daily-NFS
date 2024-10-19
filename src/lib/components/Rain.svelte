<script>
	import { onMount } from 'svelte';

	let arrayRandom = [];
	let sadEmojis = ['😢', '😔', '😞', '😟', '😭', '😿', '😕', '😫', '🙁', '🥺'];

	onMount(() => {
		for (let i = 0; i < 100; i++) {
			arrayRandom = [
				...arrayRandom,
				[Math.floor(Math.random() * 98) + 1, Math.floor(Math.random() * 2.5) + 1.5]
			];
		}
	});
</script>

<main class="back-row-toggle splat-toggle">
	<div class="rain front-row">
		{#each arrayRandom as value, i}
			<div
				class="drop"
				style="left: {i + 1}%; bottom: {value[0] +
					value[1] -
					1 +
					100}%; animation-delay: {value[0] / 2}.{value[1]}s; animation-duration: 8.5{value[0]}s;"
			>
				<div
					class="stem"
					style="animation-delay: 0.${value[0]}s; animation-duration: 1000${value[0]}s; font-size: {value[1]}rem;"
				>
					{sadEmojis[Math.floor(Math.random() * sadEmojis.length)]}
				</div>
			</div>
		{/each}
	</div>
</main>

<style lang="scss">
	main {
		z-index: -1;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100dvh;
		margin: 0;
		overflow: hidden;
		background: linear-gradient(to bottom, #202020, #111119);
	}

	.rain {
		position: absolute;
		// left: 0;
		width: 100%;
		height: 100%;
		z-index: 2;
	}

	.rain.back-row {
		display: none;
		z-index: 1;
		bottom: 60px;
		opacity: 0.5;
	}

	main.back-row-toggle .rain.back-row {
		display: block;
	}

	.drop {
		position: absolute;
		bottom: 100%;
		width: 15px;
		height: 120px;
		pointer-events: none;
		animation: drop 0.5s linear infinite;
	}

	@keyframes drop {
		0% {
			transform: translateY(0vh);
		}
		75% {
			transform: translateY(150vh);
		}
		100% {
			transform: translateY(200vh);
		}
	}

	.stem {
		font-size: 1.5rem;
	}

	.splat {
		width: 15px;
		height: 10px;
		border-top: 2px dotted rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		opacity: 1;
		transform: scale(0);
		animation: splat 0.5s linear infinite;
		display: none;
	}

	main.splat-toggle .splat {
		display: block;
	}

	@keyframes splat {
		0% {
			opacity: 1;
			transform: scale(0);
		}
		80% {
			opacity: 1;
			transform: scale(0);
		}
		90% {
			opacity: 0.5;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1.5);
		}
	}

	.toggles {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 3;
	}

	.toggle {
		position: absolute;
		left: 20px;
		width: 50px;
		height: 50px;
		line-height: 51px;
		box-sizing: border-box;
		text-align: center;
		font-family: sans-serif;
		font-size: 10px;
		font-weight: bold;
		background-color: rgba(255, 255, 255, 0.2);
		color: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.toggle:hover {
		background-color: rgba(255, 255, 255, 0.25);
	}

	.toggle:active {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.toggle.active {
		background-color: rgba(255, 255, 255, 0.4);
	}

	.splat-toggle {
		// top: 20px;
	}

	.back-row-toggle {
		// top: 90px;
		line-height: 12px;
		padding-top: 14px;
	}

	.single-toggle {
		top: 160px;
	}

	main.single-toggle .drop {
		display: none;
	}

	main.single-toggle .drop:nth-child(10) {
		display: block;
	}
</style>
