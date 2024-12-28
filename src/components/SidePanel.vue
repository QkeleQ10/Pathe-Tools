<template>
    <aside class="side-panel">
        <slot></slot>
    </aside>
</template>

<style>
aside.side-panel {
    position: relative;
    flex-grow: 1;
    flex-shrink: 1;

    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>