<script setup lang="ts">
import { computed, ref } from 'vue';
import { addImportedVoiceFromUrl, getSelectableVoiceEntries, removeImportedVoice, defaultVoiceKey } from '@/scripts/voices';

const model = defineModel<string[]>({ default: [defaultVoiceKey] });
const importUrl = ref('');
const importModalActive = ref(false);
const importError = ref('');

function voiceToggled(value: boolean, voiceId: string): void {
	if (value) {
		if (!model.value.includes(voiceId)) model.value.push(voiceId);
	} else {
		if (voiceId === defaultVoiceKey) return;
		const index = model.value.indexOf(voiceId);
		if (index > -1) {
			model.value.splice(index, 1);
		}
	}
}

function removeVoice(voiceId: string) {
	if (voiceId === defaultVoiceKey) return;
	removeImportedVoice(voiceId);
	model.value = model.value.filter(id => id !== voiceId);
	if (!model.value.includes(defaultVoiceKey)) {
		model.value.unshift(defaultVoiceKey);
	}
}

async function addVoice() {
	importError.value = '';
	try {
		const existing = selectableVoices.value.find(entry => entry.metadata?.sourceUrl === importUrl.value.trim());
		if (existing) {
			if (!model.value.includes(existing.id)) model.value.push(existing.id);
			importUrl.value = '';
			return;
		}
		const id = await addImportedVoiceFromUrl(importUrl.value);
		if (!model.value.includes(id)) model.value.push(id);
		importUrl.value = '';
		importModalActive.value = false;
	} catch (error) {
		importError.value = error instanceof Error ? error.message : 'Onbekende fout bij importeren.';
	}
}

const selectableVoices = computed(() => getSelectableVoiceEntries());
</script>

<template>
	<div class="voices-selector">

		<ul class="list voices-list">
			<li v-for="entry in selectableVoices" :key="entry.id" class="voice-item">
				<InputSwitch :modelValue="model.includes(entry.id)"
					@update:modelValue="event => voiceToggled(event, entry.id)" :identifier="entry.id">
					{{ entry.voice.name }}
				</InputSwitch>
				<small>
					{{ new Intl.DisplayNames(["nl"], { type: "language" }).of(entry.voice.language) }} &bullet;
					{{ ({ M: 'M', F: 'V' })[entry.voice.gender] || '?' }} &bullet;
					{{ entry.voice.sounds.length }} fragmenten
				</small>
				<small v-if="entry.voice.characteristics">{{ entry.voice.characteristics }}</small>
				
				<div class="actions">
					<Icon v-if="entry.id !== defaultVoiceKey" class="delete" @click="removeVoice(entry.id)">
						delete
					</Icon>
				</div>
			</li>
			<li class="dummy add">
				<Button class="tertiary" @click="importModalActive = true">
					Stem toevoegen
				</Button>
			</li>
		</ul>


		<ModalDialog buttonClass="tertiary" v-if="importModalActive" @dismiss="importModalActive = false">
			<h3>Stem toevoegen</h3>
			<Input type="text" id="voiceUrl" v-model="importUrl" placeholder="https://.../stembestand.json" />
			<br><br>
			<Button class="primary" @click="addVoice">
				Toevoegen
			</Button>
			<template v-if="importError">
				<br>
				<p class="error">{{ importError }}</p>
			</template>
		</ModalDialog>
	</div>
</template>

<style scoped>
.voices-selector {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.import-row {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: 8px;
}

.voices-list {
	margin: 0;
}

.voice-item {
	position: relative;

	small {
		opacity: .75;
	}

	.actions {
		position: absolute;
		right: 12px;
		bottom: 8px;
		display: flex;
		gap: 4px;
	}
}

.error {
	color: #ff8b8b;
}
</style>
