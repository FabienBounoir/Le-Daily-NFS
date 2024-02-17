<script>
	import Snacks from '$lib/components/Snacks.svelte';
	import '../../app.scss';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { user } from '$lib/stores/user';
	import { backOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	const links = [
		{
			href: '/daily',
			icon: 'fa-calendar-day',
			label: 'Daily'
		},
		{
			href: '/statistics',
			icon: 'fa-chart-simple',
			label: 'Statistiques'
		},
		{
			href: '/lunch',
			icon: 'fa-champagne-glasses',
			label: "Déjeuner d'équipe"
		},
		{
			href: '/weather',
			icon: 'fa-cloud',
			label: 'Météo'
		},
		{
			href: '/quarkus',
			icon: 'quarkus',
			label: 'Documentation Quarkus'
		}
	];

	$: current = links.find((l) => l.href.includes($page.url.pathname));

	const logout = async () => {
		await user.logout();
		await goto('/');
	};
</script>

<svelte:head>
	<title>Le Daily NFS</title>
</svelte:head>

<div class="layout">
	<nav>
		<div class="profile">
			<img src={'https://c.woopic.com/logo-orange.png'} alt="" />
		</div>

		<ul>
			{#each links as link (link.href)}
				{@const active = current === link}
				<li>
					<a
						class="cover"
						style={link.icon == 'quarkus' ? 'display: flex;' : ''}
						href={link.href}
						aria-current={active ? 'page' : undefined}
					>
						{#if link.icon != 'quarkus'}
							<i class="fa-solid {link.icon}" />
						{:else}
							<svg
								width="25"
								height="25"
								viewBox="0 0 120 120"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M99.8435 0C110.792 0.0378167 119.656 8.90756 119.687 19.856V99.8435C119.656 110.797 110.784 119.669 99.831 119.7H87.9374L82.4851 106.46H99.8435C103.478 106.413 106.413 103.478 106.46 99.8435V19.856C106.413 16.2215 103.478 13.2866 99.8435 13.2394H19.856C16.2215 13.2866 13.2866 16.2215 13.2394 19.856V99.8435C13.2866 103.478 16.2215 106.413 19.856 106.46H49.1268L59.8498 83.7872L74.6354 119.7H19.856C8.90269 119.669 0.0309467 110.797 0 99.8435V19.856C0.0309467 8.90269 8.90269 0.0309467 19.856 0H99.8435ZM79.2801 65.3271V86.6041L60.8513 75.9687L79.2801 65.3271ZM40.4194 44.0501V65.3271L21.9906 54.6854L40.4194 44.0501ZM78.2786 21.0329V42.3099L59.8498 31.6682L78.2786 21.0329Z"
									fill="var(--primary-600)"
								/>
								<path
									d="M40.4189 65.327L58.8477 75.9687L40.4189 86.604V65.327ZM79.2797 44.0501L97.7085 54.6854L79.2797 65.327V44.0501ZM41.4205 21.0328L59.8493 31.6682L41.4205 42.3098V21.0328Z"
									fill="var(--primary-600)"
								/>
								<path
									d="M40.4189 44.0501L58.8477 54.6854V75.9687L40.4189 65.3271V44.0501ZM79.2797 44.0501V65.3271L60.8509 75.9687V54.6854L79.2797 44.0501ZM59.8493 31.6682L78.2781 42.3098L59.8493 52.9515L41.4205 42.3098L59.8493 31.6682Z"
									fill="var(--primary-600)"
								/>
							</svg>
						{/if}
					</a>
				</li>
			{/each}
		</ul>

		<div class="footer">
			<i class="fa-solid fa-right-from-bracket" on:click={logout} />
		</div>
	</nav>
	<main>
		<div class="container">
			{#key current}
				<h1>
					<span in:fly|local={{ easing: backOut, x: -25 }}>
						{current?.label || 'NFS Dashboard'}
					</span>
				</h1>
			{/key}
			<div class="me">
				Bienvenue {$user.username}!
			</div>
			{#key current}
				<div style="height: 100%;" in:fly|local={{ easing: backOut, x: -50, duration: 300 }}>
					<slot />
				</div>
			{/key}
		</div>
	</main>
</div>

<Snacks />

<style lang="scss">
	.layout {
		display: grid;
		grid-template-columns: auto 1fr;
		height: 100vh;

		.profile:hover {
			cursor: pointer;
			animation: scaleColor 2s linear infinite;
		}

		@keyframes scaleColor {
			0% {
				transform: scale(1) rotate(0deg);
				filter: hue-rotate(0deg);
			}
			25% {
				transform: scale(1.2) rotate(90deg);
				filter: hue-rotate(90deg);
			}
			50% {
				transform: scale(1) rotate(180deg);
				filter: hue-rotate(180deg);
			}
			75% {
				transform: scale(1.2) rotate(270deg);
				filter: hue-rotate(270deg);
			}
			100% {
				transform: scale(1) rotate(360deg);
				filter: hue-rotate(360deg);
			}
		}

		nav {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;

			padding: 2.5rem 3rem;
			border-right: 1px solid var(--primary-100);

			ul {
				display: flex;
				flex-direction: column;
				justify-content: center;
				gap: 2rem;

				li {
					position: relative;

					width: 2.5rem;
					height: 2.5rem;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 0.5rem;
					transition-property: scale;

					i {
						color: var(--primary-600) !important;
					}

					a {
						font-size: 1.5rem;
					}

					&:has(a[aria-current='page']) {
						pointer-events: none;

						background-color: var(--primary-100);
						color: var(--on-primary-100);
					}

					&:active {
						scale: 0.9;
					}
				}
			}

			.profile {
				margin-bottom: auto;

				border-radius: 5%;
				padding: 2px;
				border: 2px solid var(--primary-500);

				img {
					display: block;

					$size: 3.25rem;
					height: $size;
					width: $size;

					object-fit: cover;
					border-radius: inherit;
				}
			}

			.footer {
				margin-top: auto;
				display: flex;
				gap: 1rem;

				i {
					cursor: pointer;

					opacity: 0.5;
					transition-property: opacity;

					&:hover {
						opacity: 0.75;
					}
				}
			}
		}

		main {
			overflow: auto;

			.container {
				padding: 3rem;
				display: flex;
				flex-direction: column;
				min-height: 100%;

				> h1 {
					font-size: 3rem;
					font-weight: 900;
					line-height: 37px;

					span {
						display: block;
						width: max-content;
					}
				}

				& > .me {
					font-weight: 100;
					font-size: 1.5rem;

					margin-bottom: 4rem;
					opacity: 0.75;
				}
			}
		}
	}
</style>
