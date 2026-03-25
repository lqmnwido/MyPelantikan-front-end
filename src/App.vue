<template>
  <router-view></router-view>
</template>

<script>
import { useIdleTimeout } from "@/composables/useIdleTimeout";

export default {
  name: "App",
  setup() {
    useIdleTimeout();
  },
};
</script>
