<template>
    <Layout>
        <PageHeader title="Senarai Pelantikan" pageTitle="Rekod Pelantikan" />

        <DataTable :headers="headers" :fields="fields" :items="processedTableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :buttonLabel="buttonLabel" :buttonTambah="true" :link="link" :cetak="cetak"
            :linkCetak="print" :columnWidths="columnWidths" :params="params" @change-page="onChangePage" :total="total"
            :page="page" :perPage="perPage" :loading="loading" serverSide @change-per-page="onChangePerPage"
            @search="onSearch">
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
import { kehakimanService } from "@/services/kehakiman.service.js";
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
            topicLabel: "", // Will be set dynamically
            headers: ["Bil", "Gambar", "Nama", "Tarikh Lahir", "Tarikh Lantikan", "Tarikh Tamat / Tarikh Mencapai Umur 66 Tahun", "Tarikh Mencapai Umur 66 Tahun 6 Bulan", "Tindakan"],
            fields: ["index", "gambar", "nama", 'tarikh_lahir', "tarikh_lantik", "tarikh_tamat", "tarikh_lanjutan", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center", "center", "center", "center"],
            columnWidths: ["5%", "10%", "30%", "10%", "10%", "10%", "10%", "15%"],
            buttonLabel: "Lantik Ahli",
            link: "/rekod-pelantikan/senarai-profil",
            params: {},
            print: "",
            tableData: [],
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,
            cetak: false,
            kemaskini: "",
            showConfirmDelete: false,
            showConfirmNyahAktif: false,
            showSuccess: false,
            showSuccessPadam: false,
            deleteTarget: null,
            alert: {
                error: false,
            }
        };
    },
    watch: {
        '$route.query.senarai': {
            immediate: true,
            handler() {
                this.setTopicAndLoadData();
            }
        }
    },
    methods: {
        goToProfile(item, mode) {
            const query = mode === "view" ? { view: "readonly", id: item.profil_id } : { kemaskini: true };
            this.$router.push({ path: "/profile", query });
        },
        goToResume(item, mode) {
            const query = mode === "" ? { view: "readonly", id: item.profil_id } : { id: item.profil_id };
            this.$router.push({ path: "/rekod-pelantikan/maklumat-resume", query });
        },
        goToKemaskini(item, mode) {
            const query = mode === "kemaskini" ? { kemaskini: true, id: item.id } : { id: item.id };
            this.$router.push({ path: this.kemaskini, query });
        },
        async setTopicAndLoadData() {
            const senarai = this.$route.query.senarai;

            // Default fallback
            this.topicLabel = "SENARAI HAKIM";

            const senaraiMap = {
                'hakim-mahkamah-rayuan': {
                    label: "SENARAI HAKIM MAHKAMAH RAYUAN",
                    kemaskini: "/rekod-pelantikan/kehakiman/tambah-ahli/hmr",
                    fetch: () => kehakimanService.getHMR({
                        page: this.page,
                        perPage: this.perPage,
                        search: this.search,
                    }),
                    paginated: true,
                },
                'hakim-mahkamah-tinggi': {
                    label: "SENARAI HAKIM MAHKAMAH TINGGI",
                    // params: { lantik: 'HMT' },
                    kemaskini: "/rekod-pelantikan/kehakiman/tambah-ahli/hmt",
                    fetch: () => kehakimanService.getHMT({
                        page: this.page,
                        perPage: this.perPage,
                        search: this.search,
                    }),
                    paginated: true,
                },
                'hakim-mahkamah-persekutuan': {
                    label: "SENARAI HAKIM MAHKAMAH PERSEKUTUAN",
                    // params: { lantik: 'HMP' },
                    kemaskini: "/rekod-pelantikan/kehakiman/tambah-ahli/hmp",
                    fetch: () => kehakimanService.getHMP({
                        page: this.page,
                        perPage: this.perPage,
                        search: this.search,
                    }),
                    paginated: true,
                }
            };

            if (senaraiMap[senarai]) {
                const config = senaraiMap[senarai];

                const transformedName = senarai
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase());

                // console.log(transformedName);
                const allReportTemplates = await templateService.getAllReportTemplates();
                if (allReportTemplates && allReportTemplates.some(reportTemplate => reportTemplate.name === transformedName)) {
                    this.cetak = true;
                } else {
                    this.cetak = false;
                }

                this.topicLabel = config.label;
                this.params = { pelantikan: transformedName };
                this.print = `/rekod-pelantikan/senarai-pelantikan/kategori/laporan`;
                // this.print = config.print;
                this.kemaskini = config.kemaskini || null;
                this.loading = true;

                try {
                    const response = await config.fetch();

                    if (config.paginated) {
                        const { data, total, current_page, per_page } = response;
                        this.total = total ?? 0;
                        this.page = current_page ?? this.page;
                        this.perPage = per_page ?? this.perPage;

                        // const keywords = ["Pengerusi", "Pengarah", "Timbalan", "Ketua", "Presiden", "Besar"];
                        let ahliCounter = 1;
                        this.tableData = (data || []).map((row) => {
                            let index = "";
                            // const isPriority = row.kategori && keywords.some(keyword => row.kategori.includes(keyword));
                            // if (!isPriority) {
                            index = (this.page - 1) * this.perPage + ahliCounter++;
                            // }

                            return {
                                ...row,
                                nama: row.gelaran ? `${row.gelaran} ${row.nama}` : `${row.nama}`,
                                index,
                                jawatan: row.kategori ?? "-",
                                tarikh_lahir: row.tarikh_lahir ?? "-",
                                tarikh_lantik: row.tarikh_lantik ?? "-",
                                tarikh_tamat: row.tarikh_tamat ?? "-",
                            };
                        });
                    } else {
                        this.tableData = (response?.data || []).map((row) => ({
                            ...row,
                            nama: row.gelaran ? `${row.gelaran} ${row.nama}` : row.nama,
                            index: "", // No pagination index for non-paginated
                            jawatan: row.kategori ?? "-",
                            tarikh_lahir: row.tarikh_lahir ?? "-",
                            tarikh_lantik: row.tarikh_lantik ?? "-",
                            tarikh_tamat: row.tarikh_tamat ?? "-",
                        }));
                    }
                } catch (e) {
                    console.error(e);
                    this.alert.error = true;
                    this.alert.errorMessage = e?.response?.data?.message || e.message || 'Ralat tidak diketahui';
                    this.tableData = [];
                    this.total = 0;
                } finally {
                    this.loading = false;
                }
            } else {
                this.tableData = []; // Fallback for unknown `senarai`
            }

        },
        onChangePage(p) {
            this.page = p;
            this.setTopicAndLoadData();
        },
        onChangePerPage(pp) {
            this.perPage = pp;
            this.page = 1;
            this.setTopicAndLoadData();
        },
        onSearch(keyword) {
            this.search = keyword;
            this.page = 1;
            this.setTopicAndLoadData();
        },
        nyahAktif(item) {
            this.deleteTarget = item.nama;
            this.targetID = item.id;
            this.showConfirmNyahAktif = true;
        },
        async confirmNyahAktif() {
            try {
                await kehakimanService.nyahAktifHMR(this.targetID);
                console.log('Delete:', this.targetID)
                this.showConfirmNyahAktif = false
                this.showSuccess = true
                await this.setTopicAndLoadData();
            } catch (err) {
                console.error(err);
                this.showConfirmNyahAktif = false
                this.alert.error = true
            }
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
                await this.setTopicAndLoadData();
            } catch (err) {
                this.showConfirmDelete = false
                this.alert.error = true
            }
        },

    },
    computed: {
        processedTableData() {
            const senarai = this.$route.query.senarai;
            const selectedJenis = this.$route.query.jenisPelantikan;

            const config = {
                "hakim-mahkamah-rayuan": {
                    titleMap: {
                        "Presiden Mahkamah Rayuan": "PRESIDEN MAHKAMAH RAYUAN"
                    },
                    sortOrder: ["Presiden Mahkamah Rayuan"],
                    showAgensi: false
                },
                "hakim-mahkamah-tinggi": {
                    titleMap: {
                        "Hakim Besar Malaya": "HAKIM BESAR MALAYA",
                        "Hakim Besar Sabah dan Sarawak": "HAKIM BESAR SABAH DAN SARAWAK"
                    },
                    sortOrder: ["Hakim Besar Malaya", "Hakim Besar Sabah dan Sarawak"],
                    showAgensi: true
                },
                "hakim-mahkamah-persekutuan": {
                    titleMap: {
                        "Ketua Hakim Negara": "KETUA HAKIM NEGARA",
                        "Presiden Mahkamah Rayuan": "PRESIDEN MAHKAMAH RAYUAN",
                        "Hakim Besar Malaya": "HAKIM BESAR MALAYA",
                        "Hakim Besar Sabah dan Sarawak": "HAKIM BESAR SABAH DAN SARAWAK"
                    },
                    sortOrder: ["Ketua Hakim Negara", "Presiden Mahkamah Rayuan", "Hakim Besar Malaya", "Hakim Besar Sabah dan Sarawak"],
                    showAgensi: true
                }
            };

            const setting = config[senarai];

            if (!setting) return this.tableData;

            // Dynamically build sortOrder from the static config AND any other priority roles found
            let dynamicSortOrder = [...setting.sortOrder]; // Start with the base order
            const keywords = ["Pengerusi", "Pengarah", "Timbalan", "Ketua", "Presiden", "Besar"];
            this.tableData.forEach(row => {
                const isPriority = row.kategori && keywords.some(k => row.kategori.includes(k));
                if (isPriority && row.kategori && !dynamicSortOrder.includes(row.kategori)) {
                    dynamicSortOrder.push(row.kategori);
                }
            });

            // Step 1: Transform nama with title
            const transformed = this.tableData.map(row => {
                const newRow = { ...row };
                const jawatanCode = row.kategori;
                const jawatanTitle = setting.titleMap[jawatanCode];

                if (jawatanTitle) {
                    newRow.nama = `<b><u>${jawatanTitle}</u></b><br/><br/>${row.nama}`;
                    if (setting.showAgensi) {
                        newRow.nama += `<br/>${row.agensi || ""}`;
                    }
                }

                return newRow;
            });

            // Step 2: Sort by the new dynamic order
            const sorted = transformed.sort((a, b) => {
                const aIndex = dynamicSortOrder.indexOf(a.jawatan ?? "");
                const bIndex = dynamicSortOrder.indexOf(b.jawatan ?? "");
                return (aIndex !== -1 ? aIndex : 99) - (bIndex !== -1 ? bIndex : 99);
            });

            // Step 3: Filter if jenisPelantikan selected
            const filtered = (!selectedJenis || selectedJenis === "All")
                ? sorted
                : sorted.filter(row => row.jenisPelantikan === selectedJenis);

            // ✅ Step 4: Add index only for "Ahli"
            // let ahliCounter = 1;
            const final = filtered.map(row => {
                return {
                    ...row,
                    // index: row.jawatan === "Ahli" ? ahliCounter++ : ""
                };
            });

            return final;
        }

    }

};
</script>
