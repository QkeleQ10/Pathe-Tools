<script setup lang="ts">
import { ref } from 'vue';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { useLocalStorage, useUrlSearchParams } from '@vueuse/core';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const tmsScheduleStore = useTmsScheduleStore();

const params = useUrlSearchParams('history');

const url = "https://kid-daring-robin.ngrok-free.app";
const username = params.username ? ref(params.username as string) : useLocalStorage('server-username', '');
const password = params.password ? ref(params.password as string) : useLocalStorage('server-password', '');

fetchData();

async function fetchData() {
	const response = await fetch(`${url}/users/${username.value}/timetable`, {
		headers: {
			'ngrok-skip-browser-warning': 'true'
		}
	});
	const data = await response.json();
	tmsScheduleStore.loadFromJson(data);
}

async function submitData() {
	await fetch(`${url}/users/${username.value}/timetable`, {
		method: 'POST',
		headers: {
			Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`),
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'true'
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
		<!-- <h2>Account</h2>
		<div class="block">
			<InputText v-model="username" identifier="username">
				<span>Gebruikersnaam</span>
			</InputText>
			<InputText v-model="password" identifier="password">
				<span>Wachtwoord</span>
			</InputText>
			<ButtonPrimary @click="fetchData">Ophalen</ButtonPrimary>
		</div> -->
		<h2>Gegevensbestand</h2>
		<div class="flex block">
			<p v-if="'name' in tmsScheduleStore.metadata" style="flex-grow: 1;">
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
			<p v-else style="flex-grow: 1;">
				Geen bestand geüpload
				<br>
				<small>Upload hiernaast een CSV-bestand uit RosettaBridge (met optie 'times only')</small>
			</p>
			<div class="buttons">
				<FileUploadButton id="file-upload-area" class="large" @files-uploaded="fileUploaded"
					accept="text/csv,.csv">
					<small>Of sleep een bestand hiernaartoe</small>
				</FileUploadButton>
			</div>
		</div>
	</section>
</template>

<style scoped>
.block {
	text-align: center;
	line-height: 2;
}

#file-upload-area>div>small {
	font: small Arial, Helvetica, sans-serif;
	text-transform: none;
}

.buttons {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 8px;
}
</style>
