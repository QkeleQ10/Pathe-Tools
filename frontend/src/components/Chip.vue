<template>
    <div>
        <slot></slot>
    </div>
</template>

<style scoped>
div {
    display: flex;
    gap: 4px;
    align-items: center;
    background-color: #ffc426;
    color: #000;
    font: 400 14px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 5px;
}

div.translucent-white {
    background-color: #ffffff14;
    color: #fff;
}
</style>
