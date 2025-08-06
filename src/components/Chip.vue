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
    background-color: #ffc10514;
    color: #feb91e;
    font: 500 14px Heebo, arial, sans-serif;
    line-height: 20px;
    padding: 4px 8px;
    border-radius: 4px;
}

div.secondary {
    background-color: #82828214;
    color: #fff;
}
</style>
