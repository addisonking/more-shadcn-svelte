<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let { class: className, children }: { class?: string; children: Snippet } = $props();
</script>

<div class={cn('relative flex h-[200px] w-full overflow-hidden bg-background', className)}>
	<div
		class="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 w-full bg-muted/20 border-y border-border/50 z-10"
	/>

	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent z-20"
	/>
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-20"
	/>

	<div class="flex h-full w-full justify-center px-4">
		{@render children()}
	</div>
</div>
