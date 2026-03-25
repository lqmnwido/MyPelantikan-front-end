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
                    <ProfileCard :nama="profileInfo.nama" :peranan="profileInfo.peranan"
                        :profileImage="profileInfo.imageUrl" :id="profileInfo.id" />

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
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import ProfileCard from '@/components/profile/ProfileCard.vue';
import BiodataCard from '@/components/profile/BiodataCard.vue';
import { penggunaService } from "@/services/auth.service";
import Loader from "@/components/widgets/loader";
import { useAuthStore } from '@/state/pinia';

export default {
    name: 'Profile',
    components: {
        Layout,
        PageHeader,
        ProfileCard,
        BiodataCard,
        Loader,
    },

    data() {
        return {
            loading: true,

            profileInfo: {},

            biodata: {},

        };
    },
    computed: {
        currentUser() {
            const auth = useAuthStore()
            // console.log("currentUser from store:", auth.currentUser.peranan)
            return auth.currentUser;
        }
    },
    created() {
        const id = this.currentUser.id;
        if (id) {
            this.loadProfil(id);
        } else {
            console.warn("No ID found in route.");
        }
    },
    methods: {
        async loadProfil(id) {
            try {
                const res = await penggunaService.paparPengguna(id);
                const data = res.data;
                // console.log("Pelantikan data:", data);

                this.profileInfo = {
                    id: String(data.id),
                    nama: data.nama ?? "-",
                    peranan: data.peranan ?? "",
                    imageUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                };


                // Fill biodata tab

                this.biodata = {
                    nama: data.nama,
                    nombor_ic: data.nombor_ic,
                    emel: data.emel,
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
    background: rgba(255, 255, 255, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 60;
}

.spinner {
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    font-weight: 600;
}
</style>
