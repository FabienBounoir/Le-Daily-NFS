import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const query = url.searchParams.get('q');
    const limit = url.searchParams.get('limit') || '20';

    if (!query) {
        return json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;
    console.log('TENOR_API_KEY:', TENOR_API_KEY);

    if (!TENOR_API_KEY) {
        console.error('TENOR_API_KEY not found in environment variables');
        return json({ error: 'API configuration error' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}&media_filter=gif`
        );

        if (!response.ok) {
            throw new Error(`Tenor API error: ${response.status}`);
        }

        const data = await response.json();

        // @ts-ignore
        const filteredResults = data.results?.map(gif => ({
            id: gif.id,
            content_description: gif.content_description,
            url: gif.media_formats?.gif?.url,
            preview_url: gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url,
            dimensions: gif.media_formats?.gif?.dims
        })) || [];

        return json({
            results: filteredResults,
            next: data.next
        });

    } catch (error) {
        console.error('Error fetching GIFs from Tenor:', error);
        return json({ error: 'Failed to fetch GIFs' }, { status: 500 });
    }
}
