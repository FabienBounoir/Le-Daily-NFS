const apiKey = '7dc04b25a4c715672d524bed88817277';

export const getDailyQweerte = async () => {
    try {
        const res = await fetch(`/_api/tools/qwertee`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })

        if (!res.ok) {
            throw new Error('Error fetching the results');
        }

        return res.json();
    } catch (error) {
        throw new Error('Error fetching the results');
    }
}
