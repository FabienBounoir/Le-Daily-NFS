<script>
	import { user } from '$lib/stores/user.js';

	const getNextWeekdayOccurrence = (weekday) => {
		const today = new Date();
		const targetDay = parseInt(weekday);
		const todayDay = today.getDay();

		let daysUntilTarget = targetDay - todayDay;
		if (daysUntilTarget <= 0) {
			daysUntilTarget += 7;
		}

		const nextOccurrence = new Date(today);
		nextOccurrence.setDate(today.getDate() + daysUntilTarget);
		return nextOccurrence;
	};

	const getWeekdayName = (weekday) => {
		const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
		return days[parseInt(weekday)];
	};

	const isTodayRecurringDay = (weekday) => {
		const today = new Date();
		return today.getDay() === parseInt(weekday);
	};

	$: activeDates = $user?.programmedDates
		? $user.programmedDates
				.filter((dateModule) => {
					if (!dateModule.title) return false;

					const type = dateModule.type || 'regular';

					if (type === 'recurring') {
						return true;
					}

					if (!dateModule.date) return false;
					if (dateModule.autoRemove && new Date(dateModule.date).getTime() < new Date().getTime()) {
						return false;
					}

					return true;
				})
				.map((dateModule) => {
					const type = dateModule.type || 'regular';

					if (type === 'recurring') {
						const isToday = isTodayRecurringDay(dateModule.weekday);
						const nextOccurrence = getNextWeekdayOccurrence(dateModule.weekday);
						const dayName = getWeekdayName(dateModule.weekday);

						let text = '';
						let daysLeft = 0;

						if (isToday) {
							text = `${dateModule.title} - Aujourd'hui !`;
							daysLeft = 0;
						} else {
							const diffTime = nextOccurrence.getTime() - new Date().getTime();
							daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
							text = `${dateModule.title} - Prochain ${dayName} (${daysLeft} jour${daysLeft > 1 ? 's' : ''})`;
						}

						return {
							...dateModule,
							text,
							daysLeft,
							isOverdue: false,
							isToday,
							isRecurring: true
						};
					} else {
						const targetDate = new Date(dateModule.date);
						const now = new Date();
						const diffTime = targetDate.getTime() - now.getTime();
						const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

						let text = '';
						let isOverdue = false;

						if (diffDays < 0) {
							text = `${dateModule.title} - Il y a ${Math.abs(diffDays)} jour(s)`;
							isOverdue = true;
						} else if (diffDays === 0) {
							text = `${dateModule.title} - Aujourd'hui !`;
						} else if (diffDays === 1) {
							text = `${dateModule.title} - Demain`;
						} else {
							text = `${dateModule.title} - Dans ${diffDays} jour(s)`;
						}

						return {
							...dateModule,
							text,
							daysLeft: diffDays,
							isOverdue,
							isToday: diffDays === 0,
							isRecurring: false
						};
					}
				})
		: [];
</script>

{#if activeDates.length > 0}
	<div class="dates-container">
		<h3><i class="fa-solid fa-calendar-alt"></i> Dates importantes</h3>
		<div class="dates-list">
			{#each activeDates as dateInfo}
				<div
					class="date-item {dateInfo.isOverdue
						? 'overdue'
						: dateInfo.daysLeft <= 7 || dateInfo.isToday
							? 'urgent'
							: 'normal'} {dateInfo.isRecurring ? 'recurring' : ''}"
				>
					<div class="date-content">
						<p class="date-text">{dateInfo.text}</p>
						{#if dateInfo.description}
							<p class="date-description">{dateInfo.description}</p>
						{/if}
						{#if dateInfo.isRecurring}
							<p class="recurring-indicator">
								<i class="fa-solid fa-repeat"></i>
								Récurrent
							</p>
						{/if}
					</div>
					<div class="date-badge">
						{#if dateInfo.isRecurring && dateInfo.isToday}
							<i class="fa-solid fa-star"></i>
						{:else if dateInfo.isRecurring}
							<i class="fa-solid fa-repeat"></i>
						{:else if dateInfo.daysLeft < 0}
							<i class="fa-solid fa-exclamation-triangle"></i>
						{:else if dateInfo.daysLeft === 0}
							<i class="fa-solid fa-star"></i>
						{:else if dateInfo.daysLeft <= 7}
							<i class="fa-solid fa-clock"></i>
						{:else}
							<i class="fa-solid fa-calendar"></i>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style lang="scss">
	.dates-container {
		background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
		padding: 1.5rem;
		border-radius: 1rem;
		border: 1px solid var(--primary-200);

		h3 {
			margin: 0 0 1rem 0;
			color: var(--primary-700);
			font-size: 1.2rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;

			i {
				color: var(--primary-600);
			}
		}
	}

	.dates-list {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.date-item {
		background: white;
		border-radius: 0.75rem;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		border-left: 4px solid var(--primary-400);
		transition: all 0.3s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		}

		&.urgent {
			border-left-color: #f59e0b;
			background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 5%, white 5%);
		}

		&.overdue {
			border-left-color: #ef4444;
			background: linear-gradient(135deg, #fee2e2 0%, #f87171 5%, white 5%);
		}

		&.normal {
			border-left-color: var(--primary-400);
		}

		&.recurring {
			border-left-color: #06b6d4;
			background: linear-gradient(135deg, #cffafe 0%, #67e8f9 5%, white 5%);
			position: relative;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 2px;
				background: linear-gradient(90deg, #06b6d4, rgba(6, 182, 212, 0.3));
				border-radius: 0.75rem 0.75rem 0 0;
			}
		}
	}

	.date-content {
		flex: 1;

		.date-text {
			margin: 0 0 0.2rem 0;
			font-weight: 600;
			color: var(--primary-800);
			font-size: 0.95rem;
		}

		.date-description {
			margin: 0;
			font-size: 0.8rem;
			color: var(--primary-600);
			opacity: 0.8;
		}

		.recurring-indicator {
			margin: 0.3rem 0 0 0;
			font-size: 0.75rem;
			color: #06b6d4;
			display: flex;
			align-items: center;
			gap: 0.3rem;
			font-weight: 500;

			i {
				font-size: 0.7rem;
			}
		}
	}

	.date-badge {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		flex-shrink: 0;

		.urgent & {
			background: #f59e0b;
			color: white;
		}

		.overdue & {
			background: #ef4444;
			color: white;
		}

		.normal & {
			background: var(--primary-400);
			color: white;
		}

		.recurring & {
			background: #06b6d4;
			color: white;
		}
	}

	@media (max-width: 768px) {
		.dates-container {
			padding: 1rem;

			h3 {
				font-size: 1.1rem;
			}
		}

		.date-item {
			padding: 0.8rem;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.8rem;

			.date-badge {
				align-self: flex-end;
				width: 35px;
				height: 35px;
				font-size: 0.9rem;
			}
		}
	}
</style>
