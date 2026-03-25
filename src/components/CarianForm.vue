<template>
  <div class="container-fluid">
    <div class="card p-4 shadow-sm">
      <h5 class="mb-4">Carian</h5>
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <!-- Left Column -->
          <div class="col-md-6">
            <FormField v-for="(field, i) in leftFields" :key="i" v-model="form[field.model]" v-bind="field" />
          </div>

          <!-- Right Column -->
          <div class="col-md-6">
            <FormField v-for="(field, i) in rightFields" :key="i" v-model="form[field.model]" v-bind="field" />
          </div>
        </div>

        <div class="text-center mt-3">
          <button type="button" class="btn btn-primary me-2" @click="handleSubmit">Carian</button>
          <button type="button" class="btn btn-warning" @click="resetForm">Set Semula</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import FormField from "@/components/FormField.vue";

export default {
  components: { FormField },
  props: {
    leftFields: Array,
    rightFields: Array,
  },
  data() {
    const allFields = [...(this.leftFields || []), ...(this.rightFields || [])];
    const initialForm = {};
    allFields.forEach((f) => {
      initialForm[f.model] = f.default || "";
    });

    return {
      form: initialForm,
      skipValidation: false,
    };
  },
  methods: {
    handleSubmit() {
      this.$emit("search", this.form, this.skipValidation);
      this.skipValidation = false;
    },
    resetForm() {
      for (let key in this.form) this.form[key] = "";
      this.skipValidation = true;
      this.handleSubmit();
    },
  },
};
</script>
