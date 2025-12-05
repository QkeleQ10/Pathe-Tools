<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

const model = defineModel<{
    type: string;
    width: number;
}[]>({ default: () => [] });

const colTypes = [
    { label: 'Zaal', value: 'auditorium', icon: 'text_fields' },
    { label: 'Inloop', value: 'scheduledTime', icon: 'schedule' },
    { label: 'Start hoofdfilm', value: 'mainShowTime', icon: 'schedule' },
    { label: 'Pauze', value: 'intermissionTime', icon: 'schedule' },
    { label: 'Aftiteling', value: 'creditsTime', icon: 'schedule' },
    { label: 'Einde voorstelling', value: 'endTime', icon: 'schedule' },
    { label: 'Volgende inloop', value: 'nextStartTime', icon: 'schedule' },
    { label: 'Filmtitel', value: 'title', icon: 'text_fields' },
    { label: 'Leeftijdskeuring', value: 'ageRating', icon: 'text_fields' },
];

const totalWidth = 183;
const minColWidth = 5;

const columns = ref<{ type: string; width: number }[]>(model.value || []);

watch(model, (newVal) => {
    if (newVal) columns.value = newVal;
}, { deep: true });

watch(columns, (newVal) => {
    model.value = newVal;
}, { deep: true });

const usedWidth = computed(() => columns.value.reduce((sum, col) => sum + col.width, 0));

// Drag state
const dragIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

// Resize state
const resizing = ref<{ index: number; startX: number; startWidthLeft: number; startWidthRight: number } | null>(null);

// Check if we can add a column (either there's space or we can shrink existing columns)
const canAddColumn = computed(() => {
    if (columns.value.length === 0) return true;
    // Can we have at least minColWidth per column after adding one more?
    const newColumnCount = columns.value.length + 1;
    return totalWidth >= newColumnCount * minColWidth;
});

function addColumn(atIndex: number) {
    // Add new column with placeholder width
    columns.value.splice(atIndex, 0, { type: colTypes[0].value, width: 0 });
    
    // Redistribute all columns equally
    distributeWidthsEqually();
}

function distributeWidthsEqually() {
    if (columns.value.length === 0) return;
    
    const count = columns.value.length;
    const baseWidth = Math.floor(totalWidth / count);
    const remainder = totalWidth - (baseWidth * count);
    
    // Give each column the base width, distribute remainder to first columns
    for (let i = 0; i < count; i++) {
        columns.value[i].width = baseWidth + (i < remainder ? 1 : 0);
    }
}

function removeColumn(index: number) {
    columns.value.splice(index, 1);
    
    // Redistribute the removed width to remaining columns
    if (columns.value.length > 0) {
        // Distribute proportionally
        const currentTotal = columns.value.reduce((sum, col) => sum + col.width, 0);
        const scaleFactor = totalWidth / currentTotal;
        
        let distributed = 0;
        for (let i = 0; i < columns.value.length - 1; i++) {
            const newWidth = Math.round(columns.value[i].width * scaleFactor);
            distributed += newWidth;
            columns.value[i].width = newWidth;
        }
        // Last column gets the remainder to ensure exact total
        columns.value[columns.value.length - 1].width = totalWidth - distributed;
    }
}

function onDragStart(e: DragEvent, index: number) {
    dragIndex.value = index;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
    }
}

function onDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    dragOverIndex.value = index;
}

function onDragLeave() {
    dragOverIndex.value = null;
}

function onDrop(e: DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.value !== null && dragIndex.value !== index) {
        const [moved] = columns.value.splice(dragIndex.value, 1);
        columns.value.splice(index > dragIndex.value ? index - 1 : index, 0, moved);
    }
    dragIndex.value = null;
    dragOverIndex.value = null;
}

function onDragEnd() {
    dragIndex.value = null;
    dragOverIndex.value = null;
}

function onResizeStart(e: MouseEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
    resizing.value = {
        index,
        startX: e.clientX,
        startWidthLeft: columns.value[index].width,
        startWidthRight: columns.value[index + 1].width,
    };
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
}

function onResizeMove(e: MouseEvent) {
    if (!resizing.value) return;
    const { index, startX, startWidthLeft, startWidthRight } = resizing.value;
    
    // Calculate delta in pixels and convert to width units
    // Use a reasonable scale: assume each width unit is about 5 pixels
    const pixelDelta = e.clientX - startX;
    const widthDelta = Math.round(pixelDelta / 5);
    
    const combinedWidth = startWidthLeft + startWidthRight;
    
    // Calculate new widths ensuring both stay within bounds
    let newLeftWidth = startWidthLeft + widthDelta;
    let newRightWidth = startWidthRight - widthDelta;
    
    // Clamp to minimum widths
    if (newLeftWidth < minColWidth) {
        newLeftWidth = minColWidth;
        newRightWidth = combinedWidth - minColWidth;
    }
    if (newRightWidth < minColWidth) {
        newRightWidth = minColWidth;
        newLeftWidth = combinedWidth - minColWidth;
    }
    
    columns.value[index].width = newLeftWidth;
    columns.value[index + 1].width = newRightWidth;
}

function onResizeEnd() {
    resizing.value = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
}

// Cleanup event listeners on unmount
onUnmounted(() => {
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
});
</script>

<template>
    <div class="cols-builder">
        <button class="add-btn" @click="addColumn(0)" :disabled="!canAddColumn">+</button>
        <div class="columns">
            <template v-for="(col, i) in columns" :key="i">
                <div
                    class="column"
                    :class="{ dragging: dragIndex === i, 'drag-over': dragOverIndex === i }"
                    :style="{ flex: col.width }"
                    draggable="true"
                    @dragstart="onDragStart($event, i)"
                    @dragover="onDragOver($event, i)"
                    @dragleave="onDragLeave"
                    @drop="onDrop($event, i)"
                    @dragend="onDragEnd"
                >
                    <select v-model="col.type">
                        <option v-for="opt in colTypes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                    <span class="width-label">{{ col.width }}</span>
                    <button class="remove-btn" @click="removeColumn(i)">×</button>
                    <div v-if="i < columns.length - 1" class="resize-handle" @mousedown.stop.prevent="onResizeStart($event, i)"></div>
                </div>
                <button class="add-btn between" @click="addColumn(i + 1)" :disabled="!canAddColumn">+</button>
            </template>
        </div>
        <div class="info">
            Used: {{ usedWidth }} / {{ totalWidth }}
        </div>
    </div>
</template>

<style scoped>
.cols-builder {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.columns {
    display: flex;
    align-items: stretch;
    min-height: 60px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #222;
}

.column {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 4px;
    background: #333;
    border-right: 1px solid #444;
    min-width: 40px;
    cursor: grab;
    user-select: none;
}

.column.dragging {
    opacity: 0.5;
}

.column.drag-over {
    background: #444;
}

.column select {
    max-width: 100%;
    font-size: 12px;
}

.width-label {
    font-size: 10px;
    color: #aaa;
}

.remove-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    padding: 0;
    font-size: 12px;
    line-height: 14px;
    background: #c00;
    color: #fff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
}

.resize-handle {
    position: absolute;
    top: 0;
    right: -3px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    background: transparent;
    z-index: 1;
}

.resize-handle:hover {
    background: #666;
}

.add-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    font-size: 16px;
    background: #555;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    align-self: center;
}

.add-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.add-btn.between {
    width: 20px;
    height: 20px;
    font-size: 14px;
    margin: 0 2px;
}

.info {
    font-size: 12px;
    color: #888;
}
</style>