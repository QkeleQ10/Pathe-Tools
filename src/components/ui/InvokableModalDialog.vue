<script setup lang="ts">
defineProps<{
    buttonClass?: string;
    dialogClass?: string;
    dialogStyle?: string | Record<string, string>;
}>();

const active = defineModel<boolean>('active', {
    default: false,
    type: Boolean,
});
</script>

<template>
    <slot name="invoker">
        <Button :class="buttonClass || 'secondary full left'" @click="active = true">
            <slot name="button-content">
                Dialog
            </slot>
        </Button>
    </slot>
    <Teleport to="body">
        <Transition>
            <slot name="dialog">
                <ModalDialog v-if="active" @dismiss="active = false" :class="dialogClass" :style="dialogStyle">
                    <slot name="dialog-content">
                        <p>Dialog</p>
                    </slot>
                </ModalDialog>
            </slot>
        </Transition>
    </Teleport>
</template>