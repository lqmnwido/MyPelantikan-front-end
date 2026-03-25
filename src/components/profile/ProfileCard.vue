<template>
  <div class="card p-3 shadow-sm" style="height: 300px;">
    <div class="text-center">
      <img :src="profileImage" alt="Profile" class="rounded-circle mb-2 mt-5" width="100" height="100" />
      <h5 style="font-size: small;" class="text-uppercase">{{ nama }}</h5>
      <p class="text-muted mb-3 text-uppercase">{{ peranan }}</p>
    </div>
  </div>
</template>


<script>
export default {
  name: "ProfileCard",
  props: {
    id: [String, Number],
    nama: String,
    peranan: String,
    profileImage: String,
  },
  computed: {
    showDetails() {
      // Checks if the current URL contains "?view"
      return window.location.href.includes('?view');
    }
  },


};
</script>


<style scoped>
img {
  object-fit: cover;
}
</style>
