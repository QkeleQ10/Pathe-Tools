<script setup lang="ts">
import { ref } from 'vue';

const active = defineModel<boolean>('active', {
    default: false,
    type: Boolean,
});

defineProps<{
    menuClass?: string;
}>();

const anchorRef = ref<HTMLElement | null>(null);
const contextPosition = ref<{ x: number; y: number } | null>(null);

const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    
    // Store the click position for fallback positioning
    contextPosition.value = {
        x: event.clientX,
        y: event.clientY
    };
    
    active.value = true;
};

const closeMenu = () => {
    active.value = false;
    contextPosition.value = null;
};

// Expose method for programmatic invocation
const showContextMenu = (x?: number, y?: number) => {
    if (x !== undefined && y !== undefined) {
        contextPosition.value = { x, y };
    }
    active.value = true;
};

defineExpose({
    anchorRef,
    showContextMenu,
    closeMenu
});
</script>

<template>
    <div ref="anchorRef" @contextmenu="handleContextMenu">
        <slot name="anchor">
            <!-- The element that will be the anchor for the context menu -->
        </slot>
    </div>
    <Teleport to="body">
        <Transition name="context-menu">
            <ContextMenu 
                v-if="active" 
                :anchor="anchorRef"
                :x="contextPosition?.x"
                :y="contextPosition?.y"
                :class="menuClass"
                @click-outside="closeMenu"
            >
                <slot name="menu">
                    <!-- Context menu content -->
                </slot>
            </ContextMenu>
        </Transition>
    </Teleport>
</template>

<style scoped>
.context-menu-enter-active,
.context-menu-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.context-menu-enter-from {
    opacity: 0;
    transform: scale(0.95);
}

.context-menu-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
