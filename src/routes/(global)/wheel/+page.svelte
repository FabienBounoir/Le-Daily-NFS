<script>
	import Wheel from '$lib/components/Wheel.svelte';
	import { user } from '$lib/stores/user';

	let items = [...($user?.speakers || [])].sort(() => Math.random() - 0.5);

	$: colors = [
		document.documentElement.style.getPropertyValue('--primary-600'),
		document.documentElement.style.getPropertyValue('--primary-300'),
		document.documentElement.style.getPropertyValue('--primary-700'),
		document.documentElement.style.getPropertyValue('--primary-500'),
		document.documentElement.style.getPropertyValue('--primary-800')
	];

	$: name = '';

	const addName = () => {
		items = [...items, name];
	};
</script>

<section>
	<div>
		{#each $user?.speakers as item}
			<p
				class={items.includes(item) ? 'active' : ''}
				on:click={() => {
					if (!items.includes(item)) {
						items = [...items, item].sort(() => Math.random() - 0.5);
					} else {
						items = items.filter((i) => i !== item);
					}
				}}
			>
				{item}
			</p>
		{/each}
	</div>
	{#if items?.length > 0}
		<Wheel {items} {colors} />
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
