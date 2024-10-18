<script>
	import Pointer from './Pointer.svelte';
	import { onMount, beforeUpdate, afterUpdate } from 'svelte';
	import { select, arc, pie } from 'd3';

	let isSpinning = false;
	let spinDeg = Math.random() * 360;

	const generateColors = () =>
		`rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
			Math.random() * 255
		)}, ${Math.floor(Math.random() * 255)})`;

	// passed down props
	export let pointerColor = 'var(--primary-950)';
	export let pointerTextColor = 'white';
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

			const turnWheel = Math.floor(Math.random() * (14 - 3 + 1)) + 3;

			const addedSpin = turnWheel + Math.random() * 0.9 + 0.1;
			spinDeg += addedSpin;

			let userSpin = items.length * addedSpin;

			setTimeout(() => {
				isSpinning = false;
				const audio = new Audio('./ding.mp3');
				audio.play();
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
				console.log('arcGenerator', arcGenerator);
				const [x, y] = arcGenerator.centroid(d);
				const rotateAngle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI);

				return `translate(${x}, ${y}) rotate(${rotateAngle - 90})`;
			})
			.style('font-size', 17)
			.attr('fill', textColor);
	};

	afterUpdate(svgRender);
</script>

<div class={`wheel-container`} id="wheel-container">
	<div style="rotate: {spinDeg}turn" class="wheel" />
	<Pointer {pointerColor} {pointerSize} />
	<button
		class={`spin-button ${isSpinning ? 'disabled' : ''}`}
		on:click={spinWheel}
		color={pointerTextColor}><span></span></button
	>
</div>

<style lang="scss">
	.wheel-container {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		width: max-content;
		transform: translate(-50%, -50%);
		top: 50%;
		left: 50%;
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
