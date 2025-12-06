<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue';
import { useElementSize, onClickOutside } from '@vueuse/core';

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

// Container element and sizing
const columnsContainer = useTemplateRef('columnsContainer');
const addButtonsRow = useTemplateRef('addButtonsRow');
const { width: containerWidth } = useElementSize(columnsContainer);
const scale = computed(() => containerWidth.value / totalWidth);

// Computed width info
const usedWidth = computed(() => model.value.reduce((sum, col) => sum + col.width, 0));

// Dropdown states
const activeAddDropdown = ref<number | null>(null);
const activeColumnDropdown = ref<number | null>(null);

// Close dropdowns when clicking outside
onClickOutside(addButtonsRow, () => { activeAddDropdown.value = null; }, { ignore: [columnsContainer] });
onClickOutside(columnsContainer, () => { activeColumnDropdown.value = null; }, { ignore: [addButtonsRow] });

// Check if we can add a column
const canAddColumn = computed(() => {
    if (model.value.length === 0) return true;
    return totalWidth >= (model.value.length + 1) * minColWidth;
});

function getLabel(type: string) {
    return colTypes.find(c => c.value === type)?.label || type;
}

function toggleAddDropdown(index: number) {
    activeColumnDropdown.value = null;
    activeAddDropdown.value = activeAddDropdown.value === index ? null : index;
}

function toggleColumnDropdown(index: number) {
    activeAddDropdown.value = null;
    activeColumnDropdown.value = activeColumnDropdown.value === index ? null : index;
}

function changeColumnType(index: number, type: string) {
    model.value[index].type = type;
    activeColumnDropdown.value = null;
}

function addColumnWithType(atIndex: number, type: string) {
    activeAddDropdown.value = null;

    const n = model.value.length + 1;
    const newColWidth = Math.floor(totalWidth / n);

    if (model.value.length === 0) {
        model.value.splice(atIndex, 0, { type, width: totalWidth });
        return;
    }

    // Reduce existing columns proportionally
    const reductionPerCol = newColWidth / (n - 1);
    let totalReduced = 0;

    for (let i = 0; i < model.value.length; i++) {
        const reduction = Math.min(Math.floor(reductionPerCol), model.value[i].width - minColWidth);
        model.value[i].width -= reduction;
        totalReduced += reduction;
    }

    // Add new column with freed width, or fall back to equal distribution
    if (totalReduced < minColWidth) {
        model.value.splice(atIndex, 0, { type, width: 0 });
        distributeWidthsEqually();
    } else {
        model.value.splice(atIndex, 0, { type, width: totalReduced });
        // Fix rounding issues
        const diff = totalWidth - model.value.reduce((sum, col) => sum + col.width, 0);
        if (diff !== 0) model.value[model.value.length - 1].width += diff;
    }
}

function distributeWidthsEqually() {
    const count = model.value.length;
    if (count === 0) return;

    const baseWidth = Math.floor(totalWidth / count);
    const remainder = totalWidth - baseWidth * count;

    model.value.forEach((col, i) => {
        col.width = baseWidth + (i < remainder ? 1 : 0);
    });
}

function removeColumn(index: number) {
    model.value.splice(index, 1);

    if (model.value.length > 0) {
        const currentTotal = model.value.reduce((sum, col) => sum + col.width, 0);
        const scaleFactor = totalWidth / currentTotal;

        let distributed = 0;
        for (let i = 0; i < model.value.length - 1; i++) {
            const newWidth = Math.round(model.value[i].width * scaleFactor);
            distributed += newWidth;
            model.value[i].width = newWidth;
        }
        model.value[model.value.length - 1].width = totalWidth - distributed;
    }
}

// Resize state and handlers
const resizing = ref<{ index: number; startX: number; startWidthLeft: number; startWidthRight: number } | null>(null);

function onResizeStart(e: MouseEvent, index: number) {
    resizing.value = {
        index,
        startX: e.clientX,
        startWidthLeft: model.value[index].width,
        startWidthRight: model.value[index + 1].width,
    };
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
}

function onResizeMove(e: MouseEvent) {
    if (!resizing.value) return;
    const { index, startX, startWidthLeft, startWidthRight } = resizing.value;

    const pixelDelta = e.clientX - startX;
    const widthDelta = Math.round(pixelDelta / scale.value);
    const combinedWidth = startWidthLeft + startWidthRight;

    let newLeftWidth = Math.max(minColWidth, Math.min(startWidthLeft + widthDelta, combinedWidth - minColWidth));
    let newRightWidth = combinedWidth - newLeftWidth;

    model.value[index].width = newLeftWidth;
    model.value[index + 1].width = newRightWidth;
}

