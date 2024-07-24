<script>
	import { getDailyQweerte } from '$lib/qwertee';

	let result = getDailyQweerte();
</script>

<div class="qwerteeContainer">
	{#await result}
		<p>Récupération des données...</p>
	{:then data}
		{#if data.dailyTees}
			{#each data.dailyTees as dailyTee}
				<div class="element">
					<img
						on:click={() =>
							(dailyTee.selected = ((dailyTee.selected || 0) + 1) % dailyTee.types.length)}
						src={`https://cdn.qwertee.com/images/designs/product-thumbs/${dailyTee.types[dailyTee?.selected || 0].img.id}-${dailyTee.types[dailyTee?.selected || 0].name}-450x540.jpg`}
						alt={dailyTee.title}
					/>
					<a
						class="name"
						href={`https://www.qwertee.com/`}
						target="_blank"
						rel="noopener noreferrer">{dailyTee.name}</a
					>
					<p class="price">{dailyTee.types[dailyTee?.selected || 0].price.EUR} €</p>
				</div>
			{/each}
		{:else}
			<p>Aucun daily tee trouvé</p>
		{/if}
	{:catch error}
		{error}
	{/await}
</div>

<style lang="scss">
	.qwerteeContainer {
		padding: 1em;
		background-color: var(--primary-200);
		border-radius: 0.5em;
		display: flex;
		gap: 1em;
		justify-content: space-between;

		.element {
			text-align: center;
			display: flex;
			flex-direction: column;
			img {
				border-radius: 0.5em;
				width: 14vw;
				aspect-ratio: 450/540;
				cursor: pointer;
				animation: loading 2s infinite;
				background: linear-gradient(100deg, var(--primary-300), var(--primary-900));
				background-size: 200% 200%;
			}

			@keyframes loading {
				0% {
					background-position: 0% 50%;
				}
				50% {
					background-position: 100% 50%;
				}
				100% {
					background-position: 0% 50%;
				}
			}

			a.name {
				margin-top: 0.5em;
				font-weight: bold;
			}
		}
	}
</style>
