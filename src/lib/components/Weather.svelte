<script>
	import { getWeather } from '$lib/weather';
	import { onMount } from 'svelte';
	import { fly, scale } from 'svelte/transition';

	export let city;

	let weather = getWeather(city);
	let weatherContainer;

	const getWeatherAnimation = (iconCode) => {
		const code = iconCode.slice(0, 2);
		switch (code) {
			case '01':
				return 'sunny';
			case '02':
			case '03':
			case '04':
				return 'cloudy';
			case '09':
			case '10':
				return 'rainy';
			case '11':
				return 'stormy';
			case '13':
				return 'snowy';
			case '50':
				return 'misty';
			default:
				return 'default';
		}
	};

	const getWeatherGradient = (iconCode) => {
		const code = iconCode.slice(0, 2);
		const isDay = iconCode.slice(-1) === 'd';

		switch (code) {
			case '01':
				return isDay
					? 'linear-gradient(135deg, #87CEEB 0%, #FFE4B5 100%)'
					: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
			case '02':
			case '03':
			case '04':
				return isDay
					? 'linear-gradient(135deg, #BDC3C7 0%, #2C3E50 100%)'
					: 'linear-gradient(135deg, #232526 0%, #414345 100%)';
			case '09':
			case '10':
				return 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)';
			case '11':
				return 'linear-gradient(135deg, #2C3E50 0%, #4A6741 100%)';
			case '13':
				return 'linear-gradient(135deg, #E6DEDD 0%, #B8C6DB 100%)';
			case '50':
				return 'linear-gradient(135deg, #BFBFBF 0%, #9C9C9C 100%)';
			default:
				return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
		}
	};

	const isLightBackground = (iconCode) => {
		const code = iconCode.slice(0, 2);
		const isDay = iconCode.slice(-1) === 'd';

		return (code === '01' && isDay) || code === '13' || code === '50';
	};

	onMount(() => {
		weather.then((data) => {
			if (weatherContainer && data.weather[0]) {
				const animation = getWeatherAnimation(data.weather[0].icon);
				weatherContainer.classList.add(`weather-${animation}`);
			}
		});
	});
</script>

