<template>
  <Layout>
    <PageHeader title="Pengurusan Dokumen" pageTitle="Dasar Lantikan" />
    <FileForm v-model:form="form" :topicLabel="topicLabel" :filterLantikan="filterLantikan"
      @update:filterLantikan="filterLantikan = $event" :jenisPelantikanList="jenisPelantikanList"
      :selectedPenerima="selectedPenerima" @update:selectedPenerima="selectedPenerima = $event" :penerima="penerima"
      :selectedJenisPelantikan="selectedJenisPelantikan" @submit="handleSubmit" :loading="loading"/>


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
import { dasarLantikanService } from "@/services/dasarLantikan.service";


// function formDataToJson(formData) {
//   const obj = {};
//   for (let [key, value] of formData.entries()) {
//     obj[key] = value;
//   }
//   return obj;
// }

export default {
  components: {
    Layout,
    PageHeader,
    FileForm,
    SweetAlert,
  },
  data() {
    return {
      form: {
        id: null,
        tajuk: "",
        keterangan: "",
        file: null,
        jenisLantikan: "",
        jenisKategori: "",
        id_lkp_jenis_pelantikan: "",
      },
      loading: false,
      topicLabel: "Muat Naik Dokumen Dasar Lantikan",
      filterLantikan: {},
      selectedPenerima: [],
      selectedJenisPelantikan: [],
      penerima: [],
      alert: {
        error: false,
        success: false,
        errorMessage: "",
      },
      jenisPelantikanList: [],
    };
  },
  async mounted() {
    const id = this.$route.query.id; // get ?id=1
    if (id) {
      this.form.id = id;
      await this.loadMaklumatDasarLantikan(id);
    }
  },
  methods: {
    async loadMaklumatDasarLantikan(id) {
      this.loading = true;
      try {
        const response = await dasarLantikanService.maklumatDasarLantikan(id);
        const data = response.data.data;

        // ✅ Fill form fields
        this.form.tajuk = data.tajuk;
        this.form.keterangan = data.keterangan;
        // this.form.id_lkp_jenis_pelantikan = data.jenis_pelantikan;
        this.form.id_lkp_jenis_pelantikan = {
          label: data.jenis_pelantikan, // whatever name comes from API
          value: data.id_lkp_jenis_pelantikan,   // the ID field from API
        };

        if (data.file) {
          const fileName = data.file.split('/').pop();
          this.form.fileName = fileName; // <-- store for display only
          this.form.file = data.file; // <-- keep actual file null
        }


      } catch (error) {
        this.alert.error = true;
        this.alert.errorMessage =
          error?.response?.data?.message ||
          "Gagal memuatkan maklumat dasar lantikan.";
      } finally {
        this.loading = false;
      }
    },

    async handleSubmit() {
      try {
        const formData = new FormData();
        formData.append(
          "id_lkp_jenis_pelantikan",
          this.form.id_lkp_jenis_pelantikan?.value || ""
        );
        formData.append("tajuk", this.form.tajuk);
        formData.append("keterangan", this.form.keterangan);
        if (this.form.file instanceof File) {
          formData.append("file", this.form.file);
        }

        if (this.form.id) {
          // 🟢 UPDATE MODE
          await dasarLantikanService.kemaskiniDasarLantikan(
            this.form.id,
            formData
          );
        } else {
          // 🟢 CREATE MODE
          await dasarLantikanService.simpanDokumen(formData);
        }

        this.alert.success = true;
        this.$router.push("/dasar-lantikan/senarai-lantikan");
      } catch (error) {
        this.alert.error = true;
        this.alert.errorMessage =
          error?.response?.data?.message || error.message || "Ralat tidak diketahui";
      }
    },
  },
};

</script>
