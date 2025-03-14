<script setup lang="ts">
import { FileMetadata } from '@/classes/classes';
import { useLocalStorage } from '@vueuse/core';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ref } from 'vue';

const imgUrls = defineModel<string[]>();
const emit = defineEmits<{
	'slide-clicked': [index: number]
}>();

const url = useLocalStorage('server-url', '');
const username = useLocalStorage('server-username', '');
const password = useLocalStorage('server-password', '');

fetchData();

async function fetchData() {
	const response = await fetch(`${url.value}/users/${username.value}/pictures`);
	const data = await response.json();

	imgUrls.value = data.map((fileId: string) => `${url.value}/users/${username.value}/pictures/${fileId}`);
}

async function uploadImages(files: FileList) {
	const formData = new FormData();
	for (const file of files) {
		formData.append('pictures', file);
	}

	const response = await fetch(`${url.value}/users/${username.value}/pictures`, {
		method: 'POST',
		headers: {
			Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`)
		},
		body: formData
	});
	const data = await response.json();

	imgUrls.value = [...imgUrls.value, ...data.files.map((fileId: string) => `${url.value}/users/${username.value}/pictures/${fileId}`)].sort((a, b) => a.localeCompare(b));
}

async function deleteAll() {
	const response = await fetch(`${url.value}/users/${username.value}/pictures`, {
		method: 'DELETE',
		headers: { Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`) }
	});
	const data = await response.json();

	imgUrls.value = [];
}
</script>

<template>
	<section id="upload">
		<h2>Opslaglocatie</h2>
		<div class="block">
			<InputText v-model="url" identifier="url">
				<span>Adres</span>
			</InputText>
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
			<div v-if="imgUrls.length" class="pictures" style="flex-grow: 1;">
				<img v-for="(imgUrl, index) in imgUrls" :src="imgUrl" @click="emit('slide-clicked', index)" />
			</div>
			<p v-else style="flex-grow: 1;">
				Geen afbeeldingen geüpload
				<br>
				<small>Geen afbeeldingen aanwezig op server of geen verbinding met server</small>
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
