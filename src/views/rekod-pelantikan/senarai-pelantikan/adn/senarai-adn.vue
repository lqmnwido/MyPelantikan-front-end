<template>
    <Layout>
        <PageHeader title="Senarai Pelantikan" pageTitle="Rekod Pelantikan" />

        <!-- <CarianForm :leftFields="leftFields" :rightFields="rightFields" @search="onSearch" /> -->

        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :filterShow="true" :filterOptions="filterOptions" :filterLabel="filterLabel"
            :buttonLabel="buttonLabel" :filterKey="filterKey" :buttonTambah="true" :link="link" :cetak="true"
            :linkCetak="print" v-model:selectedFilter="selectedFilter" :params="params" :columnWidths="columnWidths"
            :total="total" :page="page" :perPage="perPage" :loading="loading" serverSide @change-page="onChangePage"
            @change-per-page="onChangePerPage" @search="onSearch">
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

        <SweetAlert :show="alert.error" type="error" title="Ralat" text="Gagal memaparkan data."
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { adnService } from "@/services/adn.service.js";
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
            selectedFilter: 'All',
            // Define the topic label for the data table container
            topicLabel: "Senarai Ahli Dewan Negara",
            // Define headers for the data table
            headers: ["Bil", "Gambar", "Nama", "Tarikh Pelantikan", "Tarikh Tamat Jawatan", "Penggal", "Wakil", "Tindakan"],
            // Define fields for the data table
            fields: ["index", "gambar", "nama", "tarikh_lantik", "tarikh_tamat", "penggal", "wakil", "actions"],
            // Define column alignments    
            columnAlignments: ["center", "center", "left", "center", "center", "center", "center", "center"],
            columnWidths: ["1%", "10%", "20%", "5%", "5%", "10%", "10%", "10%"],
            // Define filter options
            filterOptions: [{ label: 'Dilantik Yang Di-Pertuan Agong', value: 'AGONG' }, { label: 'Dipilih oleh Dewan Undangan Negeri', value: 'DUN' },],
            // Rename filter label
            filterLabel: "Saring Mengikut Lantikan",
            // Define filter key for parameter
            filterKey: "jenisPelantikan",
            // Rename Button tambah
            buttonLabel: "Lantik Ahli",
            link: "/rekod-pelantikan/senarai-profil",
            params: { pelantikan: 'Ahli Dewan Negara' },
            print: "/pentadbir/template-laporan-adn",
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
            },
            deleteTarget: null,
            jenis_adn: null,
        };
    },
    mounted() {
        // let value = null;
        this.jenis_adn = this.$route.query.jenisPelantikan;
        if (this.jenis_adn == null) {
            // console.log('No value found');
        } else {
            if (this.jenis_adn == 'Dilantik Yang Di-Pertuan Agong') {
                this.selectedFilter = 'AGONG'
            } else {
                this.selectedFilter = 'DUN'
            }
            // console.log('selectedFilter:', this.selectedFilter);
        }

        this.loadData();
    },
    methods: {
        goToProfile(item, mode) {
            const query = mode === "view" ? { view: "readonly", id: item.profil_id } : { kemaskini: true };
            this.$router.push({ path: "/profile", query });
        },
        nyahAktif(item) {
            this.deleteTarget = item.nama;
            this.targetID = item.id;
            this.showConfirmNyahAktif = true;
        },
        async confirmNyahAktif() {
            try {
                await adnService.nyahAktif(this.targetID);
                console.log('Delete:', this.targetID)
                this.showConfirmNyahAktif = false
                this.showSuccess = true
                await this.loadData();
            } catch (err) {
                this.showConfirmNyahAktif = false
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
            }
        },
        goToKemaskini(item, mode) {
            const query = mode === "kemaskini" ? { kemaskini: true, id: item.id } : { id: item.id };
            this.$router.push({ path: "/rekod-pelantikan/ahli-dewan-negara/tambah-ahli", query });
        },
        goToResume(item, mode) {
            const query = mode === "" ? { view: "readonly", id: item.profil_id } : { id: item.profil_id };
            this.$router.push({ path: "/rekod-pelantikan/maklumat-resume", query });
        },
        async loadData() {
            this.loading = true;
            try {
                const res = await adnService.getADN({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                    jenis_adn: this.selectedFilter !== 'All' ? this.selectedFilter : null,
                });

                const { data, total, current_page, per_page } = res;

                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                const getLast = val => Array.isArray(val) ? val[val.length - 1] : val;
                this.tableData = (data || []).map((row, i) => ({
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1),
                    nama: row.gelaran ? `${row.gelaran} ${row.nama}` : `${row.nama}`,
                    tarikhPelantikan: getLast(row.tarikhPelantikan),
                    tarikhTamatJawatan: getLast(row.tarikhTamatJawatan),
                    penggal: getLast(row.penggal),
                    wakil: row.wakil ? `${row.parti}<br/>${row.wakil}` : row.parti,
                }));

            } catch (e) {
                console.error(e);
                this.alert.error = true;
                this.alert.errorMessage = e?.response?.data?.message || e.message || 'Ralat tidak diketahui';
                this.tableData = [];
                this.total = 0;
            } finally {
                this.loading = false;
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
            }
        },

    },
    watch: {
        selectedFilter() {
            this.page = 1;
            this.loadData();
        },
    },

};
</script>
