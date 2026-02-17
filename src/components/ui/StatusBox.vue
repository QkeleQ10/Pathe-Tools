<script setup lang="ts">
interface Props {
    working: boolean;
    health: 'healthy' | 'unhealthy' | 'neutral' | 'inactive';
    clickable?: boolean;
}

defineProps<Props>();

defineEmits<{
    (e: 'click'): void;
}>();
</script>

<template>
    <component :is="clickable ? 'button' : 'div'" class="status-box" @click="$emit('click')" :class="{
        healthy: health === 'healthy',
        unhealthy: health === 'unhealthy',
        neutral: health === 'neutral',
        inactive: health === 'inactive',
        working,
    }">
        <div class="status-light"></div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span>
                <slot name="label"></slot>
            </span>
            <small>
                <slot name="description"></slot>
            </small>
        </div>
    </component>
</template>

<style scoped>
@property --color {
    syntax: '<color>';
    inherits: true;
    initial-value: transparent;
}

.status-box {
    --color: hsl(223, 87%, 64%);

    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 8px 16px;
    line-height: 16px;
    overflow: hidden;
    text-align: start;

    font: 16px Heebo, arial, sans-serif;
    border: 1px solid light-dark(#9da1ac, #30343d);
    border-radius: 6px;
    background-color: transparent;
    background-image: radial-gradient(circle at left bottom, hsl(from var(--color) h s l / 0.2) 0%, transparent 100px);

    transition: --color 250ms;

    &.inactive {
        --color: hsl(0, 0%, 64%);
    }

    &.healthy {
        --color: hsl(111, 87%, 64%);
    }

    &.unhealthy {
        --color: hsl(0, 87%, 64%);
    }

    &.neutral {
        --color: hsl(223, 87%, 64%);
    }
}

button.status-box {
    cursor: pointer;
    background-color: transparent;

    &:hover {
        background-color: light-dark(#00000033, #ffffff1a);
    }

    &:focus-visible {
        outline: 2px solid var(--yellow2);
        outline-offset: 2px;
    }
}

.status-light {
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--color);

    .working &::before {
        content: "";
        position: absolute;
        top: -2px;
        bottom: -2px;
        left: -2px;
        right: -2px;
        background-color: var(--color);
        border-radius: 50%;
        animation: pulsate 750ms linear infinite;
    }
}

@keyframes pulsate {
    0% {
        scale: 0.8;
        opacity: 0.0;
    }

    50% {
        opacity: 1.0;
    }

    100% {
        scale: 1.3;
        opacity: 0.0;
    }
}
</style>
