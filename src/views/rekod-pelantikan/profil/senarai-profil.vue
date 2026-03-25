<template>
    <Layout>
        <PageHeader title="Senarai Profil" pageTitle="Rekod Pelantikan" />

        <DataTable :headers="headers" :fields="fields" :items="tableData" :topicLabel="topicLabel" :total="total"
            :page="page" :perPage="perPage" :loading="loading" serverSide :columnAlignments="columnAlignments"
            :columnWidths="columnWidths" :buttonTambah="true" :buttonLabel="buttonLabel" :link="link"
            @change-page="onChangePage" @change-per-page="onChangePerPage" @search="onSearch">
            <template #actions="{ item }">
                <button class="icon-btn text-primary btn-sm me-1" @click="goToProfile(item, 'view')" title="Papar">
                    <i class="mdi mdi-eye"></i>
                </button>
                <button class="icon-btn text-success btn-sm me-1" @click="goToUpdate(item, 'update')" title="Kemaskini">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="icon-btn text-warning btn-sm me-1" @click="goToLantik(item, lantikan)"
                    title="Lantik Ahli">
                    <i class="bx bx-briefcase"></i>
                </button>
                <button class="icon-btn text-secondary btn-sm me-1" @click="goToResume(item)" title="Resume">
                    <i class="mdi mdi-file-document"></i>
                </button>
                <button class="icon-btn text-danger btn-sm" @click="handleDelete(item)" title="Hapus">
                    <i class="mdi mdi-delete"></i>
                </button>
                <SweetAlert :show="showConfirmDelete" type="warning" title="Anda pasti?"
                    :html="`Tindakan ini akan memadam data: <b>${deleteTarget}</b>`" :showCancelButton="true"
                    confirmButtonText="Ya, Padam" cancelButtonText="Batal" @confirmed="confirmDelete"
                    @cancelled="showConfirmDelete = false" @closed="showConfirmDelete = false" />

            </template>

        </DataTable>

        <BModal v-model="showModal" hide-footer centered scrollable size="lg" hide-header class="bg-color">
            <div class="p-4 rounded">
                <h4 class="mb-3"><strong>Lantik Ahli!</strong></h4>
                <p>Berikut adalah Jenis Pelantikan:</p>

                <table class="table table-bordered table-hover">
                    <tbody>
                        <tr v-for="(record, index) in jenisPelantikan" :key="index">
                            <td v-if="record.id === 1 || templateNames.has(record.nama)" style="width: 90%;">{{ record.nama }}</td>
                            <td v-if="record.id === 1 || templateNames.has(record.nama)" class="text-center" style="width: 10%;">
                                <button class="btn btn-sm btn-primary" style="width: 120px;"
                                    @click="goToLantik(selectedItem, record.pelantikan)">
                                    Pilih
                                </button>
                                <!-- <span v-else>-</span> -->
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </BModal>

        <SweetAlert :show="showSuccess" type="success" title="Berjaya!" text="Data dipadam." :autoClose="1500"
            @closed="showSuccess" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" text="Gagal memaparkan data."
            @closed="alert.error = false" />

    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { profilService } from "@/services/profil.service.js";
import { lookupService } from "@/services/lookup.service.js";
import { templateSenaraiService } from "@/services/templateSenarai.service.js";
// import { Pagination } from "vue3-carousel";
import SweetAlert from "@/components/SweetAlert.vue";
// import Loader from "@/components/widgets/loader";

