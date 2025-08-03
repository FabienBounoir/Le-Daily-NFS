<script>
	import { onMount } from 'svelte';

	let currentHoliday = null;
	let currentTrivia = null;
	let loading = true;
	let error = null;
	let showAnswer = false;
	let selectedAnswer = null;
	let userAnswered = false;

	// Fonction pour récupérer les jours fériés français
	async function fetchFrenchHolidays() {
		try {
			const today = new Date();
			const year = today.getFullYear();
			const response = await fetch(`https://date.nager.at/Api/v3/PublicHolidays/${year}/FR`);

			if (!response.ok) throw new Error('Erreur lors de la récupération des jours fériés');

			const holidays = await response.json();

			// Trouve le prochain jour férié ou celui du jour
			const todayStr = today.toISOString().split('T')[0];
			const upcoming = holidays.find((holiday) => holiday.date >= todayStr);

			if (upcoming) {
				currentHoliday = {
					name: upcoming.localName || upcoming.name,
					date: upcoming.date,
					global: upcoming.global,
					counties: upcoming.counties || []
				};
			} else {
				// Si pas de jour férié à venir cette année, prendre le premier de l'année suivante
				const nextYearResponse = await fetch(
					`https://date.nager.at/Api/v3/PublicHolidays/${year + 1}/FR`
				);
				if (nextYearResponse.ok) {
					const nextYearHolidays = await nextYearResponse.json();
					if (nextYearHolidays.length > 0) {
						const nextHoliday = nextYearHolidays[0];
						currentHoliday = {
							name: nextHoliday.localName || nextHoliday.name,
							date: nextHoliday.date,
							global: nextHoliday.global,
							counties: nextHoliday.counties || []
						};
					}
				}
			}
		} catch (err) {
			console.error('Erreur holidays:', err);
			error = err instanceof Error ? err.message : 'Erreur inconnue';
		}
	}

	// Fonction pour récupérer une question de trivia
	async function fetchTrivia() {
		try {
			const response = await fetch(
				'https://the-trivia-api.com/v2/questions?limit=1&categories=history,society_and_culture,arts_and_literature,science&difficulties=easy,medium'
			);

			if (!response.ok) throw new Error('Erreur lors de la récupération de la question');

			const questions = await response.json();

			if (questions.length > 0) {
				const question = questions[0];
				// Mélange les réponses
				const allAnswers = [question.correctAnswer, ...question.incorrectAnswers];
				const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

				currentTrivia = {
					question: question.question.text,
					answers: shuffledAnswers,
					correctAnswer: question.correctAnswer,
					category: question.category,
					difficulty: question.difficulty
				};
			}
		} catch (err) {
			console.error('Erreur trivia:', err);
			error = err instanceof Error ? err.message : 'Erreur inconnue';
		}
	}

	// Fonction pour gérer la sélection d'une réponse
	function selectAnswer(answer) {
		if (userAnswered) return;

		selectedAnswer = answer;
		userAnswered = true;
		showAnswer = true;
	}

	// Fonction pour obtenir une nouvelle question
	async function getNewQuestion() {
		showAnswer = false;
		selectedAnswer = null;
		userAnswered = false;
		currentTrivia = null;

		await fetchTrivia();
	}

	// Fonction pour formatter la date en français
	function formatFrenchDate(dateStr) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('fr-FR', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Fonction pour calculer les jours restants
	function getDaysUntil(dateStr) {
		const today = new Date();
		const targetDate = new Date(dateStr);
		const diffTime = targetDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Aujourd'hui !";
		if (diffDays === 1) return 'Demain !';
		if (diffDays > 0) return `Dans ${diffDays} jours`;
		return 'Passé';
	}

	// Fonction pour obtenir l'icône de la catégorie
	function getCategoryIcon(category) {
		switch (category) {
			case 'history':
				return '🏛️';
			case 'society_and_culture':
				return '🌍';
			case 'arts_and_literature':
				return '🎨';
			case 'science':
				return '🔬';
			case 'music':
				return '🎵';
			case 'film_and_tv':
				return '🎬';
			case 'food_and_drink':
				return '🍽️';
			case 'geography':
				return '🗺️';
			case 'sport_and_leisure':
				return '⚽';
			default:
				return '🧠';
		}
	}

	// Fonction pour obtenir la couleur de la difficulté
	function getDifficultyColor(difficulty) {
		switch (difficulty) {
			case 'easy':
				return '#4ade80';
			case 'medium':
				return '#fbbf24';
			case 'hard':
				return '#ef4444';
			default:
				return '#6b7280';
		}
	}

	onMount(async () => {
		loading = true;
		await Promise.all([fetchFrenchHolidays(), fetchTrivia()]);
		loading = false;
	});
</script>

<div class="fete-du-jour-container">
	{#if loading}
		<div class="loading">
			<span class="loading-spinner">🔄</span>
			<span>Chargement des festivités...</span>
		</div>
	{:else if error}
		<div class="error">
			<span class="error-icon">⚠️</span>
			<p>Erreur : {error}</p>
		</div>
	{:else}
		<div class="content-layout">
			<!-- Section Fête du Jour à gauche -->
			{#if currentHoliday}
				<div class="holiday-section">
					<div class="section-header">
						<h3>🎉 Fête du Jour</h3>
					</div>
					<div class="holiday-card">
						<div class="holiday-info">
							<h4>{currentHoliday.name}</h4>
							<p class="holiday-date">{formatFrenchDate(currentHoliday.date)}</p>
							<p class="holiday-countdown">{getDaysUntil(currentHoliday.date)}</p>
							{#if currentHoliday.global}
								<span class="holiday-badge global">🇫🇷 National</span>
							{:else}
								<span class="holiday-badge local">📍 Local</span>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Section Question Culture Générale à droite -->
			{#if currentTrivia}
				<div class="trivia-section">
					<div class="section-header">
						<h3>🧠 Question Culture Générale</h3>
						<button class="refresh-btn" on:click={getNewQuestion} title="Nouvelle question">
							<span class="refresh-icon">🔄</span>
						</button>
					</div>
					<div class="trivia-card">
						<div class="trivia-header">
							<span class="category-icon">{getCategoryIcon(currentTrivia.category)}</span>
							<span class="category-name">{currentTrivia.category.replace(/_/g, ' ')}</span>
							<span
								class="difficulty-badge"
								style="background-color: {getDifficultyColor(currentTrivia.difficulty)}"
							>
								{currentTrivia.difficulty}
							</span>
						</div>

						<div class="question">
							<p>{currentTrivia.question}</p>
						</div>

						<div class="answers">
							{#each currentTrivia.answers as answer, index}
								<button
									class="answer-btn"
									class:selected={selectedAnswer === answer}
									class:correct={showAnswer && answer === currentTrivia.correctAnswer}
									class:incorrect={showAnswer &&
										selectedAnswer === answer &&
										answer !== currentTrivia.correctAnswer}
									on:click={() => selectAnswer(answer)}
									disabled={userAnswered}
								>
									<span class="answer-letter">{String.fromCharCode(65 + index)}</span>
									<span class="answer-text">{answer}</span>
									{#if showAnswer && answer === currentTrivia.correctAnswer}
										<span class="correct-icon">✓</span>
									{/if}
								</button>
							{/each}
						</div>

						{#if showAnswer}
							<div class="result">
								{#if selectedAnswer === currentTrivia.correctAnswer}
									<p class="result-text correct">🎉 Bravo ! Bonne réponse !</p>
								{:else}
									<p class="result-text incorrect">
										😔 Dommage ! La bonne réponse était : <strong
											>{currentTrivia.correctAnswer}</strong
										>
									</p>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.fete-du-jour-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.content-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30px;
		align-items: start;
	}

	.loading,
	.error {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 40px;
		text-align: center;
		color: #6b7280;
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
		font-size: 1.2rem;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		color: #ef4444;
	}

	.error-icon {
		font-size: 1.2rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 15px;
	}

	.section-header h3 {
		margin: 0;
		color: #1f2937;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.refresh-btn {
		background: #f3f4f6;
		border: none;
		border-radius: 8px;
		padding: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.refresh-btn:hover {
		background: #e5e7eb;
	}

	.refresh-btn:hover .refresh-icon {
		transform: rotate(90deg);
	}

	.refresh-icon {
		transition: transform 0.2s;
		font-size: 1rem;
	}

	/* Styles pour la section fête */
	.holiday-section {
		height: 100%;
	}

	.holiday-card {
		background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #fbbf24;
	}

	.holiday-info h4 {
		margin: 0 0 10px 0;
		color: #92400e;
		font-size: 1.4rem;
		font-weight: 700;
	}

	.holiday-date {
		color: #b45309;
		font-size: 1.1rem;
		margin: 5px 0;
		font-weight: 500;
	}

	.holiday-countdown {
		color: #d97706;
		font-size: 1rem;
		margin: 10px 0;
		font-weight: 600;
	}

	.holiday-badge {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
		margin-top: 10px;
	}

	.holiday-badge.global {
		background: #dbeafe;
		color: #1e40af;
	}

	.holiday-badge.local {
		background: #ecfdf5;
		color: #059669;
	}

	/* Styles pour la section trivia */
	.trivia-section {
		height: 100%;
	}

	.trivia-card {
		background: white;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e5e7eb;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.trivia-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid #f3f4f6;
	}

	.category-icon {
		font-size: 1.5rem;
	}

	.category-name {
		flex: 1;
		color: #374151;
		font-weight: 500;
		text-transform: capitalize;
	}

	.difficulty-badge {
		color: white;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.question {
		margin-bottom: 20px;
	}

	.question p {
		color: #1f2937;
		font-size: 1.1rem;
		line-height: 1.6;
		margin: 0;
		font-weight: 500;
	}

	.answers {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.answer-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: #f9fafb;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		width: 100%;
	}

	.answer-btn:hover:not(:disabled) {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.answer-btn.selected {
		background: #dbeafe;
		border-color: #3b82f6;
	}

	.answer-btn.correct {
		background: #dcfce7;
		border-color: #22c55e;
		color: #166534;
	}

	.answer-btn.incorrect {
		background: #fee2e2;
		border-color: #ef4444;
		color: #991b1b;
	}

	.answer-btn:disabled {
		cursor: not-allowed;
	}

	.answer-letter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: #6b7280;
		color: white;
		border-radius: 50%;
		font-weight: 600;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	.answer-btn.correct .answer-letter {
		background: #22c55e;
	}

	.answer-btn.incorrect .answer-letter {
		background: #ef4444;
	}

	.answer-text {
		color: var(--primary-800);
		flex: 1;
		font-weight: 500;
	}

	.correct-icon {
		color: #22c55e;
		font-weight: bold;
		font-size: 1.2rem;
	}

	.result {
		margin-top: 20px;
		padding: 15px;
		border-radius: 8px;
		text-align: center;
	}

	.result-text {
		margin: 0;
		font-weight: 600;
		font-size: 1rem;
	}

	.result-text.correct {
		background: #dcfce7;
		color: #166534;
		border: 1px solid #22c55e;
	}

	.result-text.incorrect {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #ef4444;
	}

	/* Responsive */
	@media (max-width: 968px) {
		.content-layout {
			grid-template-columns: 1fr;
			gap: 20px;
		}
	}

	@media (max-width: 640px) {
		.fete-du-jour-container {
			padding: 15px;
		}

		.holiday-card,
		.trivia-card {
			padding: 15px;
		}

		.answer-btn {
			padding: 10px 12px;
		}

		.question p {
			font-size: 1rem;
		}
	}
</style>
