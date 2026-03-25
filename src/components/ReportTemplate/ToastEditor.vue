<template>
  <div ref="editor"></div>
</template>

<script>
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

export default {
  name: 'ToastEditor',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      editor: null,
    };
  },
  watch: {
    modelValue(newValue) {
      if (this.editor && this.editor.getHTML() !== newValue) {
        this.editor.setHTML(newValue);
      }
    },
  },
  mounted() {
    if (this.$refs.editor) {
      this.editor = new Editor({
        el: this.$refs.editor,
        height: '300px',
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
        initialValue: this.modelValue,
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['table', 'link'],
        ],
      });

      this.editor.on('change', () => {
        this.$emit('update:modelValue', this.editor.getHTML());
      });
    }
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  },
};
</script>
