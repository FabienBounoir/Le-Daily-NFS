<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Pause from '$lib/components/Pause.svelte';
	import Return from '$lib/components/Return.svelte';
	import { getWeather } from '$lib/weather';
	import { getResultEuromillion } from '$lib/euroMillion';

	let names = [];
	let time = null;
	let i = 0;

	let actualTime = 120;
	let timeSpeaker = 0;

	let startDailyDaily = new Date();
	let endDaily = false;
	let interval = null;

	let pause = false;
	let voiceSynthesis = true;

	let actualKeyDown = '';

	let keydownInterval = null;

	let weatherSophia = null;
	let weatherMontpellier = null;

	let euromillions = null;

	let totalTimer = 0;

	const dateHyrox = new Date('2024-06-07');

	const diffDate = Math.floor((dateHyrox - new Date()) / (1000 * 60 * 60 * 24));

	const timerHistory = new Map();
	const timeResult = new Map();

	onMount(async () => {
		const url = new URL(window.location.href);
		const namesQuery = url.searchParams.get('names');
		if (namesQuery) {
			names = namesQuery.split(',');
		}

		const timeQuery = url.searchParams.get('time');
		if (timeQuery) {
			actualTime = parseInt(timeQuery);
			time = parseInt(timeQuery);
		}

		const voiceQuery = url.searchParams.get('voice');
		if (voiceQuery) {
			voiceSynthesis = voiceQuery === 'true';
		}

		textToSpeech(names[i]);

		interval = setInterval(() => {
			if (endDaily) return;
			if (!time) return;
			totalTimer++;
			if (pause) return;

			actualTime--;
			timeSpeaker++;

			if (actualTime == 5) {
				textToSpeech(`5 secondes restantes`);
			}
		}, 1000);

		document.addEventListener('keydown', (e) => {
			actualKeyDown = e.code;

			if (keydownInterval) {
				clearTimeout(keydownInterval);
			}

			keydownInterval = setTimeout(() => {
				actualKeyDown = '';
			}, 400);

			if (e.code === 'Space') {
				newSpeaker();
			} else if (e.code === 'ArrowLeft') {
				if (i - 1 < 0) {
					return;
				} else {
					timerHistory.set(names[i], actualTime);
					i--;
					actualTime = timerHistory.get(names[i]) || time;
					timeSpeaker = timeResult.get(names[i]) || 0;
					textToSpeech(names[i]);
				}
			} else if (e.code === 'ArrowRight') {
				if (i + 1 >= names.length) {
					return;
				} else {
					timerHistory.set(names[i], actualTime);
					i++;
					actualTime = timerHistory.get(names[i]) || time;
					timeSpeaker = timeResult.get(names[i]) || 0;
					textToSpeech(names[i]);
				}
			} else if (e.code === 'KeyP') {
				pause = !pause;
			}
		});
	});

	const textToSpeech = (text) => {
		if (!voiceSynthesis) return;
		if ('speechSynthesis' in window) {
			if (window.speechSynthesis.speaking) {
				window.speechSynthesis.cancel();
			}

			let utterance = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(utterance);
		}
	};

	const newSpeaker = () => {
		if (endDaily) return;
		if (i + 1 >= names.length) {
			endDaily = true;
			timerHistory.set(names[i], actualTime);
			timeResult.set(names[i], timeSpeaker);
			i = 0;
		} else {
			timerHistory.set(names[i], actualTime);
			timeResult.set(names[i], timeSpeaker);
			i++;
			actualTime = time;
			timeSpeaker = 0;
			textToSpeech(names[i]);
		}
	};

	const returnTimeSpeaker = (name) => {
		const speakerInfo = Array.from(timeResult.entries()).sort((a, b) => b[1] - a[1]);

		let result = '';

		for (const [name, time] of speakerInfo) {
			result += `${name} : ${time} secondes \n`;
		}

		return result;
	};

	const renderWeather = (data) => {
		return `<div style=" text-items: center; display:flex; flex-direction: column; align-items: center;"><h3>${data.name}</h3>
			<div style="display: flex; align-items: center; gap: 1em;">
				<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Météo" />
				<p>${data.main.temp}°C</p>
			</div>
			</div>`;
	};

	const renderEuroMillion = (data) => {
		if (!data || data.length === 0) return;
		const lastTirage = data[data.length - 1];

		let render = `<div style="display: flex; flex-direction: row; align-items: center; gap: 1em;">`;

		for (let i = 0; i < lastTirage.numbers.length; i++) {
			render += `<p style="color: var(--primary); font-size: 1.5em; border-radius: 50%; border: 1px solid var(--primary-hover); width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;"
			>${lastTirage.numbers[i]}</p>`;
		}

		render += '<p><p>';

		for (let i = 0; i < lastTirage.stars.length; i++) {
			render += `<p style="position: relative; color: var(--primary); font-size: 1.5em; border-radius: 50%; border: 1px solid var(--primary-hover); width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;"
			
			>${lastTirage.stars[i]}
			
			<svg style=" position: absolute; width: 20px; top: -3px; right: -3px;" fill="yellow" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
			</p>`;
		}

		render += `</div>`;

		return render;
	};

	const getInfo = async () => {
		weatherSophia = await getWeather('Sophia Antipolis');
		weatherMontpellier = await getWeather('Montpellier');
		euromillions = await getResultEuromillion();
	};

	const timeFormater = (time) => {
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = time % 60;

		return `${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''} ${seconds}s`;
	};

	$: endDaily && getInfo();
