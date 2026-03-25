<template>
  <Layout>
    <PageHeader :title="isEditMode ? 'Kemaskini Pengguna' : 'Daftar Pengguna'" pageTitle="Penyelenggaraan Pengguna" />
    <BRow class="justify-content-center">
      <BCol md="12" lg="12" xl="12">
        <BCard no-body class="overflow-hidden">
          <div class="pt-4 px-4">
            <h5>{{ isEditMode ? "Kemaskini Pengguna" : "Daftar Pengguna" }}</h5>
            <p>Akaun Aplikasi MyPelantikan</p>
          </div>
          <BCardBody class="pt-0">
            <BAlert v-model="registerSuccess" class="mt-3" variant="success" dismissible>
              {{ isEditMode ? "Kemaskini berjaya." : "Pendaftaran berjaya! Kata Laluan telah dihantar ke emel pengguna."
              }}
            </BAlert>

            <BAlert v-model="isRegisterError" class="mt-3" variant="danger" dismissible>
              {{ regError }}
            </BAlert>

            <BForm class="p-2" @submit.prevent="submitForm">
              <BFormGroup class="mb-3" id="email-group" label="Emel" label-for="emel">
                <BFormInput id="emel" v-model="user.emel" type="email" placeholder="Masukkan Emel"
                  :class="{ 'is-invalid': submitted && v$.user.emel.$error }" />
                <div v-if="submitted && v$?.user?.emel?.$error" class="invalid-feedback">
                  <span v-if="v$.user.emel.required.$message">{{
                    v$.user.emel.required.$message
                  }}</span>
                </div>
              </BFormGroup>

              <BFormGroup class="mb-3" id="fullname-group" label="Nama" label-for="nama">
                <BFormInput id="nama" v-model="user.nama" type="text" placeholder="Masukkan Nama"
                  :class="{ 'is-invalid': submitted && v$.user.nama.$error }" />
                <div v-if="submitted && v$?.user?.nama?.$error" class="invalid-feedback">
                  <span v-if="v$.user.nama.required.$message">{{
                    v$.user.nama.required.$message
                  }}</span>
                </div>
              </BFormGroup>

              <BFormGroup class="mb-3" id="fullname-group" label="No. Kad Pengenalan" label-for="noIC">
                <BFormInput id="noIC" v-model="user.ic" type="text" placeholder="Masukkan No. Kad Pengenalan"
                  maxLength="12" pattern="[0-9]*" @keypress="(/[0-9]/.test($event.key))||$event.preventDefault()" inputmode="numeric" :disabled="isEditMode"
                  :class="{ 'is-invalid': submitted && v$.user.ic.$error }" />
                <div v-if="submitted && v$?.user?.ic?.$error" class="invalid-feedback">
                  <div v-for="(item, index) in v$.user.ic.$errors" :key="index">
                    <span v-if="item.$message">{{ item.$message }}</span>
                  </div>
                </div>
              </BFormGroup>

              <BFormGroup class="mb-3" id="fullname-group" label="Peranan" label-for="peranan">
                <BFormSelect id="peranan" v-model="user.peranan" :options="perananOptions"
                  placeholder="Sila Pilih Peranan" :class="{ 'is-invalid': submitted && v$.user.peranan.$error }" />
                <div v-if="submitted && v$?.user?.peranan?.$error" class="invalid-feedback">
                  <div v-for="(item, index) in v$.user.peranan.$errors" :key="index">
                    <span v-if="item.$message">{{ item.$message }}</span>
                  </div>
                </div>
              </BFormGroup>

              <div class="mt-4 d-grid">
                <BButton type="submit" variant="primary" class="btn-block">
                  {{ isEditMode ? "Kemaskini Pengguna" : "Daftar Pengguna" }}
                </BButton>
              </div>
            </BForm>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<script>
import { reactive, toRefs } from "vue";
import { required, email, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import { useNotificationStore } from "@/state/pinia";
import { useRoute } from "vue-router";
import axiosClient from "@/services/apiClient";


export default {
  components: { Layout, PageHeader },
  setup() {
    const route = useRoute();
    const notificationStore = useNotificationStore();

    const state = reactive({
      user: {
        id: null,
        emel: "",
        nama: "",
        ic: "",
        peranan: "",
      },
      perananOptions: [
        { value: "", text: "Sila Pilih Peranan" },
        { value: "admin", text: "Admin" },
        { value: "pengguna", text: "Pengguna" },
        { value: "pentadbir sistem", text: "Pentadbir Sistem" },
      ],
      submitted: false,
      regError: null,
      isRegisterError: false,
      registerSuccess: false,
      isEditMode: false,
    });

    const rules = {
      user: {
        emel: {
          required: helpers.withMessage("Emel diperlukan", required),
          email: helpers.withMessage("Emel tidak sah", email),
        },
        nama: { required: helpers.withMessage("Nama diperlukan", required) },
        ic: { required: helpers.withMessage("Nombor IC diperlukan", required) },
        peranan: { required: helpers.withMessage("Peranan diperlukan", required) },
      },
    };

    const v$ = useVuelidate(rules, state);

    if (route.query.id) {
      state.isEditMode = true;
      state.user.id = route.query.id;

      axiosClient.get(`penyelenggaraan-pengguna/pengguna/${state.user.id}`).then((res) => {
        state.user = {
          id: res.data.id,
          emel: res.data.emel,
          nama: res.data.nama,
          ic: res.data.nombor_ic,
          peranan: res.data.peranan,
        };
      });
    }

    const submitForm = async () => {
      state.submitted = true;
      v$.value.$touch();
      if (v$.value.$invalid) return;

      try {
        if (state.isEditMode) {
          await axiosClient.put(`penyelenggaraan-pengguna/kemaskini/${state.user.id}`, {
            nama: state.user.nama,
            emel: state.user.emel,
            nombor_ic: state.user.ic,
            peranan: state.user.peranan,
          });
        } else {
          await axiosClient.post("register", {
            nama: state.user.nama,
            emel: state.user.emel,
            nombor_ic: state.user.ic,
            peranan: state.user.peranan,
          });
        }

        state.registerSuccess = true;
        state.isRegisterError = false;
        state.submitted = false;

        if (!state.isEditMode) {
          state.user = { emel: "", nama: "", ic: "", peranan: "" };
          v$.value.$reset();
        }
      } catch (err) {
        state.isRegisterError = true;
        state.registerSuccess = false;

        let errorMessage = state.isEditMode
          ? "Gagal kemaskini pengguna"
          : "Gagal mendaftar pengguna.";

        const serverErrors = err.response?.data?.errors;

        if (serverErrors) {
          if (serverErrors.emel && serverErrors.emel.length > 0) {
            errorMessage = "Emel telah didaftarkan.";
          } 
          else if (serverErrors.nombor_ic && serverErrors.nombor_ic.length > 0) {
            errorMessage = "No. Kad Pengenalan telah didaftarkan.";
          }
          else {
            errorMessage = "Sila semak semula borang. Terdapat ralat pengesahan data.";
          }
        }
        state.regError = errorMessage;
      }
    };

    return {
      ...toRefs(state),
      v$,
      submitForm,
      notification: notificationStore,
    };
  },
};
</script>
