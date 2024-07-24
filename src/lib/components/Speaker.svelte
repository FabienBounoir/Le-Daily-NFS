<script>
	import { onMount } from 'svelte';
	import { blur, fly, scale } from 'svelte/transition';
	import { user } from '$lib/stores/user';

	export let names;
	export let i;

	$: currentSpeaker = names[i];
</script>

<div class="actualSpeaker">
	{#if $user?.avatars && $user?.avatars[currentSpeaker]}
		<img
			in:blur={{ duration: 500, opacity: 0 }}
			src={'/avatar/' + $user?.avatars[currentSpeaker]}
			alt="Jira Avatar"
			on:error={() => {
				$user.avatars[currentSpeaker] = null;
			}}
		/>
	{/if}
	<div>
		{#key currentSpeaker}
			<p in:fly={{ duration: 300, x: 20, y: 0, opacity: 0 }}>
				{i > 0 ? names[i - 1] : ''}
			</p>
			<p in:scale={{ duration: 300, opacity: 0 }}>
				{currentSpeaker}
			</p>
			<p in:fly={{ duration: 300, x: 20, y: 0, opacity: 0 }}>
				{i + 1 < names.length ? names[i + 1] : ''}
			</p>
		{/key}
	</div>
</div>

<style>
	.actualSpeaker {
		text-align: center;
	}
	img {
		width: 100px;
		height: 100px;
		border-radius: 50%;
	}
	p {
		font-size: 2em;
	}
</style>