</script>

<svelte:head>
	<title>Daily en cours...</title>
	<meta
		name="description"
		content="Attention c'est l'heure du daily fait attention c'est bientôt à toi"
	/>
</svelte:head>

<section>
	{#if endDaily}
		<h1>Le daily est terminé</h1>

		<div class="return" on:click={() => goto('/init')}>
			<Return />
		</div>

		<div class="container-result">
			<div>
				<h3>Voici le temps de parole de chacun :</h3>
				<br />
				<pre>{returnTimeSpeaker()}</pre>
			</div>
			<div>
				<h3>Quelques informations supplémentaires :</h3>
				<br />
				<pre>Le daily a commencé à {startDailyDaily.toLocaleTimeString()}</pre>
				<pre>Le daily a duré {timeFormater(totalTimer)}</pre>
			</div>
		</div>

		<div class="hyrox-info">
			<p>HYROX dans {diffDate} jours</p>
		</div>

		{#if weatherSophia}
			<div class="widget-meteo-1">{@html renderWeather(weatherSophia)}</div>
		{/if}

		{#if weatherMontpellier}
			<div class="widget-meteo-2">{@html renderWeather(weatherMontpellier)}</div>
		{/if}

		{#if euromillions}
			<div class="widget-euromillion">{@html renderEuroMillion(euromillions)}</div>
		{/if}
	{:else}
		<h1>Le daily NFS</h1>

		{#if names.length > 0}
			<div class="actualSpeaker">
				<div>
					<p>{i > 0 ? names[i - 1] : ''}</p>
					<p>{names[i]}</p>
					<p>{i + 1 < names.length ? names[i + 1] : ''}</p>
				</div>
				<p
					class={actualTime <= 5 && actualTime > 0 && !pause
						? 'warn'
						: actualTime <= 0 && !pause
							? 'danger'
							: ''}
				>
					{#if pause}
						<Pause />
					{:else}
						{actualTime}
					{/if}
				</p>
			</div>
		{/if}

		<p id="infoTimeDaily">
			Le Daily a commencé à {startDailyDaily.toLocaleTimeString()} - {timeFormater(totalTimer)}
		</p>
		<div id="infoKeys">
			<div>
				<span class={actualKeyDown == 'KeyP' ? 'key-down' : ''}>P</span>
				{pause ? ' Play ' : 'Pause'}
			</div>
			<div>
				<span class={actualKeyDown == 'Space' ? 'key-down' : ''}>Space</span>
				New
			</div>
			<div>
				<span class={actualKeyDown == 'ArrowLeft' ? 'key-down' : ''}>←</span>
				Previous
			</div>
		</div>
	{/if}
</section>

<style lang="scss">
	.container-result {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1em;
		justify-content: center;

		div {
			margin: 1em;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 1em;
			border-radius: 5px;
			color: var(--primary);
			border: 1px solid var(--primary);

			padding: 0.25em 0.5em;
			border-radius: 0.25em;

			p {
				font-size: 2em;
			}

			pre {
				font-size: 1.5em;
			}
		}
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		gap: 8em;
	}

	#infoTimeDaily {
		position: fixed;
		bottom: 0;
		left: 0;
		padding: 1em;
	}

	#infoKeys {
		position: fixed;
		bottom: 0;
		right: 0;
		padding: 1em;
		display: flex;
		gap: 1em;

		div {
			min-width: 50px;
			margin: 0;
			padding: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.5em;

			span {
				padding: 0.25em 0.5em;
				border: 1px solid var(--primary);
				border-radius: 0.25em;
			}

			span.key-down {
				background-color: var(--primary);
				color: white;
			}
		}
	}

	h1 {
		font-size: 2em;
		text-align: center;
	}

	.actualSpeaker {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;

		p {
			font-size: 3em;
		}

		div {
			display: flex;
			justify-content: center;
			align-items: end;
			gap: 1em;
			position: relative;

			p {
				opacity: 0.3;
			}

			p:nth-child(1) {
				position: absolute;
				bottom: 0;
				left: -7em;
			}

			p:nth-child(2) {
				font-size: 5em;
				opacity: 1;
			}

			p:nth-child(3) {
				position: absolute;
				bottom: 0;
				right: -7em;
			}
		}
	}

	.warn {
		color: orange;
	}

	.danger {
		color: red;
		animation: blinker 1s linear infinite;
	}

	@keyframes blinker {
		50% {
			opacity: 0;
			transform: scale(1.2);
		}
	}

	.widget-meteo-1 {
		position: fixed;
		bottom: 0;
		left: 0;
		padding: 1em;
	}

	.widget-meteo-2 {
		position: fixed;
		bottom: 0;
		right: 0;
		padding: 1em;
	}

	.widget-euromillion {
		position: fixed;
		left: 50%;
		bottom: 10px;
		transform: translateX(-50%);
	}

	.return {
		position: fixed;
		top: 0;
		right: 0;
		margin: 3em;
		padding: 0.5em;
		border: 2px solid var(--primary);
		border-radius: 5px;
	}

	.return:hover {
		background-color: var(--primary-hover);
		cursor: pointer;
	}

	.hyrox-info{
		position: fixed;
		top: 0;
		left: 0;
		padding: 2em;
		animation: zoom 1s linear infinite;
		font-weight: bold;
	}

	@keyframes zoom {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
