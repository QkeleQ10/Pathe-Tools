<script setup lang="ts">
import { ref, computed, watch, onUnmounted, useTemplateRef } from 'vue';
import { useElementSize } from '@vueuse/core';

const model = defineModel<{
    type: string;
    width: number;
}[]>({
    default: () => [
        { type: 'auditorium', width: 8 },
        { type: 'scheduledTime', width: 8 },
        { type: 'intermissionTime', width: 12 },
        { type: 'creditsTime', width: 22 },
        { type: 'title', width: 47 },
        { type: 'ageRating', width: 3 },
    ]
});

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

const totalWidth = 100;
const minColWidth = 3;

const columns = ref<{ type: string; width: number }[]>(model.value || []);

watch(model, (newVal) => {
    if (newVal) columns.value = newVal;
}, { deep: true });

watch(columns, (newVal) => {
    model.value = newVal;
}, { deep: true });

const el = useTemplateRef('columnsContainer');
const { width: containerWidth } = useElementSize(el)
const scale = computed(() => containerWidth.value / totalWidth);

const usedWidth = computed(() => columns.value.reduce((sum, col) => sum + col.width, 0));

// Drag state
const dragIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

// Resize state
const resizing = ref<{ index: number; startX: number; startWidthLeft: number; startWidthRight: number } | null>(null);

// Add column dropdown state
const activeDropdown = ref<number | null>(null);

// Check if we can add a column (either there's space or we can shrink existing columns)
const canAddColumn = computed(() => {
    if (columns.value.length === 0) return true;
    // Can we have at least minColWidth per column after adding one more?
    const newColumnCount = columns.value.length + 1;
    return totalWidth >= newColumnCount * minColWidth;
});

function getLabel(type: string) {
    return colTypes.find(c => c.value === type)?.label || type;
}

function toggleDropdown(index: number) {
    if (activeDropdown.value === index) {
        activeDropdown.value = null;
    } else {
        activeDropdown.value = index;
    }
}

function addColumnWithType(atIndex: number, type: string) {
    activeDropdown.value = null;

    const n = columns.value.length + 1; // new column count
    const newColWidth = Math.floor(totalWidth / n); // width for the new column

    if (columns.value.length === 0) {
        // First column takes all available width
        columns.value.splice(atIndex, 0, { type, width: totalWidth });
        return;
    }

    // Reduce existing columns proportionally to free up space for the new column
    const reductionPerCol = newColWidth / (n - 1);
    let totalReduced = 0;

    for (let i = 0; i < columns.value.length; i++) {
        const reduction = Math.floor(reductionPerCol);
        // Ensure column doesn't go below minimum width
        const actualReduction = Math.min(reduction, columns.value[i].width - minColWidth);
        columns.value[i].width -= actualReduction;
        totalReduced += actualReduction;
    }

    // Handle any rounding issues - the new column gets whatever was freed
    const actualNewColWidth = totalReduced;

    // If we couldn't free enough space, take proportionally from all columns
    if (actualNewColWidth < minColWidth) {
        // Fall back to equal distribution
        columns.value.splice(atIndex, 0, { type, width: 0 });
        distributeWidthsEqually();
        return;
    }

    // Add the new column with the freed width
    columns.value.splice(atIndex, 0, { type, width: actualNewColWidth });

    // Ensure total equals totalWidth (fix any rounding issues)
    const currentTotal = columns.value.reduce((sum, col) => sum + col.width, 0);
    if (currentTotal !== totalWidth) {
        columns.value[columns.value.length - 1].width += totalWidth - currentTotal;
    }
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
    const pixelDelta = e.clientX - startX;
    const widthDelta = Math.round(pixelDelta / scale.value);

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

// Close dropdown when clicking outside
function onClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.add-btn-container')) {
        activeDropdown.value = null;
    }
}

// Cleanup event listeners on unmount
onUnmounted(() => {
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
    document.removeEventListener('click', onClickOutside);
});

// Add click outside listener
document.addEventListener('click', onClickOutside);

function getAddButtonPosition(index: number): string {
    // Calculate position based on cumulative width of columns up to this index
    let cumulativeWidth = 0;
    for (let i = 0; i <= index; i++) {
        cumulativeWidth += columns.value[i].width;
    }
    const percentage = (cumulativeWidth / totalWidth) * 100;
    return `${percentage}%`;
}
</script>

