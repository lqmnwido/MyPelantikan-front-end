<template>
  <div class="mb-3 row">
    <!-- Left Column -->
    <div class="col-md-6">
      <FormField v-for="(field, i) in leftFields" :key="`left-${i}`" :model-value="getValue(field.model)"
        @update:modelValue="setValue(field.model, $event)" v-bind="field" />

    </div>

    <!-- Right Column -->
    <div class="col-md-6">
      <FormField v-for="(field, i) in rightFields" :key="`left-${i}`" :model-value="getValue(field.model)"
        @update:modelValue="setValue(field.model, $event)" v-bind="field" />

    </div>
  </div>
</template>

<script>
import FormField from "@/components/FormField.vue";

export default {
  name: "LayoutForm",
  components: { FormField },
  props: {
    leftFields: { type: Array, default: () => [] },
    rightFields: { type: Array, default: () => [] },
    form: { type: Object, required: true },
  },
  computed: {
    localForm: {
      get() {
        return this.form;
      },
      set(newValue) {
        this.$emit("update:form", newValue);
      },
    },
  },
  methods: {
    getValue(model) {
      if (!model || typeof model !== 'string') return undefined;
      return model.split(".").reduce((acc, key) => acc?.[key], this.localForm);
    },
    setValue(model, value) {
      if (!model || typeof model !== 'string') return;

      const keys = model.split(".");
      let target = this.localForm;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in target)) target[keys[i]] = {};
        target = target[keys[i]];
      }

      target[keys[keys.length - 1]] = value;
    }

  },
};
</script>
