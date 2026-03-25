<template>
    <Layout>
        <PageHeader title="Senarai Notifikasi" pageTitle="Notifikasi" />

        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :buttonTambah="false" :columnWidths="columnWidths" :total="total" :page="page"
            :perPage="perPage" :loading="loading" serverSide @change-page="onChangePage"
            @change-per-page="onChangePerPage" @search="onSearch">
            <template #actions="{ item }">
                <button class="icon-btn text-danger" @click="hapus(item)" title="Padam">
                    <i class="mdi mdi-delete"></i>
                </button>
            </template>
        </DataTable>
        <SweetAlert :show="alert.showConfirmDelete" type="warning" title="Anda pasti?"
            :html="`Tindakan ini akan hapuskan notifikasi: <b>${deleteTarget}</b>`" :showCancelButton="true"
            confirmButtonText="Ya, hapus" cancelButtonText="Batal" @confirmed="confirmDelete"
            @cancelled="alert.showConfirmDelete = false" @closed="alert.showConfirmDelete = false" />

        <SweetAlert :show="alert.showSuccess" type="success" title="Berjaya!" text="Notifikasi telah dihapuskan."
            :autoClose="1500" @closed="alert.showSuccess = false" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { notifikasiService } from "@/services/notifikasi.service";
import SweetAlert from "@/components/SweetAlert.vue";

export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        SweetAlert,
    },
    data() {
        return {
            topicLabel: "Senarai Ahli Hampir Tamat Tempoh",
            headers: ["No", "Gambar", "Nama (Jawatan)", "Tarikh Tamat", "Tindakan"],
            fields: ["index", "gambar", "nama", "tarikh_tamat", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center",],
            columnWidths: ["5%", "10%", "55%", "20%", "10%"],
            tableData: [],
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
            leftFields: [
                { label: 'Tajuk', model: 'tajuk', type: 'text', placeholder: 'Tajuk...' },
            ],
            rightFields: [
                { label: 'Pelantikan', model: 'pelantikan', type: 'select', placeholder: 'SILA PILIH', options: [{ label: 'Tuan Yang Terutama', value: '1' }] },
            ],
        };
    },
    async mounted() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            try {
                const res = await notifikasiService.senaraiNotifikasi({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                });

                const { data, total, current_page, per_page } = res;

                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                this.tableData = (data || []).map((row, i) => ({
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1),
                    nama: row.gelaran ?
                        `${row.gelaran} ${row.nama} <br> <span class="badge rounded-pill bg-primary text-white me-1">${row.jawatan}</span>` :
                        `${row.nama} <br> <span class="badge rounded-pill bg-primary text-white me-1">${row.jawatan}</span>`,
                }));

            } catch (err) {
                this.alert.errorMessage = JSON.stringify(err?.response?.data?.error) || err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
                this.alert.error = true;
            } finally {
                this.loading = false
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
        hapus(item) {
            this.deleteTarget = item.nama;
            this.targetID = item.id;
            this.alert.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                await notifikasiService.hapusNotifikasi(this.targetID);
                // console.log('Delete:', this.targetID)
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

<style scoped>
.icon-btn {
    background: transparent;
    border: none;
    padding: 4px;
    font-size: 1.1rem;
    cursor: pointer;
}

.icon-btn:hover {
    opacity: 0.7;
}
</style>