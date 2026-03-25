<template>
  <div v-if="showCard" class="card p-3 shadow-sm">
    <h5 class="mb-3">Maklumat Pelantikan</h5>
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Tarikh Lantikan</label>
        <input type="date" class="form-control" v-model="tarikhLantikan" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Tarikh Tamat</label>
        <input type="date" class="form-control" v-model="tarikhTamat" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Parti</label>
        <select class="form-select" v-model="parti">
          <option>PKR</option>
          <option>UMNO</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">Profil Aktif</label>
        <select class="form-select" v-model="profilAktif">
          <option>Aktif</option>
          <option>Tidak Aktif</option>
        </select>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "MaklumatPelantikanCard",
  data() {
    return {
      tarikhLantikan: '',
      tarikhTamat: '',
      parti: 'PKR',
      profilAktif: 'Aktif'
    };
  },
  computed: {
    showCard() {
      // Only show if URL contains '?Kemaskini'
      return window.location.href.includes('?kemaskini');
    }
  }
};
</script>
