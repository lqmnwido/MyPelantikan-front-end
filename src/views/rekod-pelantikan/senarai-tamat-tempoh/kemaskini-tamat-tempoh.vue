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
                    <LayoutForm :leftFields="computedLeftTab4" :rightFields="rightTab4" v-model:form="form" />
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
import { tamatService } from "@/services/tamat.service.js";
import SweetAlert from "@/components/SweetAlert.vue";

export default {
    name: "TambahPelantikan",
    components: { Layout, PageHeader, FormWizard, LayoutForm, SweetAlert },

    data() {
        return {
            isEditMode: "add",
            wizardSteps: [{ title: "Maklumat Lantikan" }],
            form: {
                tarikh_lanjutan: "",
                tarikh_lantik: "",
                tarikh_tamat: "",
                id_jenis_pelantikan: null,
            },
            allLeftTab4Fields: [
                { label: "Tarikh Lantik", type: "date", model: "tarikh_lantik", required: true},
                {
                    label: "6 Bulan Yang diluluskan",
                    type: "date",
                    model: "tarikh_lanjutan",
                },
            ],
            rightTab4: [
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
        if (this.$route.query.kemaskini === "true") {
            this.isEditMode = "update";
            const id = this.$route.query.id;
            if (id) await this.loadAhli(id);
        }
    },

    methods: {
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

                // Format date fields
                ["tarikh_lantik", "tarikh_tamat", "tarikh_lanjutan"].forEach((field) => {
                    if (data[field]) {
                        const formatted = new Date(data[field]).toISOString().split("T")[0];
                        formData.set(field, formatted);
                    }
                });

                if (this.isEditMode === "update" && id) {
                    await tamatService.kemaskini(id, formData);
                    this.alert.kemaskini = true;
                }

                this.$router.push({path: "/rekod-pelantikan/senarai-tamat-tempoh"});

            } catch (error) {
                console.error("Error preparing form data:", error);
                this.alert.error = true;
                this.alert.errorMessage =
                    error?.response?.data?.message || error.message || "Ralat tidak diketahui";
            }
        },

        async loadAhli(id) {
            try {
                const res = await tamatService.maklumat(id);
                const data = res?.data?.data;
                if (!data) throw new Error("Tiada data ahli ditemui.");

                this.form.tarikh_lantik = data.tarikh_lantik || "";
                this.form.tarikh_tamat = data.tarikh_tamat || "";
                this.form.tarikh_lanjutan = data.tarikh_lanjutan || "";
                this.form.id_jenis_pelantikan = data.id_lkp_jenis_pelantikan || null;
            } catch (err) {
                console.error("❌ Error loading profil for edit:", err);
                this.alert.error = true;
                this.alert.errorMessage =
                    err?.response?.data?.message || err.message || "Ralat tidak diketahui";
            }
        },
    },

    watch: {
    },

    computed: {
        pageTitle() {
            return this.isEditMode === "update" ? "Kemaskini Tarikh Tamat Tempoh" : "Tambah Rekod Tamat Tempoh";
        },
        computedLeftTab4() {
            if ([2, 3, 4].includes(this.form.id_jenis_pelantikan)) {
                return this.allLeftTab4Fields;
            } else {
                return this.allLeftTab4Fields.filter(
                    (field) => field.model !== "tarikh_lanjutan"
                );
            }
        },
    },
};
</script>
