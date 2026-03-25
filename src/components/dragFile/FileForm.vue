<template>
  <div class="container-fluid">
    <div class="card p-4 shadow-sm">
      <h5 class="mb-4">{{ topicLabel }}</h5>
      <Loader :loading="loading" class="loading-overlay" />

      <div v-if="$route.name === 'tambah-dokumen-lantikan'" class="mb-3">
        <label class="form-label fw-bold">Jenis Pelantikan</label>
        <Multiselect
          v-model="localForm.id_lkp_jenis_pelantikan"
          class="select-search"
          placeholder="Sila pilih jenis lantikan..."
          track-by="value"
          label="label"
          :options="jenisLantikan"
        />
      </div>

      <div class="mb-3" v-if="$route.path === '/rekod-pelantikan/pengurusan-dokumen-pelantikan'">
        <label class="form-label fw-bold">Saring Mengikut Lantikan:</label>
        <FilterLantikan
          :modelValue="filterLantikan"
          @update:modelValue="$emit('update:filterLantikan', $event)"
          :jenisPelantikanList="jenisPelantikanList"
          class="mb-3"
        />

        <label class="form-label fw-bold">Nama Penerima</label>
        <MultiselectPenerima
          :modelValue="selectedPenerima"
          @update:modelValue="$emit('update:selectedPenerima', $event)"
          @search-change="$emit('search-change', $event)"
          :penerima="filteredPenerima"
        />
      </div>

      <div class="mb-3" v-if="$route.path !== '/pentadbir/aduan/tambah-aduan'">
        <label class="form-label fw-bold">Tajuk</label>
        <input v-model="localForm.tajuk" type="text" class="form-control" placeholder="Tajuk..." />
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">Keterangan</label>
        <KeteranganForm v-model:keterangan="localForm.keterangan" :key="localForm.id || 'new'" />
      </div>

      <FileDrop v-model="localForm.file" :fileName="localForm.fileName" />

      <div class="mt-4 text-end">
        <button
          v-if="$route.name === 'tambah-dokumen-lantikan'"
          class="btn btn-secondary me-2"
          @click="goBack()"
        >Kembali</button>
        <button class="btn btn-primary" @click="handleSubmit">Hantar</button>
      </div>
    </div>
  </div>
</template>

<script>
import FilterLantikan from "@/components/dragFile/FilterLantikan.vue";
import MultiselectPenerima from "@/components/dragFile/MultiSelectPenerima.vue";
import FileDrop from "@/components/dragFile/FileDrop.vue";
import KeteranganForm from "@/components/dragFile/KeteranganForm.vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import { lookupService } from "@/services/lookup.service.js";
import Loader from "@/components/widgets/loader";

export default {
  name: "FileForm",
  components: {
    FilterLantikan,
    MultiselectPenerima,
    FileDrop,
    KeteranganForm,
    Multiselect,
    Loader
  },
  props: {
    form: Object,
    topicLabel: String,
    penerima: Array,
    selectedPenerima: Array,
    filterLantikan: Object,
    jenisPelantikanList: Array,
    loading: { type: Boolean, default: false },

  },
  emits: ["update:selectedPenerima", "update:filterLantikan", "submit", "update:form", "search-change"],
  data() {
    return {
      localForm: { ...this.form }, // copy on mount
      jenisLantikan: [],
    };
  },
  watch: {
    // Sync parent prop into localForm whenever parent changes (important for async load)
    form: {
      deep: true,
      immediate: true,
      handler(newVal) {
        this.localForm = { ...newVal };
      },
    },
    // Emit changes for individual fields
    "localForm.tajuk"() {
      this.$emit("update:form", { ...this.localForm });
    },
    "localForm.keterangan"() {
      this.$emit("update:form", { ...this.localForm });
    },
    "localForm.id_lkp_jenis_pelantikan"() {
      this.$emit("update:form", { ...this.localForm });
    },
    "localForm.file"() {
      this.$emit("update:form", { ...this.localForm });
    },
  },
  async mounted() {
    if (this.$route.name === "tambah-dokumen-lantikan") {
      await this.loadJenisPelantikan();
    }
  },
  computed: {
    filteredPenerima() {
      if (!this.filterLantikan || typeof this.filterLantikan !== "object") return this.penerima;

      const activeGroups = Object.keys(this.filterLantikan).filter((key) => this.filterLantikan[key]);
      if (activeGroups.length === 0) return this.penerima;

      return this.penerima.filter((group) => activeGroups.includes(group.group));
    },
  },
  methods: {
    goBack() {
      const from = this.$route.query.from;
      if (from) this.$router.push(from);
      else this.$router.back();
    },
    handleSubmit() {
      this.$emit("submit");
    },
    async loadJenisPelantikan() {
      try {
        const response = await lookupService.getJenisPelantikan();
        this.jenisLantikan = response.map((p) => ({
          label: p.nama,
          value: p.id,
        }));
      } catch (err) {
        console.error("Failed to load jenis pelantikan:", err);
      }
    },
  },
};
</script>

<style scoped>
.form-control {
  line-height: 2.0;
}

.select-search {
  width: 100% !important;
  font-size: small;
  padding: 0 !important;
}

.multiselect__input {
  margin: 0;
  padding: 0;
  height: auto;
  font-size: 1rem;
}

.multiselect__single {
  padding: 0;
  margin: 0;
  line-height: 2;
  font-size: small;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  width: 100%;
  background: rgba(255, 255, 255, 0.6); 
}
</style>
