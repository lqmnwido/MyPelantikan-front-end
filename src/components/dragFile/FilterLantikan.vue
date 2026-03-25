<template>
  <div>
    <Multiselect
      v-model="selectedFilters"
      :options="jenisPelantikanList"
      mode="tags"
      placeholder="Pilih jenis lantikan"
      @change="updateModelValue"
    />
  </div>
</template>

<script>
import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';

export default {
  name: "FilterLantikan",
  components: { Multiselect },
  props: {
    modelValue: Object,
    jenisPelantikanList: Array,
  },
  data() {
    return {
      selectedFilters: Object.keys(this.modelValue).filter(key => this.modelValue[key]),
    };
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.selectedFilters = Object.keys(newVal).filter(key => newVal[key]);
      },
      deep: true,
    },
  },
  methods: {
    updateModelValue(newVal) {
      const newModelValue = {};
      this.jenisPelantikanList.forEach(item => {
        newModelValue[item] = newVal.includes(item);
      });
      this.$emit("update:modelValue", newModelValue);
    },
  },
};
</script>