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
			href: '/recap',
			icon: 'fa-medal',
			label: 'Récap'
		},
		{
			href: '/wheel',
			icon: 'fa-dharmachakra',
			label: 'La roue de la MEP'
		},
		{
			href: '/burger',
			icon: 'fa-burger',
			label: 'Burger',
			user: 'nfs'
		},
		{
			href: '/quarkus',
			icon: 'quarkus',
			label: 'Documentation Quarkus',
			user: 'nfs'
		}
	];

	$: current = links.find((l) => $page.url.pathname.includes(l.href));

	const logout = async () => {
		await user.logout();
		await goto('/');
	};
</script>

<svelte:head>
	<title>Le Daily {$user?.username || ''}</title>
</svelte:head>

<div class="layout">
	<nav>
		<div class="profile">
			<svg
				width="500"
				height="500"
				viewBox="0 0 500 500"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M450 425C450 438.8 438.8 450 425 450H75C61.2 450 50 438.8 50 425V175C50 161.2 61.2 150 75 150H425C438.8 150 450 161.2 450 175V425ZM450 50V25C450 11.2 438.8 0 425 0C411.2 0 400 11.2 400 25V50H275V25C275 11.2 263.8 0 250 0C236.2 0 225 11.2 225 25V50H100V25C100 11.2 88.8 0 75 0C61.2 0 50 11.2 50 25V50C22.375 50 0 72.375 0 100V450C0 477.6 22.375 500 50 500H450C477.625 500 500 477.6 500 450V100C500 72.375 477.625 50 450 50Z"
					fill="var(--primary-600)"
				/>
			</svg>

			<p>{new Date().getDate()}</p>
		</div>

		<ul>
			{#each links as link (link.href)}
				{#if link.user && $user.username !== link.user}{:else}
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
				{/if}
			{/each}
		</ul>

		<div class="footer">
			<i
				class="fa-solid fa-palette decorations"
				on:click={() => goto('/decorations')}
				title="Décorations d'avatar"
			/>
			<i class="fa-solid fa-gear settings" on:click={() => goto('/settings')} />
			<i class="fa-solid fa-right-from-bracket" on:click={logout} />
		</div>
	</nav>
	<main>
		<div class="container">
			{#key current}
				<h1>
					<span in:fly|local={{ easing: backOut, x: -25 }}>
						{current?.label || 'Paramètre'}
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
					transition: 0.3s linear;

					&:hover {
						transform: scale(1.1);
						background-color: var(--primary-50);
					}

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
				position: relative;
				padding: 2px;

				p {
					position: absolute;
					bottom: 0;
					left: 50%;
					font-weight: 700;
					transform: translate(-50%, -50%);
				}

				svg {
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

				.settings {
					transition: transform 0.3s linear;
					&:hover {
						transform: rotate(45deg);
					}
				}

				.decorations {
					transition: transform 0.3s linear;
					&:hover {
						transform: scale(1.2);
					}
				}

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
