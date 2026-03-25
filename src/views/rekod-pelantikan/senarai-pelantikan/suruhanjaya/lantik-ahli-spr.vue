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
import { suruhanjayaService } from "@/services/suruhanjaya.service.js";
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
            },

            jawatanList: [],
            //inputGroup Label for perkhidmatan
            inputGroupLabelPerkhidmatan: "Perkhidmatan",

            //4th Tab Fields
            leftTab4: [
                { label: 'Jawatan', type: 'select-search', placeholder: '- SILA PILIH -', model: 'jawatan', options: this.jawatanField, required: true },
                {
                    label: 'Wakil', type: 'select-search', placeholder: '- PILIH WAKIL -', model: 'wakil', options: [
                        { label: 'Melayu', value: 'Wakil Melayu' },
                        { label: 'Cina', value: 'Wakil Cina' },
                        { label: 'India', value: 'Wakil India' },
                        { label: 'Sarawak', value: 'Wakil Sarawak' },
                        { label: 'Sabah', value: 'Wakil Sabah' },
                    ],
                    disabled: !this.isAhli
                },
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
    watch: {
        'form.jawatan'(newVal) {
            const wakilField = this.leftTab4.find(f => f.model === 'wakil');
            if (wakilField) {
                wakilField.disabled = newVal !== 'Ahli';
            }

            if (newVal !== 'Ahli') {
                this.form.wakil = "";
            }
        }
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
                this.jawatanList = response.filter(item => item.id_lkp_jenis_pelantikan === 7).sort((a, b) => a.nama.localeCompare(b.nama));
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
                this.id_jenis_pelantikan = 7 || null;

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
                formData.append('kategori', 'Suruhanjaya Pilihan Raya');
                formData.append('jawatan', data.jawatan);
                formData.append('wakil', data.wakil);

                const tarikh_lantik = data.tarikh_lantik
                    ? new Date(data.tarikh_lantik).toISOString().split('T')[0]
                    : '';

                const tarikh_tamat = data.tarikh_tamat
                    ? new Date(data.tarikh_tamat).toISOString().split('T')[0]
                    : '';

                formData.append('tarikh_lantik', tarikh_lantik);
                formData.append('tarikh_tamat', tarikh_tamat);

                formData.append('id_jenis_pelantikan', data.id_jenis_pelantikan);
                // console.log("✅ FormData ready to send:", formDataToJson(formData));

                const id_pelantikan = this.$route.query.id;

                if (this.isEditMode === 'update' && id_pelantikan) {
                    await suruhanjayaService.kemaskiniAhliSPR(id_pelantikan, formData);
                    this.alert.kemaskini = true;
                } else {
                    await suruhanjayaService.lantikAhliSPR(formData);
                    this.alert.success = true;
                }

                this.$router.push({ path: "/rekod-pelantikan/senarai-pelantikan/kategori/suruhanjaya", query: { senarai: "suruhanjaya-pilihan-raya" } });
            } catch (error) {
                console.error("Error preparing form data:", error);
                this.alert.error = true
                this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui'
                return;
            }
        },
        async loadAhli(id) {
            try {
                const res = await suruhanjayaService.maklumatAhliSPR(id);
                const data = res.data.data;

                // Populate your form here
                this.form = {
                    jawatan: data.jawatan,
                    tarikh_lantik: data.tarikh_lantik,
                    tarikh_tamat: data.tarikh_tamat,
                    wakil: data.wakil,
                    id_jenis_pelantikan: data.id_lkp_jenis_pelantikan,
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
            return this.isEditMode === 'update' ? 'Kemaskini Suruhanjaya Pilihan Raya' : 'Lantik Suruhanjaya Pilihan Raya';
        },
    },
    isAhli() {
        return this.form.jawatan === 'Ahli';
    }


};
</script>
