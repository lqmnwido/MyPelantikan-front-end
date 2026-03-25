<template>
  <footer class="footer">
    <BContainer :fluid="layoutWidth === 'fluid' || layoutWidth === 'scrollable'">
      <BRow>
        <BCol sm="6">{{ new Date().getFullYear() }} - {{ new Date().getFullYear() + 1 }} © MyPelantikan.</BCol>
        <BCol sm="6">
          <div class="text-sm-end d-none d-sm-block">Designed & Developed by 2EN APPS SDN BHD</div>
        </BCol>
      </BRow>
    </BContainer>
  </footer>
</template>

<script>
export default {
  props: {
    layoutWidth: {
      type: String,
      default: 'fluid'
    }
  }
}
</script> 