function onResizeEnd() {
    resizing.value = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
}

function getAddButtonPosition(index: number): string {
    let cumulativeWidth = 0;
    for (let i = 0; i <= index; i++) {
        cumulativeWidth += model.value[i].width;
    }
    return `${(cumulativeWidth / totalWidth) * 100}%`;
}

// Compute dropdown position class based on available space
function getDropdownPositionClass(index: number): string {
    const position = index <= 0 ? 0 : parseFloat(getAddButtonPosition(index - 1));
    // If position > 70%, flip to the left
    return position > 70 ? 'dropdown-left' : '';
}

function getColumnDropdownPositionClass(index: number): string {
    let cumulativeWidth = 0;
    for (let i = 0; i <= index; i++) {
        cumulativeWidth += model.value[i].width;
    }
    const centerPosition = (cumulativeWidth - model.value[index].width / 2) / totalWidth * 100;
    return centerPosition > 70 ? 'dropdown-left' : '';
}
</script>

<template>
    <div class="cols-builder">
        <div class="columns-wrapper">
            <div class="columns" ref="columnsContainer">
                <template v-for="(col, i) in model" :key="i">
                    <div class="column" :style="{ width: `${col.width}%` }" @click.stop="toggleColumnDropdown(i)">
                        <span class="col-label">{{ getLabel(col.type) }}</span>
                        <span class="width-label">{{ col.width }}</span>
                        <Icon class="delete" @click.stop="removeColumn(i)">close</Icon>
                        <div v-if="i < model.length - 1" class="resize-handle"
                            @mousedown.stop.prevent="onResizeStart($event, i)"></div>
                        <!-- Column type dropdown -->
                        <div v-if="activeColumnDropdown === i" class="dropdown column-dropdown"
                            :class="getColumnDropdownPositionClass(i)" @click.stop>
                            <button v-for="opt in colTypes" :key="opt.value" @click="changeColumnType(i, opt.value)"
                                :class="{ active: col.type === opt.value }">
                                <Icon>{{ opt.icon }}</Icon>
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>
                </template>
            </div>
            <div class="add-buttons-row" ref="addButtonsRow">
                <div class="add-btn-container" :style="{ left: '0' }">
                    <button class="add-btn teardrop" @click.stop="toggleAddDropdown(0)" :disabled="!canAddColumn">
                        <Icon>add</Icon>
                    </button>
                    <div v-if="activeAddDropdown === 0" class="dropdown" :class="getDropdownPositionClass(0)">
                        <button v-for="opt in colTypes" :key="opt.value" @click="addColumnWithType(0, opt.value)">
                            <Icon>{{ opt.icon }}</Icon>
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
                <template v-for="(col, i) in model" :key="'add-' + i">
                    <div class="add-btn-container" :style="{ left: getAddButtonPosition(i) }">
                        <button class="add-btn teardrop" @click.stop="toggleAddDropdown(i + 1)" :disabled="!canAddColumn">
                            <Icon>add</Icon>
                        </button>
                        <div v-if="activeAddDropdown === i + 1" class="dropdown" :class="getDropdownPositionClass(i + 1)">
                            <button v-for="opt in colTypes" :key="opt.value" @click="addColumnWithType(i + 1, opt.value)">
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
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s;
}

.column:hover {
    background-color: #ffffff12;
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

.add-btn.teardrop > .icon {
    --size: 16px;
    transform: rotate(45deg);
}

.add-btn.teardrop:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.dropdown {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 12px;
    border: 1px solid light-dark(#30343d, #9da1ac);
    background-color: light-dark(#fff, #1a1c1f);
    border-radius: 4px;
    z-index: 10;
    min-width: 160px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dropdown.dropdown-left {
    left: auto;
    right: 0;
    transform: translateX(50%);
}

.column-dropdown {
    top: calc(100% + 4px);
}

.dropdown button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px 12px;
    text-align: left;
    border: none;
    font-size: 14px;
    cursor: pointer;
    background-color: transparent;
    color: light-dark(#000, #fff);
}

.dropdown button:hover {
    background-color: light-dark(#f0f0f0, #30343d);
}

.dropdown button.active {
    background-color: light-dark(#e0e0e0, #3a3e47);
}

.info {
    font-size: 12px;
    color: #888;
}
</style>