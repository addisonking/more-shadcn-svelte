<script lang="ts">
	import { cn } from '$lib/utils';
	import { getSortableContext } from './ctx';
	import type { Snippet } from 'svelte';
	import { onDestroy, onMount } from 'svelte';

	let {
		id,
		class: className,
		children
	}: {
		id: string;
		class?: string;
		children: Snippet;
	} = $props();

	const ctx = getSortableContext();
	let ref: HTMLElement | undefined = $state();
	let isDragging = $derived(ctx.getDraggedId() === id);

	onMount(() => {
		if (ref) ctx.registerItem(id, ref);
	});

	onDestroy(() => {
		ctx.unregisterItem(id);
	});

	function handleDragOver(e: DragEvent) {
		ctx.onDragOver(e, id);
	}
</script>

<div
	bind:this={ref}
	data-sortable-id={id}
	class={cn(
		'relative transition-transform touch-none',
		isDragging && 'opacity-50 z-50 ring-2 ring-primary ring-offset-2 rounded-lg bg-background',
		className
	)}
	draggable="false"
	ondragstart={(e) => ctx.onDragStart(e, id)}
	ondragend={(e) => ctx.onDragEnd(e)}
	ondragover={handleDragOver}
	role="listitem"
>
	{@render children()}
</div>
