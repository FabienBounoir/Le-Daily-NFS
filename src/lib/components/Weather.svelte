<script>
	import { getWeather } from '$lib/weather';

	export let city;

	let weather = getWeather(city);
</script>

{#await weather}
	Quel temps fait-il à {city} ? 🔎
{:then data}
	<div class="weather-container">
		<h1>{data.weather[0].description}</h1>
		<div class="weather">
			<h1>{parseFloat(data.main.temp).toFixed(1)}°</h1>
			<span> </span>
			<div class="weather-info">
				<p><i class="fa-solid fa-wind"></i> {parseFloat(data.wind.speed || 0).toFixed(1)} km/h</p>
				<p><i class="fa-solid fa-location-dot"></i> {city}</p>
			</div>
			<img src="http://openweathermap.org/img/wn/{data.weather[0].icon}@4x.png" alt="weather" />
			<img src="http://openweathermap.org/img/wn/{data.weather[0].icon}@4x.png" alt="weather" />
		</div>
	</div>
{:catch error}
	{error}
{/await}

<style lang="scss">
	.weather-container {
		display: flex;
		flex-direction: column;
		width: fit-content;
		border-radius: 1em;
		background-color: var(--primary-200);
		padding: 0.5em 1em;
		position: relative;
		width: auto;

		img {
			width: 120px;
			position: absolute;
			top: -48px;
			right: -48px;
			filter: blur(1em);
		}

		img:last-child {
			width: 100px;
			position: absolute;
			top: -40px;
			right: -40px;
			filter: none;
		}
	}

	.weather {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
		gap: 1em;

		h1 {
			font-size: 3em;
		}

		span {
			background-color: var(--primary-600);
			border-radius: 0.5em;
			width: 0.2em;
			height: 2.8em;
		}
	}

	.weather-info {
		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 0.3em;
	}
</style>
