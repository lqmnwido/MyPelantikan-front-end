<template>
    <Layout>
        <PageHeader title="Senarai Pelantikan" pageTitle="Rekod Pelantikan" />

        <!-- DataTable -->
        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :buttonLabel="buttonLabel" :buttonTambah="buttonTambah" :link="link" :cetak="cetak"
            :linkCetak="print" :params="params" :columnWidths="columnWidths" :total="total" :page="page"
            :perPage="perPage" :loading="loading" serverSide @change-page="onChangePage"
            @change-per-page="onChangePerPage" @search="onSearch">
            <!-- Actions slot -->
            <template #actions="{ item }">
                <button class="icon-btn text-primary me-1" @click="goToProfile(item, 'view')" title="Papar">
                    <i class="mdi mdi-eye"></i>
                </button>
                <button class="icon-btn text-success me-1" @click="goToKemaskini(item, 'kemaskini')" title="Kemaskini">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="icon-btn text-secondary me-1" @click="goToResume(item)" title="Resume">
                    <i class="mdi mdi-file-document"></i>
                </button>
                <button class="icon-btn text-warning" @click="nyahAktif(item)" title="Nyah Aktif">
                    <i class="mdi mdi-delete"></i>
                </button>
                <button class="icon-btn text-danger me-1" @click="handleDelete(item)" title="Padam">
                    <i class="mdi mdi-delete"></i>
                </button>

                <SweetAlert :show="showConfirmNyahAktif" type="warning" title="Anda pasti?"
                    :html="`Tindakan ini akan nyahaktif rekod: <br/><b>${deleteTarget}</b><br/> dan disimpan ke senarai tamat tempoh`"
                    :showCancelButton="true" confirmButtonText="Ya, Nyahaktif" cancelButtonText="Batal"
                    @confirmed="confirmNyahAktif" @cancelled="showConfirmNyahAktif = false"
                    @closed="showConfirmNyahAktif = false" />

                <SweetAlert :show="showConfirmDelete" type="warning" title="Anda pasti?"
                    :html="`Tindakan ini akan memadamkan rekod: <br/><b>${deleteTarget}</b><br/> dari senarai pelantikan ini`"
                    :showCancelButton="true" confirmButtonText="Ya, Padam" cancelButtonText="Batal"
                    @confirmed="confirmDelete" @cancelled="showConfirmDelete = false"
                    @closed="showConfirmDelete = false" />

            </template>
        </DataTable>

        <!-- Alerts -->
        <SweetAlert :show="showSuccess" type="success" title="Berjaya!" text="Calon dinyahaktifkan." :autoClose="1500"
            @closed="showSuccess = false" />

        <SweetAlert :show="showSuccessPadam" type="success" title="Berjaya!" text="Calon dipadamkan." :autoClose="1500"
            @closed="showSuccess = false" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { templateSenaraiService } from "@/services/templateSenarai.service.js"; // ✅ add service for TemplateSenarai
import { templateService } from "@/services/template.service.js";
import { tamatService } from "@/services/tamat.service.js";
import SweetAlert from "@/components/SweetAlert";

