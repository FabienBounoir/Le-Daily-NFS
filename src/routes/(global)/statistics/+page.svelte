<script>
	import { api } from '$lib/utils/api';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { scale, slide } from 'svelte/transition';
	import { user } from '$lib/stores/user';
	import { snacks } from '$lib/stores/snacks';

	/**
	 * @type {any[]}
	 */
	let dailies = [];
	let speakers = [];

	dailies = api.get('/daily');
	speakers = api.get(`/daily/stats/${$user.teams[0]}/speakers`);

	const timeFormater = (time) => {
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = time % 60;

		return `${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''} ${seconds}s`;
	};

	const formatNumber = (number) => {
		if (number % 1 === 0) return number;
		return number.toFixed(1);
	};
</script>

<main>
	<section class="speakers">
		<h2>❖ Les Statistiques par speakers</h2>
		<div>
			{#await speakers}
				<p>loading...</p>
			{:then speakers}
				{#if speakers.length === 0}
					<p>Lancer un daily pour voir les statistiques</p>
				{/if}

				{#each speakers as speaker, i}
					<div in:slide={{ duration: 500, delay: i * 100 }}>
						<h1>{speaker.name}</h1>
						<p>
							<i class="fa-solid fa-stopwatch-20"></i>
							~{formatNumber(speaker.moyenTime)} secondes
						</p>
						<p><i class="fa-solid fa-hashtag"></i> {speaker.totalDaily} dailies</p>
					</div>
				{/each}
			{:catch error}
				<p>{error}</p>
			{/await}
		</div>
	</section>

	<section class="dailies">
		<h2>❖ Historique des dailies</h2>
		<div>
			{#await dailies}
				{#each Array(Math.floor(Math.random() * 5) + 3).fill(0) as _}
					<div class="daily-squeleton">
						<p><span>➜ Daily team</span></p>
						<span class="spacer"></span>
						<p><span>00:00:00</span> <i class="fa-solid fa-clock"></i></p>
						<p><span>0</span> <i class="fa-solid fa-user" /></p>
						<p><span>00:00 - 00/00/0000</span> <i class="fa-solid fa-calendar-days"></i></p>
						<i class="fa-solid fa-trash"></i>
					</div>
				{/each}
			{:then dailies}
				{#each dailies as daily, i}
					<div
						class="daily"
						on:mouseover={(e) => {
							if (e.target.tagName === 'I' && e.target.classList.contains('fa-trash'))
								e.fromElement.style.filter = 'grayscale(1)';
							else if (e.target.tagName === 'DIV') e.target.style.filter = 'grayscale(0)';
						}}
						on:mouseout={(e) => {
							e.fromElement.style.filter = 'grayscale(0)';
						}}
					>
						<p>➜ Daily {daily.team} n°{dailies.length - i}</p>
						<span class="spacer"></span>
						<p>{timeFormater(daily.totalTime)} <i class="fa-solid fa-clock"></i></p>

						<p>{daily?.users?.length} <i class="fa-solid fa-user" /></p>

						<p>
							{`${new Date(daily?.date).getHours()}`.padStart(2, '0') +
								':' +
								`${new Date(daily?.date).getMinutes()}`.padStart(2, '0')} -
							{`${new Date(daily?.date).getDate()}`.padStart(2, '0') +
								'/' +
								`${new Date(daily?.date).getMonth() + 1}`.padStart(2, '0') +
								'/' +
								new Date(daily?.date).getFullYear()} <i class="fa-solid fa-calendar-days"></i>
						</p>

						<i
							on:click={async () => {
								try {
									await api.delete(`/daily/${daily._id}`);
									dailies = dailies.filter((_, index) => index !== i);
								} catch (e) {
									snacks.error(e.message);
								}
							}}
							class="fa-solid fa-trash"
						></i>
					</div>
				{/each}
			{:catch error}
				<h1>Oopsie... 🥸</h1>
				<p>{error}</p>
			{/await}
		</div>
	</section>
</main>

<style lang="scss">
	main {
		user-select: none;
		display: flex;
		flex-direction: column;
		gap: 3em;
	}
	h2 {
		font-size: 1.2em;
		font-weight: 600;
		text-align: left;
	}

	button {
		user-select: initial;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.speakers {
		& > div {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 1em;
			flex-wrap: wrap;

			h1 {
				font-size: 1.7em;
				font-weight: 700;
			}

			div {
				display: flex;
				flex-direction: column;
				border: 0px solid black;
				border-radius: 0.5em;
				padding: 1em;
				gap: 0.5em;
				background-color: var(--primary-100);
				width: 100%;
				align-items: left;
				transition: filter 0.5s;
				width: fit-content;
				transition: transform 0.5s;
				cursor: pointer;

				&:hover {
					transform: scale(1.05);
				}

				.spacer {
					flex: 1;
				}

				> i {
					cursor: pointer;
					background-color: var(--primary-300);
					padding: 0.5em;
					border-radius: 0.5em;
				}
			}
		}
	}

	.dailies {
		& > div {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1em;

			div {
				display: flex;
				flex-direction: row;
				border: 0px solid black;
				border-radius: 0.5em;
				padding: 1em;
				gap: 2em;
				background-color: var(--primary-100);
				width: 100%;
				align-items: center;
				transition: filter 0.5s;

				.spacer {
					flex: 1;
				}

				> i {
					cursor: pointer;
					background-color: var(--primary-300);
					padding: 0.5em;
					border-radius: 0.5em;
				}
			}
		}

		h1 {
			font-size: 2em;
			font-weight: 700;
		}

		.daily-squeleton {
			filter: opacity(0.7);

			p {
				span {
					background-color: var(--primary-600);
					border-radius: 0.5em;
					color: transparent;
					animation: breathe 2s infinite;
				}
			}

			@keyframes breathe {
				0% {
					filter: opacity(0.5);
				}
				50% {
					filter: opacity(1);
				}
				100% {
					filter: opacity(0.5);
				}
			}
		}
	}
</style>