<template>
    <div class="cols-builder">
        <div class="columns-wrapper">
            <div class="columns" ref="columnsContainer">
                <template v-for="(col, i) in columns" :key="i">
                    <div class="column" :class="{ dragging: dragIndex === i, 'drag-over': dragOverIndex === i }"
                        :style="{ width: `${col.width / totalWidth * 100}%` }" draggable="true"
                        @dragstart="onDragStart($event, i)" @dragover="onDragOver($event, i)" @dragleave="onDragLeave"
                        @drop="onDrop($event, i)" @dragend="onDragEnd">
                        <span class="col-label">{{ getLabel(col.type) }}</span>
                        <span class="width-label">{{ col.width }}</span>
                        <Icon class="delete" @click="removeColumn(i)">×</Icon>
                        <div v-if="i < columns.length - 1" class="resize-handle"
                            @mousedown.stop.prevent="onResizeStart($event, i)"></div>
                    </div>
                </template>
            </div>
            <div class="add-buttons-row">
                <div class="add-btn-container" :style="{ left: '0' }">
                    <button class="add-btn teardrop" @click.stop="toggleDropdown(0)" :disabled="!canAddColumn"
                        :style="{ anchorName: `--dropdown-0` }">
                        <Icon>add</Icon>
                    </button>
                    <div v-if="activeDropdown === 0" class="dropdown" :style="{ positionAnchor: `--dropdown-0` }">
                        <button v-for="opt in colTypes" :key="opt.value" @click="addColumnWithType(0, opt.value)">
                            <Icon>{{ opt.icon }}</Icon>
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
                <template v-for="(col, i) in columns" :key="'add-' + i">
                    <div class="add-btn-container" :style="{ left: getAddButtonPosition(i) }">
                        <button class="add-btn teardrop" @click.stop="toggleDropdown(i + 1)" :disabled="!canAddColumn"
                            :style="{ anchorName: `--dropdown-${i}` }">
                            <Icon>add</Icon>
                        </button>
                        <div v-if="activeDropdown === i + 1" class="dropdown"
                            :style="{ positionAnchor: `--dropdown-${i}` }">
                            <button v-for="opt in colTypes" :key="opt.value"
                                @click="addColumnWithType(i + 1, opt.value)">
                                <Icon>{{ opt.icon }}</Icon>
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="info">
            Breedte: {{ usedWidth }} / {{ totalWidth }}
        </div>
    </div>
</template>

<style scoped>
.cols-builder {
    margin-block: 16px;
}

.columns-wrapper {
    position: relative;
}

.columns {
    display: flex;
    align-items: stretch;
    min-height: 60px;

    border-radius: 5px;
    border: 1px solid #ffffff14;
    overflow: hidden;
}

.column {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font: 16px Heebo, arial, sans-serif;
    background-color: #ffffff06;
    color: currentColor;
    cursor: grab;
    user-select: none;
}

.column.dragging {
    opacity: .5;
}

.column.drag-over {
    background: #444;
}

.col-label {
    font-size: 11px;
    color: #fff;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
}

.width-label {
    font-size: 10px;
    color: #aaa;
}

.delete {
    position: absolute;
    top: 2px;
    right: 2px;
    color: #ff6b6b;
    cursor: pointer;
}

.resize-handle {
    position: absolute;
    top: 0;
    right: -3px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    background-color: light-dark(#9da1ac, #30343d);
    z-index: 1;
}

.resize-handle:hover {
    background-color: #9da1ac;
}

.add-buttons-row {
    position: relative;
    height: 28px;
    margin-top: -8px;
}

.add-btn-container {
    position: absolute;
    transform: translateX(-50%);
    z-index: 2;
}

.add-btn.teardrop {
    width: 20px;
    height: 20px;
    padding: 0;
    font-size: 14px;
    line-height: 18px;
    color: #090a0b;
    background-color: var(--yellow2);
    border: none;
    border-radius: 50% 0 50% 50%;
    transform: rotate(-45deg);
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
}

.add-btn.teardrop>.icon {
    --size: 16px;
    transform: rotate(45deg);
}

.add-btn.teardrop:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.dropdown {
    position: absolute;
    position-area: bottom center;
    position-try: most-width flip-inline;
    margin: 12px;
    border: 1px solid light-dark(#30343d, #9da1ac);
    background-color: #ffffff06;
}

.dropdown button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 200px;
    padding: 6px 12px;
    text-align: left;
    border: none;
    font-size: 12px;
    cursor: pointer;

    background-color: light-dark(#fff, #30343d);
    color: light-dark(#000, #fff);
    font-size: 14px;
}

.dropdown button:hover {
    background-color: light-dark(#30343d, #9da1ac);
    color: light-dark(#fff, #000);
}

.info {
    font-size: 12px;
    color: #888;
}
</style>