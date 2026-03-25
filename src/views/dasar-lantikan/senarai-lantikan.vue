<template>
    <Layout>
        <PageHeader title="Senarai Dasar Lantikan" pageTitle="Dasar Lantikan" />

        <CarianForm :leftFields="leftFields" :rightFields="rightFields" @search="onSearch" />


        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :columnWidths="columnWidths" :topicLabel="topicLabel" :loading="loading" :buttonLabel="buttonLabel"
            :carian="false" :buttonTambah="true" :link="link" :total="total" :page="page" :perPage="perPage"
            @change-page="onChangePage" @change-per-page="onChangePerPage" @search="onSearch">
            <template #actions="{ item }">
                <button class="icon-btn text-success me-1" @click="handleEdit(item)" title="Kemaskini">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="icon-btn text-danger" @click="handleDelete(item)" title="Padam">
                    <i class="mdi mdi-delete"></i>
                </button>
            </template>
        </DataTable>

        <SweetAlert :show="alert.showConfirmDelete" type="warning" title="Anda pasti?"
            :html="`Tindakan ini akan memadamkan file: <b>${deleteTarget}</b>`" :showCancelButton="true"
            confirmButtonText="Ya, padam" cancelButtonText="Batal" @confirmed="confirmDelete"
            @cancelled="alert.showConfirmDelete = false" @closed="alert.showConfirmDelete = false" />

        <SweetAlert :show="alert.showSuccess" type="success" title="Berjaya!" text="Data dipadam." :autoClose="1500"
            @closed="alert.showSuccess" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" text="Gagal memaparkan data."
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import CarianForm from "@/components/CarianForm.vue";
import SweetAlert from "@/components/SweetAlert";
import { dasarLantikanService } from "@/services/dasarLantikan.service";
import { lookupService } from "@/services/lookup.service";

export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        CarianForm,
        SweetAlert,
    },
    data() {
        return {
            // Define the topic label for the data table container
            topicLabel: "Senarai Dokumen Dasar Lantikan",
            // Define headers for the data table
            headers: ["No", "Tajuk", "Keterangan", "Jenis Lantikan", "File", "Tarikh & Masa", "Tindakan"],
            // Define fields for the data table
            fields: ["index","tajuk","keterangan","jenis_pelantikan","file","masa_simpan","actions",],
            columnAlignments: ["center", "left", "left", "center", "left", "center"],
            columnWidths: ["5%", "10%", "30%", "20%", "20$", "15%"],
            buttonLabel: "Tambah Dokumen Dasar Lantikan",
            link: "/dasar-lantikan/senarai-lantikan/tambah-dokumen",
            tableData: [],
            form: {
                search_tajuk: "",
                search_jenis_pelantikan: "",
            },
            jenis_pelantikan: [],
            leftFields: [
                { label: 'Tajuk', model: 'search_tajuk', type: 'text', placeholder: 'Tajuk...' },
            ],
            rightFields: [
                { label: 'Jenis Lantikan', model: 'search_jenis_pelantikan', type: 'select-search', placeholder: 'SILA PILIH', options: [] },
            ],
            loading: false,
            alert: {
                showConfirmDelete: false,
                showSuccess: false,
                error: false,
            },
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            deleteTarget: null,
        };
    },
    async mounted() {
        await this.loadDasarLantikan();
        await this.loadJenisPelantikan();
    },
    methods: {
        handleEdit(item) {
            // alert(item.id);
            this.$router.push({ path: '/dasar-lantikan/senarai-lantikan/tambah-dokumen', query: { id: item.id } });
        },
        async loadDasarLantikan() {
            this.loading = true;
            try {
                const res = await dasarLantikanService.senaraiDasarLantikan({
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
                    tajuk: row.tajuk ? `${row.tajuk}` : "-",
                    index: (this.page - 1) * this.perPage + (i + 1),
                    masa_simpan: row.masa_simpan ? `${row.masa_simpan.tarikh}<br>${row.masa_simpan.masa}` : "-",
                    tarikh_lahir: row.tarikh_lahir ?? "-",
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
        async loadJenisPelantikan() {
            try {
                const response = await lookupService.getJenisPelantikan();
                this.jenis_pelantikan = response.map(pelantikan => ({
                    label: pelantikan.nama,
                    value: pelantikan.id
                }));

                this.rightFields = this.rightFields.map(field =>
                    field.model === 'search_jenis_pelantikan'
                        ? { ...field, options: this.jenis_pelantikan }
                        : field
                );
                // console.log("options loaded:", this.rightFields[0].options);
            } catch (err) {
                this.alert.error = true;
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
            }
        },
        onChangePage(p) {
            this.page = p;
            this.loadDasarLantikan();
        },
        onChangePerPage(pp) {
            this.perPage = pp;
            this.page = 1;
            this.loadDasarLantikan();
        },
        onSearch(keyword) {
            // console.log(keyword);
            this.search = keyword;
            this.page = 1;
            this.loadDasarLantikan();
        },
        handleDelete(item) {
            const fileName = decodeURIComponent(item.file.split('/').pop());
            // console.log(fileName);
            this.deleteTarget = fileName;
            this.targetID = item.id;
            this.alert.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                await dasarLantikanService.hapusDasarLantikan(this.targetID);
                console.log('Delete:', this.targetID)
                this.alert.showConfirmDelete = false
                this.alert.showSuccess = true
                await this.loadDasarLantikan();
            } catch (err) {
                this.alert.showConfirmDelete = false
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
            }
        },
    },
    computed: {
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