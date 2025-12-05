<script setup lang="ts">
import { ref } from 'vue';
import ColsBuilder from '@/components/ui/ColsBuilder.vue';

const columnWidths = ref<number[]>([30, 40, 30]);
const emptyColumns = ref<number[]>([]);
const customTotalColumns = ref<number[]>([200, 300, 500]);
</script>

<template>
    <main>
        <section>
            <div class="section-content">
                <h1>ColsBuilder Demo</h1>
                
                <div class="demo-section">
                    <h2>Basic Usage</h2>
                    <p>Default total width of 100. Add, remove, reorder (drag), and resize columns.</p>
                    <ColsBuilder v-model="columnWidths" />
                    <pre>Model: {{ JSON.stringify(columnWidths) }}</pre>
                </div>

                <div class="demo-section">
                    <h2>Empty State</h2>
                    <p>Start with no columns.</p>
                    <ColsBuilder v-model="emptyColumns" />
                    <pre>Model: {{ JSON.stringify(emptyColumns) }}</pre>
                </div>

                <div class="demo-section">
                    <h2>Custom Total Width (1000)</h2>
                    <p>Total width can be any value.</p>
                    <ColsBuilder v-model="customTotalColumns" :total-width="1000" :min-column-width="50" />
                    <pre>Model: {{ JSON.stringify(customTotalColumns) }}</pre>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
.demo-section {
    margin-bottom: 48px;
    padding: 24px;
    background-color: #1b1d23;
    border-radius: 8px;
}

.demo-section h2 {
    margin-top: 0;
    color: var(--yellow1);
}

.demo-section p {
    color: #888;
    margin-bottom: 16px;
}

pre {
    margin-top: 16px;
    padding: 12px;
    background-color: #0d0e11;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    color: #888;
    overflow-x: auto;
}
</style>
