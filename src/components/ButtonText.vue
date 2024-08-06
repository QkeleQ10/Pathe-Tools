<template>
    <button class="primary" type="button">
        <slot></slot>
    </button>
</template>

<style scoped>
button.primary {
    display: flex;
    align-items: baseline;
    gap: 8px;
    justify-content: center;
    box-sizing: border-box;
    border: none;
    color: #000;
    cursor: pointer;
    font: 16px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    text-align: center;
    text-decoration: none;
    text-transform: uppercase;
    background-color: transparent;
    user-select: none;
}

button.primary:hover,
button.primary:focus-visible {
    opacity: 0.8;
}
</style>