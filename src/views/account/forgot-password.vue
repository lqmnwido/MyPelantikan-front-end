<template>
  <Layout>
    <BRow class="justify-content-center">
      <BCol md="8" lg="6" xl="5">
        <BCard no-body class="overflow-hidden">
          <div class="bg-color">
            <BRow>
              <BCol cols="7">
                <div class="p-4" style="color: white;">
                  <h5>Lupa kata laluan</h5>
                  <p>Set Kata Laluan dengan MyPelantikan.</p>
                </div>
              </BCol>
              <BCol cols="5" class="align-self-end">
                <img src="@/assets/images/profile-img.png" alt class="img-fluid" />
              </BCol>
            </BRow>
          </div>
          <BCardBody class="pt-0">
            <div>
              <router-link to="/">
                <div class="avatar-md profile-user-wid mb-4">
                  <span class="avatar-title rounded-circle bg-color radius">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg" alt
                      height="34" />
                  </span>
                </div>
              </router-link>
            </div>

            <div class="p-2">
              <BAlert v-model="isResetSuccess" class="mb-4" variant="success" dismissible>{{ success }}</BAlert>
              <BAlert v-model="isResetError" class="mb-4" variant="danger" dismissible>{{ error }}</BAlert>
              <BForm @submit.prevent="tryToReset">
                <div class="mb-3">
                  <label for="emel">Emel</label>
                  <input type="email" v-model="user.emel" class="form-control" id="emel" placeholder="Masukkan emel"
                    :class="{ 'is-invalid': (v$.user.emel.$error && v$.user.emel.$dirty) || (submitted && v$.user.emel.$error) }"
                    @blur="v$.user.emel.$touch()" />
                  <div v-if="(v$.user.emel.$error && v$.user.emel.$dirty) || (submitted && v$.user.emel.$error)"
                    class="invalid-feedback">
                    <div v-for="error in v$.user.emel.$errors" :key="error.$uid">
                      {{ error.$message }}
                    </div>
                  </div>
                </div>
                <BRow class="mb-3 mb-0">
                  <BCol cols="12" class="text-end">
                    <BButton variant="primary" class="w-md" type="submit">
                      Set Semula
                    </BButton>
                  </BCol>
                </BRow>
              </BForm>
            </div>
          </BCardBody>
        </BCard>
        <div class="mt-5 text-center shadow">
          <p>
            Tidak Lupa Kata Laluan?
            <router-link to="/login" class="fw-medium text-primary">Log Masuk Di Sini</router-link>
          </p>
          <p>
            © {{ new Date().getFullYear() }} Hakcipta Kerajaan Selangor <i class="mdi mdi-heart text-danger"></i>
          </p>
        </div>
      </BCol>
    </BRow>
  </Layout>
</template>

<script>
import Layout from "../../layouts/auth";
import { reactive, toRefs } from "vue";
import { required, email, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { forgotPassword } from "@/services/auth.service";

export default {
  setup() {
    const state = reactive({
      user: {
        emel: '',
      },
      submitted: false,
      error: null,
      success: null,
      tryingToReset: false,
      isResetError: false,
      isResetSuccess: false,
    });

    const rules = {
      user: {
        emel: {
          required: helpers.withMessage("Emel diperlukan", required),
          email: helpers.withMessage("Masukkan emel yang sah", email),
        },
      }
    }

    const v$ = useVuelidate(rules, state);

    return { ...toRefs(state), v$ };
  },
  components: {
    Layout,
  },
  methods: {
    async tryToReset() {
      this.submitted = true;
      this.v$.$touch();

      if (this.v$.$invalid) {
        console.log('Validation errors:', this.v$.user.emel.$errors);
        return;
      }

      try {
        this.tryingToReset = true;
        const response = await forgotPassword(this.user.emel);

        this.tryingToReset = false;
        this.isResetSuccess = true;
        this.success = response.message;
      } catch (error) {
        console.log(error);
        this.tryingToReset = false;
        this.isResetError = true;
        this.error = error.response?.data?.message || "Ralat hantar emel";
      }
    }
  },
};
</script>

<style lang="scss" module></style>
<style scoped>
.shadow {
  color: white;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
}

.bg-color {
  background-color: #384c69;
}

.radius {
  border-radius: 12px;
  /* rounded corners */
  box-shadow:
    -5px 0 10px rgba(0, 0, 0, 0.05),
    /* subtle outer shadow */
    inset 2px 2px 5px rgba(255, 255, 255, 0.1),
    /* light inner highlight */
    inset -2px -2px 5px rgba(0, 0, 0, 0.3);
  /* dark inner shadow */
}
</style>