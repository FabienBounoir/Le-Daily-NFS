<script>
	import { user } from '$lib/stores/user';
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

<div class="topPlayerContainer">
	<div class="topThreePlayers">
		{#each top3_Speakers as user, i}
			<div class="player">
				<p>{user.name}</p>
				<div class="information top-{i}">
					{#if user.avatars}
						<img
							src={'/avatar/' + user.avatars}
							alt="Jira Avatar"
							on:error={() => {
								user.avatars = null;
							}}
						/>
					{:else}
						<img
							src={'https://api.dicebear.com/9.x/adventurer/svg?seed=' + user.name}
							alt="Avatar"
							on:error={() => {
								user.avatars = null;
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
					{#if user.avatars}
						<img
							src={'/avatar/' + user.avatars}
							alt="Jira Avatar"
							on:error={() => {
								user.avatars = null;
							}}
						/>
					{:else}
						<img
							src={'https://api.dicebear.com/9.x/adventurer/svg?seed=' + user.name}
							alt="Avatar"
							on:error={() => {
								user.avatars = null;
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

<style lang="scss">
	.topPlayerContainer {
		user-select: none;
		display: flex;
		flex-direction: column;
		gap: 1em;

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
					img {
						width: 25px;
						height: 25px;
						border-radius: 50%;
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
