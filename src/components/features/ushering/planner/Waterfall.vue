<script setup lang="ts">
const props = defineProps<{
    now: number;
    title?: string;
}>();

const isHovering = defineModel<boolean>('isHovering');
const hoverPos = defineModel<number>('hoverPos');
</script>

<template>
    <div class="waterfall">
        <h4>{{ title }}</h4>
        <div class="waterfall-strip"
            @mousemove="(e) => { isHovering = true; const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); hoverPos = (e.clientX - rect.left) / rect.width; }"
            @mouseleave="isHovering = false">
            <slot></slot>
            <div class="now" :style="{
                left: (now * 100) + '%'
            }"></div>
            <div class="hover" v-if="isHovering" :style="{
                left: (hoverPos * 100) + '%'
            }"></div>
        </div>
    </div>
</template>

<style scoped>
.waterfall {
    position: relative;
    display: grid;
    grid-template-columns: 80px 1fr;
    column-gap: 8px;
    align-items: center;
    margin-block: 6px;

    &>h4 {
        margin-top: 0;
        margin-bottom: 0;
        text-align: right;
        text-wrap: balance;
        line-height: 18px;
    }

    .waterfall-strip {
        position: relative;
        height: 50px;
        padding: 4px;
        border-radius: 5px;
        outline: 1px solid #ffffff14;
        overflow: hidden;

    }

    .now,
    .hover {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: white;
        z-index: 1;
        pointer-events: none;
    }
}
</style>