<script>
import Layout from "../../layouts/auth"
import { useAuthStore } from '@/state/pinia'

export default {
  components: {
    Layout,
  },
  beforeMount() {
    console.log('test')
    const auth = useAuthStore()
    auth.logOut()
    this.$router.push({ name: 'login' })
  },
}
</script>

<template>
  <Layout />
</template>
