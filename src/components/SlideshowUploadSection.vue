<script setup lang="ts">
import { useLocalStorage, useUrlSearchParams } from '@vueuse/core';
import { ref } from 'vue';

const requestStatus = ref<'creds_missing' | 'loading' | 'success' | 'error'>('creds_missing');
const imgUrls = defineModel<string[]>();
const emit = defineEmits<{
	'slide-clicked': [index: number]
}>();

const params = useUrlSearchParams('history');

const url = "https://kid-daring-robin.ngrok-free.app";
const username = params.username ? ref(params.username as string) : useLocalStorage('server-username', '');
const password = params.password ? ref(params.password as string) : useLocalStorage('server-password', '');

if (username.value) fetchData();

async function fetchData() {
	imgUrls.value = [];
	requestStatus.value = 'loading';

	try {
		const response = await fetch(`${url}/users/${username.value}/pictures`, {
			headers: {
				'ngrok-skip-browser-warning': 'true'
			}
		});
		const data = await response.json();

		imgUrls.value = await Promise.all(data.map(async (fileId: string) => await fetchImage(fileId)));
		requestStatus.value = 'success';
	} catch (error) {
		requestStatus.value = 'error';
	}
}

async function uploadImages(files: FileList) {
	requestStatus.value = 'loading';

	try {
		const formData = new FormData();
		for (const file of files) {
			formData.append('pictures', file);
		}

		const response = await fetch(`${url}/users/${username.value}/pictures`, {
			method: 'POST',
			headers: {
				Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`),
				'ngrok-skip-browser-warning': 'true'
			},
			body: formData
		});
		const data = await response.json();

		imgUrls.value = [...imgUrls.value, ...(await Promise.all(data.files.map(async (fileId: string) => await fetchImage(fileId))))].sort((a, b) => a.localeCompare(b));
		requestStatus.value = 'success';
	} catch (error) {
		requestStatus.value = 'error';
	}
}

async function deleteAll() {
	requestStatus.value = 'loading';

	try {
		await fetch(`${url}/users/${username.value}/pictures`, {
			method: 'DELETE',
			headers: {
				Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`),
				'ngrok-skip-browser-warning': 'true'
			}
		});

		imgUrls.value = [];
		requestStatus.value = 'success';
	} catch (error) {
		requestStatus.value = 'error';
	}
}

async function fetchImage(fileId: string) {
	const response = await fetch(`${url}/users/${username.value}/pictures/${fileId}`, {
		headers: {
			'ngrok-skip-browser-warning': 'true'
		}
	});
	const blob = await response.blob();
	return URL.createObjectURL(blob);
}
</script>

<template>
	<section id="upload">
		<h2>Waarschuwing</h2>
		<div class="block">
			<p>
				Dit is experimenteel. Het werkt alleen als de tijdelijke server actief is ({{ url }}).
			</p>
			<InputText v-model="username" identifier="username">
				<span>Gebruikersnaam</span>
			</InputText>
			<InputText v-model="password" identifier="password">
				<span>Wachtwoord</span>
			</InputText>
			<ButtonSecondary @click="fetchData">
				<Icon>cloud_download</Icon>Nu ophalen
			</ButtonSecondary>
		</div>
		<h2>Dia's</h2>
		<div class="flex block">
			<div v-if="imgUrls.length && requestStatus === 'success'" class="pictures" style="flex-grow: 1;">
				<img v-for="(imgUrl, index) in imgUrls" :src="imgUrl" @click="emit('slide-clicked', index)" />
			</div>
			<p v-else-if="requestStatus === 'success'" style="flex-grow: 1;">
				Geen afbeeldingen geüpload
				<br>
				<small>Geen afbeeldingen aanwezig op server.</small>
			</p>
			<p v-else-if="requestStatus === 'error'" style="flex-grow: 1;">
				Ophalen van afbeeldingen mislukt
				<br>
				<small>De inloggegevens zijn niet correct of er is een probleem met de server.</small>
			</p>
			<p v-else-if="requestStatus === 'creds_missing'" style="flex-grow: 1;">
				Ophalen van afbeeldingen mislukt
				<br>
				<small>Een gebruikersnaam ontbreekt.</small>
			</p>
			<p v-else style="flex-grow: 1;">
				Afbeeldingen ophalen...
				<br>
				<small>Even geduld...</small>
			</p>
			<div class="buttons" style="flex-shrink: 0;" v-if="url && username && password">
				<FileUploadButton id="file-upload-area" :class="{ large: !imgUrls.length }"
					@files-uploaded="uploadImages" accept="image/*" multiple>
					<small v-if="!imgUrls.length">Of sleep bestanden hiernaartoe</small>
				</FileUploadButton>
				<ButtonSecondary v-if="imgUrls.length" @click="deleteAll">
					<Icon>delete_forever</Icon>Alles verwijderen
				</ButtonSecondary>
			</div>
		</div>
	</section>
</template>

<style scoped>
.block {
	text-align: center;
	line-height: 2;
}

.pictures {
	height: 110px;

	display: flex;
	gap: 8px;

	overflow-x: auto;

	img {
		max-width: 140px;
		object-fit: contain;

		background-color: #000;
		border: 1px solid #ffffff33;
		border-radius: 6px;

		cursor: pointer;
	}
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
