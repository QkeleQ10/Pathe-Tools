<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
    categoryId: string;
    title: string;
}>();

const activeCategory = inject<any>('activeCategory');
const contentRef = inject<any>('settingsContentRef');
const sectionRef = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

onMounted(() => {
    if (sectionRef.value && contentRef?.value) {
        // Create an intersection observer to track when this section is in view
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                        activeCategory.value = props.categoryId;
                    }
                });
            },
            {
                root: contentRef.value,
                threshold: [0, 0.3, 0.5, 0.7, 1],
                rootMargin: '-20% 0px -70% 0px'
            }
        );

        observer.observe(sectionRef.value);
    }
});

onUnmounted(() => {
    if (observer && sectionRef.value) {
        observer.unobserve(sectionRef.value);
        observer.disconnect();
    }
});
</script>

<template>
    <section :id="categoryId" class="settings-section" ref="sectionRef">
        <h2 class="settings-section-title">{{ title }}</h2>
        <div class="settings-section-content">
            <slot></slot>
        </div>
    </section>
</template>

<style scoped>
.settings-section {
    margin-bottom: 32px;
    scroll-margin-top: 20px;
}

.settings-section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: #fff;
}

.settings-section-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
