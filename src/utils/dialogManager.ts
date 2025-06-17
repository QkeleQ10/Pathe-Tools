// utils/DialogManager.ts
import { h, render, VNode, Component, isVNode, ref, watch } from 'vue';
import ModalDialog from '@/components/ModalDialog.vue';

type DialogContent =
    | string
    | VNode
    | Component
    | (() => VNode)
    | DialogContent[];

export function showDialog(content: DialogContent) {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const isVisible = ref(true);

    const destroy = () => {
        render(null, container);
        document.body.removeChild(container);
    };

    const hide = () => {
        isVisible.value = false;
    };

    const show = () => {
        isVisible.value = true;
    };

    const onDismiss = () => {
        destroy();
    };

    const normalize = (item: DialogContent): VNode[] => {
        if (Array.isArray(item)) return item.flatMap(normalize);
        if (typeof item === 'string') return [h('div', item)];
        if (typeof item === 'function') return [(item as () => VNode)()];
        if (isVNode(item)) return [item];
        return [h(item)];
    };

    const vnode = h(ModalDialog, {
        onDismiss,
        visible: isVisible.value, // pass visibility prop
    }, {
        default: () => normalize(content),
    });

    // Reactive re-render on isVisible change
    const reactiveRender = () => render(h(() => vnode), container);
    reactiveRender();
    watch(isVisible, reactiveRender);

    return {
        hide,
        show,
        destroy,
        isVisible,
    };
}