export default {
    components: { Layout, PageHeader, DataTable, SweetAlert },
    data() {
        return {
            // loading: true,
            topicLabel: "Senarai Profil / CV",
            headers: ["Bil", "Gambar", "Nama", "Tarikh Lahir", "Tindakan"],
            fields: ["index", "gambar", "nama", "tarikh_lahir", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center"],
            columnWidths: ["5%", "10%", "50%", "20%", "15%"],
            buttonLabel: "Tambah Calon",
            link: "/rekod-pelantikan/senarai-profil/calon",
            // pagination/search state
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,

            tableData: [],

            selectedItem: null,

            jenisPelantikan: [],
            deleteTarget: null,
            showConfirmDelete: false,
            showSuccess: false,
            showModal: false,
            alert: {
                error: false,
            },
            templateNames: new Set()
        };
    },
    async mounted() {
        // console.log(this.$route.query.pelantikan);
        await this.fetchProfils();
        await this.loadJenisPelantikan();
        await this.loadTemplateNames();
    },
    methods: {
        toTitleCase(str) {
            if (!str) return '';
            return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
        },
        async loadTemplateNames() {
            try {
                const templates = await templateSenaraiService.getTemplates();
                this.templateNames = new Set((templates || []).map(template => template.name));
            } catch (error) {
                console.error("Gagal load template names:", error);
                this.templateNames = new Set();
            }
        },
        async fetchProfils() {
            this.loading = true;
            try {
                const res = await profilService.getProfils({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                });

                const { data, total, current_page, per_page } = res;

                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                this.tableData = (data || []).map((row, i) => {
                    const formattedName = this.toTitleCase(row.nama); 
    
                    // Combine the original gelaran (e.g., "YB Senator") with the formatted name.
                    const fullName = row.gelaran ? `${row.gelaran} ${formattedName}` : formattedName;

                    return {
                        ...row,
                        nama: fullName,
                        index: (this.page - 1) * this.perPage + (i + 1),
                        jawatan: row.jawatan ?? "-",
                        tarikh_lahir: row.tarikh_lahir ?? "-",
                    };
                });
            } catch (e) {
                console.error(e);
                this.tableData = [];
                this.total = 0;
            } finally {
                this.loading = false;
            }
        },
        async loadJenisPelantikan() {
            try {
                const res = await lookupService.getSenaraiPelantikan();
                // console.log("API Response:", res); // <-- log untuk lihat bentuk data

                if (!res) {
                    console.error("lookupService.getJenisPelantikan() tidak pulangkan data yang dijangka.");
                    this.jenisPelantikan = [];
                    return;
                }

                this.jenisPelantikan = res.map(item => ({
                    id: item.id,
                    nama: item.nama,
                    pelantikan: item.nama
                }));
            } catch (error) {
                console.error("Gagal load jenisPelantikan:", error);
                this.jenisPelantikan = [];
            }
        },
        view(item) {
            console.log('View:', item);
        },
        onChangePage(p) {
            this.page = p;
            this.fetchProfils();
        },
        onChangePerPage(pp) {
            this.perPage = pp;
            this.page = 1;
            this.fetchProfils();
        },
        onSearch(keyword) {
            this.search = keyword;
            this.page = 1;
            this.fetchProfils();
        },
        goToProfile(item, mode) {
            const query = mode === "view" ? { view: "readonly", id: item.id } : { kemaskini: true };
            this.$router.push({ path: "/profile", query });
        },
        handleDelete(item) {
            this.deleteTarget = item.nama;
            this.targetID = item.id;
            this.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                await profilService.hapusProfil(this.targetID);
                // console.log('Delete:', this.targetID)
                this.showConfirmDelete = false
                this.showSuccess = true
                await this.fetchProfils();
            } catch (err) {
                this.showConfirmDelete = false
                this.alert.error = true
            }
        },
        goToUpdate(item, mode) {
            const query = mode === "update" ? { id: item.id, kemaskini: true } : { kemaskini: true };
            this.$router.push({ path: "/rekod-pelantikan/senarai-profil/calon", query, item: item });
        },
        goToResume(item, mode) {
            const query = mode === "" ? { view: "readonly", id: item.id } : { id: item.id };
            this.$router.push({ path: "/rekod-pelantikan/maklumat-resume", query });
        },
        goToLantik(item, pelantikan) {
            const id = item?.id ?? this.selectedItem?.id ?? null;
            const selectedLantikan = this.$route.query.pelantikan || pelantikan;

            if (!selectedLantikan) {
                this.selectedItem = item; // store for modal use
                this.showModal = true;
                return;
            }

            if (["Ahli Dewan Negara"].includes(selectedLantikan)) {
                this.$router.push({
                    path: "/rekod-pelantikan/ahli-dewan-negara/tambah-ahli",
                    query: { id },
                });
            } else if (["Hakim Mahkamah Rayuan"].includes(selectedLantikan)) {
                this.$router.push({
                    path: "/rekod-pelantikan/kehakiman/tambah-ahli/hmr",
                    query: { id },
                });
            } else if (["Hakim Mahkamah Tinggi"].includes(selectedLantikan)) {
                this.$router.push({
                    path: "/rekod-pelantikan/kehakiman/tambah-ahli/hmt",
                    query: { id },
                });
            } else if (["Hakim Mahkamah Persekutuan"].includes(selectedLantikan)) {
                this.$router.push({
                    path: "/rekod-pelantikan/kehakiman/tambah-ahli/hmp",
                    query: { id },
                });
            // } else if (["Keanggotaan Suruhanjaya Perkhidmatan Awam"].includes(selectedLantikan)) {
            //     this.$router.push({
            //         path: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spa",
            //         query: { id },
            //     });
            // } else if (["Suruhanjaya Pilihan Raya"].includes(selectedLantikan)) {
            //     this.$router.push({
            //         path: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spr",
            //         query: { id },
            //     });
            // } else if (["Keanggotaan Suruhanjaya Perkhidmatan Kehakiman Dan Perundangan"].includes(selectedLantikan)) {
            //     this.$router.push({
            //         path: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spkp",
            //         query: { id },
            //     });
            // } else if (["Keanggotaan Lembaga Penasihat, Jabatan Perdana Menteri"].includes(selectedLantikan)) {
            //     this.$router.push({
            //         path: "/rekod-pelantikan/lembaga/tambah-ahli/lpjpm",
            //         query: { id },
            //     });
            // } else if (["Lembaga Pengampunan Bagi Wilayah Persekutuan Kuala Lumpur, Labuan Dan Putrajaya"].includes(selectedLantikan)) {
            //     this.$router.push({
            //         path: "/rekod-pelantikan/lembaga/tambah-ahli/lpwp",
            //         query: { id },
            //     });
            // } else if (["Tuan Yang Terutama Yang Di-Pertua Negeri"].includes(selectedLantikan)) {
            //     this.$router.push({
            //         path: "/rekod-pelantikan/tuan-yang-terutama/tambah-ahli",
            //         query: { id },
            //     });
            // } else if (["Keanggotaan Lembaga Penasihat, Pusat Pencegahan Jenayah Kewangan Nasional (NFCC)"].includes(selectedLantikan)) {
            //     this.$router.push({
            //         path: "/rekod-pelantikan/akta-akta/tambah-ahli/nfcc",
            //         query: { id },
            //     });
            } else {
                this.$router.push({
                    path: "/rekod-pelantikan/senarai-pelantikan/kategori/lantik-ahli",
                    query: { id, pelantikan: selectedLantikan },
                });
            }
        },
        
    },
};
</script>
<style scopep>
.bg-color {
    background-color: rgba(255, 255, 255, 0) !important;
}
.class-for-name-cell { 
    text-transform: capitalize !important;
}
</style>