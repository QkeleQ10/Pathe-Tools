<script setup lang="ts">
const emit = defineEmits<{
	'files-uploaded': [files: FileList | File[]]
}>();
const props = defineProps<{
	accept?: string;
	multiple?: boolean;
}>();
</script>

<template>
	<div class="flex block">
		<slot></slot>
		<div class="buttons">
			<FileUploadButton id="file-upload-area" @files-uploaded="(files) => emit('files-uploaded', files)"
				:accept="props.accept" :multiple="props.multiple">
			</FileUploadButton>
			<slot name="buttons">
				<small>Of sleep een bestand naar deze pagina</small>
			</slot>
		</div>
	</div>
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
