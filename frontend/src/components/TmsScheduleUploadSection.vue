<script setup lang="ts">
import { ref } from 'vue'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { useLocalStorage } from '@vueuse/core'

const tmsScheduleStore = useTmsScheduleStore()

const fileInput = ref(null)
const url = useLocalStorage('tms-schedule-url', 'http://10.21.246.2:3000/timetable')

async function fetchData() {
	const response = await fetch(url.value);
	const data = await response.json();
	console.log(data);
	tmsScheduleStore.loadFromJson(data);
}

async function submitData() {
	await fetch(url.value, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ timetable: tmsScheduleStore.table, metadata: tmsScheduleStore.metadata })
	});
	console.log(JSON.parse(JSON.stringify({ timetable: tmsScheduleStore.table, metadata: tmsScheduleStore.metadata })));
}

async function addFiles(event: Event) {
	await tmsScheduleStore.addFiles((event.target as HTMLInputElement).files);
	submitData();
}
</script>

<template>
	<section id="upload">
		<h2>Gegevensbestand</h2>
		<div class="grid">
			<div v-if="'name' in tmsScheduleStore.metadata" class="block">
				<p>{{ tmsScheduleStore.metadata.name }}
					<br>
					<small>
						Gegenereerd op {{ new Date(tmsScheduleStore.metadata.lastModified).toLocaleString() }}
						<br>
						Geüpload op {{ new Date(tmsScheduleStore.metadata.uploadedDate).toLocaleString() }}
					</small>
				</p>
			</div>
			<div v-else class="block">
				<p>Geen bestand geüpload</p>
			</div>
			<div class="block">
				<InputText v-model="url" identifier="url">
					<span>URL</span>
				</InputText>
				<ButtonPrimary @click="fetchData">Ophalen</ButtonPrimary>
			</div>
			<div class="block">
				<!-- <DropZone id="drop-zone" class="block" @files-dropped="tmsScheduleStore.addFiles"
					#default="{ dropZoneActive }" @click="fileInput.click()" style="cursor: pointer;">
					<div>
						<div v-if="dropZoneActive">Laat los om te uploaden</div>
						<div v-else-if="'name' in tmsScheduleStore.metadata">{{ tmsScheduleStore.metadata.name }}</div>
						<div v-else>Sleep een bestand hierheen</div>
						<div class="small">CSV-bestand uit RosettaBridge (met optie 'times only')</div>
					</div>
				</DropZone> -->
				<ButtonPrimary @click="fileInput.click()">Bladeren...</ButtonPrimary>
				<input type="file" ref="fileInput" accept="text/csv,.csv" style="display: none" @change="addFiles" />
			</div>
		</div>
	</section>
</template>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	gap: 8px;
}

h2 {
	margin-bottom: 16px;
}

.block:nth-child(1) {
	grid-row: span 2;
}

.block {
	padding: 16px;
	border-radius: 5px;
	background-color: #ffffff14;

	text-align: center;
	line-height: 2;
}

#drop-zone {
	width: 100%;
	height: 100%;
	min-height: 170px;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16px;

	border: 4px dashed transparent;
	color: #ffffffcc;
	font-size: 14px;
}

#drop-zone[data-active=true] {
	border-color: #ffffff14;
}

#drop-zone>div {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
}
</style>
