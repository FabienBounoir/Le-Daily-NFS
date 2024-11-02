<script>
	import { onMount } from 'svelte';

	export let speakers = [];

	let speakersArraySort = [];

	let top3_Speakers = [];

	let otherSpeakers = [];

	onMount(() => {
		speakersArraySort = speakers.sort((a, b) => b.timer - a.timer);

		if (speakersArraySort.length >= 3) {
			top3_Speakers = [speakersArraySort[2]];
		}
		if (speakersArraySort.length >= 1) {
			top3_Speakers = [...top3_Speakers, speakersArraySort[0]];
		}
		if (speakersArraySort.length >= 2) {
			top3_Speakers = [...top3_Speakers, speakersArraySort[1]];
		}

		otherSpeakers = speakersArraySort.slice(3);
	});
</script>

<div class="containerTop">
	<div class="topPlayerContainer">
		<div class="topThreePlayers">
			{#each top3_Speakers as user, i}
				<div class="player">
					<p>{user.name}</p>
					<div class="information top-{i}">
						{#if user.avatar}
							{#if user.avatar == 'bouns.svelte'}
								<img
									src={'/avatar/bouns.png'}
									alt="Jira Avatar"
									on:error={() => {
										user.avatar = null;
									}}
								/>
							{:else}
								<img
									src={'/avatar/' + user.avatar}
									alt="Jira Avatar"
									on:error={() => {
										user.avatar = null;
									}}
								/>
							{/if}
						{:else}
							<img
								src={'https://api.dicebear.com/9.x/personas/svg?seed=' + user.name}
								alt="Avatar"
								on:error={() => {
									user.avatar = null;
								}}
							/>
						{/if}

						<p>{user.timer} secondes</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="otherPlayers">
			{#each otherSpeakers as user, i}
				<div class="player">
					<div>
						{#if user.avatar}
							{#if user.avatar == 'bouns.svelte'}
								<img
									src={'/avatar/bouns.png'}
									alt="Jira Avatar"
									on:error={() => {
										user.avatar = null;
									}}
								/>
							{:else}
								<img
									src={'/avatar/' + user.avatar}
									alt="Jira Avatar"
									on:error={() => {
										user.avatar = null;
									}}
								/>
							{/if}
						{:else}
							<img
								src={'https://api.dicebear.com/9.x/personas/svg?seed=' + user.name}
								alt="Avatar"
								on:error={() => {
									user.avatar = null;
								}}
							/>
						{/if}
						<p>{user.name}</p>
					</div>

					<p>{user.timer} secondes</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.containerTop {
		display: flex;
		flex-direction: column;
		gap: 1em;
		max-height: 93vh;
		overflow-x: auto;
	}

	.topPlayerContainer {
		user-select: none;
		display: flex;
		flex-direction: column;
		gap: 1em;
		justify-content: center;

		.otherPlayers {
			display: flex;
			flex-direction: column;
			gap: 1em;
			align-items: center;
			width: calc((10vw * 3) + 2em);
			margin: 0 auto;

			.player {
				background-color: var(--primary-200);
				border-radius: 0.5em;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				width: -webkit-fill-available;
				padding: 0.5em;

				& > div {
					display: flex;
					gap: 0.5em;
					* {
						width: 25px;
						height: 25px;
					}
					img {
						width: 25px;
						height: 25px;
						border-radius: 50%;
					}

					svg {
						width: 25px;
						height: 25px;
					}

					.emptyImage {
						width: 25px;
						height: 25px;
						border-radius: 50%;
						background-color: var(--primary-100);
					}
				}
			}
		}

		.topThreePlayers {
			display: flex;
			flex-direction: row;
			gap: 1em;
			height: 30vh;

			justify-content: center;
			.player {
				min-width: 10vw;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.5em;

				& > p {
					margin-top: auto;
				}

				.information {
					border-top-left-radius: 0.5em;
					border-top-right-radius: 0.5em;
					border-bottom-left-radius: 0.2em;
					border-bottom-right-radius: 0.2em;
					background-color: var(--primary-300);
					border: 1px solid var(--primary-600);
					width: -webkit-fill-available;
					text-align: center;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: space-between;
					padding: 1em 0;

					img {
						width: 50px;
						height: 50px;
						border-radius: 50%;
						border: 1px solid var(--primary-600);
						background-color: var(--primary-600);
					}

					svg {
						width: 50px;
						height: 50px;
						border-radius: 50%;
						border: 1px solid var(--primary-600);
						background-color: var(--primary-600);
					}
				}

				.top-0 {
					height: 55%;
				}

				.top-1 {
					height: 95%;
				}

				.top-2 {
					height: 75%;
				}
			}
		}
	}
</style>
