<script>
	export let actualKeyDown = '';
	export let actionName = 'Add User';
	export let key = 'Tab';
	export let keyName = 'Tab';
	export let action;
</script>

<div on:click={action?.()}>
	<span class={actualKeyDown == key ? 'key-down' : ''}>{keyName}</span>
	{actionName}
</div>

<style lang="scss">
	div {
		min-width: 50px;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
		cursor: pointer;

		&:hover span {
			background-color: var(--primary-600);
			color: white;
			translate: 0em 0.1em;
		}

		span {
			padding: 0.25em 0.5em;
			border: 1px solid var(--primary-600);
			border-radius: 0.25em;
			transition: all 0.2s ease-in-out;
		}

		span.key-down {
			background-color: var(--primary-600);
			color: white;
		}
	}
</style>
