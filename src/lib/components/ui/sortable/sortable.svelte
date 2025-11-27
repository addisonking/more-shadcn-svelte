<script lang="ts">
	import { cn } from '$lib/utils';
	import { setSortableContext } from './ctx';
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';

	let {
		items = $bindable([]),
		class: className,
		children,
		onSort,
		animation = 200,
		orientation = 'vertical'
	}: {
		items: any[];
		class?: string;
		children: Snippet;
		onSort?: (items: any[]) => void;
		animation?: number;
		orientation?: 'vertical' | 'horizontal' | 'mixed';
	} = $props();

	let draggedId = $state<string | null>(null);
	let itemNodes = new Map<string, HTMLElement>();

	function swapItems(fromIndex: number, toIndex: number) {
		const newItems = [...items];
		const [moved] = newItems.splice(fromIndex, 1);
		newItems.splice(toIndex, 0, moved);
		items = newItems;
		onSort?.(newItems);
	}

	setSortableContext({
		getDraggedId: () => draggedId,
		registerItem: (id, node) => itemNodes.set(id, node),
		unregisterItem: (id) => itemNodes.delete(id),

		onDragStart: (e, id) => {
			draggedId = id;
			document.body.style.cursor = 'grabbing';

			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = 'move';
				const img = new Image();
				img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
				e.dataTransfer.setDragImage(img, 0, 0);
			}
		},

		onDragOver: async (e, targetId) => {
			e.preventDefault();
			if (!draggedId || draggedId === targetId) return;

			const targetNode = itemNodes.get(targetId);
			if (!targetNode) return;

			const rect = targetNode.getBoundingClientRect();

			const midY = rect.top + rect.height / 2;
			const midX = rect.left + rect.width / 2;

			const fromIdx = items.findIndex((i) => i.id === draggedId);
			const toIdx = items.findIndex((i) => i.id === targetId);

			if (fromIdx === -1 || toIdx === -1) return;

			const isVertical = orientation === 'vertical';

			if (isVertical) {
				if (fromIdx < toIdx && e.clientY < midY) return;
				if (fromIdx > toIdx && e.clientY > midY) return;
			} else {
				if (fromIdx < toIdx && e.clientX < midX) return;
				if (fromIdx > toIdx && e.clientX > midX) return;
			}

			const currentPositions = new Map<string, DOMRect>();
			itemNodes.forEach((node, id) => {
				currentPositions.set(id, node.getBoundingClientRect());
			});

			swapItems(fromIdx, toIdx);
			await tick();

			itemNodes.forEach((node, id) => {
				const oldRect = currentPositions.get(id);
				if (oldRect) {
					const newRect = node.getBoundingClientRect();
					const diffX = oldRect.left - newRect.left;
					const diffY = oldRect.top - newRect.top;

					if (Math.abs(diffX) > 0 || Math.abs(diffY) > 0) {
						node.style.transform = `translate(${diffX}px, ${diffY}px)`;
						node.style.transition = 'none';

						requestAnimationFrame(() => {
							node.style.transform = '';
							node.style.transition = `transform ${animation}ms cubic-bezier(0.2, 0, 0, 1)`;
						});
					}
				}
			});
		},

		onDragEnd: () => {
			draggedId = null;
			document.body.style.cursor = '';
		}
	});

	function handleContainerDragOver(e: DragEvent) {
		e.preventDefault();
	}
</script>

<div
	class={cn(
		'relative flex',
		orientation === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-4',
		className
	)}
	ondragover={handleContainerDragOver}
	role="list"
>
	{@render children()}
</div>
