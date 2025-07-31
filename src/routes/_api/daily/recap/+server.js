import { json } from '@sveltejs/kit';
import { recapService } from '$lib/server/services/recap.service.js';

export async function GET({ url, locals }) {
    try {
        const team = url.searchParams.get('team');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const speakerName = url.searchParams.get('speaker');

        if (!team || !startDate || !endDate) {
            return json({ error: 'team, startDate et endDate sont requis' }, { status: 400 });
        }

        const recap = await recapService.generateRecap(
            team,
            new Date(startDate),
            new Date(endDate),
            speakerName
        );

        // Générer les citations fun
        recap.funQuotes = recapService.generateFunQuotes(recap);

        return json(recap);
    } catch (error) {
        console.error('Erreur lors de la génération du récap:', error);
        return json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
