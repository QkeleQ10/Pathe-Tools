<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['dismiss']);
const modalContentRef = ref<HTMLElement>(null);

const closeModal = () => {
    emit('dismiss');
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        closeModal();
    }
};

// Add and remove event listeners for the `Esc` key
onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    modalContentRef.value.focus();
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" @click.self="closeModal">
        <div class="modal-content" ref="modalContentRef" tabindex="-1">
            <slot></slot>
            <button class="close-button" @click="closeModal">
                <Icon>close</Icon>
            </button>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #202020;
    color: #fff;
    padding: 16px 20px;
    border-radius: 10px;
    max-width: 650px;
    width: 100%;
    max-height: 95vh;

    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    outline: none;
    overflow-y: auto;
}

.close-button {
    position: absolute;
    top: 8px;
    right: 8px;
    
    background: none;
    border: none;
    --size: 20px;
    color: #fff;
    cursor: pointer;
}
</style>