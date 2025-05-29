<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';

import { routes } from '@/router/index'

const allowedRoutes = ['timetable', 'announcer', 'narrowcasting', 'slideshow', 'intermission-finder'];

const params = useUrlSearchParams();

const division = ref(0.5);

let isDragging = false;

const startDragging = (e: MouseEvent) => {
    isDragging = true;
    e.preventDefault();
};

const stopDragging = () => {
    isDragging = false;
};

const onDrag = (e: MouseEvent) => {
    if (!isDragging) return;
    const newDivision = e.clientX / window.innerWidth;
    division.value = Math.min(0.7, Math.max(0.3, newDivision));
};

onMounted(() => {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDragging);
});

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDragging);
});
</script>

<template>
    <div id="splitscreen-view" :style="{ '--division': `${division * 100}%` }">
        <div class="division" id="left-division">
            <nav>
                <a v-for="route in routes.filter(route => allowedRoutes.includes(String(route.name)))"
                    :class="{ active: params.left === String(route.name) }" @click="params.left = String(route.name)">
                    {{ route.meta.title }}
                </a>
            </nav>
            <component v-if="params.left" :is="routes.find(route => route.name === params.left).component"
                :title="routes.find(route => route.name === params.left).meta.title" class="view" id="left-view" />
        </div>
        <div id="divider" @mousedown="startDragging">
            <Icon>drag_indicator</Icon>
        </div>
        <div class="division" id="right-division">
            <nav>
                <a v-for="route in routes.filter(route => allowedRoutes.includes(String(route.name)))"
                    :class="{ active: params.right === String(route.name) }" @click="params.right = String(route.name)">
                    {{ route.meta.title }}
                </a>
            </nav>
            <component v-if="params.right" :is="routes.find(route => route.name === params.right).component"
                :title="routes.find(route => route.name === params.right).meta.title" class="view" id="right-view" />
        </div>
    </div>
</template>

<style scoped>
#splitscreen-view {
    --division: 50%;
    display: grid;
    grid-template-columns: calc(var(--division) - 2px) calc(100% - var(--division) - 2px);
    gap: 4px;
}

#divider {
    position: fixed;
    top: 0;
    bottom: 0;
    left: calc(var(--division) - 2px);
    background-color: #ffffff1a;
    background-image: none;
    backdrop-filter: blur(16px);
    box-shadow: 0 0 0 1px #fff3;
    width: 16px;
    margin-left: -4px;
    margin-right: -4px;
    cursor: ew-resize;
    z-index: 5;

    .icon {
        position: sticky;
        top: 50%;
        /* left: 50%; */
        translate: -1px -50%;
    }
}

.division {
    height: calc(100vh - 72px);

    nav {
        height: 72px;
        display: flex;
        align-items: center;
        margin-top: -72px;
        font-size: 12px;
        overflow-x: hidden;

        a {
            cursor: pointer;
            margin-right: 1em;
            z-index: 5;
        }
    }

    .view {
        position: relative;

        height: 100vh;
        margin-top: -72px;
    }
}

#left-division nav {
    margin-left: 144px;
}

#right-division nav {
    margin-right: 144px;
}
</style>