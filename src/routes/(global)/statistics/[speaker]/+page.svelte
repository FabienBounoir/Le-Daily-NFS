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
	<h1>
		<p on:click={() => goto('/statistics')}>❮</p>
		{data.speaker} voici tes statistiques
	</h1>

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
