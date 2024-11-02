<script>
	import Wheel from '$lib/components/Wheel.svelte';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	let items = [...($user?.users?.map?.((u) => u.name) || [])].sort(() => Math.random() - 0.5);

	let colors = [];

	$: name = '';
	let mounted = false;

	onMount(() => {
		setTimeout(() => {
			colors = [
				document.documentElement.style.getPropertyValue('--primary-600'),
				document.documentElement.style.getPropertyValue('--primary-300'),
				document.documentElement.style.getPropertyValue('--primary-700'),
				document.documentElement.style.getPropertyValue('--primary-500'),
				document.documentElement.style.getPropertyValue('--primary-800')
			];

			console.log('colors', colors);

			mounted = true;
		}, 100);
	});

	const addName = () => {
		items = [...items, name];
	};
</script>

<svelte:head>
	<title>MEP wheel - {$user?.username || ''}</title>
	<meta
		name="description"
		content="La roue permettant de definir la personne devant realisé la Mise en production"
	/>
</svelte:head>

<section>
	<div>
		<h1>Participants:</h1>
		{#each $user?.users as user}
			<p
				class={items.includes(user.name) ? 'active' : ''}
				on:click={() => {
					if (!items.includes(user.name)) {
						items = [...items, user.name].sort(() => Math.random() - 0.5);
					} else {
						items = items.filter((i) => i !== user.name);
					}
				}}
			>
				{user.name}
			</p>
		{/each}
	</div>
	{#if items?.length > 0}
		{#if mounted}
			<Wheel {items} {colors} />
		{/if}
	{:else}
		<p>Ajouter des personnes à la liste dans les paramètres</p>
	{/if}
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: row;
		gap: 1em;
		position: relative;
		min-height: 50vh;
		> div {
			display: flex;
			flex-direction: column;
			gap: 0.5em;
			p {
				user-select: none;
				cursor: pointer;
				border-radius: 0.5em;
				padding: 0.5em;
				background-color: var(--primary-100);
				color: var(--primary-700) !important;
				filter: grayscale(1);
			}

			p.active {
				color: white;
				filter: grayscale(0);
			}
		}
	}
</style>
