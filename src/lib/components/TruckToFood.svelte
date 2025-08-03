<script>
	import { onMount } from 'svelte';
	import { burgerData } from '$lib/burger.js';

	let dishesData = null;
	let loading = false;

	onMount(() => {
		loadDishesData();
	});

	const loadDishesData = async () => {
		loading = true;
		try {
			dishesData = await burgerData();
		} catch (error) {
			console.error('Erreur lors du chargement des plats:', error);
			dishesData = [];
		} finally {
			loading = false;
		}
	};
</script>

<div class="truck-food-widget">
	{#if loading}
		<div class="loading-state">
			<i class="fa-solid fa-spinner fa-spin"></i>
			<p>Chargement du menu...</p>
		</div>
	{:else if dishesData && dishesData.length > 0}
		<div class="menu-cards">
			{#each dishesData as dish, index}
				<div class="menu-card" style="--delay: {index * 0.2}s">
					<div class="dish-image">
						<img src={dish.image} alt={dish.name} />
					</div>
					<div class="dish-info">
						<div class="dish-category">{dish.element}</div>
						<h4>{dish.name}</h4>
						<p class="dish-description">{dish.description}</p>
					</div>
				</div>
			{/each}
		</div>
	{:else if dishesData && dishesData.length === 0}
		<div class="error-state">
			<i class="fa-solid fa-exclamation-triangle"></i>
			<p>Aucun plat trouvé pour aujourd'hui</p>
		</div>
	{/if}
</div>

<style lang="scss">
	.truck-food-widget {
		background: transparent;
		border-radius: 0;
		padding: 0;
		border: none;
		margin-bottom: 0;

		.menu-cards {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			gap: 1.5rem;
			justify-items: center;
		}

		.menu-card {
			background: white;
			border-radius: 1rem;
			padding: 1rem;
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
			transition: all 0.3s ease;
			animation: slideInUp 0.6s ease calc(var(--delay, 0s));
			max-width: 320px;
			width: 100%;

			&:hover {
				transform: translateY(-5px);
				box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
			}

			.dish-image {
				width: 100%;
				height: 200px;
				border-radius: 0.75rem;
				overflow: hidden;
				margin-bottom: 1rem;

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform 0.3s ease;
				}

				&:hover img {
					transform: scale(1.05);
				}
			}

			.dish-info {
				text-align: center;

				.dish-category {
					color: #f59e0b;
					font-size: 0.8rem;
					font-weight: 600;
					text-transform: uppercase;
					letter-spacing: 0.5px;
					margin-bottom: 0.5rem;
				}

				h4 {
					margin: 0 0 0.75rem 0;
					font-size: 1.2rem;
					font-weight: 600;
					color: var(--primary-800);
				}

				.dish-description {
					margin: 0;
					font-size: 0.9rem;
					color: var(--primary-600);
					line-height: 1.5;
				}
			}
		}

		.loading-state,
		.error-state {
			text-align: center;
			padding: 2rem;

			i {
				font-size: 2rem;
				color: var(--primary-400);
				margin-bottom: 1rem;
			}

			p {
				margin: 0;
				color: var(--primary-600);
				font-size: 0.9rem;
			}
		}

		.loading-state i {
			color: #f59e0b;
		}

		.error-state i {
			color: #ef4444;
		}
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.truck-food-widget {
			.widget-header h3 {
				font-size: 1.1rem;
			}

			.menu-cards {
				grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
				gap: 1rem;
			}

			.menu-card {
				padding: 0.8rem;

				.dish-image {
					height: 180px;
				}
			}
		}
	}

	@media (max-width: 480px) {
		.truck-food-widget {
			.menu-cards {
				grid-template-columns: 1fr;
				max-width: 300px;
				margin: 0 auto;
			}

			.menu-card .dish-image {
				height: 160px;
			}
		}
	}
</style>
