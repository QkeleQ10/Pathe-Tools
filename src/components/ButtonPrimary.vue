<template>
    <button class="primary" type="button">
        <slot></slot>
    </button>
</template>

<style scoped>
button.primary {
    display: block;
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .12);
    border: none;
    border-radius: 6px;
    box-sizing: border-box;
    color: rgba(21, 21, 21, .96);
    cursor: pointer;
    font-family: "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    font-size: 16px;
    height: 34px;
    line-height: 34px;
    padding: 0 30px;
    text-align: center;
    text-decoration: none;
    text-transform: uppercase;
    background-color: #ffc426;
    background-image: linear-gradient(to bottom, #f7da66, #ffc426);
}

button.primary:hover, button.primary:focus-visible {
    background-color: #e3af24;
    background-image: -webkit-linear-gradient(top, #dcc25c, #e3af24);
    background-image: linear-gradient(to bottom, #dcc25c, #e3af24);
}
</style>