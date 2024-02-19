export const burgerData = async () => {
    try {
        const html = await fetch("/_api/tools/burger").then(res => res.text());
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const currentDishesDiv = tempDiv.querySelector('#current-dishes');

        const dishesArray = [];

        const subDivs = currentDishesDiv.querySelectorAll('div');

        for (let i = 0; i < subDivs.length; i++) {
            if(!subDivs[i].id.includes("current-"))  continue;
            const dishObject = {};

            const imgElement = subDivs[i].querySelector('img');
            dishObject.image = imgElement ? imgElement.getAttribute('src') : '';

            const h3Element = subDivs[i].querySelector('h3');
            dishObject.element = h3Element ? h3Element.textContent : '';

            const h2Element = subDivs[i].querySelector('h2');
            dishObject.name = h2Element ? h2Element.textContent : '';

            const pElement = subDivs[i].querySelector('.current-text p');
            dishObject.description = pElement ? pElement.textContent : '';

            dishesArray.push(dishObject);
        }

        return dishesArray;
    }
    catch (e) {
        console.error(e);
        return [];
    }
}