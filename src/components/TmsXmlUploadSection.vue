<script setup lang="ts">
import { ref } from 'vue'
import { useTmsXmlStore } from '@/stores/tmsXml'

const tmsXmlStore = useTmsXmlStore()
</script>

<template>
	<section id="upload">
		<h2>Bestand uploaden</h2>
		<FileUploadArea id="file-upload-area" @files-uploaded="tmsXmlStore.addFiles">
			<small>XML-bestand uit RosettaBridge</small>
		</FileUploadArea>
	</section>
</template>

<style scoped>
h2 {
	margin-bottom: 16px;
}

#file-upload-area {
	width: 100%;
}
</style>
