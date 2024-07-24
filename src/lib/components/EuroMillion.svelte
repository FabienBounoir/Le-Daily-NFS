<script>
	import { getResultEuromillion } from '$lib/euroMillion';
	import { getWeather } from '$lib/weather';

	let result = getResultEuromillion();
</script>

<div class="euromillion">
	{#await result}
		<p>Le dernier tirage de l'euromillion:</p>
		<p>Récupération des données...</p>
	{:then data}
		{#if data && data.length > 0}
			<p>
				Tirage Euromillion du {new Date(data[data.length - 1].date).toLocaleDateString('fr-FR', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
			<div style="display: flex; flex-direction: row; align-items: center; gap: 0.5em;">
				{#each data[data.length - 1].numbers as number}
					<p class="number">
						{number}
					</p>
				{/each}
				<p></p>

				{#each data[data.length - 1].stars as star}
					<p class="star">
						{star}

						<svg
							fill="none"
							focusable="false"
							stroke-linecap="round"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							><path
								d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
							></path></svg
						>
					</p>
				{/each}
			</div>
		{/if}
	{:catch error}
		{error}
	{/await}
</div>

<style lang="scss">
	.number {
		color: var(--primary-600);
		font-size: 1.5em;
		border-radius: 50%;
		border: 3px solid var(--primary-600);
		// background-color: var(--primary-200);
		width: 50px;
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.euromillion {
		background-color: var(--primary-200);
		padding: 1em;
		border-radius: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		width: max-content;
	}

	.star {
		position: relative;
		color: var(--primary-600);
		font-size: 1.3em;
		// border-radius: 50%;
		// border: 1px solid var(--primary-300);
		width: 50px;
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2;

		svg {
			position: absolute;
			width: 60px;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: -1;
			stroke: var(--primary-600);
		}
	}
</style>
