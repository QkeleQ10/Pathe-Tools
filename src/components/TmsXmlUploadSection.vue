<script setup lang="ts">
import { ref } from 'vue'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useTmsXmlStore } from '@/stores/tmsXml'

const tmsXmlStore = useTmsXmlStore()
</script>

<template>
	<section id="upload">
		<h2>Gegevensbestand</h2>
		<div class="flex block">
			<p v-if="'name' in tmsXmlStore.metadata" style="flex-grow: 1;">
				{{ tmsXmlStore.metadata.name }}
				<br>
				<small>
					Laatst gewijzigd op {{ format(new Date(tmsXmlStore.metadata.lastModified), 'PPPpp',
						{ locale: nl }) }}
				</small>
			</p>
			<p v-else style="flex-grow: 1;">
				Geen bestand geüpload
				<br>
				<small>Upload hiernaast een XML-bestand uit RosettaBridge</small>
			</p>
			<div class="buttons">
				<FileUploadButton id="file-upload-area" class="large" @files-uploaded="tmsXmlStore.addFiles"
					accept="text/xml,.xml">
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
