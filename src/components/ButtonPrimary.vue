<template>
    <button class="primary center" type="button">
        <slot></slot>
    </button>
</template>

<style scoped>
button {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    vertical-align: middle;
    height: 48px;
    min-width: 56px;
    max-width: 400px;
    line-height: 48px;
    border-radius: 6px;
    font-family: Heebo, arial, sans-serif;
    font-size: 16px;
    font-weight: 500;
    transition: all .15s ease-out;
    cursor: pointer;
    color: #fff;
    padding: 0 20px;
    outline: none;
    text-decoration: none;
    background: #1c2129;
    white-space: nowrap;
    border: none;
    box-sizing: border-box;

    &:hover {
        box-shadow: 0 0 0 8px #ffffff0d;
        background: #1f252e;
    }
}

button.center {
    justify-content: center;
}

button.full {
    width: 100%;
    max-width: none;
}

button.large {
    height: auto;
    line-height: normal;
    padding-block: 16px;
}

button.primary {
    color: #090a0b;
    background-color: #feb91e;

    &:hover {
        background-color: #ffdc6e;
    }
}
</style>