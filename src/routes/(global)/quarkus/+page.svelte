<script>
	import { onMount } from 'svelte';

	const links = [
		'https://c.tenor.com/G-wUI6CaLgMAAAAC/tenor.gif',
		'https://c.tenor.com/zjWVauwX40EAAAAC/tenor.gif',
		'https://media1.tenor.com/m/gpvZh4v4hlMAAAAd/breakfast-tom-and-jerry.gif',
		'https://media.tenor.com/ZiPMxtVbfuoAAAAM/groundhog-animal.gif',
		'https://media.tenor.com/rI2WUJfqMuIAAAAM/cute-funny.gif',
		'https://media.tenor.com/7XZ6mDE1X20AAAAM/hamster-eating.gif',
		'https://media.tenor.com/9Hrom-q-xKsAAAAM/minions-banana.gif'
	];

	let current = links[0];

	onMount(() => {
		const interval = setInterval(() => {
			const index = links.indexOf(current);
			current = links[(index + 1) % links.length];
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

<iframe src="https://quarkus.io/guides/" allowFullScreen></iframe>

<style>
	iframe {
		width: 100%;
		height: 75vh;
		border: 2px solid var(--primary-600);
		border-radius: 0.5em;
	}
</style>
