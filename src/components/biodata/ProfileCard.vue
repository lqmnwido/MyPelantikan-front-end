<template>
  <div class="card p-3 shadow-sm">
    <div class="text-center">
      <img :src="profileImage" alt="Profile" class="rounded-circle mb-2" width="100" height="100" />
      <h5 style="font-size: small;" class="text-uppercase">{{ nama }}</h5>
      <p class="text-muted mb-3 text-uppercase">{{ jawatan }}</p>

      <!-- Party Logo and Name -->
      <div v-if="parti" class="mb-3">
        <!-- <img :src="partiLogo" alt="Party Logo" class="me-2" width="24" height="16" /> -->
        <span>{{ parti }}</span>
      </div>

      <!-- 2-Column layout for info, visible only if current path includes '?view' -->
      <div v-if="showDetails" class="row text-start small mb-3">
        <div class="col-6 mb-2">
          <strong>Tarikh Lantikan: </strong>{{ tarikhLantikan }}
        </div>
        <div class="col-6 mb-2">
          <strong>Tamat Lantikan: </strong>{{ tamatLantikan }}
        </div>
        <div class="col-6 mb-2">
          <strong>Status:</strong>
          <i class="bi bi-circle-fill text-primary me-1" style="font-size: 0.6rem;"></i>{{ status }}
        </div>
        <div class="col-6 mb-2">
          <strong>Bil Hari:</strong> {{ bilHari }}
        </div>
      </div>


      <!-- Resume Section -->
      <div v-if="showDetails" class="text-start mb-2 fw-bold">Resume</div>
      <div v-if="showDetails" class="d-grid gap-2">
        <!-- <button class="btn btn-primary">Muat Turun (Word)</button> -->
        <button class="btn btn-primary" @click="emitGoToPDF">Muat Turun (PDF)</button>
        <!-- <button class="btn btn-outline-secondary">Cetak</button> -->
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "ProfileCard",
  props: {
    id: [String, Number],
    nama: String,
    jawatan: String,
    parti: String,
    profileImage: String,
    partiLogo: String,
    tarikhLantikan: String,
    tamatLantikan: String,
    status: String,
    bilHari: String
  },
  computed: {
    showDetails() {
      // Checks if the current URL contains "?view"
      return window.location.href.includes('?view');
    }
  },

  methods: {
    emitGoToPDF() {
      this.$emit('resume', this.id);
    },
  },


};
</script>


<style scoped>
img {
  object-fit: cover;
}
</style>
