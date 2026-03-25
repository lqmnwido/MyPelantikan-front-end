<!-- File: components/NotaEditor.vue -->
<template>
    <div class="container nota-section page-break">

        <div class="note mt-2">
            <h2>Nota:</h2>

            <div v-if="!isEditing" v-html="notaContent" @click="$emit('start-editing')"></div>

            <div v-else>
                <div ref="editorEl" class="editor-container"></div>
                <button @click="$emit('save')" class="btn btn-success mt-2">Save</button>
            </div>
        </div>
    </div>
</template>

<script>
import Editor from '@toast-ui/editor'
import { nextTick } from 'vue'

export default {
    props: {
        notaContent: String,
        isEditing: Boolean
    },
    emits: ['start-editing', 'save', 'update:notaContent'],
    mounted() {
        this.initEditor()
    },
    watch: {
        isEditing(newVal) {
            if (newVal) this.initEditor()
            else this.destroyEditor()
        }
    },
    beforeUnmount() {
        this.destroyEditor()
    },
    methods: {
        initEditor() {
            nextTick(() => {
                if (!this.isEditing || this.editorInstance) return

                const editorEl = this.$refs.editorEl
                if (!editorEl) {
                    console.warn('Editor element not found')
                    return
                }

                this.editorInstance = new Editor({
                    el: editorEl,
                    height: '300px',
                    initialEditType: 'wysiwyg',
                    previewStyle: 'vertical',
                    initialValue: this.notaContent,
                    events: {
                        change: () => {
                            this.$emit('update:notaContent', this.editorInstance.getHTML())
                        }
                    }
                })
            })
        },

        destroyEditor() {
            if (this.editorInstance) {
                this.editorInstance.destroy()
                this.editorInstance = null
            }
        }
    }
}
</script>

<style scoped>
.page-break {
    page-break-inside:auto;
    break-before:page;
}

.container {
    padding: 20px;
    font-family: Arial, sans-serif;
}

/* Styling for Nota Section */
.note {
    font-size: 12pt;
    margin-bottom: 20px;
    text-align: left;
    /* Align text to the left */
    line-height: 2.5;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.note h2 {
    font-weight: bold;
    text-decoration: underline;
    font-size: 14pt;
    /* Make the heading slightly larger */
    margin-bottom: 10px;
}

.note p {
    font-size: 12pt;
    margin: 10px 0;
    /* Add space between paragraphs */
    line-height: 1.6;
    /* Ensure proper spacing between lines */
}

/* Add margin and padding to ensure proper alignment */
.note div {
    margin-left: 20px;
    /* Indent the content a bit for readability */
}

.note * {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

ol,
ul {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

li {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}
</style>
