<script lang="ts">
    import { cn } from "$lib/utils";
    import type { Snippet } from "svelte";
    import * as Code from '$lib/components/ui/code';

    let { class: className, code }: {
        class?: string,
        code: string
    } = $props();

</script>

<Code.Root
        lang="svelte"
        code={code}
        class="rounded-t-none rounded-b-md border-t-0 w-full overflow-scroll bg-muted"
>
    <Code.CopyButton />
</Code.Root>