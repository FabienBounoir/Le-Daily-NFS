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
			href: '/wheel',
			icon: 'fa-dharmachakra',
			label: 'La roue de la MEP'
		},
		{
			href: '/burger',
			icon: 'fa-burger',
			label: 'Burger'
		},
		{
			href: '/quarkus',
			icon: 'quarkus',
			label: 'Documentation Quarkus'
		}
	];

	$: current = links.find((l) => $page.url.pathname.includes(l.href));

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
			<!-- <img src={'https://c.woopic.com/logo-orange.png'} alt="" /> -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				version="1.1"
				id="Layer_1"
				x="0px"
				y="0px"
				width="283.5px"
				height="283.5px"
				viewBox="0 0 283.5 283.5"
				enable-background="new 0 0 283.5 283.5"
				xml:space="preserve"
			>
				<g>
					<rect x="0" y="0" fill="var(--primary-600)" width="283.5" height="283.5" />
					<g>
						<path
							fill="#FFFFFF"
							d="M111.2,256c-4,2.6-8.4,3.9-13,3.9c-7.4,0-11.7-4.9-11.7-11.5c0-8.8,8.1-13.5,24.8-15.4v-2.2    c0-2.9-2.2-4.5-6.2-4.5c-4,0-7.3,1.6-9.6,4.5l-7-4c3.7-5.1,9.3-7.7,16.8-7.7c10.3,0,16.1,4.5,16.1,11.7c0,0,0,28.5,0,28.6h-9.2    L111.2,256z M96.6,247.7c0,2.6,1.7,5.1,4.7,5.1c3.3,0,6.4-1.4,9.6-4.2v-9.3C101.2,240.6,96.6,243,96.6,247.7z"
						/>
						<path
							fill="#FFFFFF"
							d="M129.5,221.1l8.6-1.2l0.9,4.7c4.9-3.5,8.7-5.4,13.6-5.4c8.1,0,12.3,4.3,12.3,12.8v27.5h-10.4v-25.7    c0-4.8-1.3-7-5-7c-3.1,0-6.2,1.4-9.7,4.4v28.3h-10.3V221.1z"
						/>
						<path
							fill="#FFFFFF"
							d="M233.7,260.2c-11.6,0-18.6-7.5-18.6-20.5c0-13.1,7-20.6,18.4-20.6c11.4,0,18.2,7.2,18.2,20.1    c0,0.7-0.1,1.4-0.1,2h-26.3c0.1,7.5,3.2,11.2,9.3,11.2c3.9,0,6.5-1.6,8.9-5.1l7.6,4.2C247.8,257.2,241.8,260.2,233.7,260.2z     M241.5,234.5c0-5.3-3-8.4-7.9-8.4c-4.7,0-7.6,3-8,8.4H241.5z"
						/>
						<path
							fill="#FFFFFF"
							d="M34.9,260.6c-10.3,0-19.5-6.5-19.5-20.8c0-14.3,9.3-20.8,19.5-20.8c10.3,0,19.5,6.5,19.5,20.8    C54.4,254.1,45.2,260.6,34.9,260.6z M34.9,227.7c-7.7,0-9.2,7-9.2,12c0,5.1,1.4,12,9.2,12c7.8,0,9.2-7,9.2-12    C44.1,234.7,42.6,227.7,34.9,227.7z"
						/>
						<path
							fill="#FFFFFF"
							d="M61.5,220h9.9v4.6c1.9-2.5,6.5-5.5,10.9-5.5c0.4,0,0.9,0,1.3,0.1v9.7c-0.2,0-0.3,0-0.5,0    c-4.5,0-9.5,0.7-11,4.2v26.2H61.5V220z"
						/>
						<path
							fill="#FFFFFF"
							d="M190.3,251c7.9-0.1,8.5-8.1,8.5-13.3c0-6.2-3-11.2-8.6-11.2c-3.7,0-7.9,2.7-7.9,11.6    C182.4,243,182.7,251,190.3,251z M208.9,219.9v37.4c0,6.6-0.5,17.4-19.3,17.6c-7.8,0-14.9-3.1-16.4-9.8l10.2-1.6    c0.4,1.9,1.6,3.9,7.4,3.9c5.4,0,8-2.6,8-8.7v-4.6l-0.1-0.1c-1.6,2.9-4.2,5.7-10.2,5.7c-9.2,0-16.4-6.4-16.4-19.7    c0-13.2,7.5-20.6,15.9-20.6c7.9,0,10.8,3.6,11.5,5.5l-0.1,0l0.9-4.7H208.9z"
						/>
						<path
							fill="#FFFFFF"
							d="M255.7,206.8h-4.1v11.3h-2.2v-11.3h-4.1v-1.7h10.3V206.8z M272.7,218.1h-2.2v-10.9h-0.1l-4.3,10.9h-1.4    l-4.3-10.9h-0.1v10.9h-2.2v-13h3.3l3.9,9.9l3.8-9.9h3.3V218.1z"
						/>
					</g>
				</g>
			</svg>
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
			<i class="fa-solid fa-gear" on:click={() => goto('/settings')} />
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
