import { getContext, setContext } from 'svelte';

const AUDIO_WAVE_KEY = Symbol('audio-wave');

type AudioWaveContext = {
	isPlaying: () => boolean;
};

export function setAudioWaveContext(props: AudioWaveContext) {
	setContext(AUDIO_WAVE_KEY, props);
}

export function getAudioWaveContext() {
	return getContext<AudioWaveContext>(AUDIO_WAVE_KEY);
}
