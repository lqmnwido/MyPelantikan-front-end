<template>
    <Layout>
        <div v-if="loading" class="loading-overlay">
            <Loader :loading="loading" />
        </div>
        <PageHeader title="Biodata" pageTitle="Profile" />
        <div class="container-fluid py-4">
            <div class="row g-4">
                <!-- Left Column (Profile + Appointment Info) -->
                <div class="col-md-3">
                    <ProfileCard :nama="profileInfo.nama" :jawatan="profileInfo.jawatan" :parti="profileInfo.parti"
                        :profileImage="profileInfo.imageUrl" :partiLogo="profileInfo.partiLogo"
                        :status="profileInfo.status" :tarikhLantikan="profileInfo.tarikhLantik"
                        :tamatLantikan="profileInfo.tamatLantik" :bilHari="profileInfo.hari" :id="profileInfo.id"
                        @resume="goToPageWithId" />

                    <!-- <MaklumatPelantikanCard class="mt-4" /> -->
                </div>

                <!-- Right Column (Tabbed Biodata) -->
                <div class="col-md-9">
                    <BiodataCard :initialData="biodata" />
                </div>
            </div>
        </div>
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import ProfileCard from '@/components/biodata/ProfileCard.vue';
import BiodataCard from '@/components/biodata/BiodataCard.vue';
import { viewProfils } from "@/services/profil.service";
import Loader from "@/components/widgets/loader";
// import MaklumatPelantikanCard from '@/components/biodata/MaklumatPelantikanCard.vue';

export default {
    name: 'Profile',
    components: {
        Layout,
        PageHeader,
        ProfileCard,
        BiodataCard,
        // MaklumatPelantikanCard
        Loader,
    },

    data() {
        return {
            loading: true,
            
            profileInfo: {},

            biodata: {},

        };
    },

    created() {
        const id = this.$route.query.id;
        if (id) {
            this.loadProfil(id);
        } else {
            console.warn("No ID found in route.");
        }
    },
    methods: {
        goToPageWithId(id) {
            // console.log('Navigating with ID:', id);
            this.$router.push({ name: 'maklumat-resume', query: { id: id } });
        },

        async loadProfil(id) {
            try {
                const res = await viewProfils(id);
                const data = res.data.data;
                // console.log("Pelantikan data:", data);
                const pelantikan = Array.isArray(data.pelantikans) && data.pelantikans.length > 0
                    ? data.pelantikans[0]
                    : null;

                this.profileInfo = {
                    id: String(data.id),
                    nama: (data.gelaran ? data.gelaran + ' ' : '') + (data.nama ?? "-"),
                    jawatan: (pelantikan?.jawatan ?? "") + ' ' + (pelantikan?.jenis_pelantikan ?? ""),
                    parti: data.parti?.nama ?? "",
                    status: pelantikan?.status ?? "Tidak Aktif",
                    tarikhLantik: pelantikan?.tarikh_lantik ?? "-",
                    tamatLantik: pelantikan?.tarikh_tamat ?? "-",
                    hari: pelantikan?.bilangan_hari.toString() ?? "-",
                    imageUrl: data.gambar,
                    partiLogo: data.parti?.logo ?? "",
                };


                // Fill biodata tab

                const allPerkhidmatans = (data.perkhidmatans || []).concat(data.perkhidmatans_semasa_resume || []);

                this.biodata = {
                    nama: data.nama,
                    nombor_ic: data.nombor_ic,
                    emel: data.emel,
                    parti: data.parti?.nama,
                    jantina: data.jantina,
                    tarikh_lahir: data.tarikh_lahir,
                    tarikh_bersara: data.tarikh_bersara,
                    tempat_lahir: data.tempat_lahir,
                    bangsa: data.bangsa?.nama,
                    agama: data.agama?.nama,
                    status_perkahwinan: data.status_kahwin?.nama,
                    telefons: data.telefons,
                    alamats: data.alamats,
                    akademiks: data.akademiks,
                    anugerahs: data.anugerahs,
                    perkhidmatans: allPerkhidmatans,
                    dokumens: data.dokumens,
                };
            } catch (err) {
                console.error("Error loading profile:", err);
            } finally {
                // enable watchers + hide overlay
                this.loading = false;
            }
        },
    },

};
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}
.spinner {
  padding: 12px 18px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  font-weight: 600;
}
</style>
