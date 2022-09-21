import DiffMatchPatch from 'diff-match-patch';
export default {
    bind(el, { value }, node) {
        const { value: initialValue, color } = value;
        el.__highlightInitialValue = initialValue;
        el.__highlightColor = color;
        el.__dmp = new DiffMatchPatch();
        const input = el.querySelector('input');
        const textarea = el.querySelector('textarea');
        if (input) {
            node.componentInstance.$once('hook:mounted', () => {
                const style = window.getComputedStyle(input, null);
                const div = document.createElement('div');
                div.innerText = initialValue;
                div.style.position = 'absolute';
                div.style.overflow = 'hidden';
                div.style.whiteSpace = 'nowrap';
                div.style.maxWidth = '100%';
                div.style.fontSize = style.fontSize;
                div.style.lineHeight = style.lineHeight;
                div.style.padding = style.padding;
                div.style.color = style.color;
                div.style.zIndex = 0;
                input.parentElement.insertBefore(div, input);
                input.style.zIndex = 1;
                input.style.color = 'transparent';
                el.__backdropEl = div;
                input.onscroll = evt => {
                    const scrollLeft = evt.target.scrollLeft;
                    div.scrollLeft = scrollLeft;
                };
            });
        } else if (textarea) {
            el.__isTextArea = true;
            node.componentInstance.$once('hook:mounted', () => {
                const style = window.getComputedStyle(textarea, null);
                const div = document.createElement('div');
                div.innerText = initialValue;
                div.style.position = 'absolute';
                div.style.overflow = 'hidden auto';
                div.style.whiteSpace = 'pre-wrap';
                div.style.wordWrap = 'break-word';
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.fontSize = style.fontSize;
                div.style.lineHeight = style.lineHeight;
                div.style.padding = style.padding;
                div.style.color = style.color;
                div.style.zIndex = 0;
                textarea.parentElement.insertBefore(div, input);
                textarea.style.zIndex = 1;
                textarea.style.color = 'transparent';

                el.__backdropEl = div;
                textarea.onscroll = evt => {
                    const scrollTop = evt.target.scrollTop;
                    div.scrollTop = scrollTop;
                };
            });
        }
    },
    update(el, { value }) {
        const dmp = el.__dmp;
        const diff = dmp.diff_main(el.__highlightInitialValue, value.value);
        dmp.diff_cleanupSemantic(diff);

        const valueNew = diff.reduce((acc, [index, val]) => {
            if (index === -1) {
                return acc;
            } else if (index === 0) {
                acc += val;
            } else if (index === 1) {
                if (el.__isTextArea) {
                    acc += `<span style="color: ${el.__highlightColor}">${val}</span>`;
                } else {
                    acc += `<span style="white-space: pre; color:${el.__highlightColor}">${val}</span>`;
                }
            }
            return acc;
        }, '');
        el.__backdropEl.innerHTML = valueNew;
    },
    unbind(el) {
        delete el.__backdropEl;
        delete el.__highlightInitialValue;
        delete el.__highlightInitialValue;
        delete el.__dmp;
    },
};
