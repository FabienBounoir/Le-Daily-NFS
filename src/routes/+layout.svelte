<script>
	import Snacks from "$lib/components/Snacks.svelte";
	// import "$lib/locale";
	import "../app.scss";
</script>

<svelte:head>
	<title>Le Daily NFS</title>
</svelte:head>

<slot />
<Snacks />
