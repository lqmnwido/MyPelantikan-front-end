<template>
  <Multiselect
    id="gelaran"
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    @search-change="$emit('search-change', $event)"
    :options="filtered"
    :group-label="'group'"
    :group-values="'options'"
    placeholder="Pilih penerima"
    track-by="value"
    label="label"
    multiple
    class="multiselect"
  />
</template>

<script>
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

export default {
  name: "MultiselectPenerima",
  components: { Multiselect },
  props: {
    modelValue: Array,
    penerima: Array,
    filter: Object,
  },
  emits: ['update:modelValue', 'search-change'],
  computed: {
    filtered() {
      // ✅ Prevent error if filter is undefined/null
      if (!this.filter || typeof this.filter !== 'object') {
        return this.penerima || [];
      }

      const activeGroups = Object.keys(this.filter).filter(key => this.filter[key]);

      if (activeGroups.length === 0) {
        return this.penerima || [];
      }

      return this.penerima.filter(group => activeGroups.includes(group.group));
    }
  }
}
</script>

<style>
.multiselect {
  width: 100% !important;
  height: auto !important;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 12px;
  line-height: 1.2;
  background-color: #fff;
}

.multiselect__input {
  margin: 0;
  padding: 0;
  height: auto;
  font-size: 12px;
}

.multiselect__single {
  padding: 0;
  margin: 0;
  line-height: 1.5;
}

.multiselect__select {
  height: 38px;
}

.multiselect__content-wrapper {
  z-index: 1000;
  border-radius: 0.375rem;
  border: 1px solid #6c757d;
}
</style>
