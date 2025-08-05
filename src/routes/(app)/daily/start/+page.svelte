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
	import Qwertee from '$lib/components/Qwertee.svelte';
	import PartyHat from '$lib/components/PartyHat.svelte';
	import { Confetti } from 'svelte-confetti';
	import Bouns from '$lib/components/Bouns.svelte';
	import Rain from '$lib/components/Rain.svelte';
	import ProgrammedDate from '$lib/components/ProgrammedDate.svelte';
	import AvatarDecoration from '$lib/components/AvatarDecoration.svelte';
	import TruckToFood from '$lib/components/TruckToFood.svelte';

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
	let recapInterval = null;
	let currentRecapSection = 0;
	let recapSections = [];

	let dailyMng = {
		users: [{}],
		voice: true,
		animation: true,
		time: 120,
		exclude: [],
		state: 'LOADING',
		index: 0,
		totalTimer: 0,
		startDailyDate: new Date(),
		fullScreen: true
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
				if (dailyMng.state == 'ENDED') {
					navigateRecap(-1);
					return;
				}
				if (dailyMng.index - 1 < 0) {
					return;
				} else {
					dailyMng.index--;
					textToSpeech(
						dailyMng?.users?.[dailyMng.index]?.nickname || dailyMng?.users?.[dailyMng.index]?.name
					);
				}
			}
		},
		{
			actionName: 'Next',
			key: 'ArrowRight',
			keyName: '→',
			action: () => {
				if (dailyMng.state == 'ENDED') {
					navigateRecap(1);
					return;
				}
				newSpeaker();
			}
		}
	];

	const audioManager = (audioName) => {
		audio = new Audio('/' + audioName + '.mp3');
		audio.volume = 0.5;
		audio.play();
	};

	function keydownHandler(e) {
		actualKeyDown = e.code;

		if (keydownInterval) {
			clearTimeout(keydownInterval);
		}

		keydownInterval = setTimeout(() => {
			actualKeyDown = '';
		}, 300);

		if (dailyMng.state == 'ENDED') {
			if (e.code === 'ArrowLeft') {
				navigateRecap(-1);
			} else if (e.code === 'ArrowRight') {
				navigateRecap(1);
			}
			return;
		}

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
	}

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
		if (recapInterval) {
			clearInterval(recapInterval);
		}
		document.removeEventListener('keydown', keydownHandler);
		document.body.style.removeProperty('background-color');
	});

	onMount(() => {
		let dailyInfo = null;

		try {
			dailyInfo = JSON.parse(window.localStorage.getItem('daily'));
		} catch (e) {
			console.error('Error parsing daily data from localStorage:', e);
		}

		if (!dailyInfo || !dailyInfo.users || dailyInfo.users.length === 0) {
			goto('/daily');
			return;
		}

		for (const user of dailyInfo?.users) {
			if (!user.timer) {
				user.timer = 0;
			}
		}

		dailyMng = { ...dailyMng, ...dailyInfo };

		if (dailyInfo?.fullScreen && !document.fullscreenElement) {
			try {
				document.documentElement.requestFullscreen();
			} catch (e) {
				console.error('Error requesting fullscreen:', e);
			}
		}

		if (dailyInfo.startDailyDate) {
			dailyMng.startDailyDate = new Date(dailyInfo.startDailyDate);
		}

		if (dailyMng.state == 'LOADING') {
			dailyMng.state = 'IN_PROGRESS';
		}

		if (dailyMng.state === 'ENDED') {
			initRecapSections(false);
			document.body.style.removeProperty('background-color');
		} else {
			textToSpeech(dailyMng.users[dailyMng.index].nickname || dailyMng.users[dailyMng.index].name);
			animationSpeaker(dailyMng.users[dailyMng.index].animation);
		}

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

		document.addEventListener('keydown', keydownHandler);

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
			initRecapSections();

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

	const initRecapSections = (displayStats = true) => {
		recapSections = ['topPlayers'];

		if (displayStats) {
			recapSections.push('informations');
		}

		// Ajouter la météo si disponible
		if ($user.weather && $user.weather.length > 0) {
			recapSections.push('weather');
		}

		// Ajouter les dates programmées si il y en a
		if ($user?.programmedDates && $user.programmedDates.length > 0) {
			recapSections.push('programmedDates');
		}

		// Ajouter Qwertee si disponible
		if ($user.qwertee) {
			recapSections.push('qwertee');
		}

		// Ajouter EuroMillion si activé et c'est un jour sélectionné
		const currentDay = new Date().getDay();
		if ($user.euromillion?.enabled && ($user.euromillion?.days || []).includes(currentDay)) {
			recapSections.push('euromillion');
		}

		if ($user?.truckToFood?.enabled && ($user?.truckToFood?.days || []).includes(currentDay)) {
			recapSections.push('truckToFood');
		}

		currentRecapSection = 0;

		recapInterval = setInterval(() => {
			currentRecapSection = (currentRecapSection + 1) % recapSections.length;
		}, 5000);
	};

	const navigateRecap = (direction) => {
		if (recapSections.length === 0) return;

		if (recapInterval) {
			clearInterval(recapInterval);
		}

		currentRecapSection =
			(currentRecapSection + direction + recapSections.length) % recapSections.length;

		setTimeout(() => {
			if (!recapInterval) {
				recapInterval = setInterval(() => {
					currentRecapSection = (currentRecapSection + 1) % recapSections.length;
				}, 5000);
			}
		}, 3000);
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
		<div class="recap-fullscreen">
			<div class="recap-header">
				<h1><i class="fa-solid fa-trophy"></i> Daily terminé !</h1>
				<div class="recap-navigation">
					<div class="nav-indicators">
						{#each recapSections as section, index}
							<div class="indicator {index === currentRecapSection ? 'active' : ''}" />
						{/each}
					</div>
					<p>
						<i class="fa-solid fa-arrow-left"></i> <i class="fa-solid fa-arrow-right"></i> pour
						naviguer • Section {currentRecapSection + 1}/{recapSections.length}
					</p>
				</div>
			</div>

			<div class="recap-content">
				{#if recapSections[currentRecapSection] === 'topPlayers'}
					<div class="recap-widget" in:fly={{ duration: 300, x: 50, opacity: 0 }}>
						<div class="widget-header">
							<h2><i class="fa-solid fa-ranking-star"></i> Classement des participants</h2>
							<p>Temps de parole par participant</p>
						</div>
						<div class="widget-content">
							<TopPlayers speakers={dailyMng.users} />
						</div>
					</div>
				{:else if recapSections[currentRecapSection] === 'weather'}
					<div class="recap-widget" in:fly={{ duration: 300, x: 50, opacity: 0 }}>
						<div class="widget-header">
							<h2><i class="fa-solid fa-cloud-sun"></i> Météo du jour</h2>
							<p>Conditions météorologiques actuelles</p>
						</div>
						<div class="widget-content weather-container">
							{#if $user.weather && $user.weather.length > 0}
								<div class="weather-grid">
									{#each $user.weather as city}
										<Weather {city} />
									{/each}
								</div>
							{:else}
								<div class="no-weather">
									<i class="fa-solid fa-cloud-question"></i>
									<p>Aucune ville configurée pour la météo</p>
								</div>
							{/if}
						</div>
					</div>
				{:else if recapSections[currentRecapSection] === 'informations'}
					<div class="recap-widget" in:fly={{ duration: 300, x: 50, opacity: 0 }}>
						<div class="widget-header">
							<h2><i class="fa-solid fa-chart-line"></i> Statistiques du Daily</h2>
							<p>Analyse et comparaison avec les précédents daily</p>
						</div>
						<div class="widget-content stats-content">
							{#await stats}
								<div class="stats-loading">
									<i class="fa-solid fa-spinner fa-spin"></i>
									<p>Chargement des statistiques...</p>
								</div>
							{:then data}
								<div class="stat-cards">
									<div class="stat-card primary" style="--delay: 0s">
										<div class="stat-icon">
											<i class="fa-solid fa-clock"></i>
										</div>
										<div class="stat-info">
											<h3>Durée du daily</h3>
											<p class="stat-value">{timeFormater(dailyMng.totalTimer)}</p>
											<p class="stat-detail">
												Commencé à <strong>{dailyMng.startDailyDate.toLocaleTimeString()}</strong>
											</p>
										</div>
									</div>

									<div
										class="stat-card {dailyMng.totalTimer > data.moyen ? 'warning' : 'success'}"
										style="--delay: 0.1s"
									>
										<div class="stat-icon">
											<i
												class="fa-solid fa-{dailyMng.totalTimer > data.moyen
													? 'arrow-up'
													: 'arrow-down'}"
											></i>
										</div>
										<div class="stat-info">
											<h3>Comparaison moyenne</h3>
											<p class="stat-value">
												{dailyMng.totalTimer > data.moyen ? 'Plus' : 'Moins'} long
											</p>
											<p class="stat-detail">
												Moyenne équipe : <strong>{timeFormater(data.moyen)}</strong>
											</p>
										</div>
									</div>

									<div class="stat-card info" style="--delay: 0.2s">
										<div class="stat-icon">
											<i class="fa-solid fa-calendar-days"></i>
										</div>
										<div class="stat-info">
											<h3>Temps total équipe</h3>
											<p class="stat-value">{timeFormater(data.total)}</p>
											<p class="stat-detail">passé en daily depuis le début</p>
										</div>
									</div>

									<div class="stat-card secondary" style="--delay: 0.3s">
										<div class="stat-icon">
											<i class="fa-solid fa-users"></i>
										</div>
										<div class="stat-info">
											<h3>Participants moyens</h3>
											<p class="stat-value">{fixeNumber(data.moyenPersonne)}</p>
											<p class="stat-detail">personnes par daily en moyenne</p>
										</div>
									</div>

									<div
										class="stat-card {data.equilibre < 30
											? 'success'
											: data.equilibre < 60
												? 'warning'
												: 'danger'}"
										style="--delay: 0.4s"
									>
										<div class="stat-icon">
											<i class="fa-solid fa-balance-scale"></i>
										</div>
										<div class="stat-info">
											<h3>Équilibre de parole</h3>
											<p class="stat-value">{Math.round(data.equilibre)}s</p>
											<p class="stat-detail">
												Écart-type des temps de parole
												{data.equilibre < 30
													? '(Très équilibré)'
													: data.equilibre < 60
														? '(Moyennement équilibré)'
														: '(Déséquilibré)'}
											</p>
										</div>
									</div>

									<div
										class="stat-card {data.streak >= 5
											? 'success'
											: data.streak >= 2
												? 'warning'
												: 'danger'}"
										style="--delay: 0.5s"
									>
										<div class="stat-icon">
											<i class="fa-solid fa-fire"></i>
										</div>
										<div class="stat-info">
											<h3>Streak ponctualité</h3>
											<p class="stat-value">{data.streak}</p>
											<p class="stat-detail">
												daily{data.streak > 1 ? 's' : ''} consécutif{data.streak > 1 ? 's' : ''} ≤ 15min
											</p>
										</div>
									</div>

									<div class="stat-card info" style="--delay: 0.6s">
										<div class="stat-icon">
											<i class="fa-solid fa-gauge-high"></i>
										</div>
										<div class="stat-info">
											<h3>Efficacité</h3>
											<p class="stat-value">{fixeNumber(data.efficacite)}</p>
											<p class="stat-detail">Ratio participants/seconde × 1000</p>
										</div>
									</div>

									<div
										class="stat-card {data.ponctualite >= 80
											? 'success'
											: data.ponctualite >= 50
												? 'warning'
												: 'danger'}"
										style="--delay: 0.7s"
									>
										<div class="stat-icon">
											<i class="fa-solid fa-stopwatch"></i>
										</div>
										<div class="stat-info">
											<h3>Score de ponctualité</h3>
											<p class="stat-value">{Math.round(data.ponctualite)}%</p>
											<p class="stat-detail">de dailys terminés en moins de 15min</p>
										</div>
									</div>

									<div
										class="stat-card {data.progression > 5
											? 'success'
											: data.progression >= -5
												? 'info'
												: 'warning'}"
										style="--delay: 0.8s"
									>
										<div class="stat-icon">
											<i
												class="fa-solid fa-{data.progression > 5
													? 'chart-line'
													: data.progression >= -5
														? 'minus'
														: 'chart-line-down'}"
											></i>
										</div>
										<div class="stat-info">
											<h3>Progression</h3>
											<p class="stat-value">
												{data.progression > 0 ? '+' : ''}{Math.round(data.progression)}%
											</p>
											<p class="stat-detail">
												vs les 5 dailys précédents
												{data.progression > 5
													? '(Amélioration)'
													: data.progression >= -5
														? '(Stable)'
														: '(Dégradation)'}
											</p>
										</div>
									</div>
								</div>
							{:catch error}
								<div class="stats-error">
									<i class="fa-solid fa-exclamation-triangle"></i>
									<p>Erreur lors du chargement des statistiques</p>
									<small>{error}</small>
								</div>
							{/await}
						</div>
					</div>
				{:else if recapSections[currentRecapSection] === 'qwertee'}
					<div class="recap-widget" in:fly={{ duration: 300, x: 50, opacity: 0 }}>
						<div class="widget-header">
							<h2><i class="fa-solid fa-shirt"></i> T-shirts du jour</h2>
							<p>Découvrez les designs Qwertee tendance</p>
						</div>
						<div class="widget-content qwertee-container">
							<Qwertee />
						</div>
					</div>
				{:else if recapSections[currentRecapSection] === 'euromillion'}
					<div class="recap-widget" in:fly={{ duration: 300, x: 50, opacity: 0 }}>
						<div class="widget-header">
							<h2><i class="fa-solid fa-coins"></i> Tirage EuroMillion</h2>
							<p>Résultats du tirage EuroMillion</p>
						</div>
						<div class="widget-content euromillion-container">
							<EuroMillion />
						</div>
					</div>
				{:else if recapSections[currentRecapSection] === 'truckToFood'}
					<div class="recap-widget" in:fly={{ duration: 300, x: 50, opacity: 0 }}>
						<div class="widget-header">
							<h2><i class="fa-solid fa-truck"></i> Truck to Food</h2>
							<p>Menu de la semaine</p>
						</div>
						<div class="widget-content truck-food-container">
							<TruckToFood />
						</div>
					</div>
				{:else if recapSections[currentRecapSection] === 'programmedDates'}
					<div class="recap-widget" in:fly={{ duration: 300, x: 50, opacity: 0 }}>
						<div class="widget-header">
							<h2><i class="fa-solid fa-calendar-alt"></i> Dates importantes</h2>
							<p>Échéances et événements programmés</p>
						</div>
						<div class="widget-content">
							<ProgrammedDate />
						</div>
					</div>
				{/if}
			</div>
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
						{#if dailyMng?.users?.[dailyMng.index]?.decoration}
							<AvatarDecoration
								decoration={dailyMng.users[dailyMng.index].decoration}
								avatarSize={110}
							/>
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

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<i
		role="button"
		tabindex="0"
		on:click={() => {
			if (interval) {
				clearInterval(interval);
			}
			if (recapInterval) {
				clearInterval(recapInterval);
			}

			window.localStorage.removeItem('daily');
			if (document.fullscreenElement) {
				document.exitFullscreen();
			}
			goto('/daily');
		}}
		class="fa-solid fa-times close-daily"
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
		top: 1rem;
		right: 1rem;
		font-size: 1.5rem;
		cursor: no-drop;
		transition: all 0.3s ease;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.7);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		backdrop-filter: blur(10px);

		&:hover {
			background: rgba(0, 0, 0, 0.9);
			transform: scale(1.1);
			cursor: pointer;
		}
	}

	.recap-navigation {
		position: relative;
		text-align: center;
		margin-bottom: 1rem;
		color: var(--primary-100);

		.nav-indicators {
			display: flex;
			justify-content: center;
			gap: 0.4rem;
			margin-bottom: 0.4rem;

			.indicator {
				width: 10px;
				height: 10px;
				border-radius: 50%;
				background-color: var(--primary-300);
				transition: all 0.3s ease;

				&.active {
					background-color: var(--primary-950);
					transform: scale(1.2);
				}
			}
		}

		p {
			margin: 0;
			font-size: 0.8rem;
			color: var(--primary-100);
			font-weight: 500;

			i {
				color: var(--primary-100);
				margin: 0 0.2rem;
			}
		}
	}

	.recap-fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
		display: flex;
		flex-direction: column;
		z-index: 100;
	}

	.recap-header {
		padding: 1rem 2rem;
		text-align: center;
		background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
		color: white;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

		h1 {
			margin: 0 0 0.5rem 0;
			font-size: 2rem;
			font-weight: 700;
			text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

			i {
				color: #ffd700;
				margin-right: 0.5rem;
			}
		}
	}

	.recap-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		overflow: hidden;
	}

	.recap-widget {
		width: 100%;
		max-width: 1200px;
		height: 100%;
		background: white;
		border-radius: 1.5rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.widget-header {
		background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
		color: white;
		padding: 1rem 1.5rem;
		text-align: center;
		flex-shrink: 0;

		h2 {
			margin: 0 0 0.25rem 0;
			font-size: 1.5rem;
			font-weight: 600;

			i {
				margin-right: 0.5rem;
				color: var(--primary-100);
			}
		}

		p {
			margin: 0;
			font-size: 0.9rem;
			opacity: 0.9;
			font-weight: 300;
		}
	}

	.widget-content {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.stats-content {
		.stats-loading,
		.stats-error {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 3rem 1rem;
			text-align: center;
			color: var(--primary-600);

			i {
				font-size: 2.5rem;
				margin-bottom: 1rem;
				opacity: 0.7;
			}

			p {
				margin: 0.5rem 0;
				font-size: 1.1rem;
				font-weight: 500;
			}

			small {
				opacity: 0.6;
				font-size: 0.9rem;
			}
		}

		.stats-loading i {
			color: var(--primary-500);
		}

		.stats-error i {
			color: #e74c3c;
		}

		.stat-cards {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 1.5rem;
			width: 100%;
		}

		.stat-card {
			background: white;
			border-radius: 1rem;
			padding: 1.5rem;
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
			border-left: 4px solid var(--primary-500);
			display: flex;
			align-items: center;
			gap: 1rem;
			transition: all 0.3s ease;
			animation: slideInScale 0.5s ease-out forwards;
			animation-delay: var(--delay);
			opacity: 0;
			transform: translateY(20px) scale(0.95);
			position: relative;
			overflow: hidden;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 2px;
				background: linear-gradient(90deg, transparent, var(--primary-200), transparent);
				opacity: 0;
				transition: opacity 0.3s ease;
			}

			&:hover {
				transform: translateY(-3px);
				box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);

				&::before {
					opacity: 1;
				}
			}

			&.primary {
				border-left-color: var(--primary-600);
				.stat-icon {
					background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
				}
			}

			&.success {
				border-left-color: #10b981;
				.stat-icon {
					background: linear-gradient(135deg, #10b981, #059669);
				}
			}

			&.warning {
				border-left-color: #f59e0b;
				.stat-icon {
					background: linear-gradient(135deg, #f59e0b, #d97706);
				}
			}

			&.info {
				border-left-color: #3b82f6;
				.stat-icon {
					background: linear-gradient(135deg, #3b82f6, #2563eb);
				}
			}

			&.secondary {
				border-left-color: #8b5cf6;
				.stat-icon {
					background: linear-gradient(135deg, #8b5cf6, #7c3aed);
				}
			}

			&.danger {
				border-left-color: #ef4444;
				.stat-icon {
					background: linear-gradient(135deg, #ef4444, #dc2626);
				}
			}

			.stat-icon {
				width: 50px;
				height: 50px;
				border-radius: 0.75rem;
				display: flex;
				align-items: center;
				justify-content: center;
				color: white;
				font-size: 1.2rem;
				flex-shrink: 0;
				box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			}

			.stat-info {
				flex: 1;
				min-width: 0;

				h3 {
					margin: 0 0 0.3rem 0;
					font-size: 0.95rem;
					font-weight: 600;
					color: var(--primary-700);
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}

				.stat-value {
					margin: 0 0 0.2rem 0;
					font-size: 1.6rem;
					font-weight: 700;
					color: var(--primary-900);
					line-height: 1.2;
				}

				.stat-detail {
					margin: 0;
					font-size: 0.8rem;
					color: var(--primary-600);
					opacity: 0.9;
					line-height: 1.3;

					strong {
						color: var(--primary-700);
						font-weight: 600;
					}
				}
			}
		}
	}

	@keyframes slideInScale {
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.weather-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.weather-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	.no-weather {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: var(--primary-500);
		text-align: center;

		i {
			font-size: 3rem;
			margin-bottom: 1rem;
			opacity: 0.6;
		}

		p {
			margin: 0;
			font-size: 1.1rem;
			opacity: 0.8;
		}
	}

	.qwertee-container {
		overflow: hidden;
		border-radius: 1rem;
		padding: 0;
	}

	.euromillion-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		border-radius: 1rem;
	}

	// Responsive pour les sections du recap
	@media (max-width: 1200px) {
		.weather-grid {
			gap: 0.8rem;
		}

		.qwertee-container {
			border-radius: 0.8rem;
		}

		.stats-content .stat-cards {
			grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
			gap: 1.2rem;
		}
	}

	@media (max-width: 768px) {
		.recap-widget {
			margin: 0 1rem;

			.widget-header {
				padding: 1rem;

				h2 {
					font-size: 1.3rem;
				}

				p {
					font-size: 0.85rem;
				}
			}

			.widget-content {
				padding: 1rem;
			}
		}

		.weather-container {
			gap: 1rem;
		}

		.weather-grid {
			gap: 0.8rem;
		}

		.no-weather {
			padding: 2rem;

			i {
				font-size: 2rem;
			}

			p {
				font-size: 1rem;
			}
		}

		.stats-content {
			.stat-cards {
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 1rem;
			}

			.stat-card {
				padding: 1.2rem;
				gap: 0.8rem;

				.stat-icon {
					width: 45px;
					height: 45px;
					font-size: 1.1rem;
				}

				.stat-info {
					h3 {
						font-size: 0.9rem;
					}

					.stat-value {
						font-size: 1.4rem;
					}

					.stat-detail {
						font-size: 0.75rem;
					}
				}
			}
		}
	}

	@media (max-width: 480px) {
		.recap-widget {
			margin: 0 0.5rem;
			border-radius: 1rem;

			.widget-header {
				padding: 0.8rem;

				h2 {
					font-size: 1.2rem;
				}
			}
		}

		.weather-container {
			gap: 0.8rem;
		}

		.stats-content {
			.stat-cards {
				grid-template-columns: 1fr;
				gap: 0.8rem;
			}

			.stat-card {
				padding: 1rem;
				flex-direction: column;
				text-align: center;
				gap: 0.8rem;

				.stat-icon {
					width: 50px;
					height: 50px;
					font-size: 1.2rem;
					margin: 0 auto;
				}

				.stat-info {
					width: 100%;

					.stat-value {
						font-size: 1.6rem;
					}
				}
			}
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

	// Styles pour la section des dates programmées
	.programmed-dates-section {
		margin-top: 2rem;
	}
</style>
