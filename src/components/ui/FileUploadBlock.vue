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
	<div class="flex block blur">
		<slot></slot>
		<div class="buttons">
			<FileUploadButton id="file-upload-area" @files-uploaded="(files) => emit('files-uploaded', files)"
				:accept="props.accept" :multiple="props.multiple">
			</FileUploadButton>
			<slot name="buttons">
			</slot>
		</div>
	</div>
</template>

<style scoped>
.buttons {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 8px;
}
</style>
