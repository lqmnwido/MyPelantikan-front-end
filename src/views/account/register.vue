<template>
  <Layout>
    <BRow class="justify-content-center">
      <BCol md="8" lg="6" xl="5">
        <BCard no-body class="overflow-hidden">
          <div class="bg-color">
            <BRow>
              <BCol cols="7">
                <div class="p-4" style="color: white">
                  <h5 >Daftar Pengguna</h5>
                  <p>Akaun Aplikasi MyPelantikan</p>
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
                      class="rounded-circle" height="34" />
                  </span>
                </div>
              </router-link>
            </div>

            <BAlert v-model="registerSuccess" class="mt-3" variant="success" dismissible>Pendaftaran berjaya.
            </BAlert>

            <BAlert v-model="isRegisterError" class="mt-3" variant="danger" dismissible>{{ regError }}</BAlert>

            <div v-if="notification.message" :class="'alert ' + notification.type">
              {{ notification.message }}
            </div>

            <BForm class="p-2" @submit.prevent="tryToRegisterIn">
              <BFormGroup class="mb-3" id="email-group" label="Emel" label-for="emel">
                <BFormInput id="emel" v-model="user.emel" type="email" placeholder="Masukkan Emel" :class="{
                  'is-invalid': submitted && v$.user.emel.$error,
                }"></BFormInput>
                <div v-if="submitted && v$?.user?.emel?.$error" class="invalid-feedback">
                  <span v-if="v$.user.emel.required.$message">{{
                    v$.user.emel.required.$message
                  }}</span>
                </div>
              </BFormGroup>

              <BFormGroup class="mb-3" id="fullname-group" label="Nama" label-for="nama">
                <BFormInput id="nama" v-model="user.nama" type="text" placeholder="Masukkan Nama" :class="{
                  'is-invalid': submitted && v$.user.nama.$error,
                }"></BFormInput>
                <div v-if="submitted && v$?.user?.nama?.$error" class="invalid-feedback">
                  <span v-if="v$.user.nama.required.$message">{{
                    v$.user.nama.required.$message
                  }}</span>
                </div>
              </BFormGroup>

              <BFormGroup class="mb-3" id="fullname-group" label="No. Kad Pengenalan" label-for="noIC">
                <BFormInput id="noIC" v-model="user.ic" type="text" placeholder="Masukkan No. Kad Pengenalan" :class="{
                  'is-invalid': submitted && v$.user.ic.$error,
                }"></BFormInput>
                <div v-if="submitted && v$?.user?.ic?.$error" class="invalid-feedback">
                  <div v-for="(item, index) in v$.user.ic.$errors" :key="index">
                    <span v-if="item.$message">{{ item.$message }}</span>
                  </div>
                </div>
              </BFormGroup>

              <BFormGroup class="mb-3" id="fullname-group" label="Peranan" label-for="peranan">
                <BFormSelect id="peranan" v-model="user.peranan" :options="perananOptions"
                  placeholder="Sila Pilih Peranan" :class="{ 'is-invalid': submitted && v$.user.peranan.$error }">
                </BFormSelect>

                <div v-if="submitted && v$?.user?.peranan?.$error" class="invalid-feedback">
                  <div v-for="(item, index) in v$.user.peranan.$errors" :key="index">
                    <span v-if="item.$message">{{ item.$message }}</span>
                  </div>
                </div>
              </BFormGroup>


              <BFormGroup class="mb-3" id="password-group" label="Kata Laluan" label-for="password">
                <BFormInput id="password" v-model="user.password" type="password" placeholder="Masukkan Kata Laluan"
                  :class="{
                    'is-invalid': submitted && v$.user.password.$error,
                  }"></BFormInput>
                <div v-if="submitted && v$.user.password.$error" class="invalid-feedback">
                  <span v-if="v$.user.password.required.$message">{{
                    v$.user.password.required.$message
                  }}</span>
                </div>
              </BFormGroup>

              <BFormGroup class="mb-3" label="Ulang Kata Laluan" label-for="repeatPassword">
                <BFormInput id="repeatPassword" type="password" v-model="user.repeatPassword"
                  placeholder="Masukkan Kata Laluan Semula"
                  :class="{ 'is-invalid': submitted && v$.user.repeatPassword.$error }" />
                <div v-if="submitted && v$.user.repeatPassword.$error" class="invalid-feedback">
                  <div v-if="v$.user.repeatPassword.required.$invalid">
                    {{ v$.user.repeatPassword.required.$message }}
                  </div>
                  <div v-else-if="v$.user.repeatPassword.matchesPassword.$invalid">
                    {{ v$.user.repeatPassword.matchesPassword.$message }}
                  </div>
                </div>
              </BFormGroup>

              <!-- <p>{{ user.password }} / {{ user.repeatPassword }}</p> -->


              <div class="mt-4 d-grid">
                <BButton type="submit" variant="primary" class="btn-block">Daftar Pengguna</BButton>
              </div>

              <div class="mt-4 text-center">
                <p class="mb-0">
                  Dengan mendaftar, anda bersetuju dengan
                  <BLink href="javascript: void(0);" class="text-primary">Terma Penggunaan</BLink>
                  MyPelantikan.
                </p>
              </div>
            </BForm>
          </BCardBody>
          <div class="text-center">

          </div>
        </BCard>

        <div class="mt-5 text-center shadow">
          <p>
            Sudah mempunyai akaun ?
            <router-link to="/login" class="fw-medium text-primary">Log Masuk</router-link>
          </p>
          <!-- <p>
            © {{ new Date().getFullYear() }} Hakcipta Kerajaan Selangor <i class="mdi mdi-heart text-danger"></i>
          </p> -->
        </div>
      </BCol>
    </BRow>
  </Layout>
