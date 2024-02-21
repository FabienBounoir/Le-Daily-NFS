<script>
	import Snacks from '$lib/components/Snacks.svelte';
	import myshades from '$lib/myshades/index.js';
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/user';
	import '../app.scss';

	onMount(async () => {
		if ($user && $user.color) {
			myshades({
				primary: $user.color
			});
		}
	});
</script>

<slot />
<Snacks />
