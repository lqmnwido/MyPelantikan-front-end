<template>
  <Layout>
    <PageHeader title="Tetapan Saiz Fail" pageTitle="Konfigurasi Sistem" />

    <FileSizeConfig v-model="fileSize" @save="handleSave" />

    <!-- Alerts -->
    <SweetAlert
      :show="alert.success"
      type="success"
      title="Berjaya!"
      text="Saiz fail telah dikemaskini."
      @closed="alert.success = false"
    />
    <SweetAlert
      :show="alert.error"
      type="error"
      title="Ralat!"
      :text="alert.errorMessage"
      @closed="alert.error = false"
    />
  </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import FileSizeConfig from "@/components/config/FileSizeConfig.vue";
import SweetAlert from "@/components/SweetAlert";
import { systemConfigService } from "@/services/systemConfig.service";

export default {
  name: "ConfigFileSize",
  components: {
    Layout,
    PageHeader,
    FileSizeConfig,
    SweetAlert,
  },
  data() {
    return {
      fileSize: 5, // default fallback
      alert: {
        success: false,
        error: false,
        errorMessage: "",
      },
    };
  },
  async mounted() {
    await this.getFileSize();
  },
  methods: {
    async getFileSize() {
      try {
        const response = await systemConfigService.getFileSize();
        // console.log(response);
        this.fileSize = response.size; // adjust based on API response
      } catch (error) {
        console.error("Gagal mendapatkan saiz fail:", error);
        this.alert.error = true;
        this.alert.errorMessage =
          error?.response?.data?.message || "Gagal memuatkan tetapan saiz fail.";
      }
    },

    async handleSave(value) {
      try {
        await systemConfigService.saveFileSize({ size: value });
        this.alert.success = true;
      } catch (error) {
        this.alert.error = true;
        this.alert.errorMessage =
          error?.response?.data?.message || error.message || "Ralat tidak diketahui";
      }
    },
  },
};
</script>