</template>

<script>
import { reactive, toRefs } from "vue";
import { required, email, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import axios from "axios";
import Layout from "../../layouts/auth";
import { useNotificationStore } from "@/state/pinia";

const API_URL = process.env.VUE_APP_APIKEY;

export default {
  components: {
    Layout,
  },
  setup() {
    const notificationStore = useNotificationStore();

    const state = reactive({
      user: {
        emel: '',
        nama: '',
        ic: '',
        peranan: '',
        password: '',
        repeatPassword: '',
      },
      perananOptions: [
        { value: '', text: 'Sila Pilih Peranan' },
        { value: 'admin', text: 'Admin' },
        { value: 'pengguna', text: 'Pengguna' },
        { value: 'pentadbir sistem', text: 'Pentadbir Sistem' },
      ],
      submitted: false,
      regError: null,
      tryingToRegister: false,
      isRegisterError: false,
      registerSuccess: false,
    });

    const rules = {
      user: {
        emel: {
          required: helpers.withMessage("Emel diperlukan", required),
          email: helpers.withMessage("Emel tidak sah", email),
        },
        nama: {
          required: helpers.withMessage("Nama diperlukan", required),
        },
        ic: {
          required: helpers.withMessage("Nombor IC diperlukan", required),
        },
        peranan: {
          required: helpers.withMessage("Peranan diperlukan", required),
        },
        password: {
          required: helpers.withMessage("Kata laluan diperlukan", required),
        },
        repeatPassword: {
          required: helpers.withMessage("Ulang kata laluan diperlukan", required),
          matchesPassword: helpers.withMessage(
            "Kata laluan tidak sepadan",
            function (value) {
              // console.log('Password:', state.user.password, 'Repeat:', value);
              return value === state.user.password;
            }
          ),
        },
      }
    };

    const v$ = useVuelidate(rules, state);

    const tryToRegisterIn = async () => {
      state.submitted = true;
      v$.value.$touch();

      if (v$.value.$invalid) return;

      try {
        await axios.post(API_URL + "register", {
          nama: state.user.nama,
          emel: state.user.emel,
          nombor_ic: state.user.ic,
          peranan: state.user.peranan,
          // password: state.user.password,
          password: state.user.repeatPassword,
        });

        // const token = response.data.token;
        // const user = response.data.user;

        // ✅ Store token in localStorage (or Pinia store)
        // localStorage.setItem("token", token);
        // localStorage.setItem("user", JSON.stringify(user));

        // ✅ Optionally: set default auth header for future requests
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        state.registerSuccess = true;
        state.isRegisterError = false;

        //  window.location.href = "/"; // or use router.push("/dashboard")

      } catch (err) {
        state.isRegisterError = true;
        state.registerSuccess = false;
        state.regError = "IC telah didaftarkan";
      }
    };

    return {
      ...toRefs(state),
      v$,
      tryToRegisterIn,
      notification: notificationStore,
    };
  },
};
</script>

<style scoped>
.shadow {
  color: white;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
}
.bg-color{
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