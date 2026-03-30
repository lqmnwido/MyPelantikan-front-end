<template>
  <Layout>
    <PageHeader title="Pengurusan Template" pageTitle="Template Baru" />

    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card shadow-sm p-4">
            <SenaraiBuilder :jenisPelantikan="jenisPelantikan" :headers="headers"
              :jenisPelantikanOptions="jenisPelantikanOptions" :variableOptions="variableOptions"
              @update:jenisPelantikan="jenisPelantikan = $event" @update:headers="headers = $event" @add-header="addHeader" @remove-header="removeHeader"
              @save-template="submitTemplate" :loading="loading"/>
          </div>
        </div>
      </div>
    </div>

    <SweetAlert :show="showSuccess" type="success" title="Berjaya!" text="Template disimpan." :autoClose="1500"
      @closed="showSuccess = false" />
  </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import SenaraiBuilder from "@/components/SenaraiTemplate/SenaraiBuilder.vue";
import SweetAlert from "@/components/SweetAlert.vue";
import { templateSenaraiService } from "@/services/templateSenarai.service.js";
import { lookupService } from "@/services/lookup.service.js";

export default {
  name: "TemplateBaru",
  components: { Layout, PageHeader, SenaraiBuilder, SweetAlert },
  data() {
    return {
      isEdit: false,
      templateId: null,
      jenisPelantikan: null,
      headers: [],
      showSuccess: false,
      loading: false,
      // options (without "custom")
      jenisPelantikanOptions: [],
      variableOptions: [
        { value: "gambar", label: "gambar" },
        { value: "nama", label: "nama" },
        { value: "tarikh_lahir", label: "tarikh_lahir" },
        { value: "umur", label: "umur" },
        { value: "jawatan", label: "jawatan" },
        { value: "tarikh_lantik", label: "tarikh_lantik" },
        { value: "tarikh_tamat", label: "tarikh_tamat" },
        { value: "tarikh_lanjutan", label: "tarikh_lanjutan" },
        { value: "penggal", label: "penggal" },
        { value: "wakil", label: "wakil" },
        { value: "catatan", label: "catatan" },
      ],
    };
  },
  mounted() {
    this.loadJenisPelantikan();
    if (this.$route.query.mod === 'kemaskini' && this.$route.query.id) {
      this.isEdit = true;
      this.templateId = this.$route.query.id;
      this.loadData(this.templateId);
    }
  },
  methods: {
    async loadData(id) {
      this.loading = true;
      try {
        const template = await templateSenaraiService.getTemplateByID(id);
        this.jenisPelantikan = { id: template.jenis_pelantikan, label: template.name };
        this.headers = template.headers.map((h, idx) => ({
          ...h,
          id: h.id || `header-${Date.now()}-${idx}`,
          customVariable: h.custom_variable
        }));
      } catch (error) {
        console.log("Error loading template data:", error);
        alert("Gagal memuat data template.");
      }finally{
        this.loading = false;
      }
    },

    // async loadJenisPelantikan() {
    //   const response = await lookupService.getJenisPelantikan();
    //   if (Array.isArray(response)) {
    //     this.jenisPelantikanOptions = response.map((item) => ({
    //       label: item.nama,
    //       value: { id: item.id, label: item.nama },
    //     }));
    //   }
    // },
    async loadJenisPelantikan() {
      try {
        this.loading = true;
        // 1. Get all jenis pelantikan
        const response = await lookupService.getJenisPelantikan();

        // 2. Get all templates
        const templates = await templateSenaraiService.getTemplates();
        const usedJenisIds = templates.map(t => Number(t.jenis_pelantikan));

        if (Array.isArray(response)) {
          this.jenisPelantikanOptions = response
            .filter(item => {

              if (Number(item.id) === 1) return false;

              // ✅ If in edit mode, keep the currently selected jenisPelantikan visible
              if (this.isEdit && this.jenisPelantikan?.id === item.id) {
                return true;
              }
              // Otherwise, filter out used IDs
              return !usedJenisIds.includes(Number(item.id));
            })
            .map(item => ({
              label: item.nama,
              value: { id: item.id, label: item.nama },
            }));
        }
      } catch (e) {
        console.error("Error loading jenis pelantikan:", e);
      }finally{
        this.loading = false;
      }
    },
    async kemaskini() {
      try {
        if (!this.jenisPelantikan) {
          alert("Sila lengkapkan nama template & jenis pelantikan");
          return;
        }

        const payload = {
          name: this.jenisPelantikan.label,
          jenis_pelantikan: this.jenisPelantikan.id,
          columns: this.headers,
        };

        await templateSenaraiService.kemaskiniTemplate(this.templateId, payload);
        // console.log('Template updated:', res);

        this.showSuccess = true;
        this.$router.push('/pentadbir/template-senarai');
      } catch (e) {
        console.error("Error updating template:", e);
        alert("Gagal mengemaskini template.");
      }
    },
    addHeader(header) {
      this.headers.push(header);
    },
    removeHeader(i) {
      this.headers.splice(i, 1);
    },
    async submitTemplate() {
      if (this.isEdit) {
        this.kemaskini();
      } else {
        try {
          if (!this.jenisPelantikan) {
            alert("Sila lengkapkan nama template & jenis pelantikan");
            return;
          }

          const payload = {
            name: this.jenisPelantikan.label,
            jenis_pelantikan: this.jenisPelantikan.id,
            columns: this.headers,
          };

          await templateSenaraiService.saveTemplate(payload);
          // console.log('Payload:', payload ?? "Gagal");

          this.showSuccess = true;
          // this.templateName = "";
          this.jenisPelantikan = "";
          this.headers = [];
          this.$router.push('/pentadbir/template-senarai');
        } catch (e) {
          console.error("Error saving template:", e);
          alert("Gagal menyimpan template.");
        }

      }
    },
  },
};
</script>
