<script>
	export let visible = false;
</script>

{#if visible}
	<div class="help-modal" on:click={() => (visible = false)}>
		<div class="help-content" on:click|stopPropagation>
			<div class="help-header">
				<h2>🎯 Comment ça marche ?</h2>
				<button on:click={() => (visible = false)}>✕</button>
			</div>

			<div class="help-body">
				<div class="example-card">
					<h3>📊 Exemple de récap généré</h3>
					<div class="mini-recap">
						<div class="mini-header">
							<h4>🎯 Daily Recap</h4>
							<p>01/07/2024 → 31/07/2024</p>
						</div>
						<div class="mini-stats">
							<div class="mini-stat">
								<span class="value">42</span>
								<span class="label">Dailies</span>
							</div>
							<div class="mini-stat">
								<span class="value">4m 23s</span>
								<span class="label">Temps moyen</span>
							</div>
						</div>
						<div class="mini-fun">
							<p>🎉 <strong>Équivalences fun</strong></p>
							<p>☕ 50 cafés • 🎵 62 chansons • 📺 8 épisodes Netflix</p>
						</div>
						<div class="mini-habits">
							<p>📊 <strong>Tes habitudes</strong></p>
							<p>📅 Mardi (jour préféré) • 🕐 Matin • 🔥 12 jours consécutifs</p>
						</div>
						<div class="mini-achievements">
							<p>🏆 <strong>Achievements</strong></p>
							<div class="mini-badges">
								<span class="badge">🥇 Vétéran</span>
								<span class="badge">⚡ Flash</span>
								<span class="badge">🏃 Marathon</span>
							</div>
						</div>
					</div>
				</div>

				<div class="features-list">
					<h3>✨ Fonctionnalités</h3>
					<ul>
						<li>📊 <strong>Statistiques complètes</strong> - Temps total, moyennes, records</li>
						<li>🎉 <strong>Équivalences fun</strong> - Cafés, chansons, épisodes Netflix...</li>
						<li>📅 <strong>Analyse temporelle</strong> - Jour/heure préférés, tendances</li>
						<li>
							🔥 <strong>Streaks & régularité</strong> - Plus longue série, pourcentage de participation
						</li>
						<li>👥 <strong>Stats sociales</strong> - Binômes, taille d'équipe, participation</li>
						<li>🏆 <strong>Achievements</strong> - Badges selon tes performances</li>
						<li>💭 <strong>Citations fun</strong> - Messages personnalisés et amusants</li>
						<li>📸 <strong>Partage</strong> - Télécharge et partage ta carte</li>
					</ul>
				</div>

				<div class="tips">
					<h3>💡 Conseils</h3>
					<ul>
						<li>Utilisez les <strong>périodes rapides</strong> pour les récaps standards</li>
						<li>Sélectionnez un <strong>speaker spécifique</strong> pour un récap personnel</li>
						<li>Laissez vide pour avoir un <strong>récap d'équipe</strong></li>
						<li>Plus la période est longue, plus les stats sont détaillées !</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.help-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 2em;
	}

	.help-content {
		background: white;
		border-radius: 20px;
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
	}

	.help-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2em 2em 1em;
		border-bottom: 1px solid #eee;

		h2 {
			margin: 0;
			font-size: 1.5em;
			font-weight: 700;
		}

		button {
			background: #f8f9fa;
			border: none;
			border-radius: 50%;
			width: 40px;
			height: 40px;
			cursor: pointer;
			font-size: 1.2em;
			transition: background 0.2s;

			&:hover {
				background: #e9ecef;
			}
		}
	}

	.help-body {
		padding: 2em;
		display: flex;
		flex-direction: column;
		gap: 2em;
	}

	.example-card {
		h3 {
			margin: 0 0 1em;
			font-size: 1.2em;
			color: #333;
		}
	}

	.mini-recap {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 15px;
		padding: 1.5em;
		font-size: 0.9em;

		.mini-header {
			text-align: center;
			margin-bottom: 1.5em;

			h4 {
				margin: 0 0 0.5em;
				font-size: 1.3em;
			}

			p {
				margin: 0;
				opacity: 0.9;
			}
		}

		.mini-stats {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1em;
			margin-bottom: 1.5em;

			.mini-stat {
				background: rgba(255, 255, 255, 0.15);
				border-radius: 10px;
				padding: 1em;
				text-align: center;

				.value {
					display: block;
					font-size: 1.4em;
					font-weight: 700;
					margin-bottom: 0.2em;
				}

				.label {
					font-size: 0.8em;
					opacity: 0.8;
				}
			}
		}

		.mini-fun,
		.mini-habits,
		.mini-achievements {
			margin-bottom: 1em;

			p {
				margin: 0 0 0.5em;

				&:last-child {
					margin: 0;
				}
			}

			strong {
				font-weight: 600;
			}
		}

		.mini-badges {
			display: flex;
			gap: 0.5em;
			flex-wrap: wrap;

			.badge {
				background: rgba(255, 255, 255, 0.2);
				padding: 0.3em 0.6em;
				border-radius: 20px;
				font-size: 0.8em;
				white-space: nowrap;
			}
		}
	}

	.features-list,
	.tips {
		h3 {
			margin: 0 0 1em;
			font-size: 1.2em;
			color: #333;
		}

		ul {
			margin: 0;
			padding-left: 1.5em;

			li {
				margin-bottom: 0.8em;
				line-height: 1.4;

				strong {
					color: #667eea;
				}
			}
		}
	}

	@media (max-width: 768px) {
		.help-modal {
			padding: 1em;
		}

		.help-content {
			border-radius: 15px;
		}

		.help-header,
		.help-body {
			padding: 1.5em;
		}

		.mini-stats {
			grid-template-columns: 1fr !important;
		}

		.mini-badges {
			justify-content: center;
		}
	}
</style>
