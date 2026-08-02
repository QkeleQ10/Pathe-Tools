<script setup lang="ts">
defineProps<{
    title: string;
    buttonLabel: string;
    buttonIcon: string;
    buttonClass?: string;
    headingTag?: string;
    disabled?: boolean;
    description?: string;
}>();

const date = defineModel<Date>({ required: true });

defineEmits<{
    (e: 'submit'): void;
}>();
</script>

<template>
    <div class="announcement-timing-form">
        <component :is="headingTag || 'h3'" class="heading label">{{ title }}</component>
        <p v-if="description">{{ description }}</p>

        <div class="controls">
            <InputDate v-model="date" class="date-field" />
            <Button :class="buttonClass || 'primary'" :disabled="disabled" @click="$emit('submit')">
                <Icon>{{ buttonIcon }}</Icon>
                {{ buttonLabel }}
            </Button>
        </div>
    </div>
</template>

<style scoped>
.announcement-timing-form {
    display: grid;
    gap: 8px;

    .heading {
        margin: 0;
    }

    p {
        margin: 0;
        opacity: 0.8;
    }

    .controls {
        display: flex;
        gap: 8px;
        align-items: center;

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