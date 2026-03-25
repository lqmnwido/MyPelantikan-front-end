<template>
  <Layout>
    <PageHeader title="Aduan" pageTitle="Pentadbir" />
    <FileForm v-model:form="form" :topicLabel="topicLabel" @submit="handleSubmit" />

    <SweetAlert :show="alert.success" type="success" title="Berjaya!" text="Aduan telah dihantar."
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
import { aduanService } from "@/services/aduan.service";
import { useAuthStore } from "@/state/pinia";

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
    SweetAlert
  },
  data() {
    return {
      form: {
        keterangan: "",
        file: null,
        nama: "",
        peranan: "",
      },
      topicLabel: "Lapor Aduan",
      alert: {
        error: false,
        success: false, // Also missing earlier
        errorMessage: "" // To avoid undefined errors
      },
    };
  },
  watch: {
    form: {
      deep: true,
      handler(newForm) {
        // Re-inject nama and peranan if missing
        const auth = useAuthStore();
        const user = auth.currentUser;
        if (!newForm.nama) newForm.nama = user.nama;
        if (!newForm.peranan) newForm.peranan = user.peranan.replace(/\b\w/g, char => char.toUpperCase());
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const formData = new FormData();
        formData.append("nama", this.form.nama);
        formData.append("peranan", this.form.peranan);
        formData.append("keterangan", this.form.keterangan);
        formData.append("gambar", this.form.file);

        // console.log(formDataToJson(formData));
        await aduanService.tambahAduan(formData);

        this.alert.success = true;
        this.resetForm();
      } catch (error) {
        this.alert.error = true;
        this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui';
      }
    },
    resetForm() {
      Object.assign(this.form, {
        keterangan: "",
        file: null,
      });
    }

  },
};
</script>
