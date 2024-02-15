const apiKey = '7dc04b25a4c715672d524bed88817277';

export const getWeather = async (city) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const res = await fetch(apiUrl)

        if (!res.ok) {
            throw new Error('City not found');
        }

        return res.json();

    } catch (error) {
        throw new Error('City not found');
    }
}
