<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
const emit = defineEmits(['files-dropped']);

const active = ref(false);
let inActiveTimeout: ReturnType<typeof setTimeout> | null = null;

function setActive(): void {
    active.value = true;
    if (inActiveTimeout) {
        clearTimeout(inActiveTimeout);
    }
}

function setInactive(): void {
    inActiveTimeout = setTimeout(() => {
        active.value = false;
    }, 50);
}

function onDrop(e: DragEvent): void {
    setInactive();
    emit('files-dropped', [...e.dataTransfer!.files]);
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
    <div :data-active="active" @dragenter.prevent="setActive" @dragover.prevent="setActive"
        @dragleave.prevent="setInactive" @drop.prevent="onDrop">
        <slot :dropZoneActive="active"></slot>
    </div>
</template>
