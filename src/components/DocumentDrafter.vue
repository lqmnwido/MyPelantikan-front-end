<template>
  <div class="card p-4 shadow-sm">
    <h5 class="mb-3">Draf Dokumen</h5>
    <div class="mb-3 d-flex gap-2">
      <button class="btn btn-primary" @click="exportPDF">Export to PDF</button>
      <button class="btn btn-success" @click="exportWord">Export to Word</button>
    </div>
    <div ref="editorEl" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
import Editor from '@toast-ui/editor'
import chartPlugin from '@toast-ui/editor-plugin-chart'
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight'
import colorSyntax from '@toast-ui/editor-plugin-color-syntax'
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell'

// import jsPDF from 'jspdf'
import html2pdf from 'html2pdf.js'
// import html2canvas from 'html2canvas'
import htmlDocx from 'html-docx-js/dist/html-docx'
import { saveAs } from 'file-saver'

import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/chart/dist/toastui-chart.css'
import 'prismjs/themes/prism.css'
import 'tui-color-picker/dist/tui-color-picker.css'
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css'
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const editorEl = ref(null)
let editorInstance = null

onMounted(() => {
  editorInstance = new Editor({
    el: editorEl.value,
    height: '400px',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    initialValue: props.modelValue,
    plugins: [
      chartPlugin,
      codeSyntaxHighlight,
      colorSyntax,
      tableMergedCell
    ],
    hooks: {
      addImageBlobHook: async (blob, cb) => {
        // Dummy example: use base64 or real server upload
        const reader = new FileReader()
        reader.onload = () => cb(reader.result, blob.name)
        reader.readAsDataURL(blob)
      }
    }
  })

  editorInstance.on('change', () => {
    emit('update:modelValue', editorInstance.getHTML())
  })
})

onUnmounted(() => {
  editorInstance?.destroy()
})

function exportPDF() {
  const editorContainer = editorEl.value.querySelector('.toastui-editor-contents')

  if (!editorContainer) {
    console.error('Rendered content not found')
    return
  }

  const clone = editorContainer.cloneNode(true)
  clone.style.padding = '20px'
  clone.style.backgroundColor = 'white'
  clone.style.fontSize = '14px'

  const wrapper = document.createElement('div')
  wrapper.appendChild(clone)

  const opt = {
    margin: 0.5,
    filename: 'document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().set(opt).from(wrapper).save()
}



function exportWord() {
  const html = editorInstance.getHTML()
  const blob = htmlDocx.asBlob(html)
  saveAs(blob, 'document.docx')
}
</script>

<style scoped>
.card {
  max-width: 100%;
}

@media print {
  .toastui-editor-toolbar,
  .editor-buttons {
    display: none !important;
  }
}

</style>