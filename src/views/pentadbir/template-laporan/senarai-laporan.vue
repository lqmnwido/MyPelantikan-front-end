<template>
    <Layout>
        <PageHeader title="Senarai Laporan" pageTitle="Pentadbir" />

        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :buttonLabel="buttonLabel" :buttonTambah="true" :link="link"
            :columnWidths="columnWidths" :total="total" :page="page" :perPage="perPage" :loading="loading" serverSide
            @change-page="onChangePage" @change-per-page="onChangePerPage" @search="onSearch">
            <template #actions="{ item }">
                <button class="icon-btn text-primary me-1" @click="goToPapar(item, 'view')" title="Papar">
                    <i class="mdi mdi-eye"></i>
                </button>
                <button class="icon-btn text-success me-1" @click="goToKemaskini(item, 'kemaskini')" title="Kemaskini">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="icon-btn text-danger" @click="hapus(item)" title="Hapus">
                    <i class="mdi mdi-delete"></i>
                </button>

                <SweetAlert :show="showConfirmDelete" type="warning" title="Anda pasti?"
                    :html="`Tindakan ini akan menghapuskan laporan: <b>${deleteTarget}</b>`" :showCancelButton="true"
                    confirmButtonText="Ya, Hapuskan" cancelButtonText="Batal" @confirmed="confirmDelete"
                    @cancelled="showConfirmDelete = false" @closed="showConfirmDelete = false" />

            </template>
        </DataTable>

        <SweetAlert :show="showSuccess" type="success" title="Berjaya!" text="Templat dihapuskan." :autoClose="1500"
            @closed="showSuccess = false" />


        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import SweetAlert from "@/components/SweetAlert";
import { templateService } from '@/services/template.service.js';

export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        SweetAlert,
    },
    data() {
        return {
            // Define the topic label for the data table container
            topicLabel: "Senarai Laporan",
            // Define headers for the data table
            headers: ["Bil", "Laporan", "Tindakan"],
            // Define fields for the data table
            fields: ["index", "laporan", "actions"],
            // Define column alignments    
            columnAlignments: ["center", "left", "center"],
            columnWidths: ["5%", "85%", "10%"],
            // Rename Button tambah
            buttonLabel: "Tambah Laporan",
            link: "/pentadbir/senarai-laporan/template-laporan",

            tableData: [],
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,
            showConfirmDelete: false,
            showSuccess: false,
            alert: {
                error: false,
                errorMessage: '',
            },
            deleteTarget: null,
        };
    },
    async mounted() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            try {
                const response = await templateService.getSenaraiLaporan({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                });
                // console.log("API Response: ", response);

                const { data, total, current_page, per_page } = response;
                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                this.tableData = (data || []).map((row, i) => ({
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1),
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
        goToPapar(item, mode) {
            this.$router.push({ path: `/pentadbir/laporan`, query: { mod: mode, pelantikan: item.laporan } });
        },
        goToKemaskini(item, mode) {
            this.$router.push({ path: `/pentadbir/senarai-laporan/template-laporan`, query: { mod: mode, id: item.id } });
        },
        hapus(item) {
            // console.log('Hapus:', item)
            this.deleteTarget = item.laporan;
            this.targetID = item.id;
            this.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                await templateService.hapusTemplate(this.targetID);
                // console.log('Delete:', this.targetID)
                this.showConfirmDelete = false
                this.showSuccess = true
                await this.loadData();
            } catch (err) {
                this.showConfirmDelete = false
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
            }
        },
    }
}
</script>