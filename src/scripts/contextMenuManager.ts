// utils/contextMenuManager.ts
import { h, render, VNode, Component, isVNode } from 'vue';
import ContextMenu from '@ui/ContextMenu.vue';

type ContextMenuContent =
    | string
    | VNode
    | Component
    | (() => VNode)
    | ContextMenuContent[];

export interface ShowContextMenuOptions {
    x?: number;
    y?: number;
    anchor?: HTMLElement;
}

export function showContextMenu(content: ContextMenuContent, options: ShowContextMenuOptions = {}) {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Set anchor name on the anchor element if provided
    if (options.anchor) {
        options.anchor.style.anchorName = '--context-menu-anchor';
    }

    const destroy = () => {
        render(null, container);
        document.body.removeChild(container);
    };

    const onClickOutside = () => {
        destroy();
    };

    const normalize = (item: ContextMenuContent): VNode[] => {
        if (Array.isArray(item)) return item.flatMap(normalize);
        if (typeof item === 'string') return [h('div', item)];
        if (typeof item === 'function') return [(item as () => VNode)()];
        if (isVNode(item)) return [item];
        return [h(item)];
    };

    const vnode = h(ContextMenu, {
        x: options.x,
        y: options.y,
        anchor: options.anchor,
        onClickOutside,
    }, {
        default: () => normalize(content),
    });

    render(h(() => vnode), container);

    return {
        destroy,
    };
}
