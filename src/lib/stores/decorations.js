import { writable } from 'svelte/store';

/**
 * Store pour les décorations d'avatar
 * @typedef {Object} Decoration
 * @property {string} name - Nom de la décoration
 * @property {string} formattedName - Nom formaté pour l'affichage
 * @property {string|null} downloadUrl - URL de téléchargement
 * @property {number} size - Taille du fichier
 */

/**
 * @typedef {Object} DecorationsState
 * @property {Array<Decoration>} decorations - Liste des décorations
 * @property {boolean} loading - État de chargement
 * @property {boolean} loaded - Indique si les données ont été chargées
 * @property {string|null} error - Message d'erreur éventuel
 * @property {boolean} cached - Indique si les données viennent du cache
 */

/** @type {import('svelte/store').Writable<DecorationsState>} */
const decorationsStore = writable({
    decorations: [],
    loading: false,
    loaded: false,
    error: null,
    cached: false
});

// Variable pour éviter les appels multiples simultanés
/** @type {Promise<void> | null} */
let loadingPromise = null;

/**
 * Charge les décorations depuis l'API
 * @returns {Promise<void>}
 */
async function loadDecorations() {
    // Si un chargement est déjà en cours, retourner la même promesse
    if (loadingPromise) {
        console.log('Chargement déjà en cours, utilisation de la promesse existante');
        return loadingPromise;
    }

    // Vérifier l'état actuel du store
    /** @type {DecorationsState | undefined} */
    let currentState;
    const unsubscribe = decorationsStore.subscribe(state => {
        currentState = state;
    });
    unsubscribe();

    // Si déjà chargé, ne rien faire
    if (currentState && currentState.loaded) {
        return Promise.resolve();
    }

    console.log('Début du chargement des décorations...');

    loadingPromise = performLoad();

    try {
        await loadingPromise;
    } finally {
        loadingPromise = null;
    }
}

/**
 * Effectue le chargement réel des décorations
 * @returns {Promise<void>}
 */
async function performLoad() {
    // Marquer comme en cours de chargement
    decorationsStore.update(state => ({
        ...state,
        loading: true,
        error: null
    }));

    try {
        const response = await fetch('/_api/tools/decorations');
        const data = await response.json();

        if (data.success && Array.isArray(data.decorations)) {
            decorationsStore.set({
                decorations: data.decorations,
                loading: false,
                loaded: true,
                error: null,
                cached: data.cached || false
            });

            if (data.cached) {
                console.log('Décorations chargées depuis le cache serveur');
            } else {
                console.log('Décorations chargées depuis l\'API GitHub');
            }

            if (data.fallback) {
                console.warn('API GitHub indisponible, utilisation du fallback');
            }
        } else {
            throw new Error(data.error || 'Réponse invalide du serveur');
        }
    } catch (error) {
        console.warn('Erreur lors du chargement des décorations:', error);

        // Fallback sur les décorations populaires en cas d'erreur
        const fallbackDecorations = [
            { name: 'angel', formattedName: 'Angel', downloadUrl: null, size: 0 },
            { name: 'cat_ears', formattedName: 'Cat Ears', downloadUrl: null, size: 0 },
            { name: 'devil', formattedName: 'Devil', downloadUrl: null, size: 0 },
            { name: 'fire', formattedName: 'Fire', downloadUrl: null, size: 0 },
            { name: 'lightning', formattedName: 'Lightning', downloadUrl: null, size: 0 },
            { name: 'butterflies', formattedName: 'Butterflies', downloadUrl: null, size: 0 },
            { name: 'flower_clouds', formattedName: 'Flowers', downloadUrl: null, size: 0 },
            { name: 'stardust', formattedName: 'Stars', downloadUrl: null, size: 0 },
            { name: 'hugh_the_rainbow', formattedName: 'Rainbow', downloadUrl: null, size: 0 },
            { name: 'sunflowers', formattedName: 'Sunflowers', downloadUrl: null, size: 0 },
            { name: 'snowfall', formattedName: 'Snowflake', downloadUrl: null, size: 0 },
            { name: 'pirate_captain', formattedName: 'Pirate', downloadUrl: null, size: 0 }
        ];

        decorationsStore.set({
            decorations: fallbackDecorations,
            loading: false,
            loaded: true,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            cached: false
        });
    }
}

/**
 * Force le rechargement des décorations
 * @returns {Promise<void>}
 */
async function reloadDecorations() {
    // Réinitialiser l'état et la promesse de chargement
    loadingPromise = null;
    decorationsStore.update(state => ({ ...state, loaded: false }));
    await loadDecorations();
}

export {
    decorationsStore,
    loadDecorations,
    reloadDecorations
};
