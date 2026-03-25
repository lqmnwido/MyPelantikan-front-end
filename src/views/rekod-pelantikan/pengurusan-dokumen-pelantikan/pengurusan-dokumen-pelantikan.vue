<template>
  <Layout>
    <PageHeader title="Pengurusan Dokumen Pelantikan" pageTitle="Rekod Pelantikan" />
    <FileForm v-model:form="form" :topicLabel="topicLabel" :filterLantikan="filterLantikan"
      @update:filterLantikan="filterLantikan = $event" :jenisPelantikanList="jenisPelantikanList"
      :selectedPenerima="selectedPenerima" @update:selectedPenerima="selectedPenerima = $event" :penerima="penerima"
      @submit="handleSubmit"
      @search-change="handlePenerimaSearch" />


    <SweetAlert :show="alert.success" type="success" title="Berjaya!" text="Dokumen telah disimpan."
      @closed="alert.success = false" />

    <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
      @closed="alert.error = false" />
  </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import FileForm from "@/components/dragFile/FileForm.vue";
import SweetAlert from "@/components/SweetAlert";
import { pengurusanDokumenService } from "@/services/pengurusanDokumen.service";
import { profilService } from "@/services/profil.service";
import { lookupService } from "@/services/lookup.service";

function formDataToJson(formData) {
  const obj = {};
  for (let [key, value] of formData.entries()) {
    obj[key] = value;
  }
  return obj;
}

export default {
  components: {
    Layout,
    PageHeader,
    FileForm,
    SweetAlert
  },
  data() {
    return {
      form: {
        tajuk: "",
        keterangan: "",
        file: null,
        jenisLantikan: "",
        jenisKategori: ""
      },
      topicLabel: "Muat Naik Dokumen Pelantikan",
      filterLantikan: {},
      selectedPenerima: [],
      penerima: [],
      alert: {
        error: false,
        success: false, // Also missing earlier
        errorMessage: "" // To avoid undefined errors
      },
      jenisPelantikanList: [],
      penerimaSearch: '',
      debouncedLoadPenerima: null,
    };
  },
  created() {
    this.debouncedLoadPenerima = this.debounce(this.loadPenerima, 300);
  },
  async mounted() {
    await this.loadFilterOptions();
    await this.loadPenerima();
  },
  watch: {
    filterLantikan: {
      deep: true,
      handler() {
        this.loadPenerima();
      }
    }
  },
  methods: {
    debounce(func, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },
    handlePenerimaSearch(query) {
        this.penerimaSearch = query;
        this.debouncedLoadPenerima();
    },
    async loadFilterOptions() {
        try {
            const response = await lookupService.getJenisPelantikan();
            this.jenisPelantikanList = response.map(item => item.nama);
            this.filterLantikan = this.jenisPelantikanList.reduce((acc, jenis) => {
                acc[jenis] = false;
                return acc;
            }, {});
        } catch (error) {
            this.alert.error = true;
            this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui';
        }
    },
    async loadPenerima() {
      try {
        const activeFilters = Object.keys(this.filterLantikan).filter(key => this.filterLantikan[key]);

        if (activeFilters.length > 0) {
          // Filter is active, load assigned profiles
          const response = await pengurusanDokumenService.senaraiPenerima({ search: this.penerimaSearch });
          const pelantikanList = response.data;
          
          const grouped = {};
          pelantikanList.forEach(item => {
            if (activeFilters.includes(item.jenis_pelantikan)) {
                const groupName = item.jenis_pelantikan;
                if (!grouped[groupName]) {
                    grouped[groupName] = [];
                }
                grouped[groupName].push({
                    value: item.profil_id,
                    label: item.nama || 'Tiada Nama'
                });
            }
          });

          this.penerima = Object.keys(grouped).map(group => ({
            group,
            options: grouped[group]
          }));

        } else {
          // No filter, load all profiles
          const response = await profilService.getProfils({ perPage: 1000, search: this.penerimaSearch });
          const profiles = response.data;
          this.penerima = [{
              group: 'Semua Profil',
              options: profiles.map(p => ({ value: p.id, label: p.nama }))
          }];
        }
      } catch (error) {
        this.alert.error = true;
        this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui';
      }
    },
    async handleSubmit() {
      try {
        const formData = new FormData();
        formData.append("tajuk", this.form.tajuk);
        formData.append("keterangan", this.form.keterangan);
        formData.append("file", this.form.file);

        const penerimaIds = this.selectedPenerima.map(p => p.value || p.id); // Adjust based on actual structure
        formData.append("id_profil", JSON.stringify(penerimaIds));

        console.log("✅ FormData ready to send:", formDataToJson(formData));

        // If you have other fields, add them here too
        // formData.append("jenis_kategori", this.form.jenisKategori);

        await pengurusanDokumenService.simpanDokumen(formData);

        this.alert.success = true;
        this.resetForm();
      } catch (error) {
        this.alert.error = true;
        this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui';
      }
    },
    resetForm() {
      Object.assign(this.form, {
        tajuk: "",
        keterangan: "",
        file: null,
        jenisLantikan: "",
        jenisKategori: ""
      });

      this.selectedPenerima = [];

      this.filterLantikan = Object.fromEntries(
        this.jenisPelantikanList.map(jenis => [jenis, false])
      );
    }

  }
};
</script>