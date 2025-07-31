<script>
	import { createEventDispatcher } from 'svelte';
	import { scale, fade } from 'svelte/transition';

	export let recap = null;
	export let isLoading = false;
	export let compact = false;

	const dispatch = createEventDispatcher();

	const formatTime = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${secs}s`;
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	const downloadAsImage = () => {
		dispatch('download', { recap });
	};

	// Couleurs pour les achievements
	const achievementColors = {
		'🏆': 'var(--primary-300)',
		'🥇': 'var(--primary-300)',
		'🥈': 'var(--primary-400)',
		'🥉': 'var(--primary-500)',
		'⚡': 'var(--primary-600)',
		'🏃': 'var(--primary-500)',
		'🦋': 'var(--primary-400)'
	};
</script>

{#if isLoading}
	<div class="recap-card loading" in:fade={{ duration: 300 }}>
		<div class="loading-content">
			<div class="spinner"></div>
			<p>Génération de votre récap en cours...</p>
		</div>
	</div>
{:else if recap}
	<div class="recap-card" id="recap-export" class:compact in:scale={{ duration: 500, start: 0.8 }}>
		<!-- Header -->
		<header class="recap-header">
			<div class="period-info">
				<h1>🎯 Daily Recap</h1>
				<p class="period">
					{formatDate(recap.period.startDate)} → {formatDate(recap.period.endDate)}
				</p>
				<p class="team">Équipe {recap.team}</p>
				{#if recap.speakerName}
					<p class="speaker">👤 {recap.speakerName}</p>
				{/if}
			</div>
			<div class="actions">
				<button on:click={downloadAsImage} title="Télécharger en image">�</button>
			</div>
		</header>

		<!-- Main Stats -->
		<section class="main-stats">
			<div class="stat-card primary">
				<div class="stat-value">{recap.totalDailies}</div>
				<div class="stat-label">Dailies</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{formatTime(Math.round(recap.averageTime))}</div>
				<div class="stat-label">Temps moyen</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{formatTime(recap.totalTime)}</div>
				<div class="stat-label">Temps total</div>
			</div>
		</section>

		{#if !compact}
			<!-- Fun Stats -->
			{#if recap.funEquivalents}
				<section class="fun-stats">
					<h3>🎉 Équivalences fun</h3>
					<div class="equivalents">
						<div class="equivalent">
							<span class="icon">☕</span>
							<span class="value">{recap.funEquivalents.coffee}</span>
							<span class="label">cafés</span>
						</div>
						<div class="equivalent">
							<span class="icon">🎵</span>
							<span class="value">{recap.funEquivalents.songs}</span>
							<span class="label">chansons</span>
						</div>
						<div class="equivalent">
							<span class="icon">📺</span>
							<span class="value">{recap.funEquivalents.netflixEpisodes}</span>
							<span class="label">épisodes Netflix</span>
						</div>
						<div class="equivalent">
							<span class="icon">🐦</span>
							<span class="value">{recap.funEquivalents.twitterPosts}</span>
							<span class="label">posts Twitter</span>
						</div>
					</div>
				</section>
			{/if}

			<!-- Time Patterns -->
			{#if recap.dayStats}
				<section class="patterns">
					<h3>📊 Tes habitudes</h3>
					<div class="pattern-grid">
						<div class="pattern-item">
							<span class="pattern-icon">📅</span>
							<div>
								<div class="pattern-value">{recap.dayStats.bestDay}</div>
								<div class="pattern-label">Jour préféré</div>
							</div>
						</div>
						<div class="pattern-item">
							<span class="pattern-icon">🕐</span>
							<div>
								<div class="pattern-value">{recap.hourStats.preferredTime}</div>
								<div class="pattern-label">Moment préféré</div>
							</div>
						</div>
						<div class="pattern-item">
							<span class="pattern-icon">🔥</span>
							<div>
								<div class="pattern-value">{recap.streakStats.longestStreak}</div>
								<div class="pattern-label">Plus longue série</div>
							</div>
						</div>
						<div class="pattern-item">
							<span class="pattern-icon">📈</span>
							<div>
								<div class="pattern-value">{recap.streakStats.regularity}%</div>
								<div class="pattern-label">Régularité</div>
							</div>
						</div>
					</div>
				</section>
			{/if}

			<!-- Social Stats -->
			{#if recap.socialStats}
				<section class="social-stats">
					<h3>👥 Statistiques sociales</h3>
					<div class="social-grid">
						{#if recap.speakerName}
							<div class="social-item">
								<span class="social-icon">🎯</span>
								<div>
									<div class="social-value">{recap.socialStats.participationRate}%</div>
									<div class="social-label">Participation</div>
								</div>
							</div>
							{#if recap.socialStats.bestBuddy}
								<div class="social-item">
									<span class="social-icon">👯</span>
									<div>
										<div class="social-value">{recap.socialStats.bestBuddy}</div>
										<div class="social-label">Meilleur binôme</div>
									</div>
								</div>
							{/if}
							<div class="social-item">
								<span class="social-icon">🧘</span>
								<div>
									<div class="social-value">{recap.socialStats.soloDaily}</div>
									<div class="social-label">Dailies solo</div>
								</div>
							</div>
						{:else}
							<div class="social-item">
								<span class="social-icon">⭐</span>
								<div>
									<div class="social-value">{recap.socialStats.mostActive}</div>
									<div class="social-label">Plus actif</div>
								</div>
							</div>
							<div class="social-item">
								<span class="social-icon">👥</span>
								<div>
									<div class="social-value">{Math.round(recap.socialStats.averageTeamSize)}</div>
									<div class="social-label">Taille moyenne équipe</div>
								</div>
							</div>
							<div class="social-item">
								<span class="social-icon">👤</span>
								<div>
									<div class="social-value">{recap.socialStats.smallestDaily}</div>
									<div class="social-label">Plus petit daily</div>
								</div>
							</div>
						{/if}
					</div>
				</section>
			{/if}

			<!-- Achievements -->
			{#if recap.achievements && recap.achievements.length > 0}
				<section class="achievements">
					<h3>🏆 Achievements</h3>
					<div class="achievements-grid">
						{#each recap.achievements as achievement}
							<div
								class="achievement"
								style="border-color: {achievementColors[achievement.icon] || '#ccc'}"
								title={achievement.description}
							>
								<span class="achievement-icon">{achievement.icon}</span>
								<div class="achievement-content">
									<div class="achievement-name">{achievement.name}</div>
									<div class="achievement-desc">{achievement.description}</div>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Fun Quotes -->
			{#if recap.funQuotes && recap.funQuotes.length > 0}
				<section class="fun-quotes">
					<h3>💭 Le saviez-vous ?</h3>
					<div class="quotes">
						{#each recap.funQuotes as quote}
							<div class="quote">
								<p>"{quote}"</p>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/if}

		<!-- Footer -->
		<footer class="recap-footer">
			<p>Généré le {formatDate(recap.recapDate)} • Le Daily NFS</p>
		</footer>
	</div>
{:else}
	<div class="recap-card empty" in:fade={{ duration: 300 }}>
		<div class="empty-state">
			<span class="empty-icon">📊</span>
			<h3>Aucune donnée</h3>
			<p>Sélectionnez une période pour générer votre récap</p>
		</div>
	</div>
{/if}

<style lang="scss">
	.recap-card {
		background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-700) 100%);
		border-radius: 20px;
		padding: 2em;
		color: var(--on-primary-700);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		max-width: 600px;
		margin: 0 auto;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
			pointer-events: none;
		}

		&.compact {
			padding: 1.5em;
			max-width: 400px;
		}

		&.loading {
			background: var(--primary-50);
			color: var(--primary-700);
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 200px;
		}

		&.empty {
			background: var(--primary-50);
			color: var(--primary-600);
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 300px;
		}
	}

	.loading-content {
		text-align: center;

		.spinner {
			width: 40px;
			height: 40px;
			border: 3px solid var(--primary-200);
			border-top: 3px solid var(--primary-500);
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin: 0 auto 1em;
		}

		@keyframes spin {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}
	}

	.empty-state {
		text-align: center;

		.empty-icon {
			font-size: 4em;
			display: block;
			margin-bottom: 0.5em;
		}

		h3 {
			margin: 0 0 0.5em;
			font-size: 1.5em;
		}

		p {
			margin: 0;
			opacity: 0.7;
		}
	}

	.recap-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2em;

		h1 {
			margin: 0 0 0.5em;
			font-size: 1.8em;
			font-weight: 700;
		}

		.period {
			font-size: 1.1em;
			opacity: 0.9;
			margin: 0.2em 0;
		}

		.team,
		.speaker {
			font-size: 0.9em;
			opacity: 0.8;
			margin: 0.1em 0;
		}

		.actions {
			display: flex;
			gap: 0.5em;

			button {
				background: rgba(255, 255, 255, 0.2);
				border: none;
				border-radius: 10px;
				padding: 0.5em;
				color: var(--on-primary-700);
				cursor: pointer;
				font-size: 1.2em;
				transition:
					transform 0.2s,
					background 0.2s;

				&:hover {
					transform: scale(1.1);
					background: rgba(255, 255, 255, 0.3);
				}
			}
		}
	}

	.main-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1em;
		margin-bottom: 2em;

		.stat-card {
			background: rgba(255, 255, 255, 0.15);
			border-radius: 15px;
			padding: 1.5em 1em;
			text-align: center;
			backdrop-filter: blur(10px);
			transition: transform 0.2s;

			&:hover {
				transform: translateY(-5px);
			}

			&.primary {
				background: rgba(255, 255, 255, 0.25);
				transform: scale(1.05);
			}

			.stat-value {
				font-size: 1.8em;
				font-weight: 700;
				margin-bottom: 0.2em;
				color: var(--on-primary-700);
			}

			.stat-label {
				font-size: 0.9em;
				opacity: 0.9;
				color: var(--on-primary-600);
			}
		}
	}

	section {
		margin-bottom: 2em;

		h3 {
			margin: 0 0 1em;
			font-size: 1.3em;
			font-weight: 600;
		}
	}

	.fun-stats {
		.equivalents {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
			gap: 1em;

			.equivalent {
				background: rgba(255, 255, 255, 0.1);
				border-radius: 12px;
				padding: 1em;
				text-align: center;

				.icon {
					font-size: 2em;
					display: block;
					margin-bottom: 0.5em;
				}

				.value {
					display: block;
					font-size: 1.5em;
					font-weight: 600;
					margin-bottom: 0.2em;
					color: var(--on-primary-700);
				}

				.label {
					font-size: 0.8em;
					opacity: 0.9;
					color: var(--on-primary-600);
				}
			}
		}
	}

	.patterns {
		.pattern-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 1em;

			.pattern-item {
				background: rgba(255, 255, 255, 0.1);
				border-radius: 12px;
				padding: 1em;
				display: flex;
				align-items: center;
				gap: 1em;

				.pattern-icon {
					font-size: 2em;
				}

				.pattern-value {
					font-size: 1.3em;
					font-weight: 600;
					margin-bottom: 0.1em;
					color: var(--on-primary-700);
				}

				.pattern-label {
					font-size: 0.8em;
					opacity: 0.9;
					color: var(--on-primary-600);
				}
			}
		}
	}

	.social-stats {
		.social-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 1em;

			.social-item {
				background: rgba(255, 255, 255, 0.1);
				border-radius: 12px;
				padding: 1em;
				display: flex;
				align-items: center;
				gap: 1em;

				.social-icon {
					font-size: 2em;
				}

				.social-value {
					font-size: 1.2em;
					font-weight: 600;
					margin-bottom: 0.1em;
					color: var(--on-primary-700);
				}

				.social-label {
					font-size: 0.8em;
					opacity: 0.9;
					color: var(--on-primary-600);
				}
			}
		}
	}

	.achievements {
		.achievements-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 1em;

			.achievement {
				background: rgba(255, 255, 255, 0.15);
				border: 2px solid var(--primary-300);
				border-radius: 12px;
				padding: 1em;
				display: flex;
				align-items: center;
				gap: 1em;
				transition: transform 0.2s;

				&:hover {
					transform: scale(1.02);
				}

				.achievement-icon {
					font-size: 2.5em;
				}

				.achievement-name {
					font-weight: 600;
					margin-bottom: 0.2em;
					color: var(--on-primary-700);
				}

				.achievement-desc {
					font-size: 0.8em;
					opacity: 0.9;
					color: var(--on-primary-700);
				}
			}
		}
	}

	.fun-quotes {
		.quotes {
			display: flex;
			flex-direction: column;
			gap: 1em;

			.quote {
				background: rgba(255, 255, 255, 0.1);
				border-radius: 12px;
				padding: 1em;
				border-left: 4px solid rgba(255, 255, 255, 0.3);

				p {
					margin: 0;
					font-style: italic;
					font-size: 0.95em;
				}
			}
		}
	}

	.recap-footer {
		text-align: center;
		margin-top: 2em;
		padding-top: 1em;
		border-top: 1px solid rgba(255, 255, 255, 0.2);

		p {
			margin: 0;
			font-size: 0.8em;
			opacity: 0.7;
		}
	}

	@media (max-width: 768px) {
		.recap-card {
			padding: 1.5em;
			margin: 0 1em;
		}

		.recap-header {
			flex-direction: column;
			gap: 1em;

			.actions {
				align-self: flex-end;
			}
		}

		.main-stats {
			grid-template-columns: 1fr;
		}

		.pattern-grid,
		.social-grid {
			grid-template-columns: 1fr;
		}

		.equivalents {
			grid-template-columns: repeat(2, 1fr);
		}

		.achievements-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
