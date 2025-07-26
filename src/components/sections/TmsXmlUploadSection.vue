<script setup lang="ts">
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useTmsXmlStore } from '@/stores/tmsXml'

const store = useTmsXmlStore()
</script>

<template>
	<section id="upload">
		<div class="section-content">
			<!-- <h2>Gegevensbestand</h2> -->
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
					<small>Upload een <b>XML</b>-bestand uit RosettaBridge met de knop of door hem hierheen te
						slepen.</small>
				</p>
			</FileUploadBlock>
		</div>
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
</style>
