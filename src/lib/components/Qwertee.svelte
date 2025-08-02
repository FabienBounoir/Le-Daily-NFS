<script>
	import { getDailyQweerte } from '$lib/qwertee';

	let result = getDailyQweerte();
</script>

<div class="qwertee-container">
	{#await result}
		<div class="loading-state">
			<i class="fa-solid fa-spinner fa-spin"></i>
			<p>Récupération des designs du jour...</p>
		</div>
	{:then data}
		{#if data.dailyTees && data.dailyTees.length > 0}
			<div class="tees-grid">
				{#each data.dailyTees as dailyTee, index}
					<div class="tee-card" style="--delay: {index * 0.1}s">
						<div class="tee-image">
							<button
								class="image-button"
								on:click={() =>
									(dailyTee.selected = ((dailyTee.selected || 0) + 1) % dailyTee.types.length)}
								aria-label="Changer le type de t-shirt"
							>
								<img
									src={`https://cdn.qwertee.com/images/designs/product-thumbs/${dailyTee.types[dailyTee?.selected || 0].img.id}-${dailyTee.types[dailyTee?.selected || 0].name}-450x540.jpg`}
									alt={dailyTee.title}
									loading="lazy"
								/>
							</button>
							<div class="click-hint">
								<i class="fa-solid fa-mouse-pointer"></i>
								<span>Cliquez pour changer</span>
							</div>
						</div>
						<div class="tee-info">
							<a
								class="tee-name"
								href={`https://www.qwertee.com/`}
								target="_blank"
								rel="noopener noreferrer"
							>
								{dailyTee.name}
							</a>
							<div class="tee-price">
								<span class="price-value">{dailyTee.types[dailyTee?.selected || 0].price.EUR}€</span
								>
								<span class="price-label">Prix aujourd'hui</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="no-tees">
				<i class="fa-solid fa-shirt"></i>
				<p>Aucun design disponible aujourd'hui</p>
			</div>
		{/if}
	{:catch error}
		<div class="error-state">
			<i class="fa-solid fa-exclamation-triangle"></i>
			<p>Erreur lors du chargement des designs</p>
			<small>{error}</small>
		</div>
	{/await}
</div>

<style lang="scss">
	.qwertee-container {
		padding: 1.5rem;
		width: 100%;
	}

	.loading-state,
	.error-state,
	.no-tees {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		text-align: center;
		color: var(--primary-600);

		i {
			font-size: 2.5rem;
			margin-bottom: 1rem;
			opacity: 0.7;
		}

		p {
			margin: 0.5rem 0;
			font-size: 1.1rem;
			font-weight: 500;
		}

		small {
			opacity: 0.6;
			font-size: 0.9rem;
		}
	}

	.loading-state i {
		color: var(--primary-500);
	}

	.error-state i {
		color: #e74c3c;
	}

	.tees-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		justify-items: center;
	}

	.tee-card {
		background: white;
		border-radius: 1rem;
		padding: 1rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		animation: slideInUp 0.5s ease-out forwards;
		animation-delay: var(--delay);
		opacity: 0;
		transform: translateY(20px);
		max-width: 320px;
		width: 100%;

		&:hover {
			transform: translateY(-5px);
			box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		}
	}

	.tee-image {
		position: relative;
		margin-bottom: 1rem;

		.image-button {
			background: none;
			border: none;
			padding: 0;
			cursor: pointer;
			width: 100%;
			border-radius: 0.75rem;
			overflow: hidden;
			position: relative;
			transition: transform 0.2s ease;

			&:hover {
				transform: scale(1.02);
			}

			&:focus {
				outline: 3px solid var(--primary-400);
				outline-offset: 2px;
			}
		}

		img {
			width: 100%;
			height: auto;
			aspect-ratio: 450/540;
			object-fit: cover;
			border-radius: 0.75rem;
			transition: all 0.3s ease;
		}

		.click-hint {
			position: absolute;
			top: 0.5rem;
			right: 0.5rem;
			background: rgba(0, 0, 0, 0.7);
			color: white;
			padding: 0.3rem 0.6rem;
			border-radius: 0.5rem;
			font-size: 0.75rem;
			display: flex;
			align-items: center;
			gap: 0.3rem;
			opacity: 0;
			transition: opacity 0.3s ease;
			pointer-events: none;

			i {
				font-size: 0.7rem;
			}
		}

		&:hover .click-hint {
			opacity: 1;
		}
	}

	.tee-info {
		text-align: center;

		.tee-name {
			display: block;
			font-weight: 600;
			font-size: 1.1rem;
			color: var(--primary-800);
			text-decoration: none;
			margin-bottom: 0.5rem;
			transition: color 0.2s ease;

			&:hover {
				color: var(--primary-600);
			}

			&:focus {
				outline: 2px solid var(--primary-400);
				outline-offset: 2px;
				border-radius: 0.25rem;
			}
		}

		.tee-price {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.2rem;

			.price-value {
				font-size: 1.3rem;
				font-weight: 700;
				color: var(--primary-700);
			}

			.price-label {
				font-size: 0.8rem;
				color: var(--primary-500);
				opacity: 0.8;
			}
		}
	}

	@keyframes slideInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	// Responsive
	@media (max-width: 768px) {
		.qwertee-container {
			padding: 1rem;
		}

		.tees-grid {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 1rem;
		}

		.tee-card {
			padding: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.tees-grid {
			grid-template-columns: 1fr;
			max-width: 300px;
			margin: 0 auto;
		}
	}
</style>
