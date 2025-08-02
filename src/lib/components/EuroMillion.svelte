<script>
	import { getResultEuromillion } from '$lib/euroMillion';
	import { fly, scale } from 'svelte/transition';
	let result = getResultEuromillion();
</script>

<div class="euromillion-widget">
	{#await result}
		<div class="loading-state" in:fly={{ duration: 300, y: 20, opacity: 0 }}>
			<div class="loading-icon">
				<i class="fa-solid fa-coins fa-spin"></i>
			</div>
			<h3>Chargement du tirage EuroMillion...</h3>
			<p>Récupération des derniers résultats</p>
		</div>
	{:then data}
		{#if data && data.length > 0}
			<div class="euromillion-content" in:fly={{ duration: 400, y: 30, opacity: 0 }}>
				<div class="tirage-header">
					<div class="date-badge">
						<i class="fa-solid fa-calendar-alt"></i>
						<span>
							{new Date(data[data.length - 1].date).toLocaleDateString('fr-FR', {
								weekday: 'long',
								day: 'numeric',
								month: 'long',
								year: 'numeric'
							})}
						</span>
					</div>
				</div>

				<div class="numbers-container">
					<div class="main-numbers">
						<h4><i class="fa-solid fa-circle"></i> Numéros principaux</h4>
						<div class="numbers-grid">
							{#each data[data.length - 1].numbers as number, index}
								<div
									class="number-ball main"
									in:scale={{ duration: 300, delay: index * 100, start: 0.5 }}
								>
									{number}
								</div>
							{/each}
						</div>
					</div>

					<div class="separator">
						<div class="separator-line"></div>
						<i class="fa-solid fa-plus"></i>
						<div class="separator-line"></div>
					</div>

					<div class="star-numbers">
						<h4><i class="fa-solid fa-star"></i> Étoiles</h4>
						<div class="stars-grid">
							{#each data[data.length - 1].stars as star, index}
								<div
									class="number-ball star"
									in:scale={{
										duration: 300,
										delay: (data[data.length - 1].numbers.length + index) * 100,
										start: 0.5
									}}
								>
									<span class="star-number">{star}</span>
									<div class="star-bg">
										<i class="fa-solid fa-star"></i>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div class="tirage-footer">
					<div class="jackpot-info">
						<i class="fa-solid fa-trophy"></i>
						<span>Bonne chance pour le prochain tirage !</span>
					</div>
				</div>
			</div>
		{:else}
			<div class="error-state">
				<i class="fa-solid fa-exclamation-triangle"></i>
				<h3>Aucun résultat disponible</h3>
				<p>Impossible de récupérer les données du tirage</p>
			</div>
		{/if}
	{:catch error}
		<div class="error-state" in:fly={{ duration: 300, y: 20, opacity: 0 }}>
			<i class="fa-solid fa-exclamation-triangle"></i>
			<h3>Erreur de chargement</h3>
			<p>Impossible de récupérer les résultats EuroMillion</p>
			<small class="error-detail">{error}</small>
		</div>
	{/await}
</div>

<style lang="scss">
	.euromillion-widget {
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		border-radius: 1.5rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(99, 102, 241, 0.1);
		overflow: hidden;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 4px;
			background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
		}
	}

	.loading-state,
	.error-state {
		padding: 3rem 2rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		.loading-icon,
		i {
			font-size: 3rem;
			margin-bottom: 0.5rem;
		}

		.loading-icon i {
			color: #6366f1;
			margin: 0;
		}

		i {
			color: #ef4444;
		}

		h3 {
			margin: 0;
			font-size: 1.3rem;
			font-weight: 600;
			color: var(--primary-700);
		}

		p {
			margin: 0;
			color: var(--primary-600);
			opacity: 0.8;
		}

		.error-detail {
			font-size: 0.8rem;
			color: var(--primary-500);
			opacity: 0.6;
			margin-top: 0.5rem;
		}
	}

	.euromillion-content {
		padding: 2rem;
	}

	.tirage-header {
		text-align: center;
		margin-bottom: 2rem;

		.date-badge {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
			color: white;
			padding: 0.75rem 1.5rem;
			border-radius: 2rem;
			font-weight: 600;
			font-size: 0.95rem;
			box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);

			i {
				font-size: 1rem;
			}
		}
	}

	.numbers-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		align-items: center;
	}

	.main-numbers,
	.star-numbers {
		text-align: center;
		width: 100%;

		h4 {
			margin: 0 0 1rem 0;
			font-size: 1.1rem;
			font-weight: 600;
			color: var(--primary-700);
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;

			i {
				color: var(--primary-500);
				font-size: 1rem;
			}
		}
	}

	.numbers-grid,
	.stars-grid {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.number-ball {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.3rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		position: relative;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
		}

		&.main {
			background: linear-gradient(135deg, #ffffff, #f1f5f9);
			border: 3px solid var(--primary-500);
			color: var(--primary-700);
		}

		&.star {
			background: linear-gradient(135deg, #fbbf24, #f59e0b);
			border: 3px solid #d97706;
			color: white;
			position: relative;
			overflow: hidden;

			.star-number {
				position: relative;
				z-index: 2;
				font-weight: 800;
				text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
			}

			.star-bg {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				z-index: 1;
				opacity: 0.3;

				i {
					font-size: 2rem;
					color: white;
				}
			}
		}
	}

	.separator {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		max-width: 300px;

		.separator-line {
			flex: 1;
			height: 2px;
			background: linear-gradient(90deg, transparent, var(--primary-300), transparent);
		}

		i {
			color: var(--primary-400);
			font-size: 1.2rem;
			background: white;
			width: 30px;
			height: 30px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 2px solid var(--primary-200);
		}
	}

	.tirage-footer {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--primary-100);
		text-align: center;

		.jackpot-info {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			color: var(--primary-600);
			font-weight: 500;
			font-size: 0.95rem;

			i {
				color: #fbbf24;
				font-size: 1.1rem;
			}
		}
	}

	// Responsive design
	@media (max-width: 768px) {
		.euromillion-widget {
			margin: 0 1rem;
			border-radius: 1rem;
		}

		.euromillion-content {
			padding: 1.5rem;
		}

		.tirage-header .date-badge {
			padding: 0.6rem 1.2rem;
			font-size: 0.9rem;
		}

		.numbers-container {
			gap: 1.5rem;
		}

		.number-ball {
			width: 50px;
			height: 50px;
			font-size: 1.1rem;
		}

		.numbers-grid,
		.stars-grid {
			gap: 0.8rem;
		}

		.separator {
			max-width: 250px;
		}
	}

	@media (max-width: 480px) {
		.euromillion-content {
			padding: 1rem;
		}

		.loading-state,
		.error-state {
			padding: 2rem 1rem;
		}

		.number-ball {
			width: 45px;
			height: 45px;
			font-size: 1rem;
		}

		.tirage-header .date-badge {
			padding: 0.5rem 1rem;
			font-size: 0.85rem;
		}

		.main-numbers h4,
		.star-numbers h4 {
			font-size: 1rem;
		}

		.numbers-grid,
		.stars-grid {
			gap: 0.6rem;
		}
	}
</style>
