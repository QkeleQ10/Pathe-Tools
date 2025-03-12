<script setup lang="ts">
import { FileMetadata } from '@/classes/classes';
import { useLocalStorage } from '@vueuse/core';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ref } from 'vue';

const pictures = defineModel<string[]>();
const metadata = ref<FileMetadata | {}>({});

const url = useLocalStorage('server-url', 'http://localhost:3000');
const username = useLocalStorage('server-username', 'admin');
const password = useLocalStorage('server-password', 'admin');

fetchData();

async function fetchData() {
	const response = await fetch(`${url.value}/${username.value}/memo`, {
		headers: { Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`) }
	});
	const data = await response.json();
	pictures.value.push(...(data.pictures || []));
	metadata.value = data.metadata || {};
}

async function submitData() {
	await fetch(`${url.value}/${username.value}/memo`, {
		method: 'POST',
		headers: {
			Authorization: 'Basic ' + btoa(`${username.value}:${password.value}`),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ pictures: pictures.value, metadata: metadata.value })
	});
}

async function fileUploaded(files: FileList) {
	while (pictures.value.length) pictures.value.pop();
	pictures.value.push(...await processImages(files));
	submitData();
}

async function processImages(files: FileList): Promise<string[]> {
	const maxWidth = 1920;
	const maxHeight = 1080;
	const quality = 0.75; // Adjust as needed for compression

	const processFile = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				const img = new Image();
				img.src = reader.result as string;
				img.onload = () => {
					const canvas = document.createElement("canvas");
					let { width, height } = img;

					// Maintain aspect ratio while resizing
					if (width > maxWidth || height > maxHeight) {
						const scale = Math.min(maxWidth / width, maxHeight / height);
						width *= scale;
						height *= scale;
					}

					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext("2d");
					if (!ctx) return reject(new Error("Canvas context not available"));

					ctx.drawImage(img, 0, 0, width, height);

					// Convert to JPEG (removes alpha)
					canvas.toDataURL("image/jpeg", quality)
						? resolve(canvas.toDataURL("image/jpeg", quality))
						: reject(new Error("Failed to convert image"));
				};
				img.onerror = reject;
			};
			reader.onerror = reject;
		});
	};

	return Promise.all(Array.from(files).map(processFile));
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
			<p v-if="'name' in metadata">
				{{ metadata.name }}
				<br>
				<small>
					Laatst gewijzigd op {{ format(new Date(metadata.lastModified), 'PPPpp',
						{ locale: nl }) }}
					<br>
					Geüpload op {{ format(new Date(metadata.uploadedDate), 'PPPpp', { locale: nl })
					}}
				</small>
			</p>
			<p v-else>Geen bestanden geüpload</p>
			<FileUploadArea id="file-upload-area" @files-uploaded="fileUploaded" accept="image/*" multiple>
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
