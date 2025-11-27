<script lang="ts">
	import { cn } from '$lib/utils';
	import { setWheelGroupContext } from './ctx';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	let {
		value = $bindable(),
		class: className,
		children,
		onValueChange
	}: {
		value?: string;
		class?: string;
		children: Snippet;
		onValueChange?: (val: string) => void;
	} = $props();

	let scrollRef: HTMLElement | undefined = $state();
	let items = new Map<string, HTMLElement>();
	let isInternalScroll = false;
	let observer: IntersectionObserver;

	let isDragging = $state(false);
	let startY = 0;
	let startScrollTop = 0;

	let lastY = 0;
	let lastTime = 0;
	let velocity = 0;
	let inertiaFrame: number;

	let scrollTargetIndex: number | null = null;
	let wheelTimeout: ReturnType<typeof setTimeout>;

	setWheelGroupContext({
		registerItem: (val, node) => items.set(val, node),
		unregisterItem: (val) => items.delete(val),
		selectedValue: () => value,
		onSelect: (val) => scrollToValue(val)
	});

	$effect(() => {
		if (value && !isDragging && !isInternalScroll) {
			scrollToValue(value);
		}
	});

	function safeScrollTo(node: HTMLElement, behavior: ScrollBehavior = 'smooth') {
		if (!scrollRef) return;
		const top = node.offsetTop - scrollRef.clientHeight / 2 + node.clientHeight / 2;

		scrollRef.scrollTo({ top, behavior });
	}

	function syncScrollToValue() {
		if (!scrollRef) return;
		const containerCenter = scrollRef.scrollTop + scrollRef.clientHeight / 2;
		let closestDist = Infinity;
		let closestValue: string | undefined;

		for (const [val, node] of items.entries()) {
			const itemCenter = node.offsetTop + node.clientHeight / 2;
			const dist = Math.abs(containerCenter - itemCenter);
			if (dist < closestDist) {
				closestDist = dist;
				closestValue = val;
			}
		}

		if (closestValue && closestValue !== value) {
			value = closestValue;
			onValueChange?.(closestValue);
		}
	}

	function scrollToValue(val: string | undefined) {
		if (!val || !scrollRef || isDragging) return;
		const node = items.get(val);
		if (node) {
			const itemTop = node.offsetTop;
			const containerCenter = scrollRef.scrollTop + scrollRef.clientHeight / 2;
			const elementCenter = itemTop + node.clientHeight / 2;

			if (Math.abs(containerCenter - elementCenter) < 2) return;

			isInternalScroll = true;
			safeScrollTo(node, 'smooth');

			scrollTargetIndex = null;
			cancelAnimationFrame(inertiaFrame);
			setTimeout(() => {
				isInternalScroll = false;
			}, 300);
		}
	}

	function onWheel(e: WheelEvent) {
		if (!scrollRef || isDragging) return;
		e.preventDefault();
		const itemHeight = 32;
		const direction = Math.sign(e.deltaY);

		if (scrollTargetIndex === null) {
			scrollTargetIndex = Math.round(scrollRef.scrollTop / itemHeight);
		}
		scrollTargetIndex += direction;
		const maxIndex = items.size - 1;
		scrollTargetIndex = Math.max(0, Math.min(scrollTargetIndex, maxIndex));

		scrollRef.scrollTo({ top: scrollTargetIndex * itemHeight, behavior: 'smooth' });

		clearTimeout(wheelTimeout);
		wheelTimeout = setTimeout(() => {
			scrollTargetIndex = null;
			syncScrollToValue();
		}, 200);
	}

	function onMouseDown(e: MouseEvent) {
		if (!scrollRef) return;
		isDragging = true;
		startY = e.clientY;
		startScrollTop = scrollRef.scrollTop;
		scrollTargetIndex = null;

		lastY = e.clientY;
		lastTime = Date.now();
		velocity = 0;
		cancelAnimationFrame(inertiaFrame);

		scrollRef.style.scrollSnapType = 'none';
		document.body.style.cursor = 'grabbing';
		document.body.style.userSelect = 'none';

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	function onMouseMove(e: MouseEvent) {
		if (!isDragging || !scrollRef) return;
		e.preventDefault();
		const delta = startY - e.clientY;
		scrollRef.scrollTop = startScrollTop + delta;

		const now = Date.now();
		const dt = now - lastTime;
		if (dt > 0) {
			velocity = (e.clientY - lastY) / dt;
			lastY = e.clientY;
			lastTime = now;
		}
	}

	function onMouseUp() {
		if (!isDragging || !scrollRef) return;
		isDragging = false;

		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);

		if (Math.abs(velocity) > 0.1) {
			applyInertia();
		} else {
			snapToNearest();
		}
	}

	function applyInertia() {
		if (!scrollRef) return;
		const friction = 0.95;
		const step = () => {
			if (!scrollRef) return;
			if (Math.abs(velocity) < 0.05) {
				snapToNearest();
				return;
			}
			scrollRef.scrollTop -= velocity * 16;
			velocity *= friction;
			inertiaFrame = requestAnimationFrame(step);
		};
		step();
	}

	function snapToNearest() {
		if (!scrollRef) return;
		const itemHeight = 32;
		const nearestIndex = Math.round(scrollRef.scrollTop / itemHeight);

		scrollRef.scrollTo({
			top: nearestIndex * itemHeight,
			behavior: 'smooth'
		});

		setTimeout(() => {
			syncScrollToValue();
			if (scrollRef) scrollRef.style.scrollSnapType = '';
		}, 300);
	}

	onMount(() => {
		if (value) {
			const node = items.get(value);
			if (node) safeScrollTo(node, 'instant');
		}

		observer = new IntersectionObserver(
			(entries) => {
				if (isInternalScroll || isDragging || scrollTargetIndex !== null || velocity !== 0) return;

				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const val = entry.target.getAttribute('data-value');
						if (val && val !== value) {
							value = val;
							onValueChange?.(val);
						}
					}
				});
			},
			{
				root: scrollRef,
				threshold: 0.5,
				rootMargin: '-45% 0px -45% 0px'
			}
		);

		items.forEach((node) => observer.observe(node));

		return () => {
			observer.disconnect();
			cancelAnimationFrame(inertiaFrame);
			if (isDragging) onMouseUp();
		};
	});
</script>

<div
	bind:this={scrollRef}
	class={cn(
		'no-scrollbar flex-1 h-full overflow-y-scroll snap-y snap-mandatory min-w-0 cursor-grab active:cursor-grabbing',
		'py-[84px]',
		className
	)}
	onwheel={onWheel}
	onmousedown={onMouseDown}
	role="presentation"
>
	{@render children()}
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
