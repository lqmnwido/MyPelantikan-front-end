<template>
    <Layout>
        <PageHeader title="Senarai Profil" pageTitle="Rekod Pelantikan" />

        <!-- <CarianForm :leftFields="leftFields" :rightFields="rightFields" @search="onSearch" /> -->


        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :filterShow="false" :buttonLabel="buttonLabel" :buttonTambah="true"
            :buttonLink="link" :columnWidths="columnWidths">
            <template #actions="{ item }">
                <button class="icon-btn text-primary btn-sm me-1" @click="goToProfile(item, 'view')" title="Papar">
                    <i class="mdi mdi-eye"></i>
                </button>
                <button class="icon-btn text-success btn-sm me-1" @click="goToUpdate(item, 'update')" title="Kemaskini">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="icon-btn text-warning btn-sm me-1" @click="goToLantik(item)" title="Lantik Ahli">
                    <i class="bx bx-briefcase"></i>
                </button>
                <button class="icon-btn text-secondary btn-sm me-1" @click="goToResume(item, '')" title="Resume">
                    <i class="mdi mdi-file-document"></i>
                </button>
                <button class="icon-btn text-danger btn-sm" @click="handleDelete(item)" title="Hapus">
                    <i class="mdi mdi-delete"></i>
                </button>
            </template>
        </DataTable>

        <BModal v-model="showModal" hide-footer centered size="lg" hide-header>
            <div class="p-4 rounded">
                <h4 class="mb-3"><strong>Lantik Ahli!</strong></h4>
                <p>Berikut adalah Jenis Pelantikan:</p>

                <table class="table table-bordered table-hover">
                    <!-- <thead>
                        <tr>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead> -->
                    <tbody>
                        <tr v-for="(record, index) in jenisPelantikan" :key="index">
                            <td style="width: 90%;">{{ record.nama }}</td>
                            <td class="text-center" style="width: 10%;">
                                <button class="btn btn-primary" style="width: 120px;"
                                    @click="goToLantik(record.lantikan)">
                                    PILIH
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </BModal>
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { profilService } from "@/services/profil.service.js";

export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
    },
    data() {
        return {
            topicLabel: "Senarai Profil / CV",
            headers: ["Bil", "Gambar", "Nama", "Jawatan", "Tarikh Lahir", "Tindakan"],
            fields: ["index", "gambar", "nama", "jawatan", "tarikh_lahir", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center", "center"],
            columnWidths: ["5%", "10%", "30%", "20%", "15%", "15%"],
            filterOptions: [],
            buttonLabel: "Tambah Calon",
            link: "/rekod-pelantikan/profil/tambah-ahli",
            tableData: [],

            jenisPelantikan: [
                { nama: "Ahli Dewan Negara", lantikan: "ADN" },
                { nama: "Hakim Mahkamah Rayuan", lantikan: "HMR" },
                { nama: "Hakim Mahkamah Tinggi", lantikan: "HMT" },
                { nama: "Hakim Mahkamah Persekutuan", lantikan: "HMP" },
                { nama: "Suruhanjaya Perkhidmatan Awam", lantikan: "SPA" },
                { nama: "Suruhanjaya Pilihan Raya", lantikan: "SPR" },
                { nama: "Suruhanjaya Pilihan Kehakiman dan Perundangan", lantikan: "SPKP" },
                { nama: "Lembaga Penasihat Jabatan Perdana Menteri", lantikan: "LPJPM" },
                { nama: "Lembaga Pengampunan Bagi W.P. Kuala Lumpur, Labuan dan Putrajaya", lantikan: "Pengurus" },
                { nama: "Tuan Yang Terutama Yang Di-Pertua Negeri", lantikan: "Pengurus" },
                { nama: "Lembaga Penasihat Pusat Pencegahan Jenayah Kewangan Nasional (NFCC)", lantikan: "Pengurus" },
                { nama: "Lain-Lain Pelantikan Di Bawah Perlembagaan Persekutuan Dan Akta Tertentu", lantikan: "Pengurus" },

            ],
            showModal: false,
        };
    },
    mounted() {
        // profileService.getProfiles().then((data) => {
        //     this.tableData = data;
        // });
        this.loadProfiles();
    },
    methods: {
        goToProfile(item, mode) {
            const query = mode === "view" ? { view: "readonly" } : { kemaskini: true };
            this.$router.push({ path: "/profile", query });
        },
        handleDelete(item) {
            alert("Delete " + item.nama);
        },
        goToUpdate(item, mode) {
            const query = mode === "view" ? { view: "readonly" } : { kemaskini: true };
            this.$router.push({ path: "/rekod-pelantikan/profil/tambah-ahli", query });
        },
        goToResume(item, mode) {
            const query = mode === "view" ? { view: "readonly" } : "";
            this.$router.push({ path: "/rekod-pelantikan/maklumat-resume", query });
        },
        goToLantik(item) {
            const lantik = this.$route.query.lantik || item;
            // console.log("Lantik:", lantik);
            if (lantik === "ADN") {
                this.$router.push({
                    path: "/rekod-pelantikan/ahli-dewan-negara/tambah-ahli",
                    query: { id: item.id }
                });
            } else if (lantik === "HMR" || lantik === "HMT" || lantik === "HMP") {
                this.$router.push({
                    path: "/rekod-pelantikan/kehakiman/tambah-ahli",
                    query: { id: item.id }
                });
            } else {
                this.showModal = true;
            }
        },
        async loadProfiles() {
            try {
                const data = await profilService.getProfiles(); // ⬅️ No `.data`

                // console.log("API result raw:", data); // ✅ Will log the array

                this.tableData = data.map((row, i) => ({
                    ...row,
                    index: i+1,
                    gambar: row.gambar ?? "-",
                    jawatan: row.jawatan ?? "-",
                    tarikh_lahir: row.tarikh_lahir ?? "-"
                }));
                console.table(this.tableData);

            } catch (err) {
                console.error('Failed to load profiles:', err);
                this.tableData = [];
            }
        }



    },
};
</script>
