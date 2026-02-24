<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/utils/api';
	import { user } from '$lib/stores/user';
	import { snacks } from '$lib/stores/snacks';
	import RecapCard from '$lib/components/RecapCard.svelte';
	import HelpModal from '$lib/components/HelpModal.svelte';
	import { scale, slide } from 'svelte/transition';
	import html2canvas from 'html2canvas';

	let speakers = [];
	let recap = null;
	let isLoading = false;
	let showPresets = true;

	// Formulaire
	let selectedSpeaker = '';
	let startDate = '';
	let endDate = '';
	let customPeriod = false;
	let showHelpModal = false;

	// Charger les speakers et pré-remplir depuis les paramètres URL
	onMount(async () => {
		try {
			speakers = await api.get(`/daily/stats/${$user.teams[0]}/speakers`);

			// Pré-remplir le speaker depuis l'URL
			const speakerParam = $page.url.searchParams.get('speaker');
			if (speakerParam) {
				selectedSpeaker = speakerParam;
				showPresets = false;
				customPeriod = false;
			}
		} catch (error) {
			console.error('Erreur lors du chargement des speakers:', error);
		}
	});

	// Presets de dates
	const presets = [
		{
			name: 'Cette semaine',
			icon: '📅',
			getRange: () => {
				const now = new Date();
				const start = new Date(now);
				start.setDate(now.getDate() - now.getDay() + 1); // Lundi
				start.setHours(0, 0, 0, 0);
				const end = new Date(now);
				end.setHours(23, 59, 59, 999);
				return { start, end };
			}
		},
		{
			name: 'Semaine dernière',
			icon: '📆',
			getRange: () => {
				const now = new Date();
				const start = new Date(now);
				start.setDate(now.getDate() - now.getDay() - 6); // Lundi semaine dernière
				start.setHours(0, 0, 0, 0);
				const end = new Date(start);
				end.setDate(start.getDate() + 6); // Dimanche
				end.setHours(23, 59, 59, 999);
				return { start, end };
			}
		},
		{
			name: 'Ce mois',
			icon: '🗓️',
			getRange: () => {
				const now = new Date();
				const start = new Date(now.getFullYear(), now.getMonth(), 1);
				const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
				end.setHours(23, 59, 59, 999);
				return { start, end };
			}
		},
		{
			name: 'Mois dernier',
			icon: '📋',
			getRange: () => {
				const now = new Date();
				const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				const end = new Date(now.getFullYear(), now.getMonth(), 0);
				end.setHours(23, 59, 59, 999);
				return { start, end };
			}
		},
		{
			name: 'Ce trimestre',
			icon: '📊',
			getRange: () => {
				const now = new Date();
				const quarter = Math.floor(now.getMonth() / 3);
				const start = new Date(now.getFullYear(), quarter * 3, 1);
				const end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
				end.setHours(23, 59, 59, 999);
				return { start, end };
			}
		},
		{
			name: 'Cette année',
			icon: '🎯',
			getRange: () => {
				const now = new Date();
				const start = new Date(now.getFullYear(), 0, 1);
				const end = new Date(now.getFullYear(), 11, 31);
				end.setHours(23, 59, 59, 999);
				return { start, end };
			}
		}
	];

	const selectPreset = (preset) => {
		const range = preset.getRange();
		startDate = range.start.toISOString().split('T')[0];
		endDate = range.end.toISOString().split('T')[0];
		customPeriod = false;
		showPresets = false;
	};

	const generateRecap = async () => {
		if (!startDate || !endDate) {
			snacks.error('Veuillez sélectionner une période');
			return;
		}

		if (new Date(startDate) > new Date(endDate)) {
			snacks.error('La date de début doit être antérieure à la date de fin');
			return;
		}

		isLoading = true;
		recap = null;

		try {
			const params = new URLSearchParams({
				team: $user.teams[0],
				startDate,
				endDate
			});

			if (selectedSpeaker) {
				params.append('speaker', selectedSpeaker);
			}

			recap = await api.get(`/daily/recap?${params}`);
			snacks.success('Récap généré avec succès !');
		} catch (error) {
			console.error('Erreur lors de la génération du récap:', error);
			snacks.error('Erreur lors de la génération du récap');
		} finally {
			isLoading = false;
		}
	};

	const resetForm = () => {
		selectedSpeaker = '';
		startDate = '';
		endDate = '';
		customPeriod = false;
		showPresets = true;
		recap = null;
	};

	const downloadRecap = async ({ detail }) => {
		try {
			const recapElement = document.getElementById('recap-export');
			if (!recapElement) {
				snacks.error('Aucun récap à télécharger');
				return;
			}

			snacks.success("Génération de l'image en cours...");

			// Attendre que l'élément soit bien rendu
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Faire défiler vers l'élément pour s'assurer qu'il est visible
			recapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

			// Attendre un peu plus pour le scroll
			await new Promise((resolve) => setTimeout(resolve, 300));

			console.log('Élément à capturer:', {
				width: recapElement.offsetWidth,
				height: recapElement.offsetHeight,
				visible: recapElement.offsetParent !== null,
				computedStyle: window.getComputedStyle(recapElement)
			});

			// Configuration pour html2canvas
			const canvas = await html2canvas(recapElement, {
				backgroundColor: '#ffffff',
				scale: 1.5, // Réduire un peu l'échelle
				logging: true, // Activer les logs pour debug
				useCORS: true,
				allowTaint: false,
				foreignObjectRendering: false,
				imageTimeout: 15000,
				removeContainer: false,
				width: recapElement.offsetWidth,
				height: recapElement.offsetHeight,
				scrollX: 0,
				scrollY: 0,
				x: 0,
				y: 0
			});

			console.log('Canvas généré:', {
				width: canvas.width,
				height: canvas.height
			});

			// Vérifier que le canvas n'est pas vide
			if (canvas.width === 0 || canvas.height === 0) {
				snacks.error('Erreur: image vide générée');
				return;
			}

			// Convertir en blob et télécharger
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						snacks.error("Erreur lors de la création de l'image");
						return;
					}

					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.download = `daily-recap-${detail.recap.team}-${formatDateForFilename(detail.recap.period.startDate)}-${formatDateForFilename(detail.recap.period.endDate)}.png`;
					link.href = url;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);

					snacks.success('Image téléchargée avec succès !');
				},
				'image/png',
				1.0
			);
		} catch (error) {
			console.error('Erreur lors du téléchargement:', error);
			snacks.error("Erreur lors du téléchargement de l'image");
		}
	};

	const formatDateForFilename = (dateString) => {
		return new Date(dateString).toISOString().split('T')[0];
	};

	// Auto-générer est supprimé pour éviter les boucles infinies
	// L'utilisateur doit maintenant cliquer sur "Générer le récap"
