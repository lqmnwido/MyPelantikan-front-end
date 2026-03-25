<template>
  <div class="file-size-wrapper">
    <div class="file-size-content">
      <h4 class="mb-4 text-center">Tetapan Saiz Fail Maksimum</h4>

      <div class="slider-container mb-5">
        <input type="text" ref="slider" />
      </div>

      <div class="text-center mb-4">
        <h5>
          Saiz Ditetapkan:
          <strong>{{ liveSize }} MB</strong>
        </h5>
      </div>

      <div class="text-center">
        <b-button size="lg" variant="primary" @click="saveConfig">
          Simpan
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import "ion-rangeslider";

export default {
  name: "FileSizeConfig",
  props: {
    modelValue: {
      type: Number,
      default: 10,
    },
  },
  emits: ["update:modelValue", "save"],
  data() {
    return {
      liveSize: this.modelValue,
      sliderInstance: null,
    };
  },
  mounted() {
    this.initSlider();
  },
  methods: {
    initSlider() {
      const self = this;
      const $slider = $(this.$refs.slider);

      $slider.ionRangeSlider({
        skin: "round",
        type: "single",
        min: 5,
        max: 50,
        from: this.liveSize,
        postfix: " MB",
        step: 1,
        grid: true,
        onStart(data) {
          self.liveSize = data.from;
        },
        onUpdate(data) {
          self.liveSize = data.from;
        },
        onChange(data) {
          self.liveSize = data.from;
        },
        onFinish(data) {
          self.liveSize = data.from;
          self.$emit("update:modelValue", data.from);
        },
      });

      this.sliderInstance = $slider.data("ionRangeSlider");
    },
    saveConfig() {
      this.$emit("save", this.liveSize);
    },
  },
  watch: {
    modelValue(newVal) {
      if (this.sliderInstance) {
        this.sliderInstance.update({ from: newVal });
        this.liveSize = newVal;
      }
    },
  },
  beforeUnmount() {
    if (this.sliderInstance) {
      this.sliderInstance.destroy();
      this.sliderInstance = null;
    }
  },
};
</script>

<style scoped>
.file-size-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px); /* full screen minus header/footer */
  background-color: #f8f9fa;
  width: 100%;
  padding: 40px 20px;
}

.file-size-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 50px;
  width: 100%;
  max-width: 900px;
}

.slider-container {
  width: 100%;
}

.irs--round .irs-bar {
  background-color: #556ee6;
}
</style>
