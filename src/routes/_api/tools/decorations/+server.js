import { json } from '@sveltejs/kit';

// Décorations populaires triées en premier
const popularDecorations = [
	'angel',
	'cat_ears',
	'devil',
	'fire',
	'lightning',
	'butterflies',
	'flower_clouds',
	'stardust',
	'hugh_the_rainbow',
	'sunflowers',
	'snowfall',
	'pirate_captain',
	'confetti_festive'
];

/**
 * Formate le nom d'une décoration
 * @param {string} filename
 * @returns {string}
 */
function formatDecorationName(filename) {
	return filename
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Trie les décorations avec les populaires en premier
 * @param {Array<{name: string, formattedName: string, downloadUrl: string, size: number}>} decorations
 * @returns {Array<{name: string, formattedName: string, downloadUrl: string, size: number}>}
 */
function sortDecorations(decorations) {
	const popular = decorations.filter((d) => popularDecorations.includes(d.name));
	const others = decorations.filter((d) => !popularDecorations.includes(d.name));

	// Trier chaque groupe par nom formaté
	popular.sort((a, b) => a.formattedName.localeCompare(b.formattedName));
	others.sort((a, b) => a.formattedName.localeCompare(b.formattedName));

	return [...popular, ...others];
}

export async function GET() {
	try {
		const response = await fetch(
			'https://api.github.com/repos/ItsPi3141/discord-fake-avatar-decorations/contents/public/decorations',
			{
				headers: {
					'User-Agent': 'Le-Daily-NFS-App',
				}
			}
		);

		if (!response.ok) {
			throw new Error(`GitHub API responded with status: ${response.status}`);
		}

		const files = await response.json();

		if (!Array.isArray(files)) {
			throw new Error('Invalid response format from GitHub API');
		}

		// Filtrer pour ne garder que les fichiers PNG et formater les noms
		const decorations = files
			.filter((file) => file.name && file.name.endsWith('.png'))
			.map((file) => {
				const name = file.name.replace('.png', '');
				return {
					name,
					formattedName: formatDecorationName(name),
					downloadUrl: file.download_url,
					size: file.size
				};
			});

		// Trier avec les populaires en premier
		const sortedDecorations = sortDecorations(decorations);

		return json({
			success: true,
			decorations: sortedDecorations,
			count: sortedDecorations.length
		});
	} catch (error) {
		console.error('Erreur lors de la récupération des décorations:', error);

		// Fallback avec une liste de décorations populaires
		const fallbackDecorations = [
			{ name: 'angel', formattedName: 'Angel', downloadUrl: null, size: 0 },
			{ name: 'cat_ears', formattedName: 'Cat Ears', downloadUrl: null, size: 0 },
			{ name: 'devil', formattedName: 'Devil', downloadUrl: null, size: 0 },
			{ name: 'fire', formattedName: 'Fire', downloadUrl: null, size: 0 },
			{ name: 'lightning', formattedName: 'Lightning', downloadUrl: null, size: 0 },
			{ name: 'butterflies', formattedName: 'Butterflies', downloadUrl: null, size: 0 },
			{ name: 'flower_clouds', formattedName: 'Flower Clouds', downloadUrl: null, size: 0 },
			{ name: 'stardust', formattedName: 'Stardust', downloadUrl: null, size: 0 },
			{ name: 'hugh_the_rainbow', formattedName: 'Hugh The Rainbow', downloadUrl: null, size: 0 },
			{ name: 'sunflowers', formattedName: 'Sunflowers', downloadUrl: null, size: 0 },
			{ name: 'snowfall', formattedName: 'Snowfall', downloadUrl: null, size: 0 },
			{ name: 'pirate_captain', formattedName: 'Pirate Captain', downloadUrl: null, size: 0 },
			{ name: 'confetti_festive', formattedName: 'Confetti Festive', downloadUrl: null, size: 0 }
		];

		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
				decorations: fallbackDecorations,
				count: fallbackDecorations.length,
				fallback: true
			},
			{ status: 500 }
		);
	}
}
