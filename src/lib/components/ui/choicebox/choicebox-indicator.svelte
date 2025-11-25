<script lang="ts">
    import { cn } from "$lib/utils";

    // We don't need logic here, CSS in the parent Item handles the checked state visualization
    // via group-data attributes, or we can just style this element based on parent state.
    // However, simplest is to let this be dumb and receive styles from parent context via CSS cascade
    // or just render the circles.

    let { class: className }: { class?: string } = $props();
</script>

<div class={cn("flex shrink-0 items-center justify-center", className)}>
    <!-- Outer Ring -->
    <div
            class="h-4 w-4 rounded-full border border-primary text-primary shadow-sm flex items-center justify-center ring-offset-background"
    >
        <!-- Inner Dot (Only visible when parent is checked) -->
        <div class="h-2 w-2 rounded-full bg-primary opacity-0 scale-0 transition-all duration-200 group-data-[state=checked]:opacity-100 group-data-[state=checked]:scale-100" />
    </div>
</div>