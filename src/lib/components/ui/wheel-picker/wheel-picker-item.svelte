<script lang="ts">
	import { cn } from '$lib/utils';
	import { getWheelGroupContext } from './ctx';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	let {
		value,
		class: className,
		children
	}: {
		value: string;
		class?: string;
		children: Snippet;
	} = $props();

	const ctx = getWheelGroupContext();
	let ref: HTMLElement | undefined = $state();
	let isSelected = $derived(ctx.selectedValue() === value);

	onMount(() => {
		if (ref) ctx.registerItem(value, ref);
		return () => ctx.unregisterItem(value);
	});

	function handleClick() {
		ctx.onSelect(value);
	}
</script>

<div
	bind:this={ref}
	data-value={value}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	class={cn(
		'flex h-8 min-h-[32px] w-full items-center justify-center snap-center text-sm transition-all duration-150 cursor-pointer select-none',
		isSelected
			? 'text-foreground font-semibold scale-100 opacity-100'
			: 'text-muted-foreground scale-90 opacity-40',
		className
	)}
>
	{@render children()}
</div>
