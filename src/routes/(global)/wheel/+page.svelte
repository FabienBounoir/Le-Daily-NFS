<script>
	import Wheel from '$lib/components/Wheel.svelte';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	let items = [...($user?.users?.map?.((u) => u.name) || [])].sort(() => Math.random() - 0.5);

	let colors = [];
	let mounted = false;
	let winner = null;

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

			mounted = true;
		}, 100);

		for (const userItem of $user?.users) {
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

	const activeCount = (map) => [...map.values()].filter((v) => v > 0).length;
</script>

<svelte:head>
	<title>Roue MEP - {$user?.username || ''}</title>
	<meta
		name="description"
		content="La roue permettant de définir la personne devant réaliser la Mise en production"
	/>
</svelte:head>

<section>
	<!-- Panneau gauche -->
	<div class="side-panel">
		<div class="card">
			<div class="card-header">
				<span class="card-icon">👥</span>
				<div>
					<h2>Participants</h2>
					<p class="card-desc">{activeCount(userMap)} / {userMap.size} actifs</p>
				</div>
			</div>

			{#if userMap.size === 0}
				<p class="empty-state">Aucun participant — ajoute-en dans les paramètres.</p>
			{/if}

			<div class="participants-list">
				{#each Array.from(userMap) as [name, count]}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div class="participant-row">
						<span
							class="chip {count > 0 ? 'chip-active' : 'chip-off'}"
							on:click={() => {
								if (count > 0) {
									userMap.set(name, 0);
								} else {
									userMap.set(name, 1);
								}
								userMap = new Map(userMap);
							}}
						>
							{#if count === 0}<s>{name}</s>{:else}{name}{/if}
						</span>

						{#if count > 0}
							<div class="counter">
								<button
									class="counter-btn"
									on:click={() => {
										userMap.set(name, Math.max(0, count - 1));
										userMap = new Map(userMap);
									}}
								>−</button>
								<span class="counter-val">{count}</span>
								<button
									class="counter-btn"
									on:click={() => {
										if (count < 5) {
											userMap.set(name, count + 1);
											userMap = new Map(userMap);
										}
									}}
									disabled={count >= 5}
								>+</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Zone roue -->
	<div class="wheel-area">
		{#if items?.length > 0}
			{#if mounted}
				<Wheel {items} {colors} bind:winner />
			{/if}
		{:else}
			<div class="empty-wheel">
				<span class="empty-wheel-icon">🎡</span>
				<p>Sélectionne au moins un participant pour lancer la roue.</p>
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: row;
		gap: 1.5em;
		align-items: flex-start;

		@media (max-width: 700px) {
			flex-direction: column;
		}
	}

	/* ── Panneau latéral ── */
	.side-panel {
		width: 260px;
		flex-shrink: 0;

		@media (max-width: 700px) {
			width: 100%;
		}
	}

	/* ── Card ── */
	.card {
		background: var(--primary-50);
		border: 1px solid var(--primary-100);
		border-radius: 0.875em;
		padding: 1.25em 1.5em;
		display: flex;
		flex-direction: column;
		gap: 1.25em;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.75em;

		h2 {
			margin: 0;
			font-size: 1rem;
			font-weight: 700;
		}

		.card-desc {
			margin: 0;
			font-size: 0.78rem;
			opacity: 0.8;
		}
	}

	.card-icon {
		font-size: 1.4rem;
		line-height: 1;
	}

	/* ── Liste participants ── */
	.participants-list {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.participant-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
	}

	.empty-state {
		font-size: 0.85rem;
		opacity: 0.5;
		margin: 0;
	}

	/* ── Chip ── */
	.chip {
		flex: 1;
		padding: 0.4em 0.9em;
		border-radius: 2em;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		user-select: none;
		transition: background 0.15s, opacity 0.15s;
		text-align: center;

		&:hover {
			opacity: 0.75;
		}
	}

	.chip-active {
		background: var(--primary-600);
		color: white;
	}

	.chip-off {
		background: var(--primary-100);
		color: var(--primary-400);
	}

	/* ── Counter ── */
	.counter {
		display: flex;
		align-items: center;
		gap: 0.3em;
		flex-shrink: 0;
	}

	.counter-btn {
		width: 1.8em;
		height: 1.8em;
		border-radius: 0.4em;
		border: none;
		background: var(--primary-200);
		color: var(--primary-800);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s;
		user-select: none;
		line-height: 1;

		&:hover:not(:disabled) {
			background: var(--primary-300);
		}

		&:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}
	}

	.counter-val {
		min-width: 1.4em;
		text-align: center;
		font-size: 0.875rem;
		font-weight: 700;
	}

	/* ── Zone roue ── */
	.wheel-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
	}

	.empty-wheel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75em;
		opacity: 0.45;
		text-align: center;
		padding: 2em;
	}

	.empty-wheel-icon {
		font-size: 3rem;
		line-height: 1;
	}

	.empty-wheel p {
		font-size: 0.9rem;
		margin: 0;
	}
</style>
