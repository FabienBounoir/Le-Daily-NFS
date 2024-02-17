<script>
	import { api } from '$lib/utils/api';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { scale, slide } from 'svelte/transition';

	/**
	 * @type {any[]}
	 */
	let dailies = [];

	dailies = api.get('/daily');

	const timeFormater = (time) => {
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = time % 60;

		return `${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''} ${seconds}s`;
	};
</script>

<section>
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
				<p>➜ Daily {daily.team}</p>
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
					on:click={() => {
						api.delete(`/daily/${daily._id}`);
						dailies = dailies.filter((_, index) => index !== i);
					}}
					class="fa-solid fa-trash"
				></i>
			</div>
		{/each}
	{:catch error}
		<h1>Oopsie... 🥸</h1>
		<p>{error}</p>
	{/await}
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;

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
</style>
