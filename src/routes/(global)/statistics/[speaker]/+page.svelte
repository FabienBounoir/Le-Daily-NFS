<script>
	import { api } from '$lib/utils/api';
	import { user } from '$lib/stores/user';
	import SvelteHeatmap from 'svelte-heatmap';
	import { goto } from '$app/navigation';

	let histo = [];

	/** @type {import('./$types').PageData} */
	export let data;

	let speakers = {};

	speakers = api.get(`/daily/stats/${$user.teams[0]}/speakers/${data.speaker}`).then((res) => {
		speakers = res;

		histo = speakers.history.map((speaker, i) => {
			return {
				date: new Date(speaker.date),
				value: speaker.time < 60 ? 1 : speaker.time < 90 ? 2 : speaker.time < 120 ? 3 : 4
			};
		});
	});
</script>

<svelte:head>
	<title>Statistics user {data?.speaker}</title>
	<meta name="description" content="Statistics d'un utilisateur" />
</svelte:head>

<section>
	<div class="header-section">
		<h1>
			<p on:click={() => goto('/statistics')}>❮</p>
			{data.speaker} voici tes statistiques
		</h1>
		<a href="/recap?speaker={encodeURIComponent(data.speaker)}" class="recap-button">
			🎯 Générer ton récap personnel
		</a>
	</div>
	{#if histo.length > 0}
		<SvelteHeatmap
			allowOverflow={true}
			cellGap={5}
			cellRadius={1}
			monthGap={10}
			colors={[
				document.documentElement.style.getPropertyValue('--primary-200'),
				document.documentElement.style.getPropertyValue('--primary-400'),
				document.documentElement.style.getPropertyValue('--primary-700'),
				document.documentElement.style.getPropertyValue('--primary-950')
			]}
			data={histo}
			emptyColor={'#ecedf0'}
			endDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)}
			startDate={new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)}
			view={'monthly'}
		/>
	{/if}
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.header-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2em;

		@media (max-width: 768px) {
			flex-direction: column;
			align-items: flex-start;
			gap: 1em;
		}
	}

	.recap-button {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		padding: 0.8em 1.5em;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.9em;
		display: flex;
		align-items: center;
		gap: 0.5em;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		white-space: nowrap;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
		}
	}

	h1 {
		font-size: 1.5em;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.5em;

		p {
			font-size: 1em;
			font-weight: 700;
			cursor: pointer;

			&:hover {
				color: var(--primary-400);
			}
		}
	}
</style>