export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        SweetAlert,
    },
    data() {
        return {
            topicLabel: "",
            headers: [],
            fields: [],
            columnAlignments: [],
            columnWidths: [],
            link: "",
            params: { pelantikan: "" },
            print: "",
            cetak: false,
            buttonLabel: "Lantik Ahli",
            buttonTambah: true,
            tableData: [],
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,
            showConfirmNyahAktif: false,
            showConfirmDelete: false,
            showSuccess: false,
            showSuccessPadam: false,
            alert: {
                error: false,
                errorMessage: "",
            },
            deleteTarget: null,
            templateHeaders: [],
            templateId: this.$route.query.pelantikan || null, // ✅ get template id from route
            jenis_pelantikan: null,
            templateName: null, // store template name for routing after save
        };
    },
    async mounted() {
        if (this.templateId) {
            await this.loadTemplate(this.templateId);
            // this.loadData(); // ✅ load template headers
        }
    },
    methods: {
        goToProfile(item, mode) {
            const query =
                mode === "view"
                    ? { view: "readonly", id: item.profil_id }
                    : { kemaskini: true };
            this.$router.push({ path: "/profile", query });
        },
        nyahAktif(item) {
            console.log(item.id);
            this.deleteTarget = item.nama;
            this.targetID = item.id;
            this.showConfirmNyahAktif = true;
        },
        async confirmNyahAktif() {
            try {
                // console.log("Delete:", this.targetID);
                await templateSenaraiService.hapusAhli(this.targetID);
                this.showConfirmNyahAktif = false;
                this.showSuccess = true;
                // await this.loadData();
                this.loadTemplate(this.templateId);
            } catch (err) {
                this.showConfirmNyahAktif = false;
                this.alert.error = true;
                this.alert.errorMessage =
                    err?.response?.data?.message ||
                    err.message ||
                    "Ralat tidak diketahui";
            }
        },
        goToKemaskini(item, mode) {
            const query =
                mode === "kemaskini"
                    ? { kemaskini: true, id: item.id, pelantikan: this.templateName }
                    : { id: item.id, pelantikan: this.templateName };
            this.$router.push({
                path: "/rekod-pelantikan/senarai-pelantikan/kategori/lantik-ahli",
                query,
            });
        },
        goToResume(item) {
            const query = { id: item.profil_id };
            this.$router.push({
                path: "/rekod-pelantikan/maklumat-resume",
                query,
            });
        },

        async loadTemplate(name) {
            this.loading = true;
            try {
                const res = await templateSenaraiService.getTemplateByName(name);

                if (!Array.isArray(res) || res.length === 0) {
                    throw new Error("Invalid template data received from API.");
                }
                const template = res[0]; // Access the first element of the array

                this.jenis_pelantikan = template.jenis_pelantikan;

                const allReportTemplates = await templateService.getAllReportTemplates();


                if (allReportTemplates && allReportTemplates.some(reportTemplate => reportTemplate.name === template.name)) {
                    this.cetak = true;
                } else {
                    this.cetak = false;
                }

                this.templateName = template.name; // store template name for routing after save

                this.topicLabel = "Senarai " + template.name || "Senarai Pelantikan";

                this.templateHeaders = template.headers; // store original headers

                // map headers from API to DataTable format
                this.headers = template.headers.map(h => h.label);
                this.fields = template.headers.map(h => h.variable === "custom" ? `custom_${h.id}` : h.variable);
                this.columnAlignments = template.headers.map(h => h.align || "left");
                this.columnWidths = template.headers.map(h =>
                    h.width ? `${h.width}%` : "10%"
                );

                // Manually add the "Tindakan" (Actions) column
                this.headers.push("Tindakan");
                this.fields.push("actions");
                this.columnAlignments.push("center");
                this.columnWidths.push("10%");

                this.buttonTambah = true; // always true
                this.link = "/rekod-pelantikan/senarai-profil";
                this.params = { pelantikan: template.name };
                this.print = `/pentadbir/laporan?pelantikan=${template.name}`;

                this.tableData = [];

                this.loadData(this.jenis_pelantikan);
            } catch (e) {
                console.log(e);
                this.alert.error = true;
                this.alert.errorMessage =
                    e?.response?.data?.message || e.message || "Ralat tidak diketahui";
            } finally {
                this.loading = false;
            }
        },
        async loadData(id) {
            this.loading = true;
            try {
                const res = await templateSenaraiService.SenaraiTemplate({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                }, id);

                const { data, total, current_page, per_page } = res;
                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                // 1. Map data -> transform custom variables
                let transformed = (data || []).map((row) => {
                    const transformedRow = { ...row };

                    // process custom variables
                    this.templateHeaders.forEach(header => {
                        if (header.variable === "custom") {
                            let value = header.custom_variable;

                            value = value.replace(/{{\s*nama\s*}}/g, this.formatValue(row.nama) || "-");
                            value = value.replace(/{{\s*jawatan\s*}}/g, this.formatValue(row.jawatan) || "-");
                            value = value.replace(/{{\s*peranan\s*}}/g, this.formatValue(row.peranan));
                            value = value.replace(/{{\s*tarikh_lahir\s*}}/g, row.tarikh_lahir || "-");
                            value = value.replace(/{{\s*umur\s*}}/g, row.umur || "-");
                            value = value.replace(/{{\s*tarikh_lantik\s*}}/g, row.tarikh_lantik || "-");
                            value = value.replace(/{{\s*tarikh_tamat\s*}}/g, row.tarikh_tamat || "-");
                            value = value.replace(/{{\s*tarikh_lanjutan\s*}}/g, row.tarikh_lanjutan || "-");
                            value = value.replace(/{{\s*penggal\s*}}/g, row.penggal || "-");
                            value = value.replace(/{{\s*wakil\s*}}/g, row.wakil || "-");
                            value = value.replace(/{{\s*catatan\s*}}/g, row.catatan || "");
                            value = value.replace(/{{\s*zon\s*}}/g, row.zon || "-");
                            value = value.replace(/{{\s*agensi\s*}}/g, row.agensi || "-");
                            value = value.replace(/\n/g, "<br>");

                            if (row.peranan === null) {
                                value = value.replace(/\r?\n+/g, "");
                                value = value.replace(/<br>/g, "");
                            }

                            transformedRow[`custom_${header.id}`] = value;
                        }
                    });

                    return transformedRow;
                });

                // Define keywords and sort order for priority roles
                const keywords = ["Pengerusi", "Pengarah", "Timbalan", "Ketua", "Presiden", "Besar"];
                const prioritySortOrder = [
                    "Pengerusi",
                    "Timbalan Pengerusi",
                    "Presiden",
                    "Timbalan Presiden",
                    "Pengarah",
                    "Timbalan Pengarah",
                    "Ketua",
                    "Timbalan Ketua",
                ];

                // 2. Separate and sort priority roles
                const priority = transformed
                    .filter(r => r.peranan && keywords.some(keyword => r.peranan.includes(keyword)))
                    .sort((a, b) => {
                        const aIndex = prioritySortOrder.indexOf(a.peranan);
                        const bIndex = prioritySortOrder.indexOf(b.peranan);

                        // If both are in the sort order, sort by it
                        if (aIndex !== -1 && bIndex !== -1) {
                            return aIndex - bIndex;
                        }
                        // If only 'a' is in the sort order, it comes first
                        if (aIndex !== -1) {
                            return -1;
                        }
                        // If only 'b' is in the sort order, it comes first
                        if (bIndex !== -1) {
                            return 1;
                        }
                        // Otherwise, maintain original order (or sort alphabetically by peranan)
                        return a.peranan.localeCompare(b.peranan);
                    });

                const normal = transformed.filter(r => !r.peranan || !keywords.some(keyword => r.peranan.includes(keyword)));

                // 4. Combine all roles (sorted priority roles first, then normal roles)
                let combinedAndSorted = [
                    ...priority,
                    ...normal
                ];

                // 5. Assign sequential indices to the combined and sorted list
                this.tableData = combinedAndSorted.map((row, i) => ({
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1)
                }));

            } catch (e) {
                console.error(e);
                this.alert.error = true;
                this.alert.errorMessage =
                    e?.response?.data?.message ||
                    e.message ||
                    "Ralat tidak diketahui";
                this.tableData = [];
                this.total = 0;
            } finally {
                this.loading = false;
            }
        },
        onChangePage(p) {
            this.page = p;
            this.loadData(this.jenis_pelantikan);
        },
        onChangePerPage(pp) {
            this.perPage = pp;
            this.page = 1;
            this.loadData(this.jenis_pelantikan);
        },
        onSearch(keyword) {
            this.search = keyword;
            this.page = 1;
            this.loadData(this.jenis_pelantikan);
        },
        formatValue(val) {
            if (val === null || val === undefined || val === 'null') {
                return '';
            }
            if (typeof val === 'string') {
                return val.replace(/\bnull\b/gi, '').trim();
            }
            return val;
        },

        handleDelete(item) {
            this.deleteTarget = item.nama;
            this.targetJawatan = item.jawatan;
            this.targetID = item.id;
            this.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                await tamatService.hapusRekod(this.targetID);
                // console.log('Delete:', this.targetID)
                this.showConfirmDelete = false
                this.showSuccessPadam = true
                this.loadTemplate(this.templateId);
            } catch (err) {
                this.showConfirmDelete = false
                this.alert.error = true
            }
        },
    },
};
</script>
