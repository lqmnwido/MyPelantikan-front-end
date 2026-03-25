<template>
    <Layout>
        <PageHeader title="Senarai Pengguna" pageTitle="Pentadbir" />

        <DataTable :headers="headers" :fields="fields" :items="tableData" :topicLabel="topicLabel" :total="total"
            :page="page" :perPage="perPage" :loading="loading" serverSide :columnAlignments="columnAlignments"
            :columnWidths="columnWidths" :buttonTambah="true" :buttonLabel="buttonLabel" :link="link" :filterShow="true" :filterOptions="filterOptions" :filterLabel="filterLabel"
            v-model:selectedFilter="selectedFilter" @change-page="onChangePage" @change-per-page="onChangePerPage"
            @search="onSearch" auto-search-on-typing>
            <template #actions="{ item }">
                <button class="icon-btn text-primary btn-sm me-1" @click="generatePassword(item)"
                    title="Menjana Kata Laluan">
                    <i class="mdi mdi-key-chain-variant"></i>
                </button>
                <button class="icon-btn text-warning btn-sm me-1" @click="changePassword(item)"
                    title="Tukar Kata Laluan Secara Manual">
                    <i class="mdi mdi-key-variant"></i>
                </button>
                <button class="icon-btn text-success btn-sm me-1" @click="goToUpdate(item, 'update')" title="Kemaskini">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="icon-btn text-danger btn-sm" @click="handleDelete(item)" title="Hapus">
                    <i class="mdi mdi-delete"></i>
                </button>
                <SweetAlert :show="showConfirmDelete" type="warning" title="Anda pasti?"
                    :html="`Tindakan ini akan memadam data: <b>${deleteTarget}</b>`" :showCancelButton="true"
                    confirmButtonText="Ya, Padam" cancelButtonText="Batal" @confirmed="confirmDelete"
                    @cancelled="showConfirmDelete = false" @closed="showConfirmDelete = false" />

                <SweetAlert :show="showConfirmGenerate" type="warning" title="Anda pasti?"
                    :html="`Tindakan ini akan mengemaskini kata laluan: <b>${target}</b>`" :showCancelButton="true"
                    confirmButtonText="Ya, Tukar Kata Laluan" cancelButtonText="Batal"
                    @confirmed="confirmUpdatePassword" @cancelled="showConfirmGenerate = false"
                    @closed="showConfirmGenerate = false" />

            </template>

        </DataTable>

        <SweetAlert :show="showSuccess" type="success" title="Berjaya!" text="Data dipadam." :autoClose="1500"
            @closed="showSuccess" />

        <SweetAlert :show="alert.passwordSuccess" type="success" title="Berjaya!"
            :html="`Kata Laluan telah dijana dan telah dihantar ke emel: </br><b>${targetEmel}</b>`" :autoClose="2000"
            @closed="alert.passwordSuccess" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />

    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { penggunaService } from "@/services/auth.service";
import SweetAlert from "@/components/SweetAlert.vue";

export default {
    components: { Layout, PageHeader, DataTable, SweetAlert },
    data() {
        return {
            // loading: true,
            topicLabel: "Senarai Pengguna",
            headers: ["Bil", "Kad Pengenalan", "Nama", "Emel", "Peranan", "Tindakan"],
            fields: ["index", "nombor_ic", "nama", "emel", "peranan", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center", "center"],
            columnWidths: ["5%", "15%", "30%", "20", "15%", "15%"],
            buttonLabel: "Daftar Pengguna",
            link: '/pentadbir/penyelenggaraan-pengguna/daftar-pengguna',
            selectedFilter: 'All',

            filterOptions: [
                { label: 'Admin', value: 'admin' },
                { label: 'Pengguna', value: 'pengguna' },
                { label: 'Pentadbir Sistem', value: 'pentadbir sistem' }
            ],
            filterLabel: "Saring mengikut peranan",
            filterKey: "jenisPeranan",

            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,

            tableData: [],

            deleteTarget: null,
            target: null,
            targetEmel: null,

            showConfirmDelete: false,
            showSuccess: false,
            showModal: false,
            showConfirmGenerate: false,

            alert: {
                error: false,
                passwordSuccess: false,
            }
        };
    },
    async mounted() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            try {
                const res = await penggunaService.senaraiPengguna({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                    jenis_peranan: this.selectedFilter !== 'All' ? this.selectedFilter : null,
                });

                const { data, total, current_page, per_page } = res;

                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                this.tableData = (data || []).map((row, i) => ({
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1),
                }));
            } catch (e) {
                // console.error(e);
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
            this.targetID = item.id;
            this.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                await penggunaService.hapusPengguna(this.targetID);
                // console.log('Delete:', this.targetID);
                this.showConfirmDelete = false;
                this.showSuccess = true;
                await this.loadData();
            } catch (err) {
                this.showConfirmDelete = false;
                this.alert.error = true;
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
            }
        },
        goToUpdate(item, mode) {
            const query = mode === "update" ? { id: item.id, kemaskini: true } : { kemaskini: true };
            this.$router.push({ path: "/pentadbir/penyelenggaraan-pengguna/daftar-pengguna", query, item: item });
        },
        changePassword(item) {
            const query = { id: item.id };
            this.$router.push({ path: "/pentadbir/penyelenggaraan-pengguna/senarai-pengguna/kemaskini-kata-laluan", query });
        },
        generatePassword(item) {
            this.target = item.nama;
            this.targetID = item.id;
            this.targetEmel = item.emel;
            this.showConfirmGenerate = true;
        },
        async confirmUpdatePassword() {
            try {
                await penggunaService.menjanaKataLaluan(this.targetID);
                console.log('Kemaskini Kata Laluan:', this.targetID);
                this.showConfirmGenerate = false;
                this.alert.passwordSuccess = true;
                await this.loadData();
            } catch (err) {
                this.showConfirmGenerate = false;
                this.alert.error = true;
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
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
<style scopep>
.bg-color {
    background-color: rgba(255, 255, 255, 0) !important;
}
</style>