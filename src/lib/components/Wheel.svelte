<script>
	import Pointer from './Pointer.svelte';
	import { onMount, beforeUpdate, afterUpdate } from 'svelte';
	import { select, arc, pie } from 'd3';
	import { Confetti } from 'svelte-confetti';

	let isSpinning = false;
	let spinDeg = Math.random() * 360;
	let firstSpin = true;

	const generateColors = () =>
		`rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
			Math.random() * 255
		)}, ${Math.floor(Math.random() * 255)})`;

	// passed down props
	export let pointerColor = 'var(--primary-950)';
	export let pointerTextColor = 'white';

	/** Currently selected name, set when the spin ends */
	export let winner = null;
	export let items = ['yes', 'no', 'maybe'];
	export let colors = Array.from({ length: items.length }, generateColors);
	export let size = document.documentElement.clientHeight / 1.5;
	export let pointerSize = size / 9;
	/**
	 * @template string
	 * @example "white"
	 */
	export let textColor = 'white';

	/* wheel sizes */
	$: radius = Math.min(size, size) / 2;

	const spinWheel = (e) => {
		e.stopPropagation();
		if (!isSpinning) {
			isSpinning = true;
			firstSpin = false;

			const turnWheel = Math.floor(Math.random() * (14 - 3 + 1)) + 3;

			const addedSpin = turnWheel + Math.random() * 0.9 + 0.1;
			spinDeg += addedSpin;

			let userSpin = items.length * addedSpin;

			setTimeout(() => {
				isSpinning = false;
				const audio = new Audio('./ding.mp3');
				audio.play();

				// Pointer is at 3 o'clock (90° from top, clockwise)
				const pointerAngle = 90;
				const normalizedAngle = ((pointerAngle - (spinDeg * 360)) % 360 + 360) % 360;
				const segmentAngle = 360 / items.length;
				const idx = Math.floor(normalizedAngle / segmentAngle) % items.length;
				winner = items[idx];
			}, 5000);
		}
	};
	let segmentColors = [...colors];

	const colorArrayLengthMatcher = () => {
		if (colors.length !== items.length) {
			segmentColors = Array.from({ length: items.length }, (_, i) => colors[i % colors.length]);
		}
		if (segmentColors[0] == segmentColors[segmentColors.length - 1]) {
			segmentColors[segmentColors.length - 1] = segmentColors.at(1);
		}
	};

	const svgRender = () => {
		select('.wheel svg').remove();
		colorArrayLengthMatcher();
		const svg = select('.wheel')
			.append('svg')
			.attr('width', size)
			.attr('height', size)
			.append('g')
			.attr('transform', `translate(${size / 2}, ${size / 2})`);
		const pieGenerator = pie().value(1);
		const dataWithArc = pieGenerator(items);
		const arcGenerator = arc().innerRadius(0).outerRadius(radius);
		svg
			.selectAll('mySlices')
			.data(dataWithArc)
			.enter()
			.append('path')
			.attr('d', arcGenerator)
			.attr('fill', (_, i) => segmentColors[i]);
		svg
			.selectAll('mySlices')
			.data(dataWithArc)
			.enter()
			.append('text')
			.text((_, i) => items[i])
			.attr('transform', (d) => {
				const [x, y] = arcGenerator.centroid(d);
				const rotateAngle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI);

				return `translate(${x}, ${y}) rotate(${rotateAngle - 90})`;
			})
			.style('font-size', 17)
			.attr('fill', textColor);
	};

	afterUpdate(svgRender);
</script>

<div class="wheel-wrapper">
	{#if winner}
		<div class="winner-banner" key={winner}>
			{#key winner}
				<span class="winner-name">{winner}</span>
			{/key}
		</div>
		{:else}
		<div class="winner-banner winner-placeholder">
			<span class="winner-label">En attente d'un tour de roue…</span>
		</div>
	{/if}

	<div class={`wheel-container`} id="wheel-container">
		<div style="rotate: {spinDeg}turn" class="wheel" />
		<Pointer {pointerColor} {pointerSize} />
		<button
			class={`spin-button ${isSpinning ? 'disabled' : ''}`}
			on:click={spinWheel}
			color={pointerTextColor}
			><span
				>{#if isSpinning == false && firstSpin == false}
					{#key isSpinning}
						<Confetti
							delay={[0, 1500]}
							colorArray={['var(--primary-400)', 'var(--primary-600)', 'var(--primary-950)']}
							x={[-3, 3]}
							y={[-3, 3]}
							amount={400}
							xSpread={0.4}
							size={20}
							rounded
							noGravity
							fallDistance="320px"
						/>
					{/key}
				{/if}</span
				></button
		>
	</div>
</div>

<style lang="scss">
	.wheel-wrapper {
		position: absolute;
		transform: translate(-50%, -50%);
		top: 50%;
		left: 60%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
		width: max-content;
	}

	.winner-banner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2em;
		background: var(--primary-50);
		border: 1px solid var(--primary-100);
		border-radius: 0.875em;
		padding: 0.6em 2em;
		text-align: center;
		z-index: 10;
		animation: fadeIn 0.3s ease;
	}

	.winner-placeholder {
		opacity: 0.45;
	}

	.winner-label {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-weight: 700;
		opacity: 0.90;
		color: var(--primary-900);

	}

	.winner-name {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--primary-600);
		line-height: 1.1;
		animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-6px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	@keyframes popIn {
		from { opacity: 0; transform: scale(0.6); }
		to   { opacity: 1; transform: scale(1); }
	}

	.wheel-container {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: max-content;
	}

	.disabled {
		cursor: not-allowed !important;
	}

	.wheel {
		clip-path: circle(45%);
		transition: 5s cubic-bezier(0.6, 0, 0, 1);
	}

	.spin-button {
		position: absolute;
		border-radius: 50%;
		translate: -50% -50%;
		aspect-ratio: 1/1;
		top: 50%;
		left: 50%;
		background-color: transparent;
		color: white;
		border: none;
		cursor: pointer;

		&:focus {
			outline: none;
		}

		span {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 2em;
			height: 2em;
			border-radius: 50%;
			border: 0px solid black;
			background: var(--primary-200);
			box-shadow: 0 0 30px 0 var(--primary-900);

			// clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
		}
	}
</style>
