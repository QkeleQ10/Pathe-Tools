<script setup>
import { ref } from 'vue'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'

const tmsScheduleStore = useTmsScheduleStore()

const fileInput = ref(null)
</script>

<template>
	<section id="upload">
		<h2>Bestand uploaden</h2>
		<DropZone id="drop-zone" @files-dropped="tmsScheduleStore.addFiles" #default="{ dropZoneActive }"
			@click="fileInput.click()" style="cursor: pointer;">
			<div>
				<div v-if="dropZoneActive">Laat los om te uploaden</div>
				<div v-else-if="tmsScheduleStore.metadata.name">{{ tmsScheduleStore.metadata.name }}</div>
				<div v-else>Sleep een bestand hierheen</div>
				<div class="small">CSV-bestand uit RosettaBridge (met optie 'times only')</div>
			</div>
			<ButtonPrimary :data-active="dropZoneActive">Bladeren...</ButtonPrimary>
		</DropZone>
		<input type="file" ref="fileInput" accept="text/csv,.csv" style="display: none"
			@change="tmsScheduleStore.addFiles($event.target.files)" />
	</section>
</template>

<style scoped>
h2 {
	margin-bottom: 16px;
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

	border-radius: 5px;
	background-color: #ffffff14;
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
