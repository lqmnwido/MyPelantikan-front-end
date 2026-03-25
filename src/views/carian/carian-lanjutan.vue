<template>
    <Layout>
        <PageHeader title="Carian Keseluruhan" pageTitle="Carian" />

        <CarianForm :leftFields="leftFields" :rightFields="rightFields" @search="onSearch" />

        <div v-if="tarikhMula && tarikhAkhir" class="d-flex justify-content-end mb-3">

            <button class="btn btn-primary me-2" @click="toggleLaporan">
                {{ showLaporan ? 'Tutup Laporan' : 'Papar Laporan' }}
            </button>
            <button class="btn btn-secondary me-2" @click="printLaporan" v-if="showLaporan">
                Cetak
            </button>
        </div>

        <LaporanCarian v-if="showLaporan" :items="tableData" :tarikhMula="tarikhMula" :tarikhAkhir="tarikhAkhir"
            :kumpulanJawatan="selectedKumpulanJawatan" ref="laporanCarian" />

        <DataTable v-if="!showLaporan" :headers="headers" :fields="fields" :items="tableData" :topicLabel="topicLabel"
            :total="total" :page="page" :perPage="perPage" :loading="loading" serverSide
            :columnAlignments="columnAlignments" :columnWidths="columnWidths" @change-page="onChangePage"
            @change-per-page="onChangePerPage" :carian="false" @search="onSearch">
            <template #actions="{ item }">
                <button class="icon-btn text-primary me-1" @click="goToProfile(item, 'view')" title="Papar">
                    <i class="mdi mdi-eye"></i>
                </button>
                <button class="icon-btn text-secondary me-1" @click="goToResume(item)" title="Resume">
                    <i class="mdi mdi-file-document"></i>
                </button>
            </template>
        </DataTable>

        <SweetAlert :show="alert.error" type="error" title="Ralat" text="Gagal memadam data."
            @closed="alert.error = false" />

        <SweetAlert :show="alert.amaran" type="warning" title="Amaran" text="Tarikh Mula dan Tarikh Akhir diperlukan"
            :autoClose="1500" @closed="alert.amaran = false" />
    </Layout>
</template>

<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import CarianForm from "@/components/CarianForm.vue";
import SweetAlert from "@/components/SweetAlert";
import LaporanCarian from "@/components/LaporanCarian.vue";
import { carianService } from "@/services/carian.service";
import { lookupService } from "@/services/lookup.service";
export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        CarianForm,
        SweetAlert,
        LaporanCarian,
    },
    data() {
        return {
            topicLabel: "Senarai Keseluruhan",
            headers: ["Bil", "Gambar", "Nama", "Jawatan", "Tarikh Pelantikan", "Tarikh Tamat Jawatan", "Tindakan"],
            fields: ["index", "gambar", "nama", "jawatan", "tarikh_lantik", "tarikh_tamat", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center", "center", "center", "center"],
            columnWidths: ["5%", "10%", "30%", "20%", "10%", "10%", "15%"],
            tableData: [],
            page: 1,
            perPage: 100,
            total: 0,
            search: "",
            loading: false,
            alert: {
                error: false,
                amaran: false,
            },
            skipValidation: false,
            leftFields: [
                { label: 'Tarikh Mula:', model: 'tarikh_mula', type: 'date', required: true },
                { label: 'Kumpulan Jawatan:', model: 'search_jenis_pelantikan', type: 'select-search', placeholder: 'SILA PILIH', options: [] },
            ],
            rightFields: [
                { label: 'Tarikh Akhir:', model: 'tarikh_akhir', type: 'date', required: true },
            ],
            showLaporan: false,
            tarikhMula: null,
            tarikhAkhir: null,
            selectedKumpulanJawatan: null,
        };
    },
    async mounted() {
        if (Object.values(this.search).every(value => value !== "" && value !== null && value !== undefined) && this.search !== "") {
            await this.loadData();
        }
        await this.loadJenisPelantikan();
    },
    methods: {
        toggleLaporan() {
            this.showLaporan = !this.showLaporan;
        },
        printLaporan() {
            if (this.$refs.laporanCarian) {
                this.$refs.laporanCarian.printReport();
            }
        },
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
                const res = await carianService.senaraiCarian({
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
                    nama: row.gelaran ? `${row.gelaran} ${row.nama}` : `${row.nama}`,
                }));
            } catch (err) {
                this.alert.error = true;
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
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

                this.leftFields = this.leftFields.map(field =>
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
            this.loadData();
        },
        onChangePerPage(pp) {
            this.perPage = pp;
            this.page = 1;
            this.loadData();
        },
        onSearch(keyword, skipValidation) {
            const selectedJenisPelantikanId = keyword.search_jenis_pelantikan;
            let selectedJenisPelantikanNama = null;

            if (selectedJenisPelantikanId) {
                const selectedOption = this.jenis_pelantikan.find(
                    (option) => option.value === selectedJenisPelantikanId
                );
                if (selectedOption) {
                    selectedJenisPelantikanNama = selectedOption.label;
                }
            }

            this.selectedKumpulanJawatan = selectedJenisPelantikanNama;

            if (!skipValidation && !this.selectedKumpulanJawatan) {
                if (!keyword.tarikh_mula) {
                    return this.alert.amaran = true;
                }
                if (!keyword.tarikh_akhir) {
                    return this.alert.amaran = true;
                }
            }
            this.search = keyword;
            this.tarikhMula = keyword.tarikh_mula;
            this.tarikhAkhir = keyword.tarikh_akhir;
            this.page = 1;
            this.loadData();
        },
    },
    computed: {
    },
};
</script>
