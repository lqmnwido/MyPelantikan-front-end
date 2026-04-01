<template>
    <Layout>
        <PageHeader :title="title" pageTitle="Tutorial" />

        <DataTable :headers="headers" :fields="fields" :items="tableData" :topicLabel="topicLabel"
            :buttonLabel="buttonLabel" :buttonTambah="true" :link="link" :total="total" :page="page" :perPage="perPage"
            :loading="loading" serverSide @change-page="onChangePage" @change-per-page="onChangePerPage"
            @search="onSearch">
            <template #actions="{ item }">
                <button class="icon-btn text-success me-1" @click="editTutorial(item)" title="Kemaskini">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="icon-btn text-danger" @click="deleteTutorial(item)" title="Padam">
                    <i class="mdi mdi-delete"></i>
                </button>

                <SweetAlert :show="showConfirmDelete" type="warning" title="Anda pasti?"
                    :html="`Tindakan ini akan memadamkan tutorial: <br/><b>${deleteTargetName}</b>`"
                    :showCancelButton="true" confirmButtonText="Ya, Padam" cancelButtonText="Batal"
                    @confirmed="confirmDelete" @cancelled="showConfirmDelete = false" />
            </template>
        </DataTable>
        <SweetAlert :show="showSuccess" type="success" title="Berjaya!" :text="successMessage" :autoClose="1500"
            @closed="showSuccess = false" />
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import SweetAlert from "@/components/SweetAlert.vue";
import { tutorialService } from "@/services/tutorial.service";

export default {
    name: "TutorialList",
    components: {
        Layout,
        PageHeader,
        DataTable,
        SweetAlert,
    },
    data() {
        return {
            title: "Senarai Tutorial",
            topicLabel: "Modul Tutorial",
            headers: ["Bil", "Nama", "Kategori", "Keterangan", "Tindakan"],
            fields: ["index", "title", "category", "description", "actions"],
            buttonLabel: "Tambah Tutorial",
            link: "/tutorial/create",
            tableData: [],
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,
            showConfirmDelete: false,
            deleteTargetId: null,
            deleteTargetName: "",
            showSuccess: false,
            successMessage: "",
        };
    },
    mounted() {
        this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            try {
                const response = await tutorialService.getTutorials(
                    { 
                        page: this.page, 
                        perPage: this.perPage, 
                        search: this.search 
                    });
                this.tableData = response.data.map((item, index) => (
                    { 
                        ...item, 
                        index: (this.page - 1) * this.perPage + index + 1 
                    }
                ));
                this.total = response.total;
            } catch (error) {
                console.error("Gagal memuat data tutorial:", error);
            } finally {
                this.loading = false;
            }
        },
        deleteTutorial(item) {
            this.deleteTargetId = item.id;
            this.deleteTargetName = item.name;
            this.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                // await tutorialService.deleteTutorial(this.deleteTargetId);
                this.showConfirmDelete = false;
                this.successMessage = "Tutorial berjaya dipadamkan.";
                this.showSuccess = true;
                // this.loadData();
            } catch (error) {
                console.error("Gagal memadamkan tutorial:", error);
            }
        },
    }
};
</script>