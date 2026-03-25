<!-- File: components/dragFile/KeteranganForm.vue -->
<template>
    <div id="editor" ref="editorEl" class="editor-container"></div>
    
</template>

<script>
import Editor from '@toast-ui/editor'
import { nextTick } from 'vue'

export default {
    props: {
        keterangan: String,
    },
    emits: ['save', 'update:keterangan'],
    mounted() {
        this.initEditor()
    },
    watch: {
        keterangan(newValue) {
            if (this.editorInstance && newValue !== this.editorInstance.getHTML()) {
                this.editorInstance.setHTML(newValue);
            }
        }
    },
    methods: {
        initEditor() {
            nextTick(() => {
                if (this.editorInstance) return;

                const editorEl = this.$refs.editorEl;
                if (!editorEl) {
                    console.warn('Editor element not found');
                    return;
                }

                this.editorInstance = new Editor({
                    el: editorEl,
                    height: '500px',
                    initialEditType: 'wysiwyg',
                    previewStyle: 'tab',
                    hideModeSwitch: true,
                    initialValue: this.keterangan,
                    toolbarItems: [
                        ['heading', 'bold', 'italic', 'strike'],
                        ['ul', 'ol'],
                    ],
                    events: {
                        change: () => {
                            this.$emit('update:keterangan', this.editorInstance.getHTML());
                        }
                    }
                });
            });
        }

    }
    
}
</script>
