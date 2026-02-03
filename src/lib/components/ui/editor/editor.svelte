<script lang="ts">
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';

	let {
		value = $bindable(''),
		placeholder = 'Type / for commands...',
		enableSlashCommands = true,
		class: className
	}: {
		value?: string;
		placeholder?: string;
		enableSlashCommands?: boolean;
		class?: string;
	} = $props();

	let editorEl: HTMLDivElement;
	let slashOpen = $state(false);
	let slashFilter = $state('');
	let slashPosition = $state({ top: 0, left: 0 });
	let slashStartIndex = $state(0);
	let selectedIndex = $state(0);
	let isInternalUpdate = false;

	const commands = [
		{ id: 'h1', label: 'Heading 1', insert: '# ', icon: 'H1' },
		{ id: 'h2', label: 'Heading 2', insert: '## ', icon: 'H2' },
		{ id: 'h3', label: 'Heading 3', insert: '### ', icon: 'H3' },
		{ id: 'bullet', label: 'Bullet List', insert: '- ', icon: '•' },
		{ id: 'numbered', label: 'Numbered List', insert: '1. ', icon: '1.' },
		{ id: 'quote', label: 'Quote', insert: '> ', icon: '"' },
		{ id: 'code', label: 'Code Block', insert: '```\n\n```', icon: '</>' },
		{ id: 'divider', label: 'Divider', insert: '\n---\n', icon: '—' }
	];

	let filteredCommands = $derived(
		commands.filter(
			(c) =>
				c.label.toLowerCase().includes(slashFilter.toLowerCase()) ||
				c.id.includes(slashFilter.toLowerCase())
		)
	);

	function getEditorContent(): string {
		if (!editorEl) return '';

		let text = '';
		function walk(node: Node) {
			if (node.nodeType === Node.TEXT_NODE) {
				text += node.textContent || '';
			} else if (node.nodeName === 'BR') {
				text += '\n';
			} else if (node.nodeName === 'DIV' && text.length > 0 && !text.endsWith('\n')) {
				text += '\n';
				for (const child of node.childNodes) walk(child);
			} else {
				for (const child of node.childNodes) walk(child);
			}
		}
		walk(editorEl);
		return text.replace(/\n$/, '');
	}

	function highlightMarkdown(text: string): string {
		if (!text) return '';
		return text.split('\n').map(highlightLine).join('\n');
	}

	function highlightLine(line: string): string {
		if (!line) return '<br>';
		const escaped = escapeHtml(line);

		const headingMatch = line.match(/^(#{1,3}) (.*)$/);
		if (headingMatch) {
			const level = headingMatch[1].length;
			const sizes: Record<number, string> = {
				1: 'text-2xl font-black',
				2: 'text-xl font-bold',
				3: 'text-lg font-bold'
			};
			return `<span class="syntax text-muted-foreground/50">${headingMatch[1]} </span><span class="${sizes[level]}">${highlightInline(headingMatch[2])}</span>`;
		}

		if (/^---$/.test(line)) return `<span class="syntax text-muted-foreground">${escaped}</span>`;

		if (/^> /.test(line)) {
			const text = line.replace(/^> /, '');
			return `<span class="syntax text-muted-foreground/50">&gt; </span><span class="italic text-muted-foreground border-l-2 pl-2 border-muted-foreground/30">${highlightInline(text)}</span>`;
		}

		if (/^- /.test(line)) {
			return `<span class="syntax text-muted-foreground/50">- </span><span>${highlightInline(line.substring(2))}</span>`;
		}

		if (/^\d+\. /.test(line)) {
			const match = line.match(/^(\d+\.) (.*)$/);
			return match
				? `<span class="syntax text-muted-foreground/50">${match[1]} </span><span>${highlightInline(match[2])}</span>`
				: escaped;
		}

		if (/^```/.test(line))
			return `<span class="syntax font-mono text-xs text-muted-foreground">${escaped}</span>`;

		return highlightInline(escaped);
	}

	function highlightInline(text: string): string {
		text = text.replace(
			/(\*\*\*)(.+?)(\*\*\*)/g,
			'<span class="syntax text-muted-foreground/40">$1</span><strong class="font-bold italic">$2</strong><span class="syntax text-muted-foreground/40">$3</span>'
		);
		text = text.replace(
			/(\*\*)(.+?)(\*\*)/g,
			'<span class="syntax text-muted-foreground/40">$1</span><strong class="font-semibold">$2</strong><span class="syntax text-muted-foreground/40">$3</span>'
		);
		text = text.replace(
			/(?<!\*)(\*)([^*]+?)(\*)(?!\*)/g,
			'<span class="syntax text-muted-foreground/40">$1</span><em class="italic">$2</em><span class="syntax text-muted-foreground/40">$3</span>'
		);
		text = text.replace(
			/(`)([^`]+?)(`)/g,
			'<span class="syntax text-muted-foreground/40">$1</span><code class="bg-muted px-1 py-0.5 rounded text-sm font-mono text-primary">$2</code><span class="syntax text-muted-foreground/40">$3</span>'
		);
		return text;
	}

	function escapeHtml(text: string): string {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function getCaretPosition(element: HTMLElement): number {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return 0;

		const range = selection.getRangeAt(0);
		let pos = 0;
		let found = false;

		function countNode(node: Node): void {
			if (node.nodeType === Node.TEXT_NODE) {
				pos += node.textContent?.length || 0;
			} else if (node.nodeName === 'BR') {
				pos += 1;
			} else {
				for (const child of node.childNodes) {
					countNode(child);
				}
			}
		}

		function walk(node: Node): void {
			if (found) return;

			if (node === range.startContainer) {
				if (node.nodeType === Node.TEXT_NODE) {
					pos += range.startOffset;
				} else {
					for (let i = 0; i < range.startOffset; i++) {
						if (node.childNodes[i]) {
							countNode(node.childNodes[i]);
						}
					}
				}
				found = true;
				return;
			}

			if (node.nodeType === Node.TEXT_NODE) {
				pos += node.textContent?.length || 0;
			} else if (node.nodeName === 'BR') {
				pos += 1;
			} else {
				for (const child of node.childNodes) {
					walk(child);
					if (found) return;
				}
			}
		}

		walk(element);
		return pos;
	}

	function setCaretPosition(element: HTMLElement, position: number) {
		const selection = window.getSelection();
		if (!selection) return;

		const range = document.createRange();
		let currentPos = 0;
		let found = false;

		function traverse(node: Node) {
			if (found) return;

			if (node.nodeType === Node.TEXT_NODE) {
				const len = node.textContent?.length || 0;
				if (currentPos + len >= position) {
					range.setStart(node, position - currentPos);
					range.collapse(true);
					found = true;
				} else {
					currentPos += len;
				}
			} else if (node.nodeName === 'BR') {
				if (currentPos + 1 > position) {
					range.setStartBefore(node);
					range.collapse(true);
					found = true;
				} else if (currentPos + 1 === position) {
					range.setStartAfter(node);
					range.collapse(true);
					found = true;
				} else {
					currentPos += 1;
				}
			} else {
				for (const child of node.childNodes) {
					traverse(child);
					if (found) return;
				}
			}
		}

		traverse(element);

		if (!found) {
			range.selectNodeContents(element);
			range.collapse(false);
		}

		selection.removeAllRanges();
		selection.addRange(range);
	}

	function insertCommand(cmd: (typeof commands)[0]) {
		const pos = slashStartIndex;
		const before = value.substring(0, pos);
		const after = value.substring(getCaretPosition(editorEl));

		const newValue = before + cmd.insert + after;
		isInternalUpdate = true;
		value = newValue;
		editorEl.innerHTML = highlightMarkdown(newValue);
		closeSlashMenu();

		tick().then(() => {
			const newPos = pos + cmd.insert.length - (cmd.id === 'code' ? 4 : 0);
			setCaretPosition(editorEl, newPos);
			isInternalUpdate = false;
		});
	}

	function handleInput() {
		if (!editorEl) return;
		isInternalUpdate = true;

		const pos = getCaretPosition(editorEl);
		const rawText = getEditorContent();
		value = rawText;

		const html = highlightMarkdown(rawText);
		if (editorEl.innerHTML !== html) {
			editorEl.innerHTML = html;
			setCaretPosition(editorEl, pos);
		}

		if (enableSlashCommands) checkSlashCommand(rawText, pos);
		tick().then(() => (isInternalUpdate = false));
	}

	function checkSlashCommand(text: string, caretPos: number) {
		const textBefore = text.substring(0, caretPos);
		const lastLineStart = textBefore.lastIndexOf('\n') + 1;
		const currentLine = textBefore.substring(lastLineStart);

		if (currentLine === '/') {
			slashStartIndex = caretPos - 1;
			slashFilter = '';
			selectedIndex = 0;
			slashOpen = true;
			updateSlashCoords();
		} else if (slashOpen) {
			const slashContent = text.substring(slashStartIndex + 1, caretPos);
			if (slashContent.match(/\s/) || text[slashStartIndex] !== '/') {
				closeSlashMenu();
			} else {
				slashFilter = slashContent;
				selectedIndex = 0;
				updateSlashCoords();
			}
		}
	}

	function updateSlashCoords() {
		const sel = window.getSelection();
		if (sel && sel.rangeCount > 0) {
			const rect = sel.getRangeAt(0).getBoundingClientRect();
			slashPosition = { top: rect.bottom + 5, left: rect.left };
		}
	}

	function closeSlashMenu() {
		slashOpen = false;
		slashFilter = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (slashOpen) {
			if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
				e.preventDefault();
				if (e.key === 'Escape') closeSlashMenu();
				if (e.key === 'ArrowDown')
					selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
				if (e.key === 'ArrowUp') selectedIndex = Math.max(selectedIndex - 1, 0);
				if (e.key === 'Enter' && filteredCommands[selectedIndex])
					insertCommand(filteredCommands[selectedIndex]);
			}
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			const pos = getCaretPosition(editorEl);
			const before = value.substring(0, pos);
			const after = value.substring(pos);

			isInternalUpdate = true;
			value = before + '\n' + after;
			editorEl.innerHTML = highlightMarkdown(value);
			setCaretPosition(editorEl, pos + 1);

			if (enableSlashCommands) checkSlashCommand(value, pos + 1);
			tick().then(() => (isInternalUpdate = false));
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/plain') || '';
		const pos = getCaretPosition(editorEl);
		const before = value.substring(0, pos);
		const after = value.substring(pos);

		isInternalUpdate = true;
		value = before + text + after;
		editorEl.innerHTML = highlightMarkdown(value);
		setCaretPosition(editorEl, pos + text.length);
		tick().then(() => (isInternalUpdate = false));
	}

	$effect(() => {
		if (editorEl && value !== getEditorContent() && !isInternalUpdate) {
			editorEl.innerHTML = highlightMarkdown(value);
		}
	});
</script>

<div
	class={cn(
		'relative w-full min-h-[200px] rounded-xl border bg-background p-6 shadow-sm cursor-text',
		className
	)}
	onclick={() => editorEl?.focus()}
	role="none"
>
	<div
		bind:this={editorEl}
		contenteditable="true"
		role="textbox"
		oninput={handleInput}
		onkeydown={handleKeydown}
		onpaste={handlePaste}
		class="outline-none whitespace-pre-wrap break-words leading-relaxed min-h-[150px]"
		spellcheck="false"
	></div>
	{#if !value}
		<div class="absolute top-6 left-6 text-muted-foreground/50 pointer-events-none select-none">
			{placeholder}
		</div>
	{/if}
</div>

{#if enableSlashCommands && slashOpen}
	<div
		class="fixed z-50 w-64 max-h-72 overflow-auto rounded-lg border bg-popover p-1 shadow-lg flex flex-col gap-0.5"
		style="top: {slashPosition.top}px; left: {slashPosition.left}px"
	>
		<div class="px-2 py-1.5 text-xs text-muted-foreground font-medium select-none">Blocks</div>
		{#each filteredCommands as cmd, i}
			<button
				class={cn(
					'w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-left text-sm transition-colors',
					i === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
				)}
				onmousedown={(e) => {
					e.preventDefault();
					insertCommand(cmd);
				}}
				onmouseenter={() => (selectedIndex = i)}
			>
				<span
					class="w-6 h-6 flex items-center justify-center rounded bg-background border text-[10px] font-medium shrink-0 shadow-sm"
				>
					{cmd.icon}
				</span>
				<span>{cmd.label}</span>
			</button>
		{/each}
	</div>
{/if}
