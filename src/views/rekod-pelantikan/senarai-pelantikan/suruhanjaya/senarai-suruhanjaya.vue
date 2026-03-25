<template>
    <Layout>
        <PageHeader title="Senarai Pelantikan" pageTitle="Rekod Pelantikan" />

        <!-- <CarianForm :leftFields="leftFields" :rightFields="rightFields" @search="onSearch" /> -->


        <DataTable :headers="headers" :fields="fields" :items="processedTableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :buttonLabel="buttonLabel" :buttonTambah="true" :link="link" :cetak="cetak"
            :linkCetak="print" :columnWidths="columnWidths" :params="params" @change-page="onChangePage" :total="total"
            :page="page" :perPage="perPage" :loading="loading" serverSide @change-per-page="onChangePerPage">
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
// import CarianForm from "@/components/CarianForm.vue";
import SweetAlert from "@/components/SweetAlert";
import { suruhanjayaService } from "@/services/suruhanjaya.service.js";
import { templateService } from "@/services/template.service.js";
import { tamatService } from "@/services/tamat.service.js";


export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        SweetAlert,
        // CarianForm,
    },
    data() {
        return {
            // Define the topic label for the data table container
            topicLabel: "",
            // Define column alignments    
            columnAlignments: ["center", "center", "left", "center", "center", "center", "center", "center"],
            columnWidths: ["5%", "10%", "30%", "10%", "10%", "10%", "10%", "15%"],
            // Rename Button tambah
            buttonLabel: "Lantik Ahli",
            link: "/rekod-pelantikan/senarai-profil",
            params: {},
            cetak: false,
            print: "",
            tableData: [],
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,
            kemaskini: "",
            showConfirmDelete: false,
            showConfirmNyahAktif: false,
            showSuccessPadam: false,
            showSuccess: false,
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
            this.topicLabel = "SENARAI SURUHANJAYA";

            const senaraiMap = {
                'keanggotaan-suruhanjaya-perkhidmatan-awam': {
                    label: "SENARAI KEANGGOTAAN SURUHANJAYA PERKHIDMATAN AWAM",
                    kemaskini: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spa",
                    fetch: () => suruhanjayaService.getSPA({
                        page: this.page,
                        perPage: this.perPage,
                        search: this.search,
                    }),
                    paginated: true,
                },
                'suruhanjaya-pilihan-raya': {
                    label: "SENARAI SURUHANJAYA PILIHAN RAYA",
                    kemaskini: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spr",
                    fetch: () => suruhanjayaService.getSPR({
                        page: this.page,
                        perPage: this.perPage,
                        search: this.search,
                    }),
                    paginated: true,
                },
                'keanggotaan-suruhanjaya-perkhidmatan-kehakiman-dan-perundangan': {
                    label: "SENARAI KEANGGOTAAN SURUHANJAYA PERKHIDMATAN KEHAKIMAN DAN PERUNDANGAN",
                    kemaskini: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spkp",
                    fetch: () => suruhanjayaService.getSPKP({
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

                const allReportTemplates = await templateService.getAllReportTemplates();
                if (allReportTemplates && allReportTemplates.some(reportTemplate => reportTemplate.name === transformedName)) {
                    this.cetak = true;
                } else {
                    this.cetak = false;
                }
                // console.log(transformedName);

                // console.log(this.cetak);
                this.topicLabel = config.label;
                this.params = { pelantikan: transformedName };
                this.print = `/pentadbir/laporan`;
                this.kemaskini = config.kemaskini || null;
                this.loading = true;

                try {
                    const response = await config.fetch();

                    if (config.paginated) {
                        const { data, total, current_page, per_page } = response;
                        this.total = total ?? 0;
                        this.page = current_page ?? this.page;
                        this.perPage = per_page ?? this.perPage;

                        this.tableData = (data || []).map((row) => {
                            return {
                                ...row,
                                nama: row.gelaran ? `${row.gelaran} ${row.nama}` : `${row.nama}`,
                                jawatan: row.kategori ?? "-",
                                tarikh_lahir: row.tarikh_lahir ? `${row.tarikh_lahir} <br/>(${row.umur})` : "-",
                                tarikh_lantik: row.tarikh_lantik ?? "-",
                                penggal: row.penggal ?? "-",
                                wakil: (row.wakil && row.wakil !== 'undefined') ? row.wakil : "-"
                            };
                        });
                    } else {
                        this.tableData = (response?.data || []).map((row) => ({
                            ...row,
                            nama: row.gelaran ? `${row.gelaran} ${row.nama}` : row.nama,
                            index: "",
                            jawatan: row.jawatan ?? "-",
                            tarikh_lahir: row.tarikh_lahir ?? "-",
                            tarikh_lantik: row.tarikh_lantik ?? "-",
                            penggal: row.penggal ?? "-",
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
                await suruhanjayaService.nyahAktifSPA(this.targetID);
                // console.log('Delete:', this.targetID)
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
        headers() {
            const senarai = this.$route.query.senarai;
            if (senarai === 'suruhanjaya-pilihan-raya') {
                return ["Bil", "Gambar", "Nama", "Tarikh Lahir / Umur", "Tarikh Lantikan", "Tarikh Tamat", "Catatan", "Tindakan"];
            } else {
                return ["Bil", "Gambar", "Nama", "Tarikh Lahir / Umur", "Tarikh Lantikan", "Tarikh Tamat", "Penggal", "Tindakan"];
            }
        },
        fields() {
            const senarai = this.$route.query.senarai;
            if (senarai === 'suruhanjaya-pilihan-raya') {
                return ["index", "gambar", "nama", "tarikh_lahir", "tarikh_lantik", "tarikh_tamat", "wakil", "actions"];
            } else {
                return ["index", "gambar", "nama", "tarikh_lahir", "tarikh_lantik", "tarikh_tamat", "penggal", "actions"];
            }
        },
        processedTableData() {
            const senarai = this.$route.query.senarai;
            const selectedJenis = this.$route.query.jenisPelantikan;

            const config = {
                "keanggotaan-suruhanjaya-perkhidmatan-awam": {
                    titleMap: {
                        "Pengerusi": "PENGERUSI",
                        "Timbalan Pengerusi": "TIMBALAN PENGERUSI"
                    },
                    sortOrder: ["Pengerusi", "Timbalan Pengerusi"],
                    showAgensi: true
                },
                "suruhanjaya-pilihan-raya": {
                    titleMap: {
                        "Pengerusi": "PENGERUSI",
                        "Timbalan Pengerusi": "TIMBALAN PENGERUSI"
                    },
                    sortOrder: ["Pengerusi", "Timbalan Pengerusi"],
                    showAgensi: true
                },
                "keanggotaan-suruhanjaya-perkhidmatan-kehakiman-dan-perundangan": {
                    titleMap: {
                        "Pengerusi SPKP": "PENGERUSI SPKP",
                        "Timbalan Pengerusi": "PRESIDEN MAHKAMAH RAYUAN",
                    },
                    sortOrder: ["Pengerusi SPKP", "Timbalan Pengerusi"],
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
                const aIndex = dynamicSortOrder.indexOf(a.kategori ?? "");
                const bIndex = dynamicSortOrder.indexOf(b.kategori ?? "");
                const aPrio = aIndex !== -1 ? aIndex : 99;
                const bPrio = bIndex !== -1 ? bIndex : 99;

                if (aPrio !== bPrio) {
                    return aPrio - bPrio; // Sort by priority
                }
                // If priority is the same, sort by name
                return a.nama.localeCompare(b.nama);
            });

            // Step 3: Filter if jenisPelantikan selected
            const filtered = (!selectedJenis || selectedJenis === "All")
                ? sorted
                : sorted.filter(row => row.jenisPelantikan === selectedJenis);

            // Step 4: Re-assign index after sorting
            const finalData = filtered.map((row, i) => {
                return {
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1)
                };
            });

            return finalData;
        }
    },

};
</script>
