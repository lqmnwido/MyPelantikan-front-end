<template>
    <Layout>
        <BRow class="justify-content-center">
            <BCol md="8" lg="6" xl="5">
                <BCard no-body class="overflow-hidden">
                    <div class="bg-color">
                        <BRow>
                            <BCol cols="7">
                                <div class="p-4" style="color: white;">
                                    <h5>Set semula kata laluan</h5>
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
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg"
                                            alt height="34" />
                                    </span>
                                </div>
                            </router-link>
                        </div>

                        <SweetAlert :show="success" type="success" title="Berjaya!"
                            text="Kata laluan berjaya dikemaskini." :autoClose="1500" @closed="success" />

                        <SweetAlert :show="isError" type="error" title="Ralat" :text="errorMsg"
                            @closed="isError = false" />


                        <BForm class="p-2" @submit.prevent="submit">
                            <!-- New Password -->
                            <BFormGroup class="mb-3" label="Kata Laluan Baharu" label-for="newPassword">
                                <BInputGroup>
                                    <BFormInput :type="show.newPass ? 'text' : 'password'" id="newPassword"
                                        v-model="form.newPassword" placeholder="Masukkan kata laluan baharu"
                                        :class="{ 'is-invalid': submitted && v$.form.newPassword.$error }" />
                                    <BButton variant="light" @click="show.newPass = !show.newPass">
                                        <i :class="show.newPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                    </BButton>
                                </BInputGroup>

                                <!-- Strength meter -->
                                <div class="mt-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small>Kekuatan Kata Laluan: <strong>{{ strength.label }}</strong></small>
                                        <!-- <small v-if="form.newPassword && form.newPassword.length < 12">(gunakan 12+
                                            aksara untuk keselamatan terbaik)</small> -->
                                    </div>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar" role="progressbar"
                                            :style="{ width: strength.percent + '%' }" :class="strength.barClass"
                                            aria-valuemin="0" aria-valuemax="100">
                                        </div>
                                    </div>
                                </div>

                                <ul class="mt-2 mb-0 small text-muted">
                                    <li>Minimum 12 aksara diperlukan untuk meningkatkan keselamatan
                                    </li>
                                    <li>Mesti ada huruf Besar dan Kecil (<span class="text-muted fst-italic bg-light">
                                            a-z, A-Z
                                        </span>)</li>
                                    <li>Mesti ada sekurang-kurangnya 1 nombor (<span
                                            class="text-muted fst-italic bg-light"> 0 - 9 </span>).
                                    </li>
                                    <li>Mesti ada simbol khas seperti<span class="text-muted fst-italic bg-light"> @, #,
                                            $, %
                                        </span>dan lain-lain.</li>
                                </ul>

                                <div v-if="submitted && v$?.form?.newPassword?.$error" class="invalid-feedback d-block">
                                    <div v-if="v$.form.newPassword.required.$invalid">Kata laluan baharu diperlukan
                                    </div>
                                    <div v-else-if="v$.form.newPassword.minLength.$invalid">Minimum 12 aksara</div>
                                    <div v-else-if="!newPasswordComplex(form.newPassword)">Gunakan huruf
                                        besar,
                                        huruf kecil, nombor & simbol</div>
                                </div>
                            </BFormGroup>

                            <!-- Confirm Password -->
                            <BFormGroup class="mb-3" label="Sahkan Kata Laluan Baharu" label-for="confirmPassword">
                                <BInputGroup>
                                    <BFormInput :type="show.confirm ? 'text' : 'password'" id="confirmPassword"
                                        v-model="form.confirmPassword" placeholder="Masukkan semula kata laluan baharu"
                                        :class="{ 'is-invalid': submitted && v$.form.confirmPassword.$error }" />
                                    <BButton variant="light" @click="show.confirm = !show.confirm">
                                        <i :class="show.confirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                    </BButton>
                                </BInputGroup>
                                <div v-if="submitted && v$?.form?.confirmPassword?.$error"
                                    class="invalid-feedback d-block">
                                    <div v-if="v$.form.confirmPassword.required.$invalid">Pengesahan diperlukan
                                    </div>
                                    <div v-else-if="v$.form.confirmPassword.matches.$invalid">Kata laluan tidak
                                        sepadan
                                    </div>
                                </div>
                            </BFormGroup>

                            <div class="mt-4 d-grid">
                                <BButton :disabled="loading" type="submit" variant="primary" class="btn-block">
                                    <span v-if="!loading">Kemaskini Kata Laluan</span>
                                    <span v-else class="d-inline-flex align-items-center">
                                        <span class="spinner-border spinner-border-sm me-2" role="status"
                                            aria-hidden="true"></span>
                                        Sedang dikemaskini...
                                    </span>
                                </BButton>
                            </div>
                        </BForm>
                    </BCardBody>
                </BCard>
                <div class="mt-5 text-center shadow">
                    <p>
                        Tidak Lupa Kata Laluan?
                        <router-link to="/login" class="fw-medium text-link">Log Masuk Di Sini</router-link>
                    </p>
                    <p>
                        © {{ new Date().getFullYear() }} Hakcipta Kerajaan Selangor <i
                            class="mdi mdi-heart text-danger"></i>
                    </p>
                </div>
            </BCol>
        </BRow>
    </Layout>
