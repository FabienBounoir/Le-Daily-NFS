<script>
	import Wheel from '$lib/components/Wheel.svelte';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	let items = [...($user?.users?.map?.((u) => u.name) || [])].sort(() => Math.random() - 0.5);

	let colors = [];
	let mounted = false;

	let userMap = new Map();

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

		console.log($user?.users);

		for (const userItem of $user?.users) {
			console.log('userItem', userItem);
			userMap.set(userItem.name, 1);
			userMap = new Map(userMap);
		}
	});

	$: generateItems(userMap);

	const generateItems = (userMap) => {
		items = [];
		for (const [name, count] of userMap) {
			if (count > 0) {
				for (let i = 0; i < count; i++) {
					items.push(name);
				}
			}
		}
		items = items.sort(() => Math.random() - 0.5);
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

		{#each Array.from(userMap) as [name, count]}
			<div class="user">
				<button
					on:click={() => {
						if (count > 1) {
							userMap.set(name, count - 1);
						} else {
							userMap.set(name, 0);
						}
						userMap = new Map(userMap);
					}}>-</button
				>
				<p>{count}</p>
				<button
					on:click={() => {
						if (count > 4) {
							return;
						}
						userMap.set(name, count + 1);
						userMap = new Map(userMap);
					}}>+</button
				>
				<p
					class={items.includes(name) ? 'active' : ''}
					on:click={() => {
						if (!items.includes(name)) {
							userMap.set(name, 1);
							userMap = new Map(userMap);
						} else {
							userMap.set(name, 0);
							userMap = new Map(userMap);
						}
					}}
				>
					{name}
				</p>
			</div>
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

			.user {
				display: flex;
				flex-direction: row;
				gap: 0.5em;
				align-items: center;
				justify-content: left;
				width: 100%;

				button {
					width: min-content;
				}
			}
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
