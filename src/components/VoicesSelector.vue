<script setup lang="ts">
import { voices } from '@/utils/voices';

const model = defineModel<string[]>({ default: ['default'] });

function voiceToggled(value: boolean, voiceId: string): void {
	if (value) {
		model.value.push(voiceId);
	} else {
		const index = model.value.indexOf(voiceId);
		if (index > -1) {
			model.value.splice(index, 1);
		}
	}
}
</script>

<template>
	<InputCheckbox v-for="(voice, voiceId) in voices" :key="voiceId" :modelValue="model.includes(voiceId)"
		@update:modelValue="e => voiceToggled(e, voiceId)" :identifier="voiceId">
		{{ voice.name }}
	</InputCheckbox>
</template>
