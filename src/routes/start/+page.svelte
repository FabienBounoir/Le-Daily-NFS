<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	let names = [	]
	let time = null;
	let i = 0;

	let actualTime = 120;
	let timeSpeaker = 0

	let startDailyDaily = new Date();
	let endDaily = false
	let interval = null

	const timerHistory = new Map();
	const timeResult = new Map();

	onMount(async () => {
		const url = new URL(window.location.href);
		const namesQuery = url.searchParams.get("names");
		if(namesQuery) {
			names = namesQuery.split(",");
		}

		const timeQuery = url.searchParams.get("time");
		if(timeQuery) {
			actualTime = parseInt(timeQuery);;
			time = parseInt(timeQuery);
		}

		interval = setInterval(() => {
			if(!time) return

			actualTime--;
			timeSpeaker++;
		}, 1000);

		document.addEventListener('keydown', (e) => {
			console.log(e);
			if(e.code === "Space") {
				newSpeaker();
			}
			//fleche gauche
			else if(e.code === "ArrowLeft") {
				if(i - 1 < 0) {
					return
				} else {
					timerHistory.set(names[i], actualTime);
					i--;
					actualTime = timerHistory.get(names[i]) || time;
					timeSpeaker = timeResult.get(names[i]) || 0;
				}
			}
			//fleche droite
			else if(e.code === "ArrowRight") {
				if(i + 1 >= names.length) {
					return
				} else {
					timerHistory.set(names[i], actualTime);
					i++;
					actualTime = timerHistory.get(names[i]) || time;
					timeSpeaker = timeResult.get(names[i]) || 0;
				}
			}
		})
	})

	const newSpeaker = () => {
		if(i + 1 >= names.length) {
			endDaily = true;
			timerHistory.set(names[i], actualTime);
			timeResult.set(names[i], timeSpeaker);
			i = 0;
		} else {
			i++;
			timerHistory.set(names[i], actualTime);
			timeResult.set(names[i], timeSpeaker);
			actualTime = time;
			timeSpeaker = 0;
		}
	}

	const returnTimeSpeaker = (name) => {
		const speakerInfo = Array.from(timeResult.entries()).sort((a, b) => b[1] - a[1]);

		let result = "";

		for (const [name, time] of speakerInfo) {
			result += `${name} : ${time} secondes \n`
		}
		
		return result;
	}

</script>

<svelte:head>
	<title>Daily en cours...</title>
	<meta name="description" content="Attention c'est l'heure du daily fait attention c'est bientôt à toi" />
</svelte:head>

<section>
	{#if endDaily}
		<h1>Le daily est terminé</h1>
		<p>Bravo à tous</p>
		<button on:click={() => goto("/init")}>Revenir à la configuration</button>
		{#if names.length > 0}
			<button on:click={() => goto("/start")}>Relancer un daily</button>
		{/if}
		{returnTimeSpeaker()}
		{#if names.length > 0}
			<p>Il reste des participants</p>
		{/if}
	{:else}
		<h1>Le daily NFS</h1>

		{#if names.length > 0}
			<div class="actualSpeaker">
				<div>
					<p>{i > 0 ? names[i-1] : ""}</p>
					<p>{names[i]}</p>
					<p>{i + 1 < names.length ? names[i + 1] : ""}</p>
				</div>
				<p class={actualTime <= 5 && actualTime > 0 ? "warn": actualTime <= 0 ? "danger":""} >{actualTime}</p>
			</div>
		{/if}

		<p id="infoTimeDaily">Le Daily a commencé à {startDailyDaily.toLocaleTimeString()}</p>
	{/if}
</section>

<style  lang="scss">
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	#infoTimeDaily{
		position: fixed;
		bottom: 0;
		left: 0;
		padding: 1em;
	}

	h1 {
		width: 100%;
		text-align: center;
	}

	.actualSpeaker{
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
		text-align: center;

		p{
			font-size: 3em;
		}

		div {
			display: flex;
			justify-content: center;
			align-items: end;
			gap: 1em;
			position: relative;

			p{
				opacity: 0.3;
			}

			p:nth-child(1){
				position : absolute;
				bottom: 0;
				left: -7em;
			}

			p:nth-child(2){
				font-size: 5em;
				opacity: 1;
			}

			p:nth-child(3){
				position : absolute;
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
	}


</style>