</script>

<svelte:head>
	<title>Récap Dailies - {$user?.username || ''}</title>
	<meta
		name="description"
		content="Générez vos récaps personnalisés de dailies avec des statistiques fun !"
	/>
</svelte:head>

<main>
	<header class="page-header">
		<div class="header-content">
			<div class="header-text">
				<h1>🎯 Générateur de Récap</h1>
				<p>Créez des cartes récap stylées avec vos statistiques de dailies</p>
			</div>
			<button class="help-button" on:click={() => (showHelpModal = true)}>
				❓ Comment ça marche ?
			</button>
		</div>
	</header>

	<div class="content">
		<aside class="controls" class:collapsed={!showPresets && recap}>
			{#if showPresets}
				<section class="presets" in:slide={{ duration: 300 }}>
					<h2>⚡ Périodes rapides</h2>
					<div class="preset-grid">
						{#each presets as preset}
							<button
								class="preset-button"
								on:click={() => selectPreset(preset)}
								in:scale={{ duration: 200, delay: presets.indexOf(preset) * 50 }}
							>
								<span class="preset-icon">{preset.icon}</span>
								<span class="preset-name">{preset.name}</span>
							</button>
						{/each}
					</div>

					<div class="divider">
						<span>ou</span>
					</div>

					<button
						class="custom-button"
						on:click={() => {
							customPeriod = true;
							showPresets = false;
						}}
					>
						📅 Période personnalisée
					</button>
				</section>
			{:else}
				<section class="form-section" in:slide={{ duration: 300 }}>
					<div class="form-header">
						<h2>🎨 Configuration</h2>
						<button
							class="back-button"
							on:click={() => {
								showPresets = true;
								resetForm();
							}}
						>
							← Retour
						</button>
					</div>

					<form on:submit|preventDefault={generateRecap}>
						<div class="input-group">
							<label for="startDate">Date de début</label>
							<input type="date" id="startDate" bind:value={startDate} required />
						</div>

						<div class="input-group">
							<label for="endDate">Date de fin</label>
							<input type="date" id="endDate" bind:value={endDate} required />
						</div>

						<div class="input-group">
							<label for="speaker">Speaker (optionnel)</label>
							<select id="speaker" bind:value={selectedSpeaker}>
								<option value="">Toute l'équipe</option>
								{#each speakers as speaker}
									{#if !speaker.removed}
										<option value={speaker.name}>{speaker.name}</option>
									{/if}
								{/each}
							</select>
							<small>Laissez vide pour un récap d'équipe</small>
						</div>

						<div class="form-actions">
							<button
								type="submit"
								class="generate-button"
								disabled={isLoading || !startDate || !endDate}
							>
								{#if isLoading}
									⏳ Génération...
								{:else}
									🚀 Générer le récap
								{/if}
							</button>

							{#if recap}
								<button type="button" class="reset-button" on:click={resetForm}>
									🔄 Nouveau récap
								</button>
							{/if}
						</div>
					</form>
				</section>
			{/if}
		</aside>

		<section class="recap-section">
			<RecapCard {recap} {isLoading} on:download={downloadRecap} />
		</section>
	</div>

	<HelpModal bind:visible={showHelpModal} />
</main>

<style lang="scss">
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2em;
		min-height: 100vh;
	}

	.page-header {
		text-align: center;
		margin-bottom: 3em;

		.header-content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			max-width: 800px;
			margin: 0 auto;

			@media (max-width: 768px) {
				flex-direction: column;
				gap: 1.5em;
			}
		}

		.header-text {
			text-align: left;

			@media (max-width: 768px) {
				text-align: center;
			}
		}

		h1 {
			font-size: 2.5em;
			font-weight: 700;
			margin: 0 0 0.5em;
		}

		p {
			font-size: 1.1em;
			color: var(--primary-600);
			margin: 0;
		}

		.help-button {
			background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-600) 100%);
			color: var(--on-primary-600);
			border: none;
			border-radius: 12px;
			padding: 0.8em 1.5em;
			font-weight: 600;
			cursor: pointer;
			transition:
				transform 0.2s,
				box-shadow 0.2s;
			white-space: nowrap;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 8px 25px rgba(var(--primary-500), 0.3);
			}
		}
	}

	.content {
		display: grid;
		grid-template-columns: 400px 1fr;
		gap: 3em;
		align-items: start;

		@media (max-width: 1024px) {
			grid-template-columns: 1fr;
			gap: 2em;
		}
	}

	.controls {
		background: var(--primary-50);
		border: 1px solid var(--primary-200);
		border-radius: 20px;
		padding: 2em;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 2em;

		&.collapsed {
			@media (max-width: 1024px) {
				position: static;
			}
		}
	}

	.presets {
		h2 {
			margin: 0 0 1.5em;
			font-size: 1.4em;
			font-weight: 600;
			color: var(--primary-700);
		}

		.preset-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1em;
			margin-bottom: 2em;
		}

		.preset-button {
			background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%);
			border: 2px solid transparent;
			border-radius: 15px;
			padding: 1.5em 1em;
			cursor: pointer;
			transition: all 0.3s ease;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.5em;
			text-align: center;
			color: var(--on-primary-200);

			&:hover {
				transform: translateY(-3px);
				box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
				background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
				color: var(--on-primary-700);
			}

			.preset-icon {
				font-size: 2em;
			}

			.preset-name {
				font-weight: 600;
				font-size: 0.9em;
			}
		}

		.divider {
			text-align: center;
			margin: 2em 0;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				top: 50%;
				left: 0;
				right: 0;
				height: 1px;
				background: var(--primary-300);
			}

			span {
				background: var(--primary-50);
				padding: 0 1em;
				color: var(--primary-500);
				font-size: 0.9em;
			}
		}

		.custom-button {
			width: 100%;
			background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
			color: var(--on-primary-700);
			border: none;
			border-radius: 15px;
			padding: 1.2em;
			font-size: 1em;
			font-weight: 600;
			cursor: pointer;
			transition: transform 0.2s;

			&:hover {
				transform: translateY(-2px);
			}
		}
	}

	.form-section {
		.form-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 2em;

			h2 {
				margin: 0;
				font-size: 1.4em;
				font-weight: 600;
				color: var(--primary-700);
			}

			.back-button {
				background: var(--primary-100);
				border: 1px solid var(--primary-300);
				border-radius: 8px;
				padding: 0.5em 1em;
				cursor: pointer;
				font-size: 0.9em;
				color: var(--primary-700);
				transition: background 0.2s;

				&:hover {
					background: var(--primary-200);
				}
			}
		}

		form {
			display: flex;
			flex-direction: column;
			gap: 1.5em;
		}

		.input-group {
			display: flex;
			flex-direction: column;
			gap: 0.5em;

			label {
				font-weight: 600;
				color: var(--primary-700);
			}

			input,
			select {
				padding: 0.8em;
				border: 2px solid var(--primary-300);
				border-radius: 10px;
				font-size: 1em;
				transition: border-color 0.2s;
				background: var(--primary-50);
				color: var(--primary-700);

				&:focus {
					outline: none;
					border-color: var(--primary-500);
				}

				&::placeholder {
					color: var(--primary-400);
				}
			}

			small {
				color: var(--primary-500);
				font-size: 0.8em;
			}
		}

		.form-actions {
			display: flex;
			flex-direction: column;
			gap: 1em;
			margin-top: 1em;

			.generate-button {
				background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
				color: var(--on-primary-700);
				border: none;
				border-radius: 12px;
				padding: 1em;
				font-size: 1em;
				font-weight: 600;
				cursor: pointer;
				transition: transform 0.2s;

				&:hover:not(:disabled) {
					transform: translateY(-2px);
				}

				&:disabled {
					opacity: 0.6;
					cursor: not-allowed;
				}
			}

			.reset-button {
				background: var(--primary-100);
				color: var(--primary-600);
				border: 1px solid var(--primary-300);
				border-radius: 12px;
				padding: 0.8em;
				font-size: 0.9em;
				cursor: pointer;
				transition: background 0.2s;

				&:hover {
					background: var(--primary-200);
				}
			}
		}
	}

	.recap-section {
		display: flex;
		justify-content: center;
	}

	@media (max-width: 768px) {
		main {
			padding: 1em;
		}

		.content {
			gap: 1.5em;
		}

		.controls {
			padding: 1.5em;
		}

		.presets {
			.preset-grid {
				grid-template-columns: 1fr;
			}
		}
	}
</style>
