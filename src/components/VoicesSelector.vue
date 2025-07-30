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
	<div class="scrollable-list">
		<InputCheckbox class="label-end" v-for="[id, voice] in Object.entries(voices).filter(([id, voice]) => voice.name)" :key="id"
			:modelValue="model.includes(id)" @update:modelValue="event => voiceToggled(event, id)" :identifier="id">
			{{ voice.name }}
		</InputCheckbox>
	</div>
</template>
