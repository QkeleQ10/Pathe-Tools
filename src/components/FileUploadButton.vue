<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
const props = defineProps<{
    accept: string;
    multiple?: boolean;
}>();
const emit = defineEmits<{
    'files-uploaded': [files: FileList]
}>();

const fileInput = ref<HTMLInputElement>(null);

const active = ref(false);

let inActiveTimeout: ReturnType<typeof setTimeout> | null = null;
function setActive(): void {
    active.value = true;
    if (inActiveTimeout) clearTimeout(inActiveTimeout);
}
function setInactive(): void {
    inActiveTimeout = setTimeout(() => active.value = false, 50);
}

function onDrop(e: DragEvent): void {
    active.value = false;
    emit('files-uploaded', e.dataTransfer!.files);
}

function onUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
        emit('files-uploaded', input.files);
    }
}

function preventDefaults(e: Event): void {
    e.preventDefault();
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop'] as const;

onMounted(() => {
    events.forEach((eventName) => {
        document.body.addEventListener(eventName, preventDefaults);
    });
});

onUnmounted(() => {
    events.forEach((eventName) => {
        document.body.removeEventListener(eventName, preventDefaults);
    });
});
</script>

<template>
    <ButtonPrimary class="file-upload-area" :data-drag-active="active" @dragenter.prevent="setActive"
        @dragover.prevent="setActive" @dragleave.prevent="setInactive" @drop.prevent="onDrop"
        @click="fileInput.click()">
        <div>
            <div v-if="!active"><Icon>folder_open</Icon> Bestand{{ props.multiple ? 'en' : '' }} uploaden</div>
            <div v-else>Laat los om te uploaden</div>
            <slot></slot>
        </div>
        <input type="file" ref="fileInput" :accept="props.accept" :multiple="props.multiple || null"
            style="display: none" @change="onUpload" />
    </ButtonPrimary>
</template>

<style scoped>
.file-upload-area {
    height: auto;
}

.file-upload-area[data-drag-active=true] {
    outline: 4px dashed #ffffffcc;
    outline-offset: -2px;
}
</style>
