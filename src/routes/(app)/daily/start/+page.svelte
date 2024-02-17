<script>
	import { onMount } from 'svelte';
	import { fly, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import Pause from '$lib/components/Pause.svelte';
	import Return from '$lib/components/Return.svelte';
	import Weather from '$lib/components/Weather.svelte';
	import EuroMillion from '$lib/components/EuroMillion.svelte';
	import { user } from '$lib/stores/user';
	import '@fortawesome/fontawesome-free/css/all.min.css';

	/**
	 * @type {string | any[]}
	 */
	let names = [];
	/**
	 * @type {number | null}
	 */
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

	/**
	 * @type {number | null | undefined}
	 */
	let keydownInterval = null;
	let totalTimer = 0;

	const timerHistory = new Map();
	const timeResult = new Map();

	let couleur = 'rgb(255, 0, 0)';
	$: couleur = `hsl(${(120 * actualTime) / time}deg 71.85% 42.47%)`;

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
			}, 300);

			if (e.code === 'Space' || e.code === 'ArrowRight') {
				newSpeaker();
			} else if (e.code === 'ArrowLeft') {
				if (i - 1 >= 0) {
					timerHistory.set(names[i], actualTime);
					i--;
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
		if (endDaily) return;

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
			saveDaily();
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
			result += `${name} : ${timeFormater(time)} \n`;
		}

		return result;
	};

	const timeFormater = (time) => {
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = time % 60;

		return `${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''} ${seconds}s`;
	};

	const saveDaily = () => {
		const daily = {
			users: names,
			team: $user.teams[0],
			totalTime: totalTimer,
			userTime: time
		};

		console.log(daily);

		api.post('/daily', daily);
	};
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
			<p>
				HYROX dans {Math.floor((new Date('2024-06-07') - new Date()) / (1000 * 60 * 60 * 24))} jours
			</p>
		</div>

		<div class="widget-meteo-1">
			<Weather city="Sophia Antipolis" />
		</div>

		<div class="widget-meteo-2">
			<Weather city="Montpellier" />
		</div>

		<div class="widget-euromillion">
			<EuroMillion />
		</div>
	{:else}
		<h1>Le daily {$user?.username || 'NFS'}</h1>

		{#if names.length > 0}
			<div class="actualSpeaker">
				<div>
					{#key names[i]}
						<p in:fly={{ duration: 300, x: 20, y: 0, opacity: 0 }}>
							{i > 0 ? names[i - 1] : ''}
						</p>
						<p in:scale={{ duration: 300, opacity: 0 }}>
							{names[i]}
						</p>
						<p in:fly={{ duration: 300, x: 20, y: 0, opacity: 0 }}>
							{i + 1 < names.length ? names[i + 1] : ''}
						</p>
					{/key}
				</div>
				<p style="--couleur: {couleur}" class={'timer' + (actualTime == 0 ? ' danger' : '')}>
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
			<div
				on:click={() => {
					pause = !pause;
				}}
			>
				<span class={actualKeyDown == 'KeyP' ? 'key-down' : ''}>P</span>
				{pause ? ' Play ' : 'Pause'}
			</div>
			<div
				on:click={() => {
					newSpeaker();
				}}
			>
				<span class={actualKeyDown == 'Space' ? 'key-down' : ''}>Space</span>
				Next
			</div>
			<div
				on:click={() => {
					if (i - 1 < 0) {
						return;
					} else {
						timerHistory.set(names[i], actualTime);
						i--;
						actualTime = timerHistory.get(names[i]) || time;
						timeSpeaker = timeResult.get(names[i]) || 0;
						textToSpeech(names[i]);
					}
				}}
			>
				<span class={actualKeyDown == 'ArrowLeft' ? 'key-down' : ''}>←</span>
				Previous
			</div>
		</div>
	{/if}

	<i
		on:click={() => {
			goto('/daily');
		}}
		class="fa-solid fa-rectangle-xmark close-daily"
	></i>
</section>

<style lang="scss">
	.close-daily {
		position: fixed;
		top: 0;
		right: 0;
		margin: 1em;
		font-size: 2em;
		cursor: no-drop;
		transition: filter 0.5s;

		&:hover {
			filter: grayscale(0.9);
		}
	}

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

	.timer {
		color: var(--couleur) !important;
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
		bottom: 1em;
		left: 1em;
	}

	.widget-meteo-2 {
		position: fixed;
		bottom: 1em;
		right: 1em;
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

	.hyrox-info {
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