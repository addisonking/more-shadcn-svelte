<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';

	let {
		duration = 1500,
		onComplete,
		class: className,
		children,
		fillColor = 'bg-black/10',
		onmousedown,
		onmouseup,
		ontouchstart,
		ontouchend,
		...rest
	}: {
		duration?: number;
		onComplete?: () => void;
		class?: string;
		children: Snippet;
		fillColor?: string;
		onmousedown?: (e: MouseEvent) => void;
		onmouseup?: (e: MouseEvent) => void;
		ontouchstart?: (e: TouchEvent) => void;
		ontouchend?: (e: TouchEvent) => void;
		[key: string]: any;
	} = $props();

	let isHolding = $state(false);
	let completed = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	function startHold(e: any) {
		if (completed) return;
		isHolding = true;

		timer = setTimeout(() => {
			if (isHolding) {
				completed = true;
				onComplete?.();
				setTimeout(() => {
					isHolding = false;
					completed = false;
				}, 200);
			}
		}, duration);
	}

	function cancelHold(e: any) {
		if (completed) return;
		isHolding = false;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}
</script>

<Button
	class={cn('relative overflow-hidden select-none', className)}
	onmousedown={(e) => {
		startHold(e);
		onmousedown?.(e);
	}}
	onmouseup={(e) => {
		cancelHold(e);
		onmouseup?.(e);
	}}
	onmouseleave={cancelHold}
	ontouchstart={(e) => {
		if (e.cancelable) e.preventDefault();
		startHold(e);
		ontouchstart?.(e);
	}}
	ontouchend={(e) => {
		cancelHold(e);
		ontouchend?.(e);
	}}
	{...rest}
>
	<div
		class={cn('absolute inset-0 origin-bottom pointer-events-none z-0', fillColor)}
		style:transform="scaleY({isHolding ? 1 : 0})"
		style:transition="transform {isHolding ? duration : 100}ms linear"
	></div>

	<span class="relative z-10 flex items-center gap-2 pointer-events-none">
		{@render children()}
	</span>
</Button>
