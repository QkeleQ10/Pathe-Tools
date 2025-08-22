<script setup lang="ts">
import { ref, h } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import { useSlideshowImagesStore } from '@/stores/slideshowImages';
import { httpStatuses, useServerStore } from '@/stores/server';
import { showDialog } from '@/scripts/dialogManager';
import Button from '@ui/Button.vue';

const params = useUrlSearchParams('history');

const store = useSlideshowImagesStore();

const serverStore = useServerStore();

const showOptions = ref<boolean>(false);

function deleteImage(fileName: string) {
	const dialog = showDialog(() => [
		h('h3', "Afbeelding verwijderen"),
		h('p', `Weet je zeker dat je de afbeelding "${fileName}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`),
		h(Button, {
			class: 'primary',
			onClick: () => {
				store.deleteImage(fileName)
				dialog.destroy();
			}
		}, 'Verwijderen'),
	])
}

function deleteAllImages() {
	const dialog = showDialog(() => [
		h('h3', "Alle afbeeldingen verwijderen"),
		h('p', "Weet je zeker dat je alle afbeeldingen wilt verwijderen? Dit kan niet ongedaan worden gemaakt."),
		h(Button, {
			class: 'primary',
			onClick: () => {
				store.deleteAll();
				dialog.destroy();
			}
		}, 'Alles verwijderen'),
	])
}
</script>

<template>
	<section id="upload">
		<div class="section-content">
			<div class="floating">
				<button id="upload-status" @click="showOptions = true"
					:title="httpStatuses[store.status].long || store.status + '\nKlik om serveropties te wijzigen'">
					<div id="upload-status-light" :class="store.status"></div>
					{{ httpStatuses[store.status].short || store.status }}
				</button>
			</div>
			<FileUploadBlock @files-uploaded="store.filesUploaded" accept="image/*" multiple>
				<div v-if="store.images?.length" class="pictures" style="margin: 0; flex-grow: 1;">
					<TransitionGroup name="list">
						<button v-for="image in store.images" :key="image.name" :title="image.name"
							@click="deleteImage(image.name)">
							<img :src="image.url" />
							<Icon>delete</Icon>
						</button>
					</TransitionGroup>
				</div>
				<p v-else style="margin: 0; flex-grow: 1;">
					Geen afbeeldingen
					<br>
					<small>Upload afbeeldingen met de knop of door ze hierheen te slepen.</small>
				</p>
				<template #buttons>
					<Button class="secondary" v-if="store.images?.length" @click="deleteAllImages">
						<Icon>delete_forever</Icon>Alles verwijderen
					</Button>
				</template>
			</FileUploadBlock>
		</div>

		<Transition>
			<ModalDialog v-if="showOptions" @dismiss="showOptions = false">
				<h3>Opslag op server</h3>
				<p>
					Als je een geldige gebruikersnaam en wachtwoord hebt opgegeven, dan worden de door jou ingelezen
					afbeeldingen bewaard op de server.
					<br><br>
					Je kunt vervolgens later (eventueel vanaf een ander apparaat) de afbeeldingen terugzien als je
					daar
					ook je gebruikersnaam opgeeft.
					<br><br>
					Afbeeldingen worden gesorteerd op bestandsnaam. Er kan maar één afbeelding met dezelfde
					bestandsnaam
					zijn.
					Als je een afbeelding overschrijft of alle afbeeldingen wist, dan kan dat niet ongedaan worden
					gemaakt.
					<br><br>
				</p>
				<div id="server-options">
					<em class="label">Status</em>
					<div class="server-options-container">
						<p>
							<span id="upload-status-light" :class="store.status"></span>
							<strong>{{ httpStatuses[store.status].short || store.status }}</strong>
						</p>
						<p>{{ httpStatuses[store.status].long }}</p>
					</div>

					<em class="label">Configuratie</em>
					<div class="server-options-container">
						<p>
							Serveradres
							<span style="float: right; opacity: .5;">
								{{ params.url || 'http://localhost:3541' }}
							</span>
						</p>
						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
							<InputGroup type="text" id="username" v-model="serverStore.username">
								<template #label>Gebruikersnaam</template>
							</InputGroup>
							<InputGroup type="text" id="password" v-model="serverStore.password">
								<template #label>Wachtwoord</template>
							</InputGroup>
						</div>
					</div>
					<Button class="primary full" @click="showOptions = false; store.connect();">
						<Icon>check</Icon>Vernieuwen
					</Button>
				</div>
			</ModalDialog>
		</Transition>
	</section>
</template>

<style scoped>
#upload {
	width: 90%;

	.floating {
		display: flex;
		justify-content: end;
	}
}

.pictures {
	height: 110px;

	display: flex;
	gap: 8px;

	overflow-x: auto;

	button {
		position: relative;
		width: auto;
		padding: 0;
		cursor: pointer;

		background-color: #000;
		border: 1px solid #ffffff33;
		border-radius: 6px;

		img {
			max-width: 140px;
			object-fit: contain;
		}

		.icon {
			position: absolute;
			top: 50%;
			left: 50%;
			translate: -50% -50%;
			color: #fff;
			--size: 22px;
			opacity: 0;
		}

		&:hover {
			img {
				opacity: .5;
			}

			.icon {
				opacity: 1;
			}
		}
	}
}

#upload-status {
	height: 53px;
	float: right;
	display: flex;
	align-items: center;

	background-color: transparent;
	border: none;
	color: currentColor;
	font: 16px Heebo, arial, sans-serif;
	text-shadow: 0px 0px 8px #000;

	cursor: pointer;

	&:hover,
	&:focus {
		text-decoration: underline;
	}

	#upload-status-light {
		box-shadow: 0px 0px 8px #000;
	}
}

#upload-status-light {
	display: inline-block;
	position: relative;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	margin-right: 10px;
	--background-color: hsl(0, 0%, 55%);
	background-color: var(--background-color);

	&.sent,
	&.received {
		--background-color: hsl(134, 80%, 55%);
	}

	&.error,
	&.send-error,
	&.receive-error {
		--background-color: hsl(354, 80%, 55%);
	}

	&.sending,
	&.receiving {
		--background-color: hsl(208, 80%, 55%);

		&::after {
			content: '';
			border: 2px solid var(--background-color);
			border-radius: 50%;
			position: absolute;
			top: -4px;
			left: -4px;
			right: -4px;
			bottom: -4px;
			animation: pulsate 750ms infinite;
		}
	}

	&.receiving {
		&::after {
			animation: pulsate 750ms infinite reverse;
		}
	}
}

.server-options-container {
	padding: 1rem;
	padding-block: 8px;
	padding-bottom: 8px;
	margin-top: 6px;
	margin-bottom: 16px;
	border-radius: 6px;
	background-color: #ffffff0d;

	&>p:first-child {
		margin-top: 8px;
	}

	&>.input {
		margin-block: 8px;
	}
}

@keyframes pulsate {
	0% {
		scale: 0.8;
		opacity: 0.0;
	}

	50% {
		opacity: 1.0;
	}

	100% {
		scale: 1.3;
		opacity: 0.0;
	}
}
</style>
