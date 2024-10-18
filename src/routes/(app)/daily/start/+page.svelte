<script>
	import { onMount } from 'svelte';
	import { blur, fly, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import Pause from '$lib/components/Pause.svelte';
	import Return from '$lib/components/Return.svelte';
	import Weather from '$lib/components/Weather.svelte';
	import EuroMillion from '$lib/components/EuroMillion.svelte';
	import { user } from '$lib/stores/user';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import AddUser from '$lib/components/addUser.svelte';
	import GifDisplay from '$lib/components/GifDisplay.svelte';
	import Keys from '$lib/components/Keys.svelte';
	import DateStart from '$lib/components/DateStart.svelte';
	import animationData from '$lib/animation.json';
	import TopPlayers from '$lib/components/TopPlayers.svelte';
	import Hyrox from '$lib/components/Hyrox.svelte';
	import Qwertee from '$lib/components/Qwertee.svelte';

	let i = 0;

	// let actualTime = 120;
	// let timeSpeaker = 0;

	let startDailyDaily = new Date();
	let endDaily = false;

	let audio = null;
	let openMenu = false;

	let displayGif = false;
	let gifUrl = 'https://media.tenor.com/iexmoynoWlIAAAAi/sourire-smile.gif';
	let profilAnimation = '';

	let pause = false;

	let actualKeyDown = '';
	let stats = new Promise(() => {});

	let alreadySave = false;

	let dailyMng = {
		users: [{}],
		voice: true,
		animation: true,
		time: 120,
		exclude: []
	};

	/**
	 * @type {number | null | undefined}
	 */
	let keydownInterval = null;
	/**
	 * @type {number | null | undefined}
	 */
	let animationProfilTimer = null;
	let totalTimer = 0;

	const timerHistory = new Map();
	const timeResult = new Map();

	let couleur = 'rgb(255, 0, 0)';
	$: couleur = `hsl(${(120 * (dailyMng.time - dailyMng.users[i].timer)) / dailyMng.time}deg 71.85% 42.47%)`;

	/**
	 * @typedef {Object} KeyAction
	 * @property {string} actionName - The name of the action associated with the key.
	 * @property {string} key - The key code of the action.
	 * @property {string} keyName - The display name of the key.
	 * @property {function} action - The function to be executed when the key is pressed.
	 */

	/**
	 * An array of key actions.
	 * @type {KeyAction[]}
	 */
	let keysArray = [
		{
			actionName: 'Add User',
			key: 'Tab',
			keyName: 'Tab',
			action: () => {
				openMenu = !openMenu;
			}
		},
		{
			actionName: '+5 sec',
			key: 'KeyQ',
			keyName: 'A',
			action: () => {
				// dailyMng.users[i].time += 5;
				dailyMng.users[i].timer -= 5;
			}
		},
		{
			actionName: '-5 sec',
			key: 'KeyW',
			keyName: 'Z',
			action: () => {
				// dailyMng.users[i].time -= 5;
				dailyMng.users[i].timer += 5;
			}
		},
		{
			actionName: 'Pause',
			key: 'KeyP',
			keyName: 'P',
			action: () => {
				pause = !pause;
			}
		},
		{
			actionName: 'Next',
			key: 'Space',
			keyName: 'Space',
			action: () => {
				newSpeaker();
			}
		},
		{
			actionName: 'Previous',
			key: 'ArrowLeft',
			keyName: '←',
			action: () => {
				if (i - 1 < 0) {
					return;
				} else {
					// timerHistory.set(dailyMng.users[i].name, actualTime);
					i--;
					// actualTime = timerHistory.get(dailyMng.users[i].name) || time;
					// timeSpeaker = timeResult.get(dailyMng.users[i].name) || 0;
					textToSpeech(dailyMng?.users?.[i]?.nickname || dailyMng?.users?.[i]?.name);
				}
			}
		}
	];

	onMount(async () => {
		let dailyInfo = JSON.parse(window.localStorage.getItem('daily'));
		// actualTime = dailyMng.time;

		for (const user of dailyInfo.users) {
			user.time = dailyInfo.time;
			user.timer = 0;
		}

		dailyMng = dailyInfo;

		textToSpeech(dailyMng.users[i].nickname || dailyMng.users[i].name);
		animationSpeaker(dailyMng.users[i].animation);

		let interval = setInterval(() => {
			if (endDaily) return;
			if (!dailyMng.time) return;
			totalTimer++;
			if (pause) return;

			// dailyMng.users[i].time--;
			dailyMng.users[i].timer++;
		}, 1000);

		const audioManager = (audioName) => {
			audio = new Audio('/' + audioName + '.mp3');
			audio.volume = 0.5;
			audio.play();
		};

		document.addEventListener('keydown', (e) => {
			actualKeyDown = e.code;

			if (endDaily) return;

			if (keydownInterval) {
				clearTimeout(keydownInterval);
			}

			keydownInterval = setTimeout(() => {
				actualKeyDown = '';
			}, 300);

			if (e.code === 'Tab' || e.code === 'Escape') {
				if (displayGif) {
					displayGif = false;
					if (audio) {
						audio.pause();
					}
					return;
				}

				openMenu = !openMenu;
			}

			if (openMenu) return;

			if (e.code === 'Space' || e.code === 'ArrowRight') {
				newSpeaker();
			} else if (e.code === 'ArrowLeft') {
				profilAnimation = '';
				if (i - 1 >= 0) {
					// timerHistory.set(dailyMng?.users[i].name, actualTime);
					// timeResult.set(dailyMng?.users[i].name, timeSpeaker);
					i--;
					// actualTime = timerHistory.get(dailyMng?.users[i].name) || time;
					// timeSpeaker = timeResult.get(dailyMng?.users[i].name) || 0;
					textToSpeech(dailyMng.users[i].nickname || dailyMng.users[i].name);
					animationSpeaker(dailyMng?.users[i].animation);
				}
			} else if (e.code === 'KeyP') {
				pause = !pause;
			} else if (e.code === 'KeyQ') {
				// dailyMng.users[i].time += 5;
				dailyMng.users[i].timer -= 5;
			} else if (e.code === 'KeyW') {
				// dailyMng.users[i].time -= 5;
				dailyMng.users[i].timer += 5;
			} else if (e.code === 'KeyK') {
				if (audio) {
					audio.pause();
				}
			}

			// @ts-ignore
			if (animationData[e.code]) {
				if (displayGif) {
					displayGif = false;
					if (audio) {
						audio.pause();
					}
					return;
				}

				// @ts-ignore
				const { url, sound } = animationData[e.code];

				gifUrl = url;
				displayGif = true;
				audioManager(sound);
			}
		});

		return () => {
			if (interval) clearInterval(interval);
		};
	});

	const textToSpeech = (text) => {
		if (!dailyMng.voice) return;
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
		displayGif = false;
		profilAnimation = '';
		if (i + 1 == dailyMng?.users.length) {
			endDaily = true;
			// timerHistory.set(dailyMng?.users[i].name, actualTime);
			// timeResult.set(dailyMng?.users[i].name, timeSpeaker);
			i = 0;
			saveDaily();
		} else {
			// timerHistory.set(dailyMng?.users[i].name, actualTime);
			// timeResult.set(dailyMng?.users[i].name, timeSpeaker);
			i++;
			// actualTime = dailyMng.time;
			// timeSpeaker = timeResult.get(dailyMng?.users[i].name) || 0;
			textToSpeech(dailyMng.users[i].nickname || dailyMng.users[i].name);
			animationSpeaker(dailyMng?.users[i].animation);
		}
	};

	const animationSpeaker = (animation) => {
		if (animation) {
			profilAnimation = animation;

			if (animationProfilTimer) {
				clearTimeout(animationProfilTimer);
			}

			animationProfilTimer = setTimeout(() => {
				profilAnimation = '';
			}, 4000);
		}
	};

	const timeFormater = (time) => {
		const days = Math.floor(time / 86400); // 1 jour = 86400 secondes
		const hours = Math.floor((time % 86400) / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = time % 60;

		const formattedDays = days > 0 ? days + 'j ' : ''; // Format des jours
		const formattedHours =
			hours > 0 ? (hours % 1 !== 0 ? hours.toFixed(1) : Math.floor(hours)) + 'h ' : '';
		const formattedMinutes =
			minutes > 0 ? (minutes % 1 !== 0 ? minutes.toFixed(1) : Math.floor(minutes)) + 'm ' : '';
		const formattedSeconds = (seconds % 1 !== 0 ? seconds.toFixed(1) : Math.floor(seconds)) + 's';

		return `${formattedDays}${formattedHours}${formattedMinutes}${formattedSeconds}`.trim(); // Utilisez trim pour enlever les espaces inutiles
	};

	/**
	 * @param {number} nombre
	 * @param nombre
	 */
	function fixeNumber(nombre) {
		const partieDecimale = nombre.toString().split('.')[1];

		if (partieDecimale && partieDecimale.length > 1) {
			return parseFloat(`${nombre.toFixed(1)}`);
		}

		return nombre;
	}

	const saveDaily = () => {
		if (alreadySave) return;
		alreadySave = true;
		const daily = {
			users: dailyMng?.users,
			team: $user.teams[0],
			totalTime: totalTimer,
			userTime: time,
			speakerTime: Array.from(timeResult.entries()).map(([name, time]) => ({
				name,
				time
			}))
		};

		api.post('/daily', daily).then((res) => {
			stats = api.get(`/daily/stats/${$user.teams[0]}`);
		});
	};

	const shakeEffect = (timeUser) => {
		console.log(timeUser);
		const time = timeUser * -1;

		const initialAmplitude = 1;
		const decayRate = 0.05;

		const amplitude = initialAmplitude * Math.exp(decayRate * time);

		return amplitude > 7 ? 7 : amplitude;
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

		<TopPlayers speakers={timeResult} />

		<div class="separator-vertical">
			<div></div>
		</div>

		<div class="container-result">
			<div class="weather">
				<Weather city="Sophia Antipolis" />
				<Weather city="Montpellier" />
				<Weather city="Rennes" />
			</div>

			<div class="informations">
				{#await stats then data}
					<p>
						Le daily a commencé à <b>{startDailyDaily.toLocaleTimeString()}</b> il a duré
						<b>{timeFormater(totalTimer)}</b>
						c'est
						<u class={totalTimer > data.moyen ? 'warning' : 'success'}
							>{totalTimer > data.moyen ? 'plus' : 'moins'}</u
						>
						long que la moyenne qui est à
						<b>{timeFormater(data.moyen)}</b>
					</p>

					<p>Vous avez passé <b>{timeFormater(data.total)}</b> dans un daily</p>
					<p>En moyenne il y a <b>{fixeNumber(data.moyenPersonne)}</b> personnes dans un daily</p>
				{/await}
			</div>

			<Qwertee />

			<div class="weather">
				<EuroMillion />
				<Hyrox />
			</div>
		</div>

		<div class="widget-euromillion"></div>
	{:else}
		<h1>Le daily {$user?.username || 'NFS'}</h1>

		<pre>{JSON.stringify(dailyMng, null, 2)}</pre>

		{#if dailyMng?.users?.length > 0}
			<div class="actualSpeaker">
				{#if dailyMng?.users && dailyMng?.users[i].avatars}
					<img
						in:blur={{ duration: 500, opacity: 0 }}
						src={'/avatar/' + dailyMng?.users?.[i]?.avatars}
						alt="Jira Avatar"
						on:error={() => {
							dailyMng.users[i].avatars = null;
						}}
					/>
				{/if}

				<div>
					{#key dailyMng.users[i].name}
						<p in:fly={{ duration: 300, x: 20, y: 0, opacity: 0 }}>
							{i > 0 ? dailyMng.users[i - 1].name : ''}
						</p>

						<p in:scale={{ duration: 300, opacity: 0 }}>
							{dailyMng.users[i].name}
						</p>
						<p in:fly={{ duration: 300, x: 20, y: 0, opacity: 0 }}>
							{i + 1 < dailyMng.users.length ? dailyMng.users[i + 1].name : ''}
						</p>
					{/key}
				</div>
				<p
					style="--couleur: {couleur}; --shake-amplitude: {shakeEffect(
						dailyMng.time - dailyMng.users[i].timer
					)}"
					class={'timer' +
						(dailyMng.time - dailyMng.users[i].timer <= 0 && !pause ? ' danger' : '')}
				>
					{#if pause}
						<Pause />
					{:else}
						{dailyMng.time - dailyMng.users[i].timer}
					{/if}
				</p>
			</div>
		{/if}

		<DateStart {startDailyDaily} {displayGif} />

		<p class="actualTime">
			<i class="fa-regular fa-clock"></i>
			{timeFormater(totalTimer)}
		</p>

		{#if openMenu}
			<AddUser userExclude={dailyMng.exclude} bind:speaker={dailyMng.users} bind:openMenu />
		{/if}

		<Keys {keysArray} {actualKeyDown} />
		<GifDisplay {gifUrl} {displayGif} />

		{#if profilAnimation && dailyMng.animation}
			<div class="profilAnimation">
				{#key profilAnimation}
					<img in:scale={{ duration: 500, opacity: 0 }} src={profilAnimation} alt="gif" />
				{/key}
			</div>
		{/if}
	{/if}

	<i
		on:click={() => {
			goto('/daily');
		}}
		class="fa-solid fa-rectangle-xmark close-daily"
		style={endDaily ? 'cursor: pointer;' : ''}
	></i>
</section>

<style lang="scss">
	.gifFullScreen {
		z-index: 1000;
		position: fixed;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		pointer-events: none;
	}

	.profilAnimation {
		z-index: -1;
		position: fixed;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		align-content: end;
		display: flex;
		text-align: center;
		pointer-events: none;
		justify-content: center;

		img {
			pointer-events: none;
			opacity: 0.5;
		}
	}

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
		gap: 1em;
		display: flex;
		flex-direction: column;
		justify-content: space-around;

		.weather {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 2em;
		}

		.euromillion {
			width: max-content;
			grid-area: 3/1/6/4;
		}

		b {
			color: var(--primary-800);
			font-weight: bold;
		}

		u {
			text-decoration: underline;

			&.warning {
				color: red;
			}

			&.success {
				color: green;
			}
		}

		.informations {
			background-color: var(--primary-200);
			padding: 1em;
		}

		div {
			height: fit-content;
			display: flex;
			flex-direction: column;

			border-radius: 5px;
			color: var(--primary-600);

			border-radius: 1em;
			gap: 0.3em;

			div {
				display: flex;
			}
		}
	}

	section {
		padding: 5em 2em 0;
		display: grid;
		grid-template-columns: 1fr auto 2fr;
		gap: 1em;

		& > h1 {
			position: fixed;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
		}

		.separator-vertical {
			display: flex;
			align-items: center;
			div {
				background-color: var(--primary-400);
				height: 80vh;
				width: 0.5em;
				border-radius: 0.5em;
			}
		}
	}

	.actualTime {
		position: fixed;
		top: 0;
		left: 0;
		padding: 1em;
		font-size: 1.7em;
	}

	.timer {
		color: var(--couleur) !important;
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
			color: var(--primary-600);
		}

		img {
			width: 100px;
			height: 100px;
			border-radius: 50%;

			position: absolute;
			top: -150px;
			left: 50%;
			transform: translate(-50%, 0%);
			background-color: var(--primary-100);
			border: 5px solid var(--primary-600);
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
		color: red !important;
		animation: shake 1s linear infinite;
	}

	@keyframes blinker {
		50% {
			opacity: 0;
			transform: scale(1.2);
		}
	}

	.widget-1 {
		position: fixed;
		bottom: 1em;
		left: 1em;
		display: flex;
		gap: 2em;
		flex-direction: column;
	}

	.widget-2 {
		position: fixed;
		bottom: 1em;
		right: 1.2em;
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
		border: 2px solid var(--primary-600);
		border-radius: 5px;
	}

	.return:hover {
		background-color: var(--primary-hover);
		cursor: pointer;
	}

	@keyframes shake {
		0% {
			transform: translate(
					calc(1px * var(--shake-amplitude, 1)),
					calc(1px * var(--shake-amplitude, 1))
				)
				rotate(calc(0deg * var(--shake-amplitude, 1)));
		}
		10% {
			transform: translate(
					calc(-1px * var(--shake-amplitude, 1)),
					calc(-2px * var(--shake-amplitude, 1))
				)
				rotate(calc(-1deg * var(--shake-amplitude, 1)));
		}
		20% {
			transform: translate(
					calc(-3px * var(--shake-amplitude, 1)),
					calc(0px * var(--shake-amplitude, 1))
				)
				rotate(calc(1deg * var(--shake-amplitude, 1)));
		}
		30% {
			transform: translate(
					calc(3px * var(--shake-amplitude, 1)),
					calc(2px * var(--shake-amplitude, 1))
				)
				rotate(calc(0deg * var(--shake-amplitude, 1)));
		}
		40% {
			transform: translate(
					calc(1px * var(--shake-amplitude, 1)),
					calc(-1px * var(--shake-amplitude, 1))
				)
				rotate(calc(1deg * var(--shake-amplitude, 1)));
		}
		50% {
			transform: translate(
					calc(-1px * var(--shake-amplitude, 1)),
					calc(2px * var(--shake-amplitude, 1))
				)
				rotate(calc(-1deg * var(--shake-amplitude, 1)));
		}
		60% {
			transform: translate(
					calc(-3px * var(--shake-amplitude, 1)),
					calc(1px * var(--shake-amplitude, 1))
				)
				rotate(calc(0deg * var(--shake-amplitude, 1)));
		}
		70% {
			transform: translate(
					calc(3px * var(--shake-amplitude, 1)),
					calc(1px * var(--shake-amplitude, 1))
				)
				rotate(calc(-1deg * var(--shake-amplitude, 1)));
		}
		80% {
			transform: translate(
					calc(-1px * var(--shake-amplitude, 1)),
					calc(-1px * var(--shake-amplitude, 1))
				)
				rotate(calc(1deg * var(--shake-amplitude, 1)));
		}
		90% {
			transform: translate(
					calc(1px * var(--shake-amplitude, 1)),
					calc(2px * var(--shake-amplitude, 1))
				)
				rotate(calc(0deg * var(--shake-amplitude, 1)));
		}
		100% {
			transform: translate(
					calc(1px * var(--shake-amplitude, 1)),
					calc(-2px * var(--shake-amplitude, 1))
				)
				rotate(calc(-1deg * var(--shake-amplitude, 1)));
		}
	}
</style>
