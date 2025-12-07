<script lang="ts">
export const defaultColumns = [
    { type: 'auditorium', width: 8 },
    { type: 'scheduledTime', width: 9 },
    { type: 'intermissionTime', width: 14 },
    { type: 'creditsTime', width: 17 },
    { type: 'title', width: 49 },
    { type: 'ageRating', width: 3 },
];

export const colTypes: { content: (show: TimetableShow) => string; label: string; colHeading: string; value: string; icon: string, defaultWidth: number, minWidth: number }[] = [
    {
        content: (show) =>
            show.auditorium === 'Rooftop' ? 'RT' : show.auditorium.replace(/^\w+\s/, '')
        , label: "Zaal", colHeading: "Zaal", value: 'auditorium', icon: 'text_fields', defaultWidth: 8, minWidth: 3
    },
    {
        content: (show) =>
            show.scheduledTime ? format(show.scheduledTime, 'HH:mm') : ''
        , label: "Inloop", colHeading: "Inloop", value: 'scheduledTime', icon: 'schedule', defaultWidth: 9, minWidth: 5
    },
    {
        content: (show) =>
            show.mainShowTime ? format(show.mainShowTime, 'HH:mm:ss') : ''
        , label: "Start hoofdfilm", colHeading: "Hoofdfilm", value: 'mainShowTime', icon: 'schedule', defaultWidth: 8, minWidth: 5
    },
    {
        content: (show) =>
            show.intermissionTime ? format(show.intermissionTime, 'HH:mm:ss') : ''
        , label: "Pauze", colHeading: "Pauze", value: 'intermissionTime', icon: 'schedule', defaultWidth: 14, minWidth: 5
    },
    {
        content: (show) =>
            show.creditsTime ? format(show.creditsTime, 'HH:mm:ss') : ''
        , label: "Aftiteling", colHeading: "Aftiteling", value: 'creditsTime', icon: 'schedule', defaultWidth: 17, minWidth: 5
    },
    {
        content: (show) =>
            show.endTime ? format(show.endTime, 'HH:mm:ss') : ''
        , label: "Einde voorstelling", colHeading: "Einde", value: 'endTime', icon: 'schedule', defaultWidth: 8, minWidth: 5
    },
    {
        content: (show) =>
            show.nextStartTime ? format(show.nextStartTime, 'HH:mm') : ''
        , label: "Volgende inloop", colHeading: "Volg.", value: 'nextStartTime', icon: 'schedule', defaultWidth: 5, minWidth: 5
    },
    {
        content: (show) =>
            show.title
        , label: "Filmtitel", colHeading: "Film", value: 'title', icon: 'text_fields', defaultWidth: 49, minWidth: 10
    },
    {
        content: (show) =>
            show.featureRating
        , label: "Leeftijdskeuring", colHeading: "", value: 'ageRating', icon: 'text_fields', defaultWidth: 3, minWidth: 3
    },
    {
        content: (show) =>
            show.nextStartTime && show.endTime && show.nextStartTime.getTime() - show.endTime.getTime() > 0
                ? String(Math.floor((show.nextStartTime.getTime() - show.endTime.getTime()) / 60000))
                : ''
        , label: "Schoonmaaktijd", colHeading: "Sch.", value: 'cleaningTime', icon: 'timer', defaultWidth: 6, minWidth: 3
    }
];
</script>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, useTemplateRef } from 'vue';
import { useElementSize } from '@vueuse/core';
import { format } from 'date-fns';
import { TimetableShow } from '@/scripts/types';

const model = defineModel<{
    type: string;
    width: number;
}[]>({
    default: () => []
});

const totalWidth = 100;
const defaultMinColWidth = 3;

// Helper function to get minWidth for a column type
function getMinWidth(type: string): number {
    return colTypes.find(c => c.value === type)?.minWidth || defaultMinColWidth;
}

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

// Resize state
const resizing = ref<{ index: number; startX: number; startWidthLeft: number; startWidthRight: number } | null>(null);

// Add column dropdown state
const activeDropdown = ref<number | null>(null);

