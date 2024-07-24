<script>
	import Key from './Key.svelte';

	/**
	 * @typedef {Object} KeyAction
	 * @property {string} actionName - The name of the action associated with the key.
	 * @property {string} key - The key code of the action.
	 * @property {string} keyName - The display name of the key.
	 * @property {function} action - The function to be executed when the key is pressed.
	 */

	/**
	 * An array of key actions.
	 * @type {KeyAction[]}
	 */
	export let keysArray = [];
	export let actualKeyDown = '';
</script>

<div id="infoKeys">
	{#each keysArray as keyInfo}
		<Key
			action={keyInfo.action}
			actionName={keyInfo.actionName}
			{actualKeyDown}
			key={keyInfo.key}
			keyName={keyInfo.keyName}
		/>
	{/each}
</div>

<style lang="scss">
	#infoKeys {
		position: fixed;
		bottom: 0;
		right: 0;
		padding: 1em;
		display: flex;
		gap: 1em;

		div {
			min-width: 50px;
			margin: 0;
			padding: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.5em;

			span {
				padding: 0.25em 0.5em;
				border: 1px solid var(--primary-600);
				border-radius: 0.25em;
			}

			span.key-down {
				background-color: var(--primary-600);
				color: white;
			}
		}
	}
</style>
