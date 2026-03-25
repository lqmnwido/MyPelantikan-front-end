<template>
  <Layout>
    <PageHeader title="Laman Utama" pageTitle="Dashboards" />
    <div class="container-fluid">

      <!-- Statistik -->
      <div v-for="(group, gIndex) in statData" :key="gIndex" class="mb-4">
        <h5 class="mb-3 fw-bold text-primary"><u>{{ group.group }}</u></h5>
        <BRow>
          <BCol md="3" v-for="(stat, index) in group.items" :key="index">
            <Stat :number="stat.number" :title="stat.title" :value="stat.value" :current="stat.current"
              :total="stat.total" :footerLink="stat.footerLink" />
          </BCol>
        </BRow>
      </div>

      <!-- Password Change Announcement Modal -->
      <BModal v-model="showPasswordModal" hide-footer centered size="lg" hide-header
        content-class="border-0 shadow-lg rounded-3 overflow-hidden" dialog-class="modal-dialog-slideup">
        <!-- Header -->
        <div class="bg-gradient bg-info-subtle text-dark p-4 d-flex justify-content-between align-items-center"
          style="background: linear-gradient(135deg, #ffc107, #ffca2c);">
          <div class="row d-flex">
            <i class="bx bx-error fw-normal fs-1 col"></i>
            <h4 class="fw-bold col" style="margin-top: 5px; margin-left: -10px">Pengumuman!</h4>
          </div>
          <button class="btn-close" @click="showPasswordModal = false"></button>
        </div>

        <!-- Body -->
        <div class="p-4 bg-light rounded shadow-sm">
          <p class="mb-3 fs-6">
            <strong class="mb-2"><u>Perhatian:</u></strong>
            <br />Anda sedang menggunakan <span class="fw-bold text-danger">kata laluan sementara</span>.
            Demi keselamatan akaun anda, sila tukar kata laluan sekarang.
            <span class="fw-bold text-danger">Kata laluan ini akan tamat tempoh secara automatik dalam tempoh 7
              hari</span>
            dan akaun anda akan dikunci jika tidak ditukar.
          </p>
        </div>


        <!-- Footer -->
        <div class="bg-light p-3 d-flex justify-content-end border-top">
          <button class="btn btn-primary" @click="redirectToChangePassword">
            Tukar Kata Laluan Sekarang
          </button>
        </div>
      </BModal>


      <!-- Redesigned Modal -->
      <BModal v-model="showModal" hide-footer centered size="lg" hide-header
        content-class="border-0 shadow-lg rounded-3 overflow-hidden" dialog-class="modal-dialog-slideup">
        <!-- Header -->
        <div class="bg-gradient bg-danger-subtle text-black p-4 d-flex justify-content-between align-items-center"
          style="background: linear-gradient(135deg, #dc3545, #b02a37);">
          <h4 class="mb-0 fw-bold">Peringatan!</h4>
          <button class="btn-close btn-close-white" @click="showModal = false"></button>
        </div>

        <!-- Body -->
        <div class="p-4 bg-light">
          <p class="text-muted mb-4 fs-6">Berikut adalah lantikan yang akan tamat tempoh:</p>
          <div class="modal-scroll-area">
            <div class="table-responsive">
              <table class="table align-middle table-hover">
                <thead class="table text-dark">
                  <tr>
                    <th>Nama</th>
                    <th>Lantikan</th>
                    <th class="text-center">Tarikh Tamat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in appointments" :key="index">
                    <td class="fw-semibold">{{ record.nama }}</td>
                    <td>{{ record.lantikan }}</td>
                    <td class="text-center text-danger fw-bold">{{ record.tarikhTamat }}</td>
                  </tr>
                  <tr v-if="appointments.length === 0">
                    <td colspan="3" class="text-center text-muted">Tiada rekod tamat tempoh</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-light p-3 d-flex justify-content-end border-top">
          <button class="btn btn-outline-secondary me-2" @click="showModal = false">
            Tutup
          </button>
          <button class="btn btn-danger" @click="handleLihat">
            Lihat Semua
          </button>
        </div>
      </BModal>
    </div>

    <!-- SweetAlert -->
    <SweetAlert :show="alert.error" type="error" title="Ralat" text="Gagal memaparkan data."
      @closed="alert.error = false" />
  </Layout>
</template>

<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Stat from "@/components/widgets/stat";
import SweetAlert from "@/components/SweetAlert";
import { dashboardService } from "@/services/dashboard.service";
import { notifikasiService } from "@/services/notifikasi.service";
import { lookupService } from "@/services/lookup.service";
import { templateSenaraiService } from "@/services/templateSenarai.service.js";


