<script>
	import { burgerData } from "$lib/burger";
	import { onMount } from "svelte";
    import { fly, scale } from 'svelte/transition';

    
    /**
	 * @type {string | any[] | null}
	 */
    let formatedResponse = null
    
    onMount(async () => {
        formatedResponse = await burgerData()
    })

    const getWednesdayOfweek = () => {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day == 0 ? -6 : 3); // adjust when day is sunday
        const wednesday = new Date(date.setDate(diff));
        return wednesday.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

</script>

<p>Voici les plats de notre très chère <a href="https://www.truck-2-food.fr/">Truck 2 Food</a> pour le <b>{getWednesdayOfweek()}</b></p> 
<section>
{#if formatedResponse}
    {#if formatedResponse.length === 0}
        <div>
            <h1>Erreur</h1>
            <p>Aucun plat n'a été trouvé</p>
        </div>
    {:else}


    {#each formatedResponse as dish}
        <div in:scale={{ duration: 20000, opacity: 0 }}>
            <h1>{dish.element}</h1>
            <img src={dish.image} alt={dish.name} />
            <h2>{dish.name}</h2>
            <br/>
            <p>{dish.description}</p>
        </div>
    {/each}
    {/if}
{:else}
<h1>loading...</h1>

{/if}
</section>

<style lang="scss">
    img{
        width: 400px;
        border-radius: 0.5em;
    }

    a,b{
        color: var(--primary-700);
        font-weight: bold;
    }

    section{
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        gap:1em;
        margin-top: 1em;
        
        h1{
            font-size: 2em;
            text-align: left;
            font-weight: bold;
        }

        h2{
            font-size: 1.2em;
            text-align: left;
            font-weight: bold;
        }
        
        div{
            max-width: min-content;
            align-items: center;
            display: flex;
            flex-direction: column;
            background-color: var(--primary-100);
            padding: 0.5em;
            border-radius: 1em;
            align-items: left;
        }

        p{
            text-wrap: wrap;
        }
    }

</style>
