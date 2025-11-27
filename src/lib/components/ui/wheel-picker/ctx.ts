import { getContext, setContext } from 'svelte';

const WHEEL_GROUP_KEY = Symbol('wheel-group');

type WheelGroupContext = {
	registerItem: (value: string, node: HTMLElement) => void;
	unregisterItem: (value: string) => void;
	selectedValue: () => string | undefined;
	onSelect: (value: string) => void;
};

export function setWheelGroupContext(props: WheelGroupContext) {
	setContext(WHEEL_GROUP_KEY, props);
}

export function getWheelGroupContext() {
	return getContext<WheelGroupContext>(WHEEL_GROUP_KEY);
}
