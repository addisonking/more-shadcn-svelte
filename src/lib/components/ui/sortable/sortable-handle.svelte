<script lang="ts">
	import { cn } from '$lib/utils';
	import { GripVertical } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();

	function setDraggable(e: MouseEvent | TouchEvent) {
		const item = (e.target as HTMLElement).closest('[data-sortable-id]') as HTMLElement;
		if (item) item.draggable = true;
	}

	function unsetDraggable(e: MouseEvent | TouchEvent) {
		const item = (e.target as HTMLElement).closest('[data-sortable-id]') as HTMLElement;
		if (item) item.draggable = false;
	}
</script>

<div
	class={cn(
		'cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none',
		className
	)}
	onmousedown={setDraggable}
	onmouseup={unsetDraggable}
	onmouseleave={unsetDraggable}
	ontouchstart={setDraggable}
	ontouchend={unsetDraggable}
	role="button"
	tabindex="0"
	aria-label="Drag to reorder"
>
	{#if children}
		{@render children()}
	{:else}
		<GripVertical class="h-4 w-4" />
	{/if}
</div>
