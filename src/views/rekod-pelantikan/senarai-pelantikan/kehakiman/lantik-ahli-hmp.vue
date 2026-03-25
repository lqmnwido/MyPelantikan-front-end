<template>
    <Layout>
        <PageHeader :title="pageTitle" pageTitle="Pelantikan" />
        <FormWizard :steps="wizardSteps" :formData="form" :topicLabel="topicLabel" @submit="handleFormSubmit"
            :mode="isEditMode">
            <template #default="{ stepIndex }">
                <div v-if="stepIndex === 0">
                    <LayoutForm :leftFields="leftTab4" :rightFields="rightTab4" v-model:form="form" />
                </div>
            </template>
        </FormWizard>

        <SweetAlert :show="alert.success" type="success" title="Berjaya!" text="Calon telah dilantik."
            @closed="alert.success = false" />

        <SweetAlert :show="alert.kemaskini" type="success" title="Berjaya!" text="Calon telah dikemaskini."
            @closed="alert.success = false" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />

    </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import FormWizard from "@/components/FormWizard.vue";
import LayoutForm from "@/components/LayoutForm.vue";
import { kehakimanService } from "@/services/kehakiman.service.js";
import { lookupService } from "@/services/lookup.service.js";
import SweetAlert from "@/components/SweetAlert.vue";
// function formDataToJson(formData) {
//     const obj = {};
//     for (let [key, value] of formData.entries()) {
//         obj[key] = value;
//     }
//     return obj;
// }

export default {
    components: { Layout, PageHeader, FormWizard, LayoutForm, SweetAlert },
    name: "TambahPelantikan",
    data() {
        return {
            isEditMode: "add",
            wizardSteps: [
                { title: "Maklumat Lantikan" }
            ],
            form: {
                jawatan: "",
                tarikh_lanjutan: "",
                tarikh_lantik: "",
                tarikh_tamat: "",
                catatan: "",
            },

            jawatanList: [],
            //inputGroup Label for perkhidmatan
            inputGroupLabelPerkhidmatan: "Perkhidmatan",

            //4th Tab Fields
            leftTab4: [
                { label: 'Jawatan', type: 'select-search', placeholder: '- SILA PILIH -', model: 'jawatan', options: this.jawatanField, required: true},
                { label: '6 Bulan Yang diluluskan', type: 'date', model: 'tarikh_lanjutan' },
                { label: 'Catatan', type: 'textarea', model: 'catatan', rows: 3 },
            ],
            rightTab4: [
                { label: 'Tarikh Lantik', type: 'date', model: 'tarikh_lantik', required: true },
                { label: 'Tarikh Tamat', type: 'date', model: 'tarikh_tamat', required: true },
            ],

            alert: {
                success: false,
                error: false,
                kemaskini: false,
                errorMessage: '',
            },
            topicLabel: "Butiran Ahli",
        };
    },
    async mounted() {
        await this.loadJawatan();
        await this.loadJenisPelantikanID();
        if (this.$route.query.kemaskini === 'true') {
            this.isEditMode = 'update';
            const id = this.$route.query.id;
            if (id) {
                await this.loadAhli(id);
            }
        }
    },
    methods: {
        async loadJawatan() {
            try {
                const response = await lookupService.getJawatan();
                this.jawatanList = response.filter(item => item.id_lkp_jenis_pelantikan === 4).sort((a, b) => a.nama.localeCompare(b.nama));
                // console.log("Jawatan loaded:", response);
                const jawatanField = this.leftTab4.find(f => f.model === 'jawatan');

                if (jawatanField) {
                    jawatanField.options = this.jawatanList.map(item => ({
                        label: item.nama,
                        value: item.nama
                    }));
                }
                // console.log("Jawatan loaded:", this.jawatanList);
            } catch (error) {
                console.error("Error loading jawatan:", error)
                this.alert.error = true
                this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui'
            }
        },
        async loadJenisPelantikanID() {
            try {
                await lookupService.getJenisPelantikan();
                this.id_jenis_pelantikan = 4 || null;

                this.form.id_jenis_pelantikan = this.id_jenis_pelantikan;

                // console.log("Jenis Pelantikan ID options loaded:", this.id_jenis_pelantikan);
            } catch (err) {
                console.error("Failed to load Jenis Pelantikan ID options:", err);
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui'
            }
        },
        async handleFormSubmit() {
            try {
                const id = this.$route.query.id;

                const data = this.form;
                const formData = new FormData();

                for (let [key, value] of formData.entries()) {
                    if (value === "null" || value === "undefined" || value === null || value === undefined) {
                        formData.set(key, "");
                    }
                }

                formData.append('id', id);
                formData.append('jawatan', data.jawatan ?? 'Hakim Mahkamah Persekutuan');
                formData.append('catatan', data.catatan);


                const tarikh_lantik = data.tarikh_lantik
                    ? new Date(data.tarikh_lantik).toISOString().split('T')[0]
                    : '';

                const tarikh_tamat = data.tarikh_tamat
                    ? new Date(data.tarikh_tamat).toISOString().split('T')[0]
                    : '';
                const tarikh_lanjutan = data.tarikh_lanjutan
                    ? new Date(data.tarikh_lanjutan).toISOString().split('T')[0]
                    : '';

                formData.append('tarikh_lantik', tarikh_lantik);
                formData.append('tarikh_tamat', tarikh_tamat);
                formData.append('tarikh_lanjutan', tarikh_lanjutan);

                formData.append('id_jenis_pelantikan', data.id_jenis_pelantikan);
                // console.log("✅ FormData ready to send:", formDataToJson(formData));
                
                const id_pelantikan = this.$route.query.id;

                if (this.isEditMode === 'update' && id_pelantikan) {
                    await kehakimanService.kemaskiniAhliHMP(id_pelantikan, formData);
                    this.alert.kemaskini = true;
                } else {
                    await kehakimanService.lantikAhliHMP(formData);
                    this.alert.success = true;
                }
            
                this.$router.push({ path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman", query: { senarai: "hakim-mahkamah-persekutuan" } });
            } catch (error) {
                console.error("Error preparing form data:", error);
                this.alert.error = true
                this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui'
                return;
            }
        },
        async loadAhli(id) {
            try {
                const res = await kehakimanService.maklumatAhliHMP(id);
                const data = res.data.data;

                // Populate your form here
                this.form = {
                    jawatan: data.jawatan,
                    tarikh_lantik: data.tarikh_lantik,
                    tarikh_tamat: data.tarikh_tamat,
                    tarikh_lanjutan: data.tarikh_lanjutan,
                    id_jenis_pelantikan: data.id_lkp_jenis_pelantikan,
                    catatan: data.catatan,
                };

            } catch (err) {
                console.error("❌ Error loading profil for edit:", err);
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui'
            }
        },
    },
    computed: {
        pageTitle() {
            return this.isEditMode === 'update' ? 'Kemaskini Hakim Mahkamah Persekutuan' : 'Lantik Hakim Mahkamah Persekutuan';
        },
    }


};
</script>
