<script>
    import "../app.scss";
	import { goto } from "$app/navigation";
	import { snacks } from "$lib/stores/snacks";
	// import { user } from "$lib/stores/user";

    const pwd =  "admin"
    const user = "admin"

    let username = "";
	let password = "";

	let submitting = false;

	const login = async () => {
		submitting = true;
		try {
			if(username !== user || password !== pwd) throw new Error("Mauvais identifiants");
			await goto("/init");
		} catch (error) {
			// @ts-ignore
            console.error(error);
			snacks.error("user.not_found");
		} finally {
			submitting = false;
		}
	};
</script>

<main>
	<h1>Hummm, <br />identifiez-vous<br />🕵️</h1>
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
		<button type="submit" disabled={submitting}>S'identifier</button>
	</form>
</main>

<style lang="scss">
	form {
		display: grid;
		gap: 0.5em;
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
	}
</style>
