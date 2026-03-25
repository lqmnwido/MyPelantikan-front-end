<template>
  <Layout>
    <PageHeader title="Maklumat Resume" pageTitle="Pelantikan" />
    <!-- Checkbox Filter UI -->
    <div class="container">
      <div class="card p-1">
        <form @submit.prevent="handleSubmit">
          <div class="text-center mt-3 d-flex justify-content-between">
            <!-- Button -->
            <button class="btn btn-secondary mb-3 mx-2" @click="goBack">Kembali</button>
            <button class="btn btn-primary mb-3 d-print-none mx-2" @click="triggerDownload">Muat Turun PDF</button>
            <button class="btn btn-primary mb-3 d-print-none mx-2" @click="triggerExportToWord">Export to Word</button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="loading" class="loading-overlay">
      <Loader :loading="loading" />
    </div>
    <ResumeCard ref="resumeCardRef" :loading="loading" :resume="resumeData" :profileImage="resumeData.photo"
      v-model:lampiran="lampiranLabel" :visible-fields="visibleFields" />
  </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import ResumeCard from "@/components/ResumeCard.vue";
import { viewProfils } from "@/services/profil.service";
import Loader from "@/components/widgets/loader";

export default {
  components: { Layout, ResumeCard, PageHeader, Loader },
  data() {
    return {
      loading: true,
      lampiranLabel: "LAMPIRAN -",
      visibleFields: {
        fax: false, // user must tick to show it
        statusKahwin: false
      },
      resumeData: {
        photo: '',
        personal: {
          imageUrl: '',
          nama: '',
          pelantikan_terakhir: '',
          nombor_ic: '',
          emel: '',
          parti: '',
          jantina: '',
          tarikh_lahir: '',
          tempatLahir: '',
          bangsa: '',
          agama: '',
          status_perkahwinan: '',
          telefons: [],
          alamats: [],
          akademiks: [],
          anugerahs: []
        },
        perkhidmatan: [],
        lain_lain_maklumat: []
      }
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
    async loadProfil(id) {
      this.loading = true;
      try {
        const res = await viewProfils(id);
        const data = res.data.data;
        // console.log("Profile data:", data);
        const pelantikan = Array.isArray(data.pelantikans) && data.pelantikans.length > 0
          ? data.pelantikans.map(item => {
            const jawatan = item.jawatan || "";
            const jenis_pelantikan = item.jenis_pelantikan || "";
            if (["Ahli", "Pengerusi", "Timbalan Pengerusi"].includes(jawatan)) {
              return `${jawatan} ${jenis_pelantikan}`.trim();
            }
            return jawatan;
          }).join('\n')
          : null;

        const p_terakhir = data.perkhidmatans_terarkhir;
        const pelantikan_terakhir_str = p_terakhir
          ? [p_terakhir.jawatan, p_terakhir.agensi, p_terakhir.catatan ? `(${p_terakhir.catatan})` : null]
            .filter(Boolean)
            .join('\n')
          : null;

        const pelantikan_terakhir = data.pelantikan_terakhir?.jawatan || pelantikan_terakhir_str;

        this.resumeData.photo = data.base64_photo; // Fallback image if not available
        this.resumeData.personal = {
          gelaran: data.gelaran,
          nama: data.nama,
          jawatan: pelantikan ?? "",
          pelantikan_terakhir: pelantikan_terakhir ?? "",
          noKp: this.formatNoKp(data.nombor_ic),
          tarikhLahir: data.tarikh_lahir_formatted,
          tarikhBersara: data.tarikh_bersara_formatted,
          tempatLahir: (() => {
            const lahir = data.alamats?.find(a => a.jenis?.toLowerCase().trim() === 'tempat lahir');
            if (!lahir) return '';
            return `${lahir.alamat || ''}`.trim();
          })(),
          emel: data.emel,
          alamat: (() => {
            const rumah = data.alamats?.find(a => a.jenis?.toLowerCase().trim() === 'alamat rumah');
            if (!rumah) return '';
            return `${rumah.alamat || ''}, ${rumah.poskod || ''} ${rumah.bandar || ''}, ${rumah.negeri || ''}`.trim();
          })(),
          telefon: this.formatNoTel(data.telefons?.find(t => t.jenis?.toLowerCase().trim() === 'telefon bimbit')?.no),
          statusKahwin: data.status_perkahwinan?.nama || '',
          bangsa: data.bangsa?.nama || '',
          agama: data.agama?.nama || '',
          parti: data.parti?.nama || '',

          kelulusan: data.akademiks.sort((a, b) => a.kekananan - b.kekananan).map((item) => {
            const program = item.program?.trim() || '';
            const institusi = item.institusi?.trim() || '';
            const tahun = item.tahun ? `(${item.tahun})` : '';
            return `${program}, ${institusi} ${tahun}`.trim();
          }),

          anugerah: data.anugerahs.sort((a, b) => a.kekananan - b.kekananan).map((item) => {
            return item.singkatan?.trim(); // Just return the string
          }).filter(Boolean), // Remove null/undefined/empty

          anugerah_penuh: data.anugerahs.sort((a, b) => a.kekananan - b.kekananan).map((item) => {
            return item.nama_anugerah?.trim();// Just return the string
          }).filter(Boolean),
        };


        this.resumeData.perkhidmatan = [
          ...(data.perkhidmatans_terdahulu || []).map(item => ({
            tahun: item.tahun,
            jawatan: item.jawatan,
            agensi: item.agensi,
            catatan: item.catatan
          })),
          ...(data.perkhidmatans_semasa_resume || []).map(item => ({
            tahun: item.tahun,
            jawatan: item.jawatan,
            agensi: item.agensi,
            catatan: item.catatan
          }))
        ];

        this.resumeData.lain_lain_maklumat = data.lain_lain_maklumat || [];

        // console.log('HTTP: ', this.resumeData.photo);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        this.loading = false;
      }
    },
    triggerDownload() {
      // console.log("Trying to call downloadPDF...");
      if (this.$refs.resumeCardRef) {
        // console.log("ResumeCard ref found, calling method.");
        this.$refs.resumeCardRef.downloadPDF();
      } else {
        console.warn("ResumeCard ref not available.");
      }
    },
    triggerExportToWord() {
      if (this.$refs.resumeCardRef) {
        this.$refs.resumeCardRef.exportToWord();
      } else {
        console.warn("ResumeCard ref not available for Word export.");
      }
    },
    goBack() {
      const from = this.$route.query.from;
      if (from) {
        this.$router.push(from);
      } else {
        this.$router.back();
      }
    },
    formatNoKp(noKp) {
      if (!noKp) return '';

      // Ensure it's only digits
      const digits = noKp.replace(/\D/g, '');

      // Slice and format
      const part1 = digits.slice(0, 6);
      const part2 = digits.slice(6, 8);
      const part3 = digits.slice(8, 12);

      return `${part1}-${part2}-${part3}`;
    },

    formatNoTel(noTel) {
      if (!noTel) return '';

      // Ensure it's only digits
      const digits = noTel.replace(/\D/g, '');

      // Slice and format
      const part1 = digits.slice(0, 3);
      const part2 = digits.slice(3, 12);
      return `${part1}-${part2}`;
    }
  }


};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  background-color: white;
}

.page {
  position: relative;
  min-height: 297mm;
  /* A4 page height for better alignment */
  padding-bottom: 20mm;
  /* Leave space for footer */
}

.rahsia-footer {
  position: absolute;
  bottom: 10mm;
  right: 10mm;
  font-weight: bold;
  text-align: right;
}

.btn {
  width: 200px;
}

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