<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue';

interface Column {
    id: number;
    width: number;
}

const props = withDefaults(defineProps<{
    totalWidth?: number;
    minColumnWidth?: number;
}>(), {
    totalWidth: 100,
    minColumnWidth: 5
});

const model = defineModel<number[]>({ default: () => [] });

let nextId = 0;
const columns = ref<Column[]>([]);
let isInternalUpdate = false;

// Initialize columns from model
function initFromModel() {
    columns.value = model.value.map(width => ({
        id: nextId++,
        width
    }));
}
initFromModel();

// Sync model when columns change
watch(columns, (newColumns) => {
    isInternalUpdate = true;
    model.value = newColumns.map(col => col.width);
}, { deep: true });

// Watch for external model changes (both length and values)
watch(() => [...model.value], (newModel) => {
    if (isInternalUpdate) {
        isInternalUpdate = false;
        return;
    }
    // Check if the model has actually changed from external source
    const currentWidths = columns.value.map(col => col.width);
    const hasChanged = newModel.length !== currentWidths.length ||
        newModel.some((w, i) => Math.abs(w - currentWidths[i]) > 0.001);
    
    if (hasChanged) {
        initFromModel();
    }
}, { deep: true });

const currentTotalWidth = computed(() => {
    return columns.value.reduce((sum, col) => sum + col.width, 0);
});

const isValidTotal = computed(() => {
    return columns.value.length === 0 || Math.abs(currentTotalWidth.value - props.totalWidth) < 0.01;
});

function addColumn(index: number) {
    const newWidth = Math.max(props.minColumnWidth, props.totalWidth / 10);
    
    if (columns.value.length === 0) {
        columns.value.push({
            id: nextId++,
            width: props.totalWidth
        });
        return;
    }
    
    // Distribute the new column width proportionally from existing columns
    const widthToTake = Math.min(newWidth, props.totalWidth - columns.value.length * props.minColumnWidth);
    if (widthToTake <= 0) return; // Cannot add more columns
    
    const ratio = (props.totalWidth - widthToTake) / props.totalWidth;
    
    columns.value.forEach(col => {
        col.width = col.width * ratio;
    });
    
    columns.value.splice(index, 0, {
        id: nextId++,
        width: widthToTake
    });
    
    normalizeWidths();
}

function removeColumn(index: number) {
    if (columns.value.length <= 1) {
        columns.value = [];
        return;
    }
    
    columns.value.splice(index, 1);
    
    // Distribute removed width proportionally to remaining columns
    const currentTotal = columns.value.reduce((sum, col) => sum + col.width, 0);
    if (currentTotal > 0) {
        const ratio = props.totalWidth / currentTotal;
        columns.value.forEach(col => {
            col.width = col.width * ratio;
        });
    } else {
        // Edge case: all remaining columns have zero width, distribute evenly
        const equalWidth = props.totalWidth / columns.value.length;
        columns.value.forEach(col => {
            col.width = equalWidth;
        });
    }
    
    normalizeWidths();
}

function normalizeWidths() {
    if (columns.value.length === 0) return;
    
    const currentTotal = columns.value.reduce((sum, col) => sum + col.width, 0);
    if (Math.abs(currentTotal - props.totalWidth) < 0.01) return;
    
    const ratio = props.totalWidth / currentTotal;
    columns.value.forEach(col => {
        col.width = col.width * ratio;
    });
}

// Drag and drop reordering
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

function onDragStart(index: number, event: DragEvent) {
    draggedIndex.value = index;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(index));
    }
}

function onDragOver(index: number, event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }
    dragOverIndex.value = index;
}

function onDragLeave() {
    dragOverIndex.value = null;
}

function onDrop(index: number) {
    if (draggedIndex.value !== null && draggedIndex.value !== index) {
        const draggedColumn = columns.value[draggedIndex.value];
        columns.value.splice(draggedIndex.value, 1);
        const newIndex = draggedIndex.value < index ? index - 1 : index;
        columns.value.splice(newIndex, 0, draggedColumn);
    }
    draggedIndex.value = null;
    dragOverIndex.value = null;
}

function onDragEnd() {
    draggedIndex.value = null;
    dragOverIndex.value = null;
}

// Resizing
const resizingIndex = ref<number | null>(null);
const resizeStartX = ref(0);
const resizeStartWidths = ref<{ left: number; right: number }>({ left: 0, right: 0 });
const previewRef = useTemplateRef<HTMLElement>('previewRef');

