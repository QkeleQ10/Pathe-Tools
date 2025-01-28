<script setup lang="ts">
import { voices } from '@/voices';
const selectedVoices = defineModel({ default: ['default'] })

function voiceToggled(value: boolean, voiceId: string) {
	if (value) selectedVoices.value.push(voiceId)
	else selectedVoices.value.splice(selectedVoices.value.indexOf(voiceId), 1)
}
</script>

<template>
	<InputCheckbox v-for="(voice, voiceId) in voices" :modelValue="selectedVoices.some(e => e === voiceId)"
		@update:modelValue="e => voiceToggled(e, voiceId)" :identifier="voiceId">
		{{ voice.name }}
	</InputCheckbox>
</template>
