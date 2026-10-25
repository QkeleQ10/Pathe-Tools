<script setup lang="ts">
import { onMounted } from 'vue';

defineProps<{
    title: string;
    disabled?: boolean;
    rule?: boolean;
}>();

const date = defineModel<Date>({ required: true });

onMounted(() => {
    date.value = new Date(Math.ceil((Date.now() + 1) / (5 * 60 * 1000)) * (5 * 60 * 1000));
});

defineEmits<{
    (e: 'submit'): void;
}>();
</script>

<template>
    <div class="announcement-timing-form">
        <span class="label" style="margin: 0;">{{ title }}</span>

        <div class="controls">
            <div class="primary-controls">
                <InputDate v-model="date" class="date-field" />
                <Button class="secondary" :disabled="disabled" @click="$emit('submit')">
                    <slot name="submit">
                        <Icon>timer</Icon>
                        Inplannen
                    </slot>
                </Button>
            </div>
            <hr v-if="rule" />
            <div class="secondary-controls">
                <slot name="actions"></slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
.announcement-timing-form {
    display: grid;
    gap: 8px;

    .controls {
        hr {
            border: none;
            border-top: 1px solid #ffffff14;
            margin: 16px 0;
        }

        .primary-controls,
        .secondary-controls {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .date-field {
            height: 48px;
            width: 100%;
        }

        button {
            flex-shrink: 0;
        }
    }
}
</style>