function startResize(index: number, event: MouseEvent) {
    if (index >= columns.value.length - 1) return;
    
    resizingIndex.value = index;
    resizeStartX.value = event.clientX;
    resizeStartWidths.value = {
        left: columns.value[index].width,
        right: columns.value[index + 1].width
    };
    
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', stopResize);
}

function onResizeMove(event: MouseEvent) {
    if (resizingIndex.value === null) return;
    
    const container = previewRef.value;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const deltaX = event.clientX - resizeStartX.value;
    const deltaWidth = (deltaX / containerWidth) * props.totalWidth;
    
    const leftCol = columns.value[resizingIndex.value];
    const rightCol = columns.value[resizingIndex.value + 1];
    
    const newLeftWidth = resizeStartWidths.value.left + deltaWidth;
    const newRightWidth = resizeStartWidths.value.right - deltaWidth;
    
    // Enforce minimum width
    if (newLeftWidth >= props.minColumnWidth && newRightWidth >= props.minColumnWidth) {
        leftCol.width = newLeftWidth;
        rightCol.width = newRightWidth;
    }
}

function stopResize() {
    resizingIndex.value = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', stopResize);
    normalizeWidths();
}

function getColumnWidthPercent(width: number): string {
    return `${(width / props.totalWidth) * 100}%`;
}

function updateColumnWidth(index: number, newWidth: number) {
    if (columns.value.length <= 1) {
        columns.value[index].width = props.totalWidth;
        return;
    }
    
    const oldWidth = columns.value[index].width;
    
    // Clamp to valid range
    const maxPossibleWidth = props.totalWidth - (columns.value.length - 1) * props.minColumnWidth;
    newWidth = Math.max(props.minColumnWidth, Math.min(maxPossibleWidth, newWidth));
    
    if (Math.abs(newWidth - oldWidth) < 0.01) return;
    
    columns.value[index].width = newWidth;
    
    // Adjust other columns proportionally
    const actualDelta = newWidth - oldWidth;
    const otherColumns = columns.value.filter((_, i) => i !== index);
    const otherTotal = otherColumns.reduce((sum, col) => sum + col.width, 0);
    
    if (otherTotal > 0) {
        otherColumns.forEach(col => {
            col.width = col.width - (actualDelta * (col.width / otherTotal));
        });
    } else {
        // Edge case: distribute evenly among other columns
        const equalAdjustment = actualDelta / otherColumns.length;
        otherColumns.forEach(col => {
            col.width = col.width - equalAdjustment;
        });
    }
    
    normalizeWidths();
}

function handleWidthInput(event: Event, index: number) {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        updateColumnWidth(index, isNaN(value) ? props.minColumnWidth : value);
    }
}
</script>

<template>
    <div class="cols-builder">
        <div class="cols-builder-controls">
            <button
                class="add-btn add-btn-start"
                @click="addColumn(0)"
                title="Add column at start"
                type="button"
            >
                <Icon>add</Icon>
            </button>
        </div>

        <div ref="previewRef" class="cols-builder-preview" :class="{ 'is-valid': isValidTotal, 'is-invalid': !isValidTotal }">
            <template v-for="(column, index) in columns" :key="column.id">
                <div
                    class="column"
                    :class="{
                        'dragging': draggedIndex === index,
                        'drag-over': dragOverIndex === index
                    }"
                    :style="{ width: getColumnWidthPercent(column.width) }"
                    draggable="true"
                    @dragstart="onDragStart(index, $event)"
                    @dragover="onDragOver(index, $event)"
                    @dragleave="onDragLeave"
                    @drop="onDrop(index)"
                    @dragend="onDragEnd"
                >
                    <div class="column-content">
                        <span class="column-index">{{ index + 1 }}</span>
                        <input
                            type="number"
                            class="column-width-input"
                            :value="Math.round(column.width * 100) / 100"
                            :min="minColumnWidth"
                            :max="totalWidth - (columns.length - 1) * minColumnWidth"
                            :step="0.1"
                            @input="handleWidthInput($event, index)"
                        />
                        <button
                            class="remove-btn"
                            @click="removeColumn(index)"
                            title="Remove column"
                            type="button"
                        >
                            <Icon>close</Icon>
                        </button>
                    </div>
                    
                    <div class="drag-handle" title="Drag to reorder">
                        <Icon>drag_indicator</Icon>
                    </div>
                </div>

                <div
                    v-if="index < columns.length - 1"
                    class="resize-handle"
                    :class="{ 'resizing': resizingIndex === index }"
                    @mousedown="startResize(index, $event)"
                    title="Drag to resize"
                ></div>

                <button
                    class="add-btn add-btn-between"
                    @click="addColumn(index + 1)"
                    title="Add column here"
                    type="button"
                >
                    <Icon>add</Icon>
                </button>
            </template>

            <div v-if="columns.length === 0" class="empty-state">
                <p>No columns</p>
                <Button @click="addColumn(0)">
                    <Icon>add</Icon>
                    Add first column
                </Button>
            </div>
        </div>

        <div class="cols-builder-info">
            <span v-if="columns.length > 0">
                Total: {{ Math.round(currentTotalWidth * 100) / 100 }} / {{ totalWidth }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.cols-builder {
    width: 100%;
}

.cols-builder-controls {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 8px;
}

.cols-builder-preview {
    display: flex;
    align-items: stretch;
    min-height: 80px;
    border: 2px solid #30343d;
    border-radius: 6px;
    background-color: #1c2129;
    position: relative;
    overflow: hidden;
}

.cols-builder-preview.is-valid {
    border-color: #30343d;
}

.cols-builder-preview.is-invalid {
    border-color: #d53232;
}

.column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #252a34;
    border-right: 1px solid #30343d;
    position: relative;
    min-width: 60px;
    transition: background-color 150ms, opacity 150ms;
    user-select: none;
}