{#await weather}
	<div class="weather-card loading" in:scale={{ duration: 300 }}>
		<div class="loading-spinner">
			<i class="fa-solid fa-spinner fa-spin"></i>
		</div>
		<p>Chargement météo pour {city}...</p>
	</div>
{:then data}
	<div
		bind:this={weatherContainer}
		class="weather-card"
		class:light-bg={isLightBackground(data.weather[0].icon)}
		style="background: {getWeatherGradient(data.weather[0].icon)}"
		in:fly={{ duration: 500, y: 20 }}
	>
		<!-- Animations de fond selon la météo -->
		{#if getWeatherAnimation(data.weather[0].icon) === 'rainy'}
			<div class="rain-animation">
				{#each Array(20) as _, i}
					<div class="raindrop" style="--delay: {i * 0.1}s; --duration: {1 + Math.random()}s"></div>
				{/each}
			</div>
		{/if}

		{#if getWeatherAnimation(data.weather[0].icon) === 'snowy'}
			<div class="snow-animation">
				{#each Array(30) as _, i}
					<div class="snowflake" style="--delay: {i * 0.2}s; --duration: {3 + Math.random() * 2}s">
						❄
					</div>
				{/each}
			</div>
		{/if}

		{#if getWeatherAnimation(data.weather[0].icon) === 'sunny'}
			<div class="sun-rays"></div>
		{/if}

		{#if getWeatherAnimation(data.weather[0].icon) === 'cloudy'}
			<div class="clouds">
				<div class="cloud cloud1"></div>
				<div class="cloud cloud2"></div>
			</div>
		{/if}

		<div class="weather-content">
			<div class="weather-left">
				<div class="weather-icon">
					<img
						src="http://openweathermap.org/img/wn/{data.weather[0].icon}@2x.png"
						alt={data.weather[0].description}
						in:scale={{ duration: 600, delay: 200 }}
					/>
				</div>
				<div class="weather-main" in:scale={{ duration: 400, delay: 300 }}>
					<div class="temperature">
						{parseFloat(data.main.temp).toFixed(1)}°
					</div>
					<div class="location">
						<i class="fa-solid fa-location-dot"></i>
						<span>{city}</span>
					</div>
				</div>
			</div>

			<div class="weather-right">
				<div class="description">
					{data.weather[0].description}
				</div>
				<div class="weather-details" in:fly={{ duration: 400, y: 10, delay: 400 }}>
					<div class="detail-item">
						<i class="fa-solid fa-thermometer-half"></i>
						<span>Ressenti {parseFloat(data.main.feels_like).toFixed(1)}°</span>
					</div>
					<div class="detail-item">
						<i class="fa-solid fa-wind"></i>
						<span>Vent {parseFloat(data.wind.speed || 0).toFixed(1)} km/h</span>
					</div>
					<div class="detail-item">
						<i class="fa-solid fa-droplet"></i>
						<span>Humidité {data.main.humidity}%</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{:catch error}
	<div class="weather-card error" in:scale={{ duration: 300 }}>
		<i class="fa-solid fa-exclamation-triangle"></i>
		<p>Erreur de chargement pour {city}</p>
		<small>{error}</small>
	</div>
{/await}

<style lang="scss">
	.weather-card {
		position: relative;
		border-radius: 1rem;
		padding: 1rem;
		color: white;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		overflow: hidden;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		width: 100%;
		min-height: 100px;
		display: flex;
		align-items: center;

		// Styles pour les fonds clairs
		&.light-bg {
			color: #2c3e50;
			text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
			border: 1px solid rgba(0, 0, 0, 0.1);

			.weather-main .temperature {
				text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
			}

			.weather-right .description {
				text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
			}

			.weather-details .detail-item span {
				text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
			}

			.weather-details .detail-item i {
				opacity: 0.7;
			}

			.weather-main .location {
				opacity: 0.8;
			}

			.weather-details {
				opacity: 0.9;
			}
		}

		&.loading {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 0.5rem;
			min-height: 100px;

			.loading-spinner {
				font-size: 1.5rem;
				color: rgba(255, 255, 255, 0.8);
			}

			p {
				margin: 0;
				font-size: 0.9rem;
				opacity: 0.9;
			}
		}

		&.error {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 0.5rem;
			background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
			min-height: 100px;

			i {
				font-size: 1.5rem;
				margin-bottom: 0.5rem;
			}

			p {
				margin: 0;
				font-weight: 600;
			}

			small {
				opacity: 0.8;
				font-size: 0.8rem;
			}
		}
	}

	.weather-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		gap: 1rem;
	}

	.weather-left {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.weather-icon {
		img {
			width: 60px;
			height: 60px;
			filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
		}
	}

	.weather-main {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.2rem;

		.temperature {
			font-size: 2.2rem;
			font-weight: 700;
			line-height: 1;
			text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
		}

		.location {
			display: flex;
			align-items: center;
			gap: 0.3rem;
			font-size: 0.9rem;
			opacity: 0.95;
			font-weight: 500;

			i {
				font-size: 0.8rem;
			}
		}
	}

	.weather-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		flex: 1;
		text-align: right;

		.description {
			font-size: 1.1rem;
			font-weight: 600;
			text-transform: capitalize;
			margin-bottom: 0.2rem;
			text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
		}
	}

	.weather-details {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.85rem;

		.detail-item {
			display: flex;
			align-items: center;
			gap: 0.4rem;
			white-space: nowrap;
			font-weight: 500;
			opacity: 0.95;

			i {
				width: 12px;
				font-size: 0.8rem;
				text-align: center;
				opacity: 0.9;
			}

			span {
				text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
			}
		}
	}

	// Animations météo adaptées au format horizontal
	.rain-animation {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: hidden;

		.raindrop {
			position: absolute;
			width: 2px;
			height: 10px;
			background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2));
			border-radius: 50%;
			animation: rainFall linear infinite;
			animation-delay: var(--delay);
			animation-duration: var(--duration);
			left: calc(var(--delay) * 1000 / 20 * 5%);
		}
	}

	.snow-animation {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: hidden;

		.snowflake {
			position: absolute;
			color: rgba(255, 255, 255, 0.8);
			user-select: none;
			pointer-events: none;
			animation: snowFall linear infinite;
			animation-delay: var(--delay);
			animation-duration: var(--duration);
			left: calc(var(--delay) * 1000 / 30 * 3.33%);
			font-size: 0.8rem;
		}
	}

	// Amélioration des flocons sur fond clair
	.weather-card.light-bg .snow-animation .snowflake {
		color: rgba(100, 120, 140, 0.7);
		text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
	}

	.sun-rays {
		position: absolute;
		top: 50%;
		left: 80px;
		width: 60px;
		height: 60px;
		transform: translateY(-50%);
		background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
		border-radius: 50%;
		animation: sunPulse 3s ease-in-out infinite;
	}

	// Amélioration des rayons de soleil
	.weather-card.light-bg .sun-rays {
		background: radial-gradient(circle, rgba(255, 220, 100, 0.3) 0%, transparent 70%);
		box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
	}

	.clouds {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: hidden;

		.cloud {
			position: absolute;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 50px;
			opacity: 0.6;

			&::before,
			&::after {
				content: '';
				position: absolute;
				background: rgba(255, 255, 255, 0.1);
				border-radius: 50px;
			}
		}

		.cloud1 {
			width: 40px;
			height: 15px;
			top: 20%;
			animation: cloudDrift 8s ease-in-out infinite;

			&::before {
				top: -8px;
				left: 8px;
				width: 20px;
				height: 20px;
			}

			&::after {
				top: -10px;
				right: 8px;
				width: 15px;
				height: 15px;
			}
		}

		.cloud2 {
			width: 30px;
			height: 12px;
			top: 60%;
			animation: cloudDrift 6s ease-in-out infinite reverse;

			&::before {
				top: -6px;
				left: 6px;
				width: 15px;
				height: 15px;
			}

			&::after {
				top: -8px;
				right: 6px;
				width: 12px;
				height: 12px;
			}
		}
	}

	// Keyframes pour les animations
	@keyframes rainFall {
		to {
			transform: translateY(120px);
		}
	}

	@keyframes snowFall {
		to {
			transform: translateY(120px) rotate(360deg);
		}
	}

	@keyframes sunPulse {
		0%,
		100% {
			transform: translateY(-50%) scale(1);
			opacity: 0.6;
		}
		50% {
			transform: translateY(-50%) scale(1.1);
			opacity: 0.8;
		}
	}

	@keyframes cloudDrift {
		0%,
		100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(15px);
		}
	}

	// Responsive
	@media (max-width: 768px) {
		.weather-card {
			padding: 0.8rem;
			border-radius: 0.8rem;
		}

		.weather-content {
			gap: 0.8rem;
		}

		.weather-icon img {
			width: 50px;
			height: 50px;
		}

		.weather-main .temperature {
			font-size: 1.8rem;
		}

		.weather-right .description {
			font-size: 1rem;
		}

		.weather-details {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.weather-content {
			flex-direction: column;
			gap: 0.5rem;
		}

		.weather-left {
			justify-content: center;
		}

		.weather-right {
			align-items: center;
			text-align: center;
		}

		.weather-details {
			flex-direction: row;
			justify-content: space-around;
			flex-wrap: wrap;
		}
	}
</style>
