<template>
    <button class="text" type="button">
        <slot></slot>
    </button>
</template>

<style scoped>
button.text {
    display: flex;
    align-items: baseline;
    gap: 8px;
    justify-content: center;
    box-sizing: border-box;
    border: none;
    color: currentColor;
    cursor: pointer;
    font: 16px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    text-align: center;
    text-decoration: none;
    text-transform: uppercase;
    background-color: transparent;
    user-select: none;
}

button.text[data-active=true] {
    opacity: .3;
}

button.text:hover,
button.text:focus-visible {
    opacity: 0.8;
}
</style>