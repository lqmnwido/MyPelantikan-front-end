<template>
  <Layout>
    <div class="login-page">
      <div class="login-background">
        <div class="overlay-text text-start">
          <h2>APLIKASI</h2>
          <h1>MYPELANTIKAN</h1>
          <h3>BAHAGIAN KABINET, PERLEMBAGAAN DAN PERHUBUNGAN ANTARA KERAJAAN</h3>
        </div>
      </div>

      <BRow class="justify-content-end" style="width: 500px; height: 500px;">
        <BCol>
          <BCard no-body class="overflow-hidden">
            <div class="bg-color">
              <BRow>
                <BCol cols="7" class="">
                  <div class=" p-4" style="color: white;">
                    <h5 class="">Log Masuk</h5>
                    <p>Aplikasi MyPelantikan.</p>
                  </div>
                </BCol>
                <BCol cols="5" class="align-self-end ">
                  <img src="@/assets/images/profile-img.png" alt class="img-fluid" />
                </BCol>
              </BRow>
            </div>
            <BCardBody class="pt-0" style="padding-top: 10%;">
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
              <BAlert v-model="isAuthError" variant="danger" class="mt-3" dismissible>{{ authError }}</BAlert>
              <div v-if="notification.message" :class="'alert ' + notification.type">
                {{ notification.message }}
              </div>

              <div class="form-container" style="min-height: 180px;">
                <BForm class="p-2" @submit.prevent="tryToLogIn" v-if="!showOtpForm">
                  <BFormGroup class="mb-3" id="input-group-1" label="ID Pengguna" label-for="input-1">
                    <BFormInput id="input-1" v-model="user.nombor_ic" type="text"
                      placeholder="Masukkan No. Kad Pengenalan..." maxlength="12"
                      @input="user.nombor_ic = user.nombor_ic.replace(/\D/g, '')"
                      @keypress="(/[0-9]/.test($event.key)) || $event.preventDefault()"
                      :class="{ 'is-invalid': submitted && v$.user.nombor_ic.$error }" />
                    <div v-for="(item, index) in v$.user.nombor_ic.$errors" :key="index" class="invalid-feedback">
                      <span v-if="item.$message">{{ item.$message }}</span>
                    </div>
                  </BFormGroup>

                  <BFormGroup class="mb-3" id="input-group-2" label="Kata Laluan" label-for="input-2">
                    <BInputGroup>
                      <BFormInput id="input-2" v-model="user.password" :type="show.password ? 'text' : 'password'"
                        placeholder="Masukkan Kata Laluan" :class="{
                          'is-invalid': submitted && v$.user.password.$error,
                        }" />
                      <BButton variant="light" @click="show.password = !show.password">
                        <i :class="show.password ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </BButton>
                      <div v-if="submitted && v$.user.password.$error" class="invalid-feedback">
                        <span v-if="v$.user.password.required.$message">{{
                          v$.user.password.required.$message
                        }}</span>
                      </div>
                    </BInputGroup>
                  </BFormGroup>
                  <div class="mt-3 d-grid">
                    <BButton type="submit" variant="primary" class="btn-block">Log Masuk</BButton>
                  </div>
                  <div class="mt-4 text-center">
                  </div>
                  <div class="mt-4 text-center">
                    <router-link to="/forgot-password" class="text-muted">
                      <i class="mdi mdi-lock me-1"></i> Lupa kata laluan?
                    </router-link>
                  </div>
                </BForm>

                <BForm class="p-2" @submit.prevent="verifyOtp" v-if="showOtpForm">
                  <BFormGroup class="mb-3" id="input-group-otp" label="OTP" label-for="input-otp-0">
                    <div class="d-flex justify-content-center">
                      <BFormInput v-for="(digit, index) in otp" :key="index" :id="'input-otp-' + index"
                        v-model="otp[index]" type="text" maxlength="1" @input="handleOtpInput(index)"
                        @keydown="handleOtpKeydown(index, $event)" :ref="(el) => { otpInput[index] = el }"
                        class="otp-input text-center mx-1" style="width: 50px; height: 50px; font-size: 1.5rem;" />
                    </div>
                    <div v-if="submitted && !isOtpComplete" class="invalid-feedback d-block">
                      <span>OTP 5-digit Diperlukan</span>
                    </div>
                    <p class="text-center mt-3">
                      Tidak menerima kod? <a href="#" @click.prevent="resendOtp">Hantar semula</a>
                    </p>
                  </BFormGroup>
                  <div class="mt-3 d-grid">
                    <BButton type="submit" variant="primary" class="btn-block">Sahkan</BButton>
                  </div>
                </BForm>
              </div>

            </BCardBody>
          </BCard>
        </BCol>
      </BRow>
    </div>
  </Layout>
</template>

<script>
import Layout from "../../layouts/auth";

import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import { useNotificationStore } from '@/state/pinia'
import { login, penggunaService, verifyOtp as verifyOtpService, sendOtp } from "@/services/auth.service";
import { useAuthStore } from '@/state/pinia'

const notificationStore = useNotificationStore();

