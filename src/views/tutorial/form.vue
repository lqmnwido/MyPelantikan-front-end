<template>
  <Layout>
    <PageHeader :title="isEdit ? 'Kemaskini Tutorial' : 'Tambah Tutorial'" pageTitle="Tutorial" />

    <div class="row">
      <div class="col-12">
        <div class="card p-4">
          <form @submit.prevent="saveTutorial">
            <div class="mb-3">
              <label class="form-label">Nama</label>
              <input v-model="form.name" type="text" class="form-control" placeholder="Masukkan nama tutorial" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Kategori</label>
              <select v-model="form.category" class="form-select" required>
                <option value="">Pilih Kategori</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Design">Reka Bentuk</option>
                <option value="Database">Pangkalan Data</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Keterangan</label>
              <textarea v-model="form.description" class="form-control" rows="3" placeholder="Masukkan keterangan tutorial" required></textarea>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <router-link to="/tutorial" class="btn btn-secondary">Batal</router-link>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <SweetAlert
      :show="showSuccess"
      type="success"
      title="Berjaya!"
      :text="successMessage"
      :autoClose="1500"
      @closed="onSuccessClosed"
    />
  </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import SweetAlert from "@/components/SweetAlert.vue";
import { tutorialService } from "@/services/tutorial.service";

export default {
  components: {
    Layout,
    PageHeader,
    SweetAlert,
  },
  data() {
    return {
      form: {
        name: "",
        category: "",
        description: "",
      },
      isEdit: false,
      submitting: false,
      showSuccess: false,
      successMessage: "",
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    if (id) {
      this.isEdit = true;
      await this.loadTutorial(id);
    }
  },
  methods: {
    async loadTutorial(id) {
      try {
        const res = await tutorialService.getTutorialById(id);
        this.form = { ...res.data };
      } catch (error) {
        console.error("Gagal memuatkan data tutorial:", error);
      }
    },
    async saveTutorial() {
      this.submitting = true;
      try {
        if (this.isEdit) {
          await tutorialService.updateTutorial(this.$route.params.id, this.form);
          this.successMessage = "Tutorial berjaya dikemaskini.";
        } else {
          await tutorialService.createTutorial(this.form);
          this.successMessage = "Tutorial berjaya ditambah.";
        }
        this.showSuccess = true;
      } catch (error) {
        console.error("Gagal menyimpan tutorial:", error);
      } finally {
        this.submitting = false;
      }
    },
    onSuccessClosed() {
      this.showSuccess = false;
      this.$router.push("/tutorial");
    },
  },
};
</script>
