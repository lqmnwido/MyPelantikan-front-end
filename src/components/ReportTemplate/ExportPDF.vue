<template>
    <div class="container-fluid">
        <div class="card p-4 shadow-sm">
            <!-- <h5 class="mb-4">Saringan</h5> -->
            <form @submit.prevent="handleSubmit">
                <div class="row">
                    <!-- Left Column -->
                    <div class="col-md-6">
                        <FormField v-for="(field, i) in leftFields" :key="i" v-model="form[field.model]" v-bind="field"
                            @change="onKategoriChange" />
                    </div>

                    <!-- Right Column -->
                    <div class="col-md-6">
                        <FormField v-for="(field, i) in rightFields" :key="i" v-model="form[field.model]"
                            v-bind="field" />
                    </div>
                </div>

                <div class="text-center mt-1">
                    <button type="button" @click="handleBack" class="btn btn-secondary me-2 btn-action">Kembali</button>
                    <!-- <button @click="$emit('export')" class="btn btn-primary me-2 btn-action">Muat Turun PDF</button> -->
                    <button @click="$emit('word')" class="btn btn-info me-2 btn-action">Muat Turun MS Word</button>
                    <button @click="$emit('print')" class="btn btn-primary me-2 btn-action">Cetak Laporan</button>


                    <!-- <button type="button" class="btn btn-warning" @click="resetForm">Set Semula</button> -->
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
        selectedKategori: {
            type: String,
            default: '1'
        }
    },
    data() {
        const allFields = [...(this.leftFields || []), ...(this.rightFields || [])];
        const initialForm = {};
        allFields.forEach((f) => {
            initialForm[f.model] = f.default || "";
        });
        return { form: initialForm, kategori: this.selectedKategori };
    },
    emits: [
        'export',
        'word',
        'print',
        'search',
        'update:selectedKategori'
    ],
    watch: {
        selectedKategori(newVal) {
            this.kategori = newVal
        }
    },
    methods: {
        handleBack() {
            this.$router.back();
        },
        handleSubmit() {
            this.$emit("search", this.form);
        },
        resetForm() {
            for (let key in this.form) this.form[key] = "";
        },
        onKategoriChange() {
            this.$emit('update:selectedKategori', this.form.selectedKategori);
        },
    },
};
</script>

<style>
.btn-action {
    width: 200px;
}
</style>
