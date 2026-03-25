<!-- components/SweetAlert.vue -->
<template>
  <span style="display: none;"></span>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  props: {
    show: Boolean,
    type: {
      type: String,
      default: 'success', // success, error, warning, info, question
    },
    title: String,
    text: String,
    html: String,
    confirmButtonText: {
      type: String,
      default: 'OK',
    },
    cancelButtonText: {
      type: String,
      default: 'Cancel',
    },
    showCancelButton: {
      type: Boolean,
      default: false,
    },
    autoClose: {
      type: Number, // in ms
      default: null,
    },
    toast: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      default: 'center',
    },
    input: {
      type: String, // text, textarea, email, etc.
      default: null,
    },
    inputLabel: String,
    inputPlaceholder: String,
    inputValue: String,
    showLoaderOnConfirm: {
      type: Boolean,
      default: false,
    },
    preConfirm: Function,
  },
  emits: ['confirmed', 'cancelled', 'closed', 'input-value'],
  watch: {
    show(newVal) {
      if (newVal) this.triggerAlert()
    },
  },
  methods: {
    triggerAlert() {
      Swal.fire({
        icon: this.type,
        title: this.title,
        text: this.html ? undefined : this.text,
        html: this.html,
        showCancelButton: this.showCancelButton,
        confirmButtonText: this.confirmButtonText,
        cancelButtonText: this.cancelButtonText,
        reverseButtons: true,
        toast: this.toast,
        position: this.position,
        timer: this.autoClose,
        timerProgressBar: !!this.autoClose,
        input: this.input,
        inputLabel: this.inputLabel,
        inputPlaceholder: this.inputPlaceholder,
        inputValue: this.inputValue,
        showLoaderOnConfirm: this.showLoaderOnConfirm,
        preConfirm: this.preConfirm,
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.isConfirmed) {
          this.$emit('confirmed')
          if (result.value) {
            this.$emit('input-value', result.value)
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.$emit('cancelled')
        }
        this.$emit('closed')
      })
    },
  },
}
</script>
