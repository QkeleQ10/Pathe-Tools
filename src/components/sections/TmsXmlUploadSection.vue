<script setup lang="ts">
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useTmsXmlStore } from '@/stores/tmsXml'

const store = useTmsXmlStore()
</script>

<template>
	<section id="upload">
		<h2>Gegevensbestand</h2>

		<FileUploadBlock @files-uploaded="store.uploadXml" accept="text/xml,.xml">
			<p v-if="'name' in store.metadata" style="flex-grow: 1;">
				{{ store.metadata.name }}
				<br>
				<small>
					Laatst gewijzigd op {{ format(new Date(store.metadata.lastModified), 'PPPpp',
					{ locale: nl }) }}
				</small>
			</p>
			<p v-else style="flex-grow: 1;">
				Geen gegevens
				<br>
				<small>Upload een XML-bestand uit RosettaBridge met de knop of door hem hierheen te slepen.</small>
			</p>
		</FileUploadBlock>
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
