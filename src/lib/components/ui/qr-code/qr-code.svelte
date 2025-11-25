<script lang="ts">
    import { cn } from '$lib/utils';
    import qrcode from 'qrcode-generator';
    import type { Snippet } from 'svelte';

    let {
        value,
        size = 128,
        color = '#000000',
        backgroundColor = '#FFFFFF',
        errorCorrection = 'M', // 'L', 'M', 'Q', 'H'
        margin = 2, // Modules of padding
        class: className,
        logo,
        logoSize = 0.2 // Percentage of the QR code (0.2 = 20%)
    }: {
        value: string;
        size?: number;
        color?: string;
        backgroundColor?: string;
        errorCorrection?: 'L' | 'M' | 'Q' | 'H';
        margin?: number;
        class?: string;
        logo?: string | Snippet;
        logoSize?: number;
    } = $props();

    // Generate Matrix
    let matrix = $derived.by(() => {
        if (!value) return [];
        try {
            // Type 0 = Auto detect best version
            const qr = qrcode(0, errorCorrection);
            qr.addData(value);
            qr.make();

            const count = qr.getModuleCount();
            // Convert to boolean[][] for easy rendering
            const rows = [];
            for (let r = 0; r < count; r++) {
                const row = [];
                for (let c = 0; c < count; c++) {
                    row.push(qr.isDark(r, c));
                }
                rows.push(row);
            }
            return rows;
        } catch (e) {
            console.error("QR Generation failed", e);
            return [];
        }
    });

    let moduleCount = $derived(matrix.length);
    // Coordinate space size (modules + margin)
    let viewBoxSize = $derived(moduleCount + margin * 2);
</script>

<div
        class={cn("relative inline-flex items-center justify-center shrink-0", className)}
        style:width={`${size}px`}
        style:height={`${size}px`}
>
    <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            xmlns="http://www.w3.org/2000/svg"
            shape-rendering="crispEdges"
            class="h-full w-full"
    >
        <!-- Background -->
        <rect width={viewBoxSize} height={viewBoxSize} fill={backgroundColor} />

        <!-- Modules -->
        {#each matrix as row, r}
            {#each row as isDark, c}
                {#if isDark}
                    <!--
                        Optimized: We render rects at coordinate (col + margin, row + margin).
                        Each rect is 1x1 unit in the viewBox space.
                     -->
                    <rect
                            x={c + margin}
                            y={r + margin}
                            width="1"
                            height="1"
                            fill={color}
                    />
                {/if}
            {/each}
        {/each}
    </svg>

    <!-- Logo Overlay -->
    <!--
        Note: We rely on Error Correction to handle the data obscured by the logo.
        Ensure errorCorrection is set to 'H' (High) or 'Q' (Quartile) when using large logos.
    -->
    {#if logo}
        <div
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-background rounded-full p-1 shadow-sm"
                style:width={`${size * logoSize}px`}
                style:height={`${size * logoSize}px`}
        >
            {#if typeof logo === 'string'}
                <img src={logo} alt="QR Logo" class="h-full w-full object-contain" />
            {:else}
                {@render logo()}
            {/if}
        </div>
    {/if}
</div>