.column:last-of-type {
    border-right: none;
}

.column.dragging {
    opacity: 0.5;
}

.column.drag-over {
    background-color: #3a4050;
}

.column-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
}

.column-index {
    font-size: 10px;
    font-weight: bold;
    color: #888;
    text-transform: uppercase;
}

.column-width-input {
    width: 60px;
    height: 28px;
    padding: 0 6px;
    font: 14px Heebo, arial, sans-serif;
    text-align: center;
    border: 1px solid #30343d;
    background-color: #1c2129;
    color: #fff;
    border-radius: 4px;
}

.column-width-input:focus {
    outline: 2px solid var(--yellow2);
    outline-offset: -2px;
}

/* Hide number input spinners */
.column-width-input::-webkit-outer-spin-button,
.column-width-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.column-width-input {
    -moz-appearance: textfield;
}

.remove-btn {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
    color: #888;
    border-radius: 4px;
    transition: color 150ms, background-color 150ms;
}

.remove-btn:hover {
    color: #ff6b6b;
    background-color: rgba(255, 107, 107, 0.1);
}

.remove-btn:focus-visible {
    outline: 2px solid var(--yellow2);
}

.remove-btn .icon {
    --size: 18px;
}

.drag-handle {
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    cursor: grab;
    color: #555;
    transition: color 150ms;
}

.drag-handle:hover {
    color: #888;
}

.drag-handle:active {
    cursor: grabbing;
}

.drag-handle .icon {
    --size: 16px;
}

.resize-handle {
    width: 8px;
    margin-left: -4px;
    margin-right: -4px;
    cursor: col-resize;
    background-color: transparent;
    z-index: 1;
    transition: background-color 150ms;
}

.resize-handle:hover,
.resize-handle.resizing {
    background-color: var(--yellow2);
}

.add-btn {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    cursor: pointer;
    color: #888;
    background-color: #1c2129;
    border: 1px solid #30343d;
    border-radius: 50%;
    transition: color 150ms, background-color 150ms, border-color 150ms;
}

.add-btn:hover {
    color: #fff;
    background-color: #252a34;
    border-color: var(--yellow2);
}

.add-btn:focus-visible {
    outline: 2px solid var(--yellow2);
    outline-offset: 2px;
}

.add-btn .icon {
    --size: 18px;
}

.add-btn-start {
    margin-bottom: 0;
}

.add-btn-between {
    position: absolute;
    right: -14px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    pointer-events: none;
    z-index: 2;
}

.column:hover .add-btn-between,
.add-btn-between:focus-visible {
    opacity: 1;
    pointer-events: auto;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 24px;
    color: #888;
}

.empty-state p {
    margin: 0 0 12px 0;
}

.cols-builder-info {
    margin-top: 8px;
    font-size: 12px;
    color: #888;
    text-align: right;
}
</style>
