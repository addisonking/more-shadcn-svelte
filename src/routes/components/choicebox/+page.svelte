<script lang="ts">
    import * as DocPage from "$lib/components/feature/doc-page";
    import * as Choicebox from "$lib/components/ui/choicebox";
    import { Label } from "$lib/components/ui/label";
    import { Sun, Moon, Monitor, Laptop, Smartphone, Tablet } from "lucide-svelte";

    let selectedValue = $state("option-1");
    let planValue = $state("pro");
    let themeValue = $state("system");
</script>

<DocPage.Root>
    <DocPage.Header>
        <DocPage.Title>Choicebox</DocPage.Title>
        <DocPage.Description>A visual radio group for selecting complex options.</DocPage.Description>
    </DocPage.Header>

    <DocPage.Content>
        <!-- 1. Basic Vertical -->
        <DocPage.Heading>Basic Usage</DocPage.Heading>
        <DocPage.Example>
            <DocPage.Preview class="py-10">
                <div class="w-full max-w-[600px] space-y-4">
                    <Label>Select an option</Label>
                    <Choicebox.Root bind:value={selectedValue} class="grid gap-4">
                        <Choicebox.Item value="option-1" class="group items-center justify-between">
                            <div class="space-y-1">
                                <Choicebox.Title>
                                    Option 1
                                    <span class="text-xs font-normal text-muted-foreground ml-1">(the first option)</span>
                                </Choicebox.Title>
                                <Choicebox.Description>This is the first option</Choicebox.Description>
                            </div>
                            <Choicebox.Indicator />
                        </Choicebox.Item>
                        <Choicebox.Item value="option-2" class="group items-center justify-between">
                            <div class="space-y-1">
                                <Choicebox.Title>
                                    Option 2
                                    <span class="text-xs font-normal text-muted-foreground ml-1">(the second option)</span>
                                </Choicebox.Title>
                                <Choicebox.Description>This is the second option</Choicebox.Description>
                            </div>
                            <Choicebox.Indicator />
                        </Choicebox.Item>
                    </Choicebox.Root>
                </div>
            </DocPage.Preview>
            <DocPage.Code code={`<Choicebox.Root bind:value={val}>
  <Choicebox.Item value="1" class="group justify-between">
    ...content
    <Choicebox.Indicator />
  </Choicebox.Item>
</Choicebox.Root>`} />
        </DocPage.Example>

        <DocPage.Heading>Installation</DocPage.Heading>
        {@const componentName = "choicebox"}
        <DocPage.Text>Run the following command to install the `{componentName}` components:</DocPage.Text>
        <DocPage.PM command="execute" args={["shadcn-svelte@latest", "add", "https://more-shadcn.noair.fun/r/" + componentName + ".json"]} />


        <!-- 2. Inline / Grid -->
        <DocPage.Heading>Grid Layout</DocPage.Heading>
        <DocPage.Text>Use CSS grid classes on the <code>Root</code> to create horizontal card layouts.</DocPage.Text>
        <DocPage.Example>
            <DocPage.Preview>
                <div class="space-y-4 p-6">
                    <Label>Choose a Plan</Label>
                    <Choicebox.Root bind:value={planValue} class="grid grid-cols-1 sm:grid-cols-3 gap-2">

                        <!-- Basic -->
                        <Choicebox.Item value="basic" class="group flex-col items-start gap-4 h-full">
                            <div class="flex w-full items-center justify-between">
                                <Choicebox.Title>Basic</Choicebox.Title>
                                <Choicebox.Indicator />
                            </div>
                            <Choicebox.Description>
                                Essential features for individuals starting out.
                                <span class="block mt-2 font-medium text-foreground">$10/mo</span>
                            </Choicebox.Description>
                        </Choicebox.Item>

                        <!-- Pro -->
                        <Choicebox.Item value="pro" class="group flex-col items-start gap-4 h-full">
                            <div class="flex w-full items-center justify-between">
                                <Choicebox.Title>Pro</Choicebox.Title>
                                <Choicebox.Indicator />
                            </div>
                            <Choicebox.Description>
                                Perfect for growing teams and businesses.
                                <span class="block mt-2 font-medium text-foreground">$29/mo</span>
                            </Choicebox.Description>
                        </Choicebox.Item>

                        <!-- Enterprise -->
                        <Choicebox.Item value="enterprise" class="group flex-col items-start gap-4 h-full">
                            <div class="flex w-full items-center justify-between">
                                <Choicebox.Title>Enterprise</Choicebox.Title>
                                <Choicebox.Indicator />
                            </div>
                            <Choicebox.Description>
                                Advanced features and support.
                                <span class="block mt-2 font-medium text-foreground">Custom</span>
                            </Choicebox.Description>
                        </Choicebox.Item>

                    </Choicebox.Root>
                </div>
            </DocPage.Preview>
            <DocPage.Code code={`<Choicebox.Root class="grid grid-cols-3 gap-4">
  <Choicebox.Item value="basic" class="flex-col items-start">
     <div class="flex justify-between w-full">
        <Choicebox.Title>Basic</Choicebox.Title>
        <Choicebox.Indicator />
     </div>
     <Choicebox.Description>...</Choicebox.Description>
  </Choicebox.Item>
  ...
</Choicebox.Root>`} />
        </DocPage.Example>

        <!-- 3. Visual / Theme Selector -->
        <DocPage.Heading>Visual Selection</DocPage.Heading>
        <DocPage.Text>Combine icons and hidden indicators for a polished "Theme Selector" style interface.</DocPage.Text>
        <DocPage.Example>
            <DocPage.Preview class="py-10">
                <div class="w-full max-w-[600px] space-y-4">
                    <Label>Appearance</Label>
                    <Choicebox.Root bind:value={themeValue} class="grid grid-cols-3 gap-4">

                        <!-- Light -->
                        <Choicebox.Item value="light" class="group flex-col items-center justify-center text-center gap-2 p-4">
                            <Sun class="h-6 w-6 text-muted-foreground group-data-[state=checked]:text-primary mb-1" />
                            <Choicebox.Title>Light</Choicebox.Title>
                            <!-- Hidden Indicator for accessibility, but visually hidden if preferred -->
                            <div class="sr-only"><Choicebox.Indicator /></div>
                        </Choicebox.Item>

                        <!-- Dark -->
                        <Choicebox.Item value="dark" class="group flex-col items-center justify-center text-center gap-2 p-4">
                            <Moon class="h-6 w-6 text-muted-foreground group-data-[state=checked]:text-primary mb-1" />
                            <Choicebox.Title>Dark</Choicebox.Title>
                            <div class="sr-only"><Choicebox.Indicator /></div>
                        </Choicebox.Item>

                        <!-- System -->
                        <Choicebox.Item value="system" class="group flex-col items-center justify-center text-center gap-2 p-4">
                            <Laptop class="h-6 w-6 text-muted-foreground group-data-[state=checked]:text-primary mb-1" />
                            <Choicebox.Title>System</Choicebox.Title>
                            <div class="sr-only"><Choicebox.Indicator /></div>
                        </Choicebox.Item>

                    </Choicebox.Root>
                </div>
            </DocPage.Preview>
            <DocPage.Code code={`<Choicebox.Root class="grid grid-cols-3 gap-4">
  <Choicebox.Item value="light" class="flex-col items-center">
      <Sun />
      <Choicebox.Title>Light</Choicebox.Title>
  </Choicebox.Item>
  ...
</Choicebox.Root>`} />
        </DocPage.Example>
    </DocPage.Content>
</DocPage.Root>