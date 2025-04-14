<script>
	import { onDestroy, onMount } from 'svelte';
	import { blur, fly, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import Pause from '$lib/components/Pause.svelte';
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
	import PartyHat from '$lib/components/PartyHat.svelte';
	import { Confetti } from 'svelte-confetti';
	import Bouns from '$lib/components/Bouns.svelte';
	import Rain from '$lib/components/Rain.svelte';
	import TeamMood from '$lib/components/TeamMood.svelte';
	import ProgrammedDate from '$lib/components/ProgrammedDate.svelte';

	let audio = null;
	let openMenu = false;

	let displayGif = false;
	let gifUrl = 'https://media.tenor.com/iexmoynoWlIAAAAi/sourire-smile.gif';
	let profilAnimation = '';

	let pause = false;

	let actualKeyDown = '';
	let stats = new Promise(() => {});

	let alreadySave = false;

	let interval = null;

	let dailyMng = {
		users: [{}],
		voice: true,
		animation: true,
		time: 120,
		exclude: [],
		state: 'LOADING',
		index: 0,
		totalTimer: 0,
		startDailyDate: new Date()
	};

	/**
	 * @type {number | null | undefined}
	 */
	let keydownInterval = null;
	/**
	 * @type {number | null | undefined}
	 */
	let animationProfilTimer = null;

	let couleur = 'rgb(255, 0, 0)';
	$: (couleur = `hsl(${(120 * (dailyMng.time - dailyMng.users[dailyMng.index].timer)) / dailyMng.time}deg 71.85% 42.47%)`),
		updateDailyMngOnLocalStorage(dailyMng);

	const updateDailyMngOnLocalStorage = (dailyMng) => {
		if (!dailyMng || !dailyMng.users || dailyMng.users.length === 0 || dailyMng.state == 'LOADING')
			return;

		checkLastDayOnProject(dailyMng.users[dailyMng.index].lastDayOnProject);

		window.localStorage.setItem('daily', JSON.stringify(dailyMng));
	};

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
			actionName: 'Remove User',
			key: 'KeyD',
			keyName: 'D',
			action: () => {
				if (dailyMng.users.length > 1) {
					let removeIndex = dailyMng.index;
					dailyMng.exclude = [...dailyMng.exclude, dailyMng.users[dailyMng.index]];

					if (dailyMng.index >= dailyMng.users.length - 1) {
						dailyMng.index--;
					}
					dailyMng.users.splice(removeIndex, 1);
				}
			}
		},
		{
			actionName: '+5 sec',
			key: 'KeyQ',
			keyName: 'A',
			action: () => {
				dailyMng.users[dailyMng.index].timer -= 5;
			}
		},
		{
			actionName: '-5 sec',
			key: 'KeyW',
			keyName: 'Z',
			action: () => {
				dailyMng.users[dailyMng.index].timer += 5;
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
				if (dailyMng.index - 1 < 0) {
					return;
				} else {
					dailyMng.index--;
					textToSpeech(
						dailyMng?.users?.[dailyMng.index]?.nickname || dailyMng?.users?.[dailyMng.index]?.name
					);
				}
			}
		}
	];

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
		document.body.style.removeProperty('background-color');
	});

	onMount(async () => {
		let dailyInfo = JSON.parse(window.localStorage.getItem('daily'));

		for (const user of dailyInfo.users) {
			if (!user.timer) {
				user.timer = 0;
			}
		}

		dailyMng = { ...dailyMng, ...dailyInfo };

		if (dailyInfo.startDailyDate) {
			dailyMng.startDailyDate = new Date(dailyInfo.startDailyDate);
		}

		if (dailyMng.state == 'LOADING') {
			dailyMng.state = 'IN_PROGRESS';
		}

		textToSpeech(dailyMng.users[dailyMng.index].nickname || dailyMng.users[dailyMng.index].name);
		animationSpeaker(dailyMng.users[dailyMng.index].animation);

		interval = setInterval(() => {
			if (dailyMng.state == 'ENDED') return;
			if (!dailyMng.time) return;
			dailyMng.totalTimer++;
			if (pause) return;

			dailyMng.users[dailyMng.index].timer++;
		}, 1000);

		const audioManager = (audioName) => {
			audio = new Audio('/' + audioName + '.mp3');
			audio.volume = 0.5;
			audio.play();
		};

		document.addEventListener('keydown', (e) => {
			actualKeyDown = e.code;

			if (dailyMng.state == 'ENDED') return;

			if (keydownInterval) {
				clearTimeout(keydownInterval);
			}

			keydownInterval = setTimeout(() => {
				actualKeyDown = '';
			}, 300);

			if (e.code === 'Tab' || e.code === 'Escape') {
				if (toggleGif()) return;

				openMenu = !openMenu;
			}

			if (openMenu) return;

			if (e.code === 'Space' || e.code === 'ArrowRight') {
				newSpeaker();
			} else if (e.code === 'ArrowLeft') {
				profilAnimation = '';
				if (dailyMng.index - 1 >= 0) {
					dailyMng.index--;
					textToSpeech(
						dailyMng.users[dailyMng.index].nickname || dailyMng.users[dailyMng.index].name
					);
					animationSpeaker(dailyMng?.users[dailyMng.index].animation);
				}
			} else if (e.code === 'KeyP') {
				pause = !pause;
			} else if (e.code === 'KeyQ') {
				dailyMng.users[dailyMng.index].timer -= 5;
			} else if (e.code === 'KeyW') {
				dailyMng.users[dailyMng.index].timer += 5;
			} else if (e.code === 'KeyK') {
				if (audio) {
					audio.pause();
				}
			} else if (e.code === 'KeyD') {
				if (dailyMng.users.length > 1) {
					let removeIndex = dailyMng.index;
					dailyMng.exclude = [...dailyMng.exclude, dailyMng.users[dailyMng.index]];

					if (dailyMng.index >= dailyMng.users.length - 1) {
						dailyMng.index--;
					}
					dailyMng.users.splice(removeIndex, 1);
				}
			}

			// @ts-ignore
			if (animationData[e.code]) {
				if (toggleGif()) return;

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

	const toggleGif = () => {
		if (displayGif) {
			displayGif = false;
			if (audio) {
				audio.pause();
			}
			return true;
		}
		return false;
	};

	const textToSpeech = (text) => {
		if (!dailyMng.voice) return;
		if (dailyMng.state == 'ENDED') return;

		if ('speechSynthesis' in window) {
			if (window.speechSynthesis.speaking) {
				window.speechSynthesis.cancel();
			}

			let utterance = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(utterance);
		}
	};

	const newSpeaker = () => {
		if (dailyMng.state == 'ENDED') return;
		displayGif = false;
		profilAnimation = '';
		if (dailyMng.index + 1 == dailyMng?.users.length) {
			dailyMng.state = 'ENDED';
			dailyMng.index = 0;
			saveDaily();
			document.body.style.removeProperty('background-color');

			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		} else {
			dailyMng.index++;
			textToSpeech(dailyMng.users[dailyMng.index].nickname || dailyMng.users[dailyMng.index].name);
			animationSpeaker(dailyMng?.users[dailyMng.index].animation);
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

		api.post('/daily', { team: $user.teams[0], ...dailyMng }).then((res) => {
			stats = api.get(`/daily/stats/${$user.teams[0]}`);
		});
	};

	const shakeEffect = (timeUser) => {
		const time = timeUser * -1;

		const initialAmplitude = 1;
		const decayRate = 0.05;

		const amplitude = initialAmplitude * Math.exp(decayRate * time);

		return amplitude > 7 ? 7 : amplitude;
	};

	const checkBirthdayToday = (birthday) => {
		console.log(birthday);
		if (!birthday) return false;

		const actualDate = new Date();

		const birthdayDate = new Date(birthday);

		return (
			birthdayDate.getDate() === actualDate.getDate() &&
			birthdayDate.getMonth() === actualDate.getMonth()
		);
	};

	const checkLastDayOnProject = (date) => {
		if (!date) return false;

		const actualDate = new Date();
		const LastDayOnProjectDate = new Date(date);

		return (
			LastDayOnProjectDate.getDate() === actualDate.getDate() &&
			LastDayOnProjectDate.getMonth() === actualDate.getMonth() &&
			LastDayOnProjectDate.getFullYear() === actualDate.getFullYear()
		);
	};
</script>

<svelte:head>
	<title>
		{dailyMng.state == 'ENDED'
			? 'Daily terminé !'
			: `Daily en cours - ${dailyMng.users[dailyMng.index]?.name}`}
	</title>
	<meta
		name="description"
		content="Attention c'est l'heure du daily fait attention c'est bientôt à toi"
	/>
</svelte:head>

<section>
	{#if dailyMng.state == 'ENDED'}
		<h1>Le daily est terminé</h1>

		<TopPlayers speakers={dailyMng.users} />

		<div class="separator-vertical">
			<div></div>
		</div>

		<div class="container-result">
			<div class="weather">
				{#each $user.weather as city}
					<Weather {city} />
				{/each}
			</div>

			<div class="informations">
				{#await stats then data}
					<p>
						Le daily a commencé à <b>{dailyMng.startDailyDate.toLocaleTimeString()}</b> il a duré
						<b>{timeFormater(dailyMng.totalTimer)}</b>
						c'est
						<u class={dailyMng.totalTimer > data.moyen ? 'warning' : 'success'}
							>{dailyMng.totalTimer > data.moyen ? 'plus' : 'moins'}</u
						>
						long que la moyenne qui est à
						<b>{timeFormater(data.moyen)}</b>
					</p>

					<p>Vous avez passé <b>{timeFormater(data.total)}</b> dans un daily</p>
					<p>En moyenne il y a <b>{fixeNumber(data.moyenPersonne)}</b> personnes dans un daily</p>
				{/await}
			</div>

			{#if $user.qwertee}
				<Qwertee />
			{/if}

			{#if $user.username == 'nfs'}
				<div class="weather">
					<Hyrox />
					<TeamMood />
					<ProgrammedDate dateModule={$user?.date} />
				</div>
			{/if}
		</div>
	{:else}
		<h1>Le daily {$user?.username || ''}</h1>

		{#if checkLastDayOnProject(dailyMng?.users[dailyMng.index].lastDayOnProject)}
			<Rain />
		{/if}

		{#if dailyMng?.users?.length > 0}
			{#if checkBirthdayToday(dailyMng?.users[dailyMng.index].birthday)}
				<div
					style="position: fixed; top: -50px;left: 0;height: 100vh;width: 100vw;display: flex;justify-content: center;overflow: hidden;pointer-events: none;"
				>
					<Confetti
						x={[-5, 5]}
						y={[0, 0.1]}
						delay={[1000, 3000]}
						infinite
						size={15}
						duration={5000}
						amount={150}
						fallDistance="100vh"
						colorArray={['var(--primary-400)', 'var(--primary-600)', 'var(--primary-950)']}
					/>
				</div>
			{/if}

			<div class="actualSpeaker">
				{#key dailyMng.index}
					<div class="avatars-container">
						{#if dailyMng?.users && dailyMng?.users[dailyMng.index].avatar}
							{#if dailyMng?.users[dailyMng.index].avatar == 'bouns.svelte'}
								<Bouns />
							{:else}
								<img
									in:blur={{ duration: 500, opacity: 0 }}
									src={'/avatar/' + dailyMng?.users?.[dailyMng.index]?.avatar}
									alt="Jira Avatar"
									on:error={() => {
										dailyMng.users[dailyMng.index].avatar = null;
									}}
								/>
							{/if}
						{:else}
							<img
								in:blur={{ duration: 500, opacity: 0 }}
								src={'https://api.dicebear.com/9.x/dylan/svg?seed=' +
									dailyMng?.users?.[dailyMng.index]?.name}
								alt="Avatar"
								on:error={() => {
									dailyMng.users[dailyMng.index].avatar = null;
								}}
							/>
						{/if}
						{#if checkBirthdayToday(dailyMng?.users[dailyMng.index].birthday)}
							<PartyHat />
						{/if}
					</div>
				{/key}

				<div>
					{#key dailyMng.users[dailyMng.index].name}
						<p in:fly={{ duration: 300, x: 20, y: 0, opacity: 0 }}>
							{dailyMng.index > 0 ? dailyMng.users[dailyMng.index - 1].name : ''}
						</p>

						<p in:scale={{ duration: 300, opacity: 0 }}>
							{#if checkBirthdayToday(dailyMng?.users[dailyMng.index].birthday)}
								<Confetti
									cone
									x={[-2, -2.5]}
									y={[-0.1, 0.75]}
									delay={[80, 2000]}
									colorArray={['var(--primary-500)', 'var(--primary-950)']}
								/>
							{/if}

							<span>{dailyMng.users[dailyMng.index].name}</span>
							{#if checkBirthdayToday(dailyMng?.users[dailyMng.index].birthday)}
								<Confetti
									cone
									x={[2, 2.5]}
									y={[-0.1, 0.75]}
									delay={[80, 2000]}
									colorArray={['var(--primary-500)', 'var(--primary-950)']}
								/>
							{/if}
						</p>
						<p in:fly={{ duration: 300, x: 20, y: 0, opacity: 0 }}>
							{dailyMng.index + 1 < dailyMng.users.length
								? dailyMng.users[dailyMng.index + 1].name
								: ''}
						</p>
					{/key}
				</div>
				<p
					style="--couleur: {couleur}; --shake-amplitude: {shakeEffect(
						dailyMng.time - dailyMng.users[dailyMng.index].timer
					)}"
					class={'timer' +
						(dailyMng.time - dailyMng.users[dailyMng.index].timer <= 0 && !pause ? ' danger' : '')}
				>
					{#if pause}
						<Pause />
					{:else}
						{dailyMng.time - dailyMng.users[dailyMng.index].timer}
					{/if}
				</p>

				{#if new Date().getDay() === 2 && dailyMng.users[dailyMng.index].name === 'Guillaume' && $user.username == 'nfs'}
					<span
						><br /><br />Yo la team faut remplir le team mood<br /><span style="font-weight: bold;"
							>https://team-mood-1129.apps.ocp4.innershift.sodigital.io/</span
						></span
					>
				{/if}
			</div>
		{/if}

		<DateStart startDailyDate={dailyMng.startDailyDate} {displayGif} />

		<p class="actualTime">
			<i class="fa-regular fa-clock"></i>
			{timeFormater(dailyMng.totalTimer)}
		</p>

		{#if openMenu}
			<AddUser bind:userExclude={dailyMng.exclude} bind:speaker={dailyMng.users} bind:openMenu />
		{/if}

		<Keys {keysArray} {actualKeyDown} />

		<GifDisplay {gifUrl} {displayGif} {toggleGif} />

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
			if (interval) {
				clearInterval(interval);
			}

			window.localStorage.removeItem('daily');
			goto('/daily');
		}}
		class="fa-solid fa-rectangle-xmark close-daily"
		style={dailyMng.state == 'ENDED' ? 'cursor: pointer;' : ''}
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
		justify-content: center;

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
		grid-template-columns: auto auto 2fr;
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

		.avatars-container {
			width: 100px;
			height: 100px;
			border-radius: 50%;

			position: absolute;
			top: -12dvh;
			left: 50%;
			transform: translate(-50%, 0%);
			position: relative;

			svg {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}

		img {
			width: 100px;
			height: 100px;
			border-radius: 50%;

			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background-color: var(--primary-100);
			border: 5px solid var(--primary-600);
		}

		@media screen and (max-height: 500px) {
			.avatars-container {
				display: none;
			}
		}

		div {
			// display: flex;
			// justify-content: center;
			// align-items: end;
			// gap: 1em;
			// position: relative;

			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			align-items: baseline;
			width: 95vw;

			p {
				opacity: 0.3;
			}

			p:nth-child(1) {
				scale: 0.7;
			}

			p:nth-child(2) {
				font-size: 5em;
				opacity: 1;
				display: flex;
				flex-direction: row;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			p:nth-child(3) {
				scale: 0.7;
			}
		}

		@media screen and (max-width: 1080px) {
			div {
				grid-template-columns: 1fr;

				p:nth-child(1) {
					display: none;
				}

				p:nth-child(3) {
					display: none;
				}
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
