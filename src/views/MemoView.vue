<script setup lang="ts">
import { ref } from 'vue';

const pictures = ref<string[]>([]);

</script>

<template>
    <main class="container dark">
        <MemoUploadSection v-model="pictures" />
        <section id="pictures">
            <h2>Memo</h2>
            <img v-for="picture in pictures" :src="picture" alt="Uploaded picture" />
        </section>
    </main>
</template>

<style scoped></style>
