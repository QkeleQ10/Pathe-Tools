<script setup lang="ts">
const active = defineModel<boolean>('active', {
    default: false,
    type: Boolean,
});
</script>

<template>
    <slot name="invoker">
        <Button class="secondary" @click="active = true">
            <slot name="button-content">
                Dialog
            </slot>
        </Button>
    </slot>
    <Transition>
        <slot name="dialog">
            <ModalDialog v-if="active" @dismiss="active = false">
                <slot name="dialog-content">
                    <p>Dialog</p>
                </slot>
            </ModalDialog>
        </slot>
    </Transition>
</template>