// Column type dropdown state (separate from add dropdown)
const activeColumnDropdown = ref<number | null>(null);

// Check if we can add a column (either there's space or we can shrink existing columns)
const canAddColumn = computed(() => {
    if (columns.value.length === 0) return true;
    // Can we have at least minColWidth per column after adding one more?
    const newColumnCount = columns.value.length + 1;
    const totalMinWidth = columns.value.reduce((sum, col) => sum + getMinWidth(col.type), 0) + defaultMinColWidth;
    return totalWidth >= totalMinWidth;
});

function getLabel(type: string) {
    return colTypes.find(c => c.value === type)?.label || type;
}

function toggleDropdown(index: number) {
    activeColumnDropdown.value = null; // Close column dropdown when opening add dropdown
    if (activeDropdown.value === index) {
        activeDropdown.value = null;
    } else {
        activeDropdown.value = index;
    }
}

function toggleColumnDropdown(index: number) {
    activeDropdown.value = null; // Close add dropdown when opening column dropdown
    if (activeColumnDropdown.value === index) {
        activeColumnDropdown.value = null;
    } else {
        activeColumnDropdown.value = index;
    }
}

function changeColumnType(index: number, type: string) {
    columns.value[index].type = type;
    activeColumnDropdown.value = null;
}

function addColumnWithType(atIndex: number, type: string) {
    activeDropdown.value = null;

    // Get the default width and minWidth for this column type
    const colType = colTypes.find(c => c.value === type);
    const defaultWidth = colType?.defaultWidth || Math.floor(totalWidth / (columns.value.length + 1));
    const newColMinWidth = colType?.minWidth || defaultMinColWidth;

    if (columns.value.length === 0) {
        // First column takes all available width
        columns.value.splice(atIndex, 0, { type, width: totalWidth });
        return;
    }

    // We need to subtract defaultWidth from existing columns
    // Try to take half from the right neighbor and half from the left neighbor
    const halfWidth = Math.floor(defaultWidth / 2);
    let widthToTake = defaultWidth;
    let widthTaken = 0;

    // Helper function to take width from a column (respects column-specific minWidth)
    const takeFromColumn = (colIndex: number, amount: number): number => {
        if (colIndex < 0 || colIndex >= columns.value.length) return 0;
        const colMinWidth = getMinWidth(columns.value[colIndex].type);
        const available = columns.value[colIndex].width - colMinWidth;
        const taken = Math.min(amount, Math.max(0, available));
        if (taken > 0) {
            columns.value[colIndex].width -= taken;
        }
        return taken;
    };

    // Define the index of the column to the right and left of where we're inserting
    // atIndex is where the new column will be inserted
    // The column to the right is at atIndex (before insertion), left is at atIndex - 1
    const rightNeighborIndex = atIndex;
    const leftNeighborIndex = atIndex - 1;

    // First, try to take half from the right neighbor
    if (rightNeighborIndex < columns.value.length) {
        widthTaken += takeFromColumn(rightNeighborIndex, halfWidth);
    }

    // Then, try to take half from the left neighbor
    if (leftNeighborIndex >= 0) {
        widthTaken += takeFromColumn(leftNeighborIndex, halfWidth);
    }

    // If we still need more width, expand outward from the insertion point
    let distance = 1;
    while (widthTaken < widthToTake && distance < columns.value.length) {
        const remaining = widthToTake - widthTaken;
        const halfRemaining = Math.ceil(remaining / 2);

        // Try column further right
        const farRightIndex = atIndex + distance;
        if (farRightIndex < columns.value.length) {
            widthTaken += takeFromColumn(farRightIndex, halfRemaining);
        }

        // Try column further left
        const farLeftIndex = atIndex - 1 - distance;
        if (farLeftIndex >= 0 && widthTaken < widthToTake) {
            widthTaken += takeFromColumn(farLeftIndex, widthToTake - widthTaken);
        }

        distance++;
    }

    // Add the new column with the width we were able to free (or at least minWidth)
    const actualNewColWidth = Math.max(widthTaken, newColMinWidth);
    columns.value.splice(atIndex, 0, { type, width: actualNewColWidth });

    // Ensure total equals totalWidth (fix any rounding issues)
    const currentTotal = columns.value.reduce((sum, col) => sum + col.width, 0);
    if (currentTotal !== totalWidth) {
        // Adjust the new column's width to maintain total
        columns.value[atIndex].width += totalWidth - currentTotal;
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
    const removedWidth = columns.value[index].width;
    columns.value.splice(index, 1);

    // Redistribute the removed width to adjacent columns
    if (columns.value.length > 0) {
        // Determine adjacent column indices (after removal)
        const leftIndex = index - 1;
        const rightIndex = index; // After removal, the column at `index` is the one that was to the right

        if (leftIndex >= 0 && rightIndex < columns.value.length) {
            // Both neighbors exist - split the width between them
            const halfWidth = Math.floor(removedWidth / 2);
            columns.value[leftIndex].width += halfWidth;
            columns.value[rightIndex].width += removedWidth - halfWidth;
        } else if (leftIndex >= 0) {
            // Only left neighbor exists (removed the rightmost column)
            columns.value[leftIndex].width += removedWidth;
        } else if (rightIndex < columns.value.length) {
            // Only right neighbor exists (removed the leftmost column)
            columns.value[rightIndex].width += removedWidth;
        }
    }
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

    // Get column-specific minWidths
    const leftMinWidth = getMinWidth(columns.value[index].type);
    const rightMinWidth = getMinWidth(columns.value[index + 1].type);

    // Calculate new widths ensuring both stay within bounds
    let newLeftWidth = startWidthLeft + widthDelta;
    let newRightWidth = startWidthRight - widthDelta;

    // Clamp to minimum widths
    if (newLeftWidth < leftMinWidth) {
        newLeftWidth = leftMinWidth;
        newRightWidth = combinedWidth - leftMinWidth;
    }
    if (newRightWidth < rightMinWidth) {
        newRightWidth = rightMinWidth;
        newLeftWidth = combinedWidth - rightMinWidth;
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
    if (!target.closest('.column')) {
        activeColumnDropdown.value = null;
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
                    <div class="column" :style="{ width: `${col.width / totalWidth * 100}%` }">
                        <span class="col-label">{{ getLabel(col.type) }}</span>
                        <span class="width-label">{{ col.width }}%</span>
                        <Icon class="delete" @click.stop="removeColumn(i)">close</Icon>
                        <Icon class="edit" @click.stop="toggleColumnDropdown(i)"
                            :style="{ anchorName: `--column-${i}` }">edit</Icon>
                        <div v-if="i < columns.length - 1" class="resize-handle"
                            @mousedown.stop.prevent="onResizeStart($event, i)"></div>
                        <!-- Column type dropdown -->
                        <div v-if="activeColumnDropdown === i" class="dropdown column-dropdown"
                            :style="{ positionAnchor: `--column-${i}` }" @click.stop>
                            <button v-for="opt in colTypes" :key="opt.value" @click="changeColumnType(i, opt.value)"
                                :class="{ active: col.type === opt.value }">
                                <Icon>{{ opt.icon }}</Icon>
                                {{ opt.label }}
                            </button>
                        </div>
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
    height: 50px;

    border-radius: 5px;
    border: 1px solid #ffffff14;
    overflow: visible;
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
    user-select: none;
    transition: background-color 0.15s;
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
    top: 4px;
    right: 8px;
    color: #ff6b6b;
    cursor: pointer;
}

.edit {
    position: absolute;
    bottom: 4px;
    right: 8px;
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
    position-area: left;
    position-try: most-width flip-inline;
    margin: 12px;
    border: 1px solid light-dark(#30343d, #9da1ac);
    background-color: #ffffff06;
    z-index: 10;
}

.column-dropdown {
    position-area: left;
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

.dropdown button.active {
    background-color: var(--yellow2);
    color: #090a0b;
}

.info {
    font-size: 12px;
    color: #888;
}
</style>