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

<section>
	<div class="page-grid">
		<!-- Panneau de configuration -->
		<div class="card card-controls">
			{#if showPresets}
				<div class="card-header" in:slide={{ duration: 300 }}>
					<span class="card-icon">⚡</span>
					<div>
						<h2>Périodes rapides</h2>
						<p class="card-desc">Sélectionne une période prédéfinie</p>
					</div>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<span class="help-btn" on:click={() => (showHelpModal = true)} title="Comment ça marche ?">❓</span>
				</div>

				<div class="preset-grid" in:slide={{ duration: 300 }}>
					{#each presets as preset}
						<button
							class="preset-btn"
							on:click={() => selectPreset(preset)}
							in:scale={{ duration: 200, delay: presets.indexOf(preset) * 50 }}
						>
							<span class="preset-icon">{preset.icon}</span>
							<span class="preset-name">{preset.name}</span>
						</button>
					{/each}
				</div>

				<div class="divider"><span>ou</span></div>

				<button
					class="btn-custom-period"
					on:click={() => { customPeriod = true; showPresets = false; }}
				>
					📅 Période personnalisée
				</button>
			{:else}
				<div class="card-header" in:slide={{ duration: 300 }}>
					<span class="card-icon">🎨</span>
					<div>
						<h2>Configuration</h2>
						<p class="card-desc">Paramètres du récap</p>
					</div>
				</div>

				<form class="recap-form" on:submit|preventDefault={generateRecap} in:slide={{ duration: 300 }}>
					<div class="input-group">
						<label for="startDate">Date de début</label>
						<input type="date" id="startDate" bind:value={startDate} required />
					</div>

					<div class="input-group">
						<label for="endDate">Date de fin</label>
						<input type="date" id="endDate" bind:value={endDate} required />
					</div>

					<div class="input-group">
						<label for="speaker">Speaker <span class="optional">(optionnel)</span></label>
						<select id="speaker" bind:value={selectedSpeaker}>
							<option value="">Toute l'équipe</option>
							{#each speakers as speaker}
								{#if !speaker.removed}
									<option value={speaker.name}>{speaker.name}</option>
								{/if}
							{/each}
						</select>
					</div>

					<button
						type="submit"
						class="btn-generate"
						disabled={isLoading || !startDate || !endDate}
					>
						{isLoading ? '⏳ Génération…' : '🚀 Générer le récap'}
					</button>

					{#if recap}
						<button type="button" class="btn-reset" on:click={resetForm}>
							🔄 Nouveau récap
						</button>
					{/if}

					<button
						type="button"
						class="btn-back"
						on:click={() => { showPresets = true; resetForm(); }}
					>← Retour aux périodes rapides</button>
				</form>
			{/if}
		</div>

		<!-- Résultat -->
		<div class="card card-result">
			<div class="card-header">
				<span class="card-icon">📊</span>
				<div>
					<h2>Résultat</h2>
					<p class="card-desc">Votre carte récap générée</p>
				</div>
			</div>
			<div class="recap-container">
				<RecapCard {recap} {isLoading} on:download={downloadRecap} />
			</div>
		</div>
	</div>

	<HelpModal bind:visible={showHelpModal} />
</section>

<style lang="scss">
	/* ── Layout ── */
	section {
		display: flex;
		flex-direction: column;
		gap: 1.5em;
	}

	.page-grid {
		display: grid;
		grid-template-columns: 360px 1fr;
		gap: 1.25em;
		align-items: start;

		@media (max-width: 900px) {
			grid-template-columns: 1fr;
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

	.card-controls {
		position: sticky;
		top: 1.5em;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.75em;

		h2 {
			margin: 0;
			font-size: 1.1rem;
			font-weight: 700;
		}

		.card-desc {
			margin: 0;
			font-size: 0.875rem;
			opacity: 0.70;
		}

		.help-btn {
			margin-left: auto;
			cursor: pointer;
			font-size: 1.1rem;
			opacity: 0.7;
			transition: opacity 0.15s;
			user-select: none;

			&:hover { opacity: 1; }
		}
	}

	.card-icon {
		font-size: 1.4rem;
		line-height: 1;
		flex-shrink: 0;
	}

	/* ── Presets ── */
	.preset-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75em;
	}

	.preset-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4em;
		padding: 1em 0.75em;
		background: var(--primary-100);
		border: 1px solid var(--primary-200);
		border-radius: 0.75em;
		cursor: pointer;
		transition: background 0.15s, transform 0.15s;
		user-select: none;
		color: inherit;

		&:hover {
			background: var(--primary-200);
			transform: translateY(-2px);
		}
	}

	.preset-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.preset-name {
		font-size: 0.82rem;
		font-weight: 600;
		text-align: center;
	}

	/* ── Divider ── */
	.divider {
		position: relative;
		text-align: center;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 1px;
			background: var(--primary-200);
		}

		span {
			position: relative;
			background: var(--primary-50);
			padding: 0 0.75em;
			font-size: 0.8rem;
			color: var(--primary-400);
		}
	}

	/* ── Buttons ── */
	.btn-custom-period {
		width: 100%;
		padding: 0.85em;
		background: var(--primary-600);
		color: white;
		border: none;
		border-radius: 0.75em;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s, opacity 0.2s;
		user-select: none;

		&:hover { background: var(--primary-700); }
	}

	.btn-back {
		align-self: flex-start;
		background: none;
		border: none;
		padding: 0;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		color: var(--primary-500);
		transition: color 0.15s;
		user-select: none;

		&:hover { color: var(--primary-700); }
	}

	.btn-generate {
		width: 100%;
		padding: 0.85em;
		background: var(--primary-600);
		color: white;
		border: none;
		border-radius: 0.75em;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s, opacity 0.2s;
		user-select: none;

		&:hover:not(:disabled) { background: var(--primary-700); }

		&:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}
	}

	.btn-reset {
		width: 100%;
		padding: 0.75em;
		background: var(--primary-100);
		color: inherit;
		border: 1px solid var(--primary-200);
		border-radius: 0.75em;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
		user-select: none;

		&:hover { background: var(--primary-200); }
	}

	/* ── Form ── */
	.recap-form {
		display: flex;
		flex-direction: column;
		gap: 1.1em;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.4em;

		label {
			font-size: 0.875rem;
			font-weight: 600;

			.optional {
				font-weight: 400;
				opacity: 0.60;
				font-size: 0.85em;
			}
		}

		input,
		select {
			padding: 0.65em 0.85em;
			border: 1px solid var(--primary-200);
			border-radius: 0.6em;
			font-size: 0.95rem;
			background: var(--primary-100);
			color: inherit;
			transition: border-color 0.15s;

			&:focus {
				outline: none;
				border-color: var(--primary-500);
			}
		}
	}

	/* ── Result card ── */
	.recap-container {
		display: flex;
		justify-content: center;
	}
</style>
