<script>
	import Weather from '$lib/components/Weather.svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';
</script>

<section>
	<Weather city="Sophia Antipolis" />
	<Weather city="Montpellier" />
	<Weather city="Aix-en-provence" />
	<Weather city="Monaco" />
	<Weather city="Toulon" />
</section>

<style lang="scss">
	section {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2em;
	}
</style>
