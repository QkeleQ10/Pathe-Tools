<script setup lang="ts">
const props = defineProps<{ identifier: string, disabled?: boolean, spellcheck?: boolean, autocomplete?: string }>();
const model = defineModel<string>();
</script>

<template>
    <label class="input text-input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <Input type="text" :id="identifier" :list="identifier + '-list'" v-model="model" :disabled="disabled"
            :spellcheck="spellcheck" :autocomplete="autocomplete" />
        <datalist :id="identifier + '-list'">
            <slot name="datalist"></slot>
        </datalist>
    </label>
</template>

<style scoped>
label {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    cursor: pointer;
    user-select: none;
}

label.no-label {
    display: inline-block;

    .title {
        display: none;
    }
}

.title {
    display: flex;
    flex: max-content 0 0;
    flex-direction: column;
    gap: 4px;
}

div.input.has-unit {
    width: 82px;
}

div.input span.unit {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #6d6e71;
    pointer-events: none;
}
</style>