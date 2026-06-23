<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    accept?: string;
    multiple?: boolean;
    dropzone?: boolean;
    primary?: boolean | null;
}>();
const emit = defineEmits<{
    'files-uploaded': [files: FileList]
}>();

const fileInput = ref<HTMLInputElement>(null);

function onUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
        emit('files-uploaded', input.files);
    }
    input.value = '';
}
</script>

<template>
    <Button class="file-upload-area full" :class="{ primary: props.primary, secondary: props.primary === false }"
        @click="fileInput.click()">
        <slot>
            <Icon>upload</Icon> Uploaden
        </slot>
        <input type="file" ref="fileInput" :accept="props.accept" :multiple="props.multiple || null"
            style="display: none" @change="onUpload" />
    </Button>
</template>

<style scoped>
.file-upload-area[data-drag-active=true] {
    outline: 3px dashed #ffffffcc;
    outline-offset: 4px;
}
</style>