export default {
  setup() {
    return { v$: useVuelidate() };
  },
  components: {
    Layout,
  },
  data() {
    return {
      show: { password: false },
      user: {
        nombor_ic: '',
        password: '',
      },
      otp: ['', '', '', '', ''],
      otpInput: [],
      showOtpForm: false,
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
    };
  },
  validations: {
    user: {
      nombor_ic: {
        required: helpers.withMessage("Nombor IC diperlukan", required),
      },
      password: {
        required: helpers.withMessage("Kata Laluan diperlukan", required),
      },
    }
  },
  computed: {
    notification() {
      return notificationStore || {};
    },
    otpString() {
      return this.otp.join('');
    },
    isOtpComplete() {
      return this.otp.every(digit => digit !== '');
    }
  },
  methods: {
    async tryToLogIn() {
      this.submitted = true;
      this.v$.user.$touch();
      if (this.v$.user.$invalid) return;

      try {
        const loginResponse = await login(this.user.nombor_ic, this.user.password);

        // ✅ If login successful
        if (loginResponse.status === true) {
          const token = loginResponse.token;
          const user = {
            ...loginResponse.user,
            force_password_change: loginResponse.force_password_change,
          };

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          const authStore = useAuthStore();
          authStore.setUser(user);

          const data = await penggunaService.kebenaran();
          const map = {};
          data.forEach(item => {
            const tab_id = item.tab_id;
            if (!map[tab_id]) map[tab_id] = { id: tab_id };
            map[tab_id][item.peranan] = item.kebenaran;
          });
          authStore.tabPermissions = Object.values(map);

          this.$router.push("/");
        } else {
          this.authError = loginResponse.message || "Log masuk gagal";
          this.isAuthError = true;
        }
      } catch (error) {
        const response = error.response?.data;

        // ✅ Catch OTP 401 case
        if (response?.requires_otp_verification) {
          try {
            const otpResponse = await sendOtp(this.user.nombor_ic);
            this.notification.message = otpResponse.message || "OTP telah dihantar ke emel anda.";
            this.notification.type = "alert-success";
          } catch (err) {
            console.error("❌ Gagal menghantar OTP:", err);
            this.authError = "Gagal menghantar OTP. Sila cuba lagi.";
            this.isAuthError = true;
            return;
          }

          this.showOtpForm = true;
          this.submitted = false;
          this.authError = null;
          this.isAuthError = false;
          return;
        }

        // 🟥 Any other error
        const msg = response?.message || "Log masuk gagal";
        this.authError = msg;
        this.isAuthError = true;
      }
    },

    async resendOtp() {
      try {
        const response = await sendOtp(this.user.nombor_ic);
        this.notification.message = response.message || "OTP telah dihantar semula.";
        this.notification.type = "alert-success";
      } catch {
        this.authError = "Gagal menghantar OTP semula.";
        this.isAuthError = true;
      }
    },

    async verifyOtp() {
      this.submitted = true;
      if (!this.isOtpComplete) return;

      try {
        const response = await verifyOtpService(this.user.nombor_ic, this.otpString);
        const token = response.token;
        const user = {
          ...response.user,
          force_password_change: response.force_password_change,
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const authStore = useAuthStore();
        authStore.setUser(user);

        try {
          const data = await penggunaService.kebenaran();
          if (!Array.isArray(data)) {
            throw new Error("Expected array from kebenaran API, got: " + JSON.stringify(data));
          }

          const map = {};
          data.forEach(item => {
            const tab_id = item.tab_id;
            if (!map[tab_id]) map[tab_id] = { id: tab_id };
            map[tab_id][item.peranan] = item.kebenaran;
          });
          authStore.tabPermissions = Object.values(map);
        } catch (err) {
          console.error("❌ Error fetching permissions:", err);
        }

        this.$router.push("/");
      } catch (error) {
        const msg = error.response?.data?.message;
        this.authError = msg || "OTP tidak sah";
        this.isAuthError = true;
      }
    },
    handleOtpInput(index) {
      this.otp[index] = this.otp[index].replace(/\D/g, '');
      if (this.otp[index] && index < 4) {
        this.otpInput[index + 1].focus();
      }
    },
    handleOtpKeydown(index, event) {
      if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
        this.otpInput[index - 1].focus();
      }
    }
  },
};
</script>

<style scoped>
.login-page {
  display: flex;
}

.login-background {
  flex: 1;
  background-size: cover;
  position: relative;
  padding: 50px;
  color: white;
  font-family: 'Segoe UI', sans-serif;
}

.overlay-text {
  max-width: 100%;
  margin-top: 100px;
}

.overlay-text h1 {
  font-size: 58px;
  margin-left: -2px;
  font-family: Anton;
  letter-spacing: 20px;
}

.overlay-text h2 {
  font-size: 58px;
  letter-spacing: 10px;
  font-family: Anton;
}

.overlay-text h3 {
  font-size: 27px;
  margin-bottom: 20px;
}

.overlay-text p {
  font-size: 16px;
  max-width: 100%;
}

.overlay-text h1,
.overlay-text h2,
.overlay-text h3,
.overlay-text p {
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
}

.login-card {
  flex: 0 0 420px;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 30px;
  box-shadow: -5px 0 10px rgba(0, 0, 0, 0.05);
  position: relative;
}

.card-header-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.footer-note {
  text-align: center;
  font-size: 12px;
  color: #777;
  margin-top: 20px;
}

.bg-color {
  background-color: #384c69;
}

.radius {
  border-radius: 12px;
  box-shadow:
    -5px 0 10px rgba(0, 0, 0, 0.05),
    inset 2px 2px 5px rgba(255, 255, 255, 0.1),
    inset -2px -2px 5px rgba(0, 0, 0, 0.3);
}
</style>
