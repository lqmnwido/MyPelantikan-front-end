<template>
  <div class="text-center">
    <input type="text" class="dial" :value="current" :data-total="total" readonly />
  </div>
</template>

<script>
import $ from 'jquery';
import 'jquery-knob'; // ✅ Import the plugin to make .knob() available

export default {
  props: {
    current: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    fgColor: {
      type: String,
      default: "#EC407A"
    }
  },
  mounted() {
    this.initializeKnob();
  },
  watch: {
    total(newValue) {
      this.updateKnob(newValue);
    },
    current() {
      this.updateKnob(this.total);
    }
  },
  methods: {
    initializeKnob() {
      const $dial = $(this.$el).find(".dial");
      const currentVal = parseInt(this.current.split('/')[0], 10);
      const displayVal = currentVal > this.total ? this.total : (currentVal < 0 ? 0 : currentVal);

      $dial.val(displayVal).knob({
        min: 0,
        max: this.total,
        readOnly: true,
        width: 70,
        height: 70,
        fgColor: this.fgColor,
        thickness: 0.3,
        displayInput: true,
        inputColor: this.fgColor,
        font: "inherit",
        format: (v) => `${v}/${this.total}`
      });
    },
    updateKnob(newTotal) {
      const $dial = $(this.$el).find(".dial");
      const currentVal = parseInt(this.current.split('/')[0], 10);
      const displayVal = currentVal > newTotal ? newTotal : (currentVal < 0 ? 0 : currentVal);

      $dial.trigger('configure', {
        max: newTotal,
        format: (v) => `${v}/${newTotal}`
      });
      $dial.val(displayVal).trigger('change');
    }
  }
};
</script>


<style scoped>
.dial {
  font-weight: bold;
  font-size: 10px !important;
  /* text-align: center !important; */
  vertical-align: middle;
  padding: 0;
  margin: 0 auto;
  /* width: 100% !important; */
}
</style>
