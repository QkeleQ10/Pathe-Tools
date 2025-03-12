<script setup lang="ts">
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { useLocalStorage } from '@vueuse/core'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const tmsScheduleStore = useTmsScheduleStore()

const url = useLocalStorage('server-url', 'http://localhost:3000')
const username = useLocalStorage('server-username', 'admin')
const password = useLocalStorage('server-password', 'admin')

fetchData();

async function fetchData() {
	const response = await fetch(`${url.value}/${username.value}/timetable`, {
		headers: { Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`) }
	});
	const data = await response.json();
	tmsScheduleStore.loadFromJson(data);
}

async function submitData() {
	await fetch(`${url.value}/${username.value}/timetable`, {
		method: 'POST',
		headers: {
			Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ timetable: tmsScheduleStore.table, metadata: tmsScheduleStore.metadata })
	});
}

async function fileUploaded(files: FileList) {
	await tmsScheduleStore.addFiles(files);
	submitData();
}
</script>

<template>
	<section id="upload">
		<h2>Account</h2>
		<div class="block">
			<InputText v-model="url" identifier="url">
				<span>URL</span>
			</InputText>
			<InputText v-model="username" identifier="username">
				<span>Gebruikersnaam</span>
			</InputText>
			<InputText v-model="password" identifier="password">
				<span>Wachtwoord</span>
			</InputText>
			<ButtonPrimary @click="fetchData">Ophalen</ButtonPrimary>
		</div>
		<h2>Gegevensbestand</h2>
		<div class="block">
			<p v-if="'name' in tmsScheduleStore.metadata">
				{{ tmsScheduleStore.metadata.name }}
				<br>
				<small>
					Laatst gewijzigd op {{ format(new Date(tmsScheduleStore.metadata.lastModified), 'PPPpp',
						{ locale: nl }) }}
					<br>
					Geüpload op {{ format(new Date(tmsScheduleStore.metadata.uploadedDate), 'PPPpp', { locale: nl })
					}}
				</small>
			</p>
			<p v-else>Geen bestand geüpload</p>
			<FileUploadArea id="file-upload-area" @files-uploaded="fileUploaded" accept="text/csv,.csv">
				<small>CSV-bestand uit RosettaBridge (met optie 'times only')</small>
			</FileUploadArea>
		</div>
	</section>
</template>

<style scoped>
h2 {
	margin-bottom: 16px;
}

.block {
	padding: 16px;
	border-radius: 5px;
	background-color: #ffffff14;
	color: #ffffffcc;

	text-align: center;
	line-height: 2;
}

#file-upload-area>div>small {
	font: small Arial, Helvetica, sans-serif;
	text-transform: none;
}
</style>
