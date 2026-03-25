<template>
    <Layout>
        <PageHeader title="Templat Laporan" pageTitle="Pentadbir" />

        <div class="container-fluid">
            <div class="row justify-content-center">
                <div class="col-lg-11">
                    <div class="card shadow-sm border-0">
                        <div
                            class="card-header d-flex justify-content-between align-items-center bg-primary text-white">
                            <h5 class="mb-0">
                                {{ isEdit ? "Kemaskini Templat Laporan" : "Cipta Templat Baru" }}
                            </h5>
                        </div>

                        <div class="card-body">
                            <GeneratedTemplate :template-id="templateId" :initial-data="templateData"
                                :variables-field="variablesField" :jenisPelantikan="jenisPelantikan"
                                :jenisPelantikanOptions="jenisPelantikanOptions" :variable-json="variableJson"
                                ref="genTemplate" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import GeneratedTemplate from "@/components/ReportTemplate/ck-editor.vue";

import { lookupService } from "@/services/lookup.service";
import { templateService } from "@/services/template.service";

export default {
    components: { Layout, PageHeader, GeneratedTemplate },
    data() {
        return {
            templateId: this.$route.query.id || null,
            templateData: null,
            variablesField: [
                "nama",
                "jawatan",
                "agensi",
                "umur",
                "wakil",
                "catatan",
                "penggal",
                "tarikh_lahir",
                "tarikh_mula",
                "tarikh_tamat",
                "tarikh_lanjutan",
                "tempoh_perlantikan",
            ],
            jenisPelantikan: [],
            jenisPelantikanOptions: [],
            variableJson: {},
        };
    },
    computed: {
        isEdit() {
            return !!this.templateId || this.$route.query.mod === 'kemaskini';
        },
    },
    mounted() {
        this.loadJenisPelantikan();
        if (this.isEdit) {
            this.loadTemplate();
        }
    },
    methods: {
        async loadJenisPelantikan() {
            const response = await lookupService.getJenisPelantikan();
            // console.log(response);
            const templates = await templateService.getAllReportTemplates();

            const usedJenisIds = templates.map(t => t.name);

            this.jenisPelantikanOptions = response.filter(item => {

                if (Number(item.id) === 1) return false;

                // ✅ If in edit mode, keep the currently selected jenisPelantikan visible
                if (this.isEdit && this.jenisPelantikan?.nama === item.name) {
                    return true;
                }
                // Otherwise, filter out used IDs
                return !usedJenisIds.includes((item.nama));
            }).map((item) => ({
                label: item.nama,
                value: item.nama,
            }));

            // console.log(usedJenisIds);
            if (Array.isArray(response)) {
                this.jenisPelantikan = response.filter(item => Number(item.id) !== 1).map((item) => ({
                    label: item.nama,
                    value: item.id,
                    maxAhli: item.kapasiti_ahli || 1,
                }));
            }

        },
        async loadTemplate() {
            try {
                const res = await templateService.getTemplateReport(this.templateId);
                this.templateData = res;
                // console.log(res);
            } catch (err) {
                console.error("Failed to load template", err);
            }
        },
        async handleSave() {
            await this.$refs.genTemplate.saveTemplate();
        },
        async handleUpdate() {
            await this.$refs.genTemplate.updateTemplate();
        },
        goBack() {
            this.$router.back();
        },
    },
};
</script>