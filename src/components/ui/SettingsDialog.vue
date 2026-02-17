<script setup lang="ts">
import { ref, provide } from 'vue';

const active = defineModel<boolean>('active', {
    default: false,
    type: Boolean,
});

const activeCategory = ref<string>('');
const contentRef = ref<HTMLElement | null>(null);

provide('settingsContentRef', contentRef);
provide('activeCategory', activeCategory);

const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element && contentRef.value) {
        const scrollContainer = contentRef.value;
        const elementTop = element.offsetTop;
        scrollContainer.scrollTo({
            top: elementTop - 20,
            behavior: 'smooth'
        });
    }
};

provide('scrollToCategory', scrollToCategory);
</script>

<template>
    <slot name="invoker">
        <Button class="secondary" @click="active = true">
            <slot name="button-content">
                Settings
            </slot>
        </Button>
    </slot>
    <Teleport to="body">
        <Transition>
            <div v-if="active" class="modal-overlay" role="dialog" aria-modal="true" @click.self="active = false">
                <div class="settings-modal-content">
                    <div class="settings-layout">
                        <aside class="settings-nav">
                            <slot name="navigation"></slot>
                        </aside>
                        <div class="settings-content" ref="contentRef">
                            <slot name="content"></slot>
                        </div>
                    </div>
                    <button class="close-button" @click="active = false">
                        <Icon>close</Icon>
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
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

.settings-modal-content {
    background: #202020;
    color: #fff;
    padding: 16px 20px;
    border-radius: 10px;
    max-width: 900px;
    width: 100%;
    max-height: 85vh;
    height: 80vh;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    position: relative;
    outline: none;
}

.settings-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
    height: 100%;
    overflow: hidden;
}

.settings-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 8px;
    overflow-y: auto;
}

.settings-content {
    overflow-y: auto;
    padding: 8px 16px;
    padding-right: 8px;
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
