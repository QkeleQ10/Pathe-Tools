<script setup lang="ts">
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useTmsXmlStore } from '@/stores/tmsXml'

const store = useTmsXmlStore()
</script>

<template>
	<div id="upload">
		<div class="section-content">
			<FileUploadBlock @files-uploaded="store.uploadXml" accept="text/xml,.xml"
				:highlight="JSON.stringify(store.obj).length <= 2">
				<p v-if="'name' in store.metadata" style="margin: 0; flex-grow: 1;">
					{{ store.metadata.name }}
					<br>
					<small>
						Laatst gewijzigd op {{ format(new Date(store.metadata.lastModified), 'PPPpp',
							{ locale: nl }) }}
					</small>
				</p>
				<p v-else style="margin: 0; flex-grow: 1;">
					Geen gegevens
					<br>
					<small>Upload een <b>XML</b>-bestand uit RosettaBridge met de knop of door hem hierheen te
						slepen.</small>
				</p>
			</FileUploadBlock>
		</div>
	</div>
</template>

<style scoped>
#upload {
	.floating {
		width: 90%;
		display: flex;
		justify-content: end;
	}
}
</style>