</template>

<script>
import { reactive, toRefs, computed } from "vue";
import { required, minLength, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Layout from "@/layouts/auth";
import { resetPassword } from "@/services/auth.service";
import SweetAlert from "@/components/SweetAlert.vue";
import { useRoute, useRouter } from "vue-router";


export default {
    components: { Layout, SweetAlert },
    setup() {
        const state = reactive({
            form: {
                newPassword: "",
                confirmPassword: "",
            },
            show: { newPass: false, confirm: false },
            submitted: false,
            loading: false,
            success: false,
            isError: false,
            errorMsg: null,
        });

        // extra complexity rule (uppercase, lowercase, number, symbol)
        const newPasswordComplex = (value) => {
            if (!value) return false;
            // must contain at least 1 lowercase, 1 uppercase, 1 number, 1 symbol
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
            return regex.test(value);
        };


        const rules = {
            form: {
                newPassword: {
                    required,
                    minLength: minLength(12),
                    complex: helpers.withMessage(
                        "Weak password",
                        (v) => newPasswordComplex(v)
                    ),
                },
                confirmPassword: {
                    required,
                    matches: helpers.withMessage(
                        "Passwords do not match",
                        (v) => v === state.form.newPassword
                    ),
                },
            },
        };


        const v$ = useVuelidate(rules, { form: state.form });

        const strength = computed(() => {
            const v = state.form.newPassword || "";
            let score = 0;
            if (v.length >= 12) score += 25;
            if (/[A-Z]/.test(v)) score += 15;
            if (/[a-z]/.test(v)) score += 15;
            if (/[0-9]/.test(v)) score += 20;
            if (/[^A-Za-z0-9]/.test(v)) score += 25;
            // cap 100
            const pct = Math.min(100, score);
            const label =
                pct >= 80 ? "Sangat Kukuh" : pct >= 60 ? "Kukuh" : pct >= 40 ? "Sederhana" : "Lemah";
            const barClass =
                pct >= 80
                    ? "bg-success"
                    : pct >= 60
                        ? "bg-info"
                        : pct >= 40
                            ? "bg-warning"
                            : "bg-danger";
            return { percent: pct, label, barClass };
        });

        const route = useRoute();
        const router = useRouter();

        const submit = async () => {
            state.submitted = true;
            v$.value.$touch();
            console.log(v$.value.$invalid);
            if (v$.value.$invalid) {
                console.log("Invalid");
                return;
            }

            try {
                state.loading = true;

                // ✅ get query params properly
                const token = route.query.token;
                const emel = route.query.email;

                await resetPassword({
                    token,
                    emel,
                    password: state.form.newPassword,
                    password_confirmation: state.form.confirmPassword,
                });

                state.success = true;
                router.push({ path: "/login" });

                state.isError = false;
                state.errorMsg = null;

            } catch (err) {
                state.isError = true;
                state.success = false;
                state.errorMsg = err?.response?.data?.message || "Gagal mengemaskini kata laluan.";
            } finally {
                state.loading = false;
            }
        };


        return {
            ...toRefs(state),
            v$,
            submit,
            strength,
            rules,
            newPasswordComplex,
        };
    },
};
</script>

<style scoped>
.shadow {
    color: white;
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
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
    /* rounded corners */
    box-shadow:
        -5px 0 10px rgba(0, 0, 0, 0.05),    /* subtle outer shadow */
        inset 2px 2px 5px rgba(255, 255, 255, 0.1),
        /* light inner highlight */
        inset -2px -2px 5px rgba(0, 0, 0, 0.3);
    /* dark inner shadow */
}
</style>