export default {
  components: {
    Layout,
    PageHeader,
    Stat,
    SweetAlert,
  },
  data() {
    return {
      statData: [],
      appointments: [],
      showModal: false,
      showPasswordModal: false,
      alert: {
        error: null,
      },
    };
  },
  async mounted() {
    await this.loadStatistik();
    await this.loadNotifikasi();

    const user = JSON.parse(localStorage.getItem("user"));
    // console.log(user);
    if (user?.force_password_change) {
      setTimeout(() => {
        this.showPasswordModal = true;
      }, 1000);
    }

    if (this.appointments.length > 0 & user?.force_password_change === false) {
      setTimeout(() => {
        this.showModal = true;
      }, 1500);
    }
  },
  methods: {
    async loadStatistik() {
      this.loading = true;
      try {
        const [kategoriList, jenisPelantikanList, stats, templateList] = await Promise.all([
          lookupService.getSenaraiKategoriPelantikan(),
          lookupService.getSenaraiPelantikan(),
          dashboardService.jumlahAhli(),
          templateSenaraiService.getTemplates(),
        ]);

        const templateNames = new Set(templateList.map(t => t.name));


        const kategoriMap = new Map(kategoriList.map(k => [k.id, k.nama.toUpperCase()]));
        const jumlahAhliData = stats.data.data; // { 1: 0, 2: 1, 3: 0, 4: 2, ... }
        // console.log('Jumlah Ahli:', jumlahAhliData);

        const grouped = jenisPelantikanList.reduce((acc, item) => {
          const groupName = kategoriMap.get(item.id_lkp_kategori_pelantikan);
          if (!groupName) return acc;

          if (!acc[groupName]) {
            acc[groupName] = [];
          }

          const total = item.kapasiti_ahli ?? 0;
          const currentCount = jumlahAhliData[item.id] ?? 0;
          // console.log('Current Count:', currentCount);
          const current = `${currentCount}/${total}`;

          acc[groupName].push({
            title: "Senarai",
            value: item.nama,
            current: current,
            code: item.kod,
            total: total,
            footerLink: (item.id === 1 || templateNames.has(item.nama)) ? this.getFooterLink(item.nama) : null,
            number: String(currentCount), // optional, if your <Stat> uses it
            // exists: item.id === 1 ? true : templateNames.has(item.nama) // ✅ Mark as existing if template name matches
          });

          // console.log('Template :' ,item.id, item.id === 1 ? true : templateNames.has(item.nama));
          return acc;
        }, {});

        this.statData = Object.entries(grouped).map(([group, items]) => ({
          group,
          items,
        }));
      } catch (error) {
        console.error("Error loading or processing API data:", error);
        this.alert.error = true;
      } finally {
        this.loading = false;
      }
    },
    async loadNotifikasi() {
      try {
        const response = await notifikasiService.senaraiNotifikasiDashboard();
        this.appointments = response.data;
      } catch (err) {
        console.log(err);
      }
    },
    handleLihat() {
      try {
        this.$router.push('/notifikasi/senarai-notifikasi');
      } catch (err) {
        console.log(err);
      }
    },
    getFooterLink(jenisPelantikan) {
      const routes = {
        "Ahli Dewan Negara": { path: "/rekod-pelantikan/senarai-pelantikan/kategori/ahli-dewan-negara" },
        "Hakim Mahkamah Rayuan": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman",
          query: { senarai: "hakim-mahkamah-rayuan" }
        },
        "Hakim Mahkamah Tinggi": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman",
          query: { senarai: "hakim-mahkamah-tinggi" }
        },
        "Hakim Mahkamah Persekutuan": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman",
          query: { senarai: "hakim-mahkamah-persekutuan" }
        },
        "Keanggotaan Suruhanjaya Perkhidmatan Awam": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/suruhanjaya",
          query: { senarai: "keanggotaan-suruhanjaya-perkhidmatan-awam" }
        },
        "Suruhanjaya Pilihan Raya": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/suruhanjaya",
          query: { senarai: "suruhanjaya-pilihan-raya" }
        },
        "Keanggotaan Suruhanjaya Perkhidmatan Kehakiman Dan Perundangan": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/suruhanjaya",
          query: { senarai: "keanggotaan-suruhanjaya-perkhidmatan-kehakiman-dan-perundangan" }
        },
        "Keanggotaan Lembaga Penasihat, Jabatan Perdana Menteri": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/lembaga-penasihat",
          query: { senarai: "keanggotaan-lembaga-penasihat,-jabatan-perdana-menteri" }
        },
        "Lembaga Pengampunan Bagi Wilayah Persekutuan Kuala Lumpur, Labuan Dan Putrajaya": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/lembaga-pengampunan",
          query: { senarai: "lembaga-pengampunan-bagi-wilayah-persekutuan-kuala-lumpur,-labuan-dan-putrajaya" }

        },
        "Tuan Yang Terutama Yang Di-Pertua Negeri": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/tuan-yang-terutama",
          query: { senarai: "tuan-yang-terutama-yang-di%pertua-negeri" }
        },
        "Keanggotaan Lembaga Penasihat, Pusat Pencegahan Jenayah Kewangan Nasional (NFCC)": {
          path: "/rekod-pelantikan/senarai-pelantikan/kategori/nfcc",
          query: { senarai: "keanggotaan-lembaga-penasihat,-pusat-pencegahan-jenayah-kewangan-nasional-(NFCC)" }
        },
      };

      const route = routes[jenisPelantikan];

      if (route) {
        return route;
      } else {
        return { path: "/rekod-pelantikan/senarai-pelantikan/kategori/papar", query: { pelantikan: jenisPelantikan } };
      }
    },
    redirectToChangePassword() {
      this.$router.push('/profile/kemaskini-kata-laluan');
    }
  },
  computed: {
    mainGroups() {
      // Groups with more than 1 item (AHLI DEWAN NEGARA, etc.)
      return this.statData.filter(group => group.items.length > 1);
    },

  }
};
</script>

<style scoped>
/* Smooth slide-up animation for modal */
.modal-dialog-slideup {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.bx-error {
  color: rgb(228, 127, 4);
}

.modal-scroll-area {
  /* Sets the maximum height for the table content */
  max-height: 300px;

  /* Enables vertical scrolling if content exceeds max-height */
  overflow-y: auto;

  /* Adds a small border for visual separation (optional) */
  border: 1px solid #e9ecef;

  /* Ensures the table doesn't look squished against the border */
  padding: 5px;
}
</style>
