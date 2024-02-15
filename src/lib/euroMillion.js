const apiKey = '7dc04b25a4c715672d524bed88817277';

export const getResultEuromillion = async () => {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate() - 7


    try {
        const res = await fetch(`https://euromillions.api.pedromealha.dev/draws?year=${year}&dates=${year}-${`${month}`.padStart(2, '0')}-${`${day}`.padStart(2, '0')}`, {
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
