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
import { lembagaService } from "@/services/lembaga.service.js";
import SweetAlert from "@/components/SweetAlert";
import { templateService } from "@/services/template.service.js";
import { tamatService } from "@/services/tamat.service.js";



export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        SweetAlert,
    },
    data() {
        return {
            topicLabel: "SENARAI KEANGGOTAAN LEMBAGA PENASIHAT JABATAN PERDANA MENTERI",
            headers: ["Bil", "Gambar", "Nama", "Zon", "Tarikh Lahir / Umur", "Tarikh Lantikan", "Tarikh Tamat", "Tindakan"],
            fields: ["index", "gambar", "nama", "wakil", "tarikh_lahir", "tarikh_lantik", "tarikh_tamat", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center", "center", "center", "center"],
            columnWidths: ["5%", "10%", "15%", "10%", "10%", "10%", "10%", "20%"],
            buttonLabel: "Lantik Ahli",
            link: "/rekod-pelantikan/senarai-profil",
            params: { pelantikan: "" },
            tableData: [],
            page: 1,
            perPage: 5,
            total: 0,
            cetak: false,
            print: "",
            search: "",
            loading: false,
            kemaskini: "",
            showConfirmDelete: false,
            showSuccess: false,
            showConfirmNyahAktif: false,
            showSuccessPadam: false,
            deleteTarget: null,
            alert: {
                error: false,
            }
        };
    },
    async mounted() {
        await this.loadData();
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
        async loadData() {
            const senarai = this.$route.query.senarai;
            const transformedName = senarai
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase());
            // console.log(transformedName);
            const senaraiMap = {
                'keanggotaan-lembaga-penasihat,-jabatan-perdana-menteri': {
                    kemaskini: "/rekod-pelantikan/lembaga/tambah-ahli/lpjpm",
                    fetch: () => lembagaService.getLembagaPenasihat({
                        page: this.page,
                        perPage: this.perPage,
                        search: this.search,
                    }),
                    paginated: true,
                },
            };


            if (senaraiMap[senarai]) {
                const config = senaraiMap[senarai];

                const allReportTemplates = await templateService.getAllReportTemplates();
                if (allReportTemplates && allReportTemplates.some(reportTemplate => reportTemplate.name === transformedName)) {
                    this.cetak = true;
                } else {
                    this.cetak = false;
                }

                // this.topicLabel = config.label;
                this.params = { pelantikan: transformedName };
                this.print = "/pentadbir/laporan";
                this.kemaskini = config.kemaskini || null;
                this.loading = true;

                try {
                    const response = await config.fetch();

                    if (config.paginated) {
                        const { data, total, current_page, per_page } = response;
                        this.total = total ?? 0;
                        this.page = current_page ?? this.page;
                        this.perPage = per_page ?? this.perPage;

                        // const keywords = ["Pengerusi", "Ketua"];
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
                                wakil: row.wakil ?? "-",
                                jawatan: row.kategori ?? "-",
                                tarikh_lahir: row.tarikh_lahir ? `${row.tarikh_lahir}</br>${row.umur}` : "-",
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
            this.loadData();
        },
        onChangePerPage(pp) {
            this.perPage = pp;
            this.page = 1;
            this.loadData();
        },
        onSearch(keyword) {
            this.search = keyword;
            this.page = 1;
            this.loadData();
        },
        nyahAktif(item) {
            this.deleteTarget = item.nama;
            this.targetID = item.id;
            this.showConfirmNyahAktif = true;
        },
        async confirmNyahAktif() {
            try {
                await lembagaService.nyahAktifLembagaPenasihat(this.targetID);
                // console.log('Delete:', this.targetID)
                this.showConfirmNyahAktif = false
                this.showSuccess = true
                await this.loadData();
            } catch (err) {
                console.error(err);
                this.showConfirmNyahAktif = false
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';

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
                await this.loadData();
            } catch (err) {
                this.showConfirmDelete = false
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';

            }
        },
    },
    computed: {
        processedTableData() {
            const senarai = this.$route.name;
            const selectedJenis = this.$route.query.jenisPelantikan;

            const config = {
                "senarai-lembaga-penasihat": {
                    titleMap: {
                        "Ketua Pengerusi Lembaga Penasihat": "KETUA PENGERUSI LEMBAGA PENASIHAT",
                        "Pengerusi Lembaga Penasihat": "PENGERUSI LEMBAGA PENASIHAT"
                    },
                    sortOrder: ["Ketua Pengerusi Lembaga Penasihat", "Pengerusi Lembaga Penasihat"],
                    showAgensi: true
                },
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

            // const transformed = this.tableData.map(row => {
            //     const newRow = { ...row };
            //     return newRow;
            // });

            const sorted = transformed.sort((a, b) => {
                const aIndex = dynamicSortOrder.indexOf(a.kategori ?? "");
                const bIndex = dynamicSortOrder.indexOf(b.kategori ?? "");
                return (aIndex !== -1 ? aIndex : 99) - (bIndex !== -1 ? bIndex : 99);
            });

            const filtered = (!selectedJenis || selectedJenis === "All")
                ? sorted
                : sorted.filter(row => row.jenisPelantikan === selectedJenis);

            let ahliIndex = 1;
            const finalData = filtered.map(row => {
                const newRow = { ...row };
                // const isPriority = dynamicSortOrder.includes(row.kategori);

                // if (!isPriority) {
                newRow.index = ahliIndex++;
                // } else {
                //     newRow.index = ""; // Priority roles have no index
                // }
                return newRow;
            });

            return finalData;
        }

    },

};
</script>
