<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		playing = true,
		bars = 4,
		class: className,
		barColor = 'bg-primary',
		...rest
	}: {
		playing?: boolean;
		bars?: number;
		class?: string;
		barColor?: string;
		[key: string]: any;
	} = $props();
</script>

<div class={cn('flex items-end justify-center gap-1 h-8', className)} {...rest}>
	{#each Array.from({ length: bars }) as _, i}
		<div
			class={cn(
				'w-1 rounded-sm transition-all duration-300 ease-in-out',
				barColor,
				playing ? 'animate-audiowave' : 'h-2'
			)}
			style="animation-delay: {i * 0.15}s;"
		></div>
	{/each}
</div>

<style>
	.animate-audiowave {
		animation-name: audiowave;
		animation-duration: 1s;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	@keyframes audiowave {
		0%,
		100% {
			height: 25%;
		}
		50% {
			height: 100%;
		}
	}
</style>
