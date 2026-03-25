<template>
  <BCard class="mini-stats-wid" no-body>
    <BCardBody class="custom-card-body">
      <div class="d-flex">
        <div class="flex-grow-1">
          <p class="text-muted fw-medium mb-2">{{ title }}</p>
          <h6 class="mb-0 ">{{ value }}</h6>
        </div>

        <div class="align-self-center">
          <KnobChart :current="current" :total="total" fgColor="#fc8803" />
        </div>
      </div>
    </BCardBody>
    <BCardFooter class="bg-transparent border-top py-2">
      <div class="text-muted small">
        <!-- Footer content goes here -->
        <template v-if="footerLink">
          <router-link :to="footerLink" class="text-decoration-none text-primary">
            <slot name="footer">Papar Maklumat</slot>
          </router-link>
        </template>
        <template v-else>
          <slot name="footer">Papar Maklumat</slot>
        </template>
      </div>
    </BCardFooter>
  </BCard>
</template>

<script>
import KnobChart from "@/components/widgets/KnobChart.vue";
/**
 * Stat component -- specify the widget icon, title and value.
 */
export default {
  components: {
    KnobChart
  },
  props: {
    title: String,
    value: String,
    number: String, // Can keep this for backward compatibility
    current: String, // New prop
    total: Number,   // New prop
    footerLink: {
      type: [String, Object],
      default: null
    }
  }


};
</script>


<style>
.custom-card-body {
  /* width: auto; */
  /* Optional: Add padding, overflow, etc. */
  padding: 1rem;

  h6 {
    /* font-size: 0.725rem; */
    /* font-weight: bold; */
    max-width: 220px;
    /* Adjust based on your needs */
    /* word-wrap: break-word; */
  }
}

.card-stat-value {
    /* Apply truncation to the main value/title */
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    max-width: 100%; 
    display: block;
    
    /* Inherited styles, but kept for reference: */
    /* font-size: 0.725rem; */
    /* font-weight: bold; */
    /* max-width: 220px; */
}
</style>