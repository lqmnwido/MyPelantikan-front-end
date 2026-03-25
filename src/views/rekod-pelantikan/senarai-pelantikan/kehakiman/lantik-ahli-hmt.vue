<template>
    <Layout>
        <PageHeader :title="pageTitle" pageTitle="Pelantikan" />

        <FormWizard
            :steps="wizardSteps"
            :formData="form"
            :topicLabel="topicLabel"
            @submit="handleFormSubmit"
            :mode="isEditMode"
        >
            <template #default="{ stepIndex }">
                <div v-if="stepIndex === 0">
                    <LayoutForm :leftFields="leftTab4" :rightFields="rightTab4" v-model:form="form" />
                </div>
            </template>
        </FormWizard>

        <!-- ✅ Success Alerts -->
        <SweetAlert
            :show="alert.success"
            type="success"
            title="Berjaya!"
            text="Calon telah dilantik."
            @closed="alert.success = false"
        />
        <SweetAlert
            :show="alert.kemaskini"
            type="success"
            title="Berjaya!"
            text="Calon telah dikemaskini."
            @closed="alert.kemaskini = false"
        />
        <SweetAlert
            :show="alert.error"
            type="error"
            title="Ralat"
            :text="alert.errorMessage"
            @closed="alert.error = false"
        />
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

export default {
    name: "TambahPelantikan",
    components: { Layout, PageHeader, FormWizard, LayoutForm, SweetAlert },

    data() {
        return {
            isEditMode: "add",
            wizardSteps: [{ title: "Maklumat Lantikan" }],
            form: {
                negeri: null,
                agensi: null,
                tarikh_lanjutan: "",
                tarikh_lantik: "",
                tarikh_tamat: "",
                id_jenis_pelantikan: null,
                catatan: null,
            },
            leftTab4: [
                {
                    label: "Negeri",
                    type: "select-search",
                    placeholder: "- SILA PILIH - ",
                    model: "negeri",
                    options: [
                        { label: "Malaya", value: 1 },
                        { label: "Sabah dan Sarawak", value: 12 },
                    ],
                    required: true
                },
                {
                    label: "6 Bulan Yang diluluskan",
                    type: "date",
                    model: "tarikh_lanjutan",
                },
                { label: "Catatan", type: "textarea", model: "catatan", rows: 3 },
            ],
            rightTab4: [
                { label: "Tarikh Lantik", type: "date", model: "tarikh_lantik", required: true},
                { label: "Tarikh Tamat", type: "date", model: "tarikh_tamat", required: true },
            ],
            lokasiField: [],
            topicLabel: "Butiran Ahli",
            alert: {
                success: false,
                kemaskini: false,
                error: false,
                errorMessage: "",
            },
        };
    },

    async mounted() {
        await this.loadJenisPelantikanID();
        if (this.$route.query.kemaskini === "true") {
            this.isEditMode = "update";
            const id = this.$route.query.id;
            if (id) await this.loadAhli(id);
        }
    },

    methods: {
        async loadJenisPelantikanID() {
            try {
                await lookupService.getJenisPelantikan();
                this.form.id_jenis_pelantikan = 3; // fixed ID
            } catch (err) {
                console.error("Failed to load Jenis Pelantikan ID:", err);
                this.alert.error = true;
                this.alert.errorMessage =
                    err?.response?.data?.message || err.message || "Ralat tidak diketahui";
            }
        },

        async handleFormSubmit() {
            try {
                const id = this.$route.query.id;
                const data = this.form;
                const formData = new FormData();

                // Convert null to empty strings
                for (const key in data) {
                    const value = data[key];
                    formData.append(key, value ?? "");
                }

                formData.append('jawatan', data.jawatan ?? 'Hakim Mahkamah Tinggi');

                // Format date fields
                ["tarikh_lantik", "tarikh_tamat", "tarikh_lanjutan"].forEach((field) => {
                    if (data[field]) {
                        const formatted = new Date(data[field]).toISOString().split("T")[0];
                        formData.set(field, formatted);
                    }
                });

                if (this.isEditMode === "update" && id) {
                    await kehakimanService.kemaskiniAhliHMT(id, formData);
                    this.alert.kemaskini = true;
                } else {
                    formData.append('id', id);
                    await kehakimanService.lantikAhliHMT(formData);
                    this.alert.success = true;
                }

                this.$router.push({
                    path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman",
                    query: { senarai: "hakim-mahkamah-tinggi" },
                });
            } catch (error) {
                console.error("Error preparing form data:", error);
                this.alert.error = true;
                this.alert.errorMessage =
                    error?.response?.data?.message || error.message || "Ralat tidak diketahui";
            }
        },

        async loadAhli(id) {
            try {
                const res = await kehakimanService.maklumatAhliHMT(id);
                const data = res?.data?.data;
                if (!data) throw new Error("Tiada data ahli ditemui.");

                this.form.negeri = data.negeri;
                // if (this.form.negeri) await this.loadLokasi(this.form.negeri);

                this.form.agensi = data.agensi || null;
                this.form.tarikh_lantik = data.tarikh_lantik || "";
                this.form.tarikh_tamat = data.tarikh_tamat || "";
                this.form.tarikh_lanjutan = data.tarikh_lanjutan || "";
                this.form.id_jenis_pelantikan = data.id_lkp_jenis_pelantikan || 3;
                this.form.catatan = data.catatan || "";

                const lokasiFieldIndex = this.leftTab4.findIndex((f) => f.model === "agensi");
                if (lokasiFieldIndex !== -1) {
                    this.leftTab4.splice(lokasiFieldIndex, 1, {
                        ...this.leftTab4[lokasiFieldIndex],
                        options: [...this.lokasiField],
                    });
                }
            } catch (err) {
                console.error("❌ Error loading profil for edit:", err);
                this.alert.error = true;
                this.alert.errorMessage =
                    err?.response?.data?.message || err.message || "Ralat tidak diketahui";
            }
        },

        async loadLokasi(negeriId) {
            try {
                const response = await lookupService.getLokasiHMT(negeriId);
                const lokasiList = response?.data?.data || response?.data || [];
                if (!Array.isArray(lokasiList)) throw new Error("Format data lokasi tidak sah.");

                this.lokasiField = lokasiList.map((lokasi) => ({
                    label: lokasi.nama_lokasi,
                    value: lokasi.id,
                }));
            } catch (err) {
                console.error("Failed to load lokasi options:", err);
                this.lokasiField = [];
                this.alert.error = true;
                this.alert.errorMessage =
                    err?.response?.data?.message || err.message || "Ralat tidak diketahui";
            }
        },
    },

    watch: {
        "form.negeri": {
            async handler(newVal) {
                if (newVal) {
                    await this.loadLokasi(newVal);
                } else {
                    this.lokasiField = [];
                    this.form.agensi = null;
                }
            },
        },
    },

    computed: {
        pageTitle() {
            return this.isEditMode === "update"
                ? "Kemaskini Hakim Mahkamah Tinggi"
                : "Lantik Hakim Mahkamah Tinggi";
        },
    },
};
</script>
