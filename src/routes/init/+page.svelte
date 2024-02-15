<script>
	import { goto } from "$app/navigation";

	let names = [
		"Fabien",
		"Thomas",
		"Emily",
		"Eoghean",
		"Guillaume",
		"Samy",
		"Damien",
		"Ihor",
		"Cédric",
		"Maxime",
		"Benjamin"
	]

	let timeByUser = 120;
	const randomized = true

	const start = async () => {
		let randomisedNames = names
		if(randomized) randomisedNames.sort(() => Math.random() - 0.5)
		
		await goto(`/start?names=${randomisedNames.join(",")}&time=${timeByUser}`);
	};
</script>

<svelte:head>
	<title>Configuration</title>
	<meta name="description" content="Configure le daily NFS" />
</svelte:head>

<section>
	<h1>Le daily NFS</h1>

	<div class="names">
		{#each names as name}
			<p>{name} <button
				on:click={() => names = names.filter(n => n !== name)}
				>X</button></p>
		{/each}

		<input
			on:keydown={(e) => {
				if (e.key === "Enter") {
					names = [...names, e.target.value]
					e.target.value = ""
				}
			}}
			placeholder="Ajouter un nom"
		/>
	</div>

	<button on:click={() => start()}>Start Daily</button>


</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	.names{
		border: 1px solid #000;
		border-radius: 5px;
		padding: 10px;
	}

	.names p {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 5px;
		justify-content: space-between;
	}

	.names button {
		width: min-content !important;
	}

	h1 {
		width: 100%;
		text-align: center;
	}



</style>
