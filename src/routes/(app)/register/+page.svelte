<script>
	import { goto } from '$app/navigation';
	import { snacks } from '$lib/stores/snacks';
	import { user } from '$lib/stores/user';

	let username = '';
	let password = '';
	let team = '';

	let submitting = false;

	const login = async () => {
		submitting = true;
		try {
			await user.register(username, password, team);
			await user.login(username, password);
			await goto('/daily');
		} catch (error) {
			snacks.error(error.message);
		} finally {
			submitting = false;
		}
	};
</script>

<main>
	<h1>Hello, <br />Qui es tu ?<br />🔎</h1>
	<form on:submit|preventDefault={login}>
		<input
			type="text"
			bind:value={username}
			autocomplete="username"
			placeholder="Nom d'utilisateur"
			disabled={submitting}
		/>
		<input
			type="password"
			bind:value={password}
			autocomplete="current-password"
			placeholder="Mot de passe"
			disabled={submitting}
		/>
		<input
			type="text"
			bind:value={team}
			autocomplete="team"
			placeholder="Nom de l'équipe"
			disabled={submitting}
		/>
		<button type="submit" disabled={submitting}>S'identifier</button>
		<span
			on:click={() => {
				goto('/');
			}}>Déjà un compte ?</span
		>
	</form>
</main>

<style lang="scss">
	form {
		display: grid;
		gap: 0.5em;

		span {
			text-align: center;
			font-size: 0.8em;

			&:hover {
				cursor: pointer;
				text-decoration: underline;
			}
		}
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
	}

	h1 {
		font-weight: 900;
		font-size: 2em;
		padding-bottom: 1em;
	}
</style>
