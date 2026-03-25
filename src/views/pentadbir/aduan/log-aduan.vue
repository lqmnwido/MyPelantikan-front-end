<template>
    <Layout>
        <PageHeader title="Aduan" pageTitle="Pentadbir" />


        <DataTable :headers="headers" :fields="fields" :items="aduan" :topicLabel="'Senarai Aduan'" :total="total"
            :page="page" :perPage="perPage" :loading="loading" :pagination="true" :carian="true" :menuLength="true"
            :columnAlignments="columnAlignments" :columnWidths="columnWidths" @change-page="onChangePage"
            @change-per-page="onChangePerPage" @search="onSearch">
            <template #actions="{ item }">
                <button class="icon-btn text-danger btn-sm" @click="handleDelete(item)" title="Hapus">
                    <i class="mdi mdi-delete"></i>
                </button>
            </template>
        </DataTable>

        <SweetAlert :show="alert.showConfirmDelete" type="warning" title="Anda pasti?"
            :html="`Tindakan ini akan memadamkan Aduan ID: <b>${deleteTarget}</b>`" :showCancelButton="true"
            confirmButtonText="Ya, padam" cancelButtonText="Batal" @confirmed="confirmDelete"
            @cancelled="alert.showConfirmDelete = false" @closed="alert.showConfirmDelete = false" />

        <SweetAlert :show="alert.showSuccess" type="success" title="Berjaya!" text="Data dipadam." :autoClose="1500"
            @closed="alert.showSuccess" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { aduanService } from "@/services/aduan.service";
import SweetAlert from "@/components/SweetAlert";

export default {
    name: "LogAduan",
    components: { Layout, PageHeader, DataTable, SweetAlert },
    data() {
        return {
            headers: ["ID", "Nama Pengguna", "Peranan", "Keterangan", "Gambar", "Tarikh / Masa", "Tindakan"],
            fields: ["id", "nama", "peranan", "keterangan", "file", "masa", "actions"],
            columnAlignments: ["center", "left", "center", "left", "center", "center", "center"],
            columnWidths: ["5%", "20%", "10%", "35%", "10%", "10%", "10%"],
            aduan: [],
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,
            alert: {
                showConfirmDelete: false,
                showSuccess: false,
                error: false,
            },
            deleteTarget: null,
            targetID: null, 
        };
    },
    async mounted() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            try {
                const res = await aduanService.senaraiAduan({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                });

                const { data, total, current_page, per_page } = res;

                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                this.aduan = (data || []).map((row, i) => ({
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1),
                    masa: row.masa ? `${row.masa.tarikh}<br>${row.masa.masa}` : "-",
                }));
            } catch (e) {
                // console.error(e);
                this.alert.error = true
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
            // console.log(keyword);
            this.search = keyword;
            this.page = 1;
            this.loadData();
        },
        handleDelete(item) {
            this.deleteTarget = item.id;
            this.targetID = item.id;
            this.alert.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                await aduanService.hapusAduan(this.targetID);
                // console.log('Delete ID:', this.targetID)
                this.alert.showConfirmDelete = false
                this.alert.showSuccess = true
                await this.loadData();
            } catch (err) {
                this.alert.showConfirmDelete = false
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
            }
        },
    },

};
</script>
