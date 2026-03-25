<template>
    <Layout>
        <PageHeader title="Senarai Tamat Tempoh" pageTitle="Rekod Pelantikan" />

        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :columnWidths="columnWidths" @change-page="onChangePage" :total="total"
            :page="page" :perPage="perPage" :loading="loading" serverSide @change-per-page="onChangePerPage"
            @search="onSearch" :buttonTambah="true" :link="'/rekod-pelantikan/senarai-tamat-tempoh/tambah-rekod'"
            :buttonLabel="buttonLabel" @sort-change="onSortChange" :sortBy="sortBy" :sortDesc="sortDesc">
            <template #actions="{ item }">
                <button class="icon-btn text-primary me-1" @click="goToProfile(item, 'view')" title="Papar">
                    <i class="mdi mdi-eye"></i>
                </button>
                <button class="icon-btn text-success me-1" @click="goToKemaskini(item, 'kemaskini')" title="Kemaskini">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="icon-btn text-secondary me-1" @click="goToResume(item, '')" title="Resume">
                    <i class="mdi mdi-file-document"></i>
                </button>
                <button class="icon-btn text-danger me-1" @click="handleDelete(item)" title="Padam">
                    <i class="mdi mdi-delete"></i>
                </button>
                <SweetAlert :show="showConfirmDelete" type="warning" title="Anda pasti?"
                    :html="`Tindakan ini akan memadam data: - <br/> <b>Profil</b>: ${deleteTarget} <br/> <b>Jawatan</b>: ${targetJawatan}`" :showCancelButton="true"
                    confirmButtonText="Ya, Padam" cancelButtonText="Batal" @confirmed="confirmDelete"
                    @cancelled="showConfirmDelete = false" @closed="showConfirmDelete = false" />
            </template>
        </DataTable>

        <SweetAlert :show="showSuccess" type="success" title="Berjaya!" text="Data dipadam." :autoClose="1500"
            @closed="showSuccess" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { tamatService } from "@/services/tamat.service.js";
import SweetAlert from "@/components/SweetAlert";

export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        SweetAlert
    },
    data() {
        return {
            topicLabel: "Senarai Tamat Tempoh",
            headers: ["Bil", "Gambar", "Nama", "Jawatan", "Tarikh Lahir", "Tarikh Pelantikan", "Tarikh Tamat", "Tarikh Lanjutan","Tindakan"],
            fields: ["index", "gambar", "nama", "jawatan", "tarikh_lahir", "tarikh_lantik", "tarikh_tamat", "tarikh_lanjutan", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center", "center", "center", "center", "center"],
            columnWidths: ["1%", "10%", "20%", "20%", "10%", "5%", "5%", "5%","15%"],
            tableData: [],
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            buttonLabel: "Tambah Rekod",
            sortBy: "tarikh_tamat",
            sortDesc: false,
            loading: false,
            deleteTarget: null,
            targetJawatan: null,
            targetID: null,
            alert: {
                error: false,
            },
            showConfirmDelete: false,
            showSuccess: false,
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
        async loadData() {
            this.loading = true;
            try {
                const res = await tamatService.getTamatTempoh({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                    sortBy: this.sortBy,
                    sortDesc: this.sortDesc ? 'desc' : 'asc',
                });

                const { data, total, current_page, per_page } = res;

                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                this.tableData = (data || []).map((row, i) => ({
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1),
                    nama: row.gelaran ? `${row.gelaran} ${row.nama}` : `${row.nama}`,
                    jawatan: `${row.jawatan}`,
                }));

            } catch (e) {
                console.error(e);
                this.alert.error = true
                this.alert.errorMessage = e?.response?.data?.message || e.message || 'Ralat tidak diketahui'
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
        onSortChange({ sortBy, sortDesc }) {
            this.sortBy = sortBy;
            this.sortDesc = sortDesc;
            this.page = 1;
            this.loadData();
        },
        handleDelete(item) {
            this.deleteTarget = item.nama;
            this.targetJawatan = item.jawatan;
            this.targetID = item.id;
            this.showConfirmDelete = true;
        },
        goToKemaskini(item, mode) {
            const query = mode === "kemaskini" ? { kemaskini: true, id: item.id } : { id: item.id };
            this.$router.push({ path: "/rekod-pelantikan/senarai-tamat-tempoh/kemaskini-tamat-tempoh", query });
        },
        async confirmDelete() {
            try {
                await tamatService.hapusRekod(this.targetID);
                // console.log('Delete:', this.targetID)
                this.showConfirmDelete = false
                this.showSuccess = true
                await this.loadData();
            } catch (err) {
                this.showConfirmDelete = false
                this.alert.error = true
            }
        },
    },
};
</script>
