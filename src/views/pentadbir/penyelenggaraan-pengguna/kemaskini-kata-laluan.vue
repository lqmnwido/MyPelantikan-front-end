<template>
    <Layout>
        <div v-if="loading" class="loading-overlay">
            <Loader :loading="loading" />
        </div>
        <PageHeader title="Kemaskini Kata Laluan" pageTitle="Pentadbir" />
        <div class="container-fluid py-4">
            <BRow class="justify-content-center">
                <BCol md="12" lg="12" xl="12">
                    <BCard no-body class="overflow-hidden shadow-sm">
                        <div class="pt-4 px-4">
                            <h5>Tukar Kata Laluan Bagi Akaun : {{ nama }} - [{{ peranan }}]</h5>
                            <p>Pastikan kata laluan yang kukuh.</p>
                        </div>

                        <BCardBody class="pt-0">
                            <BAlert v-model="success" variant="success" dismissible class="mt-2">
                                Kata laluan berjaya dikemaskini.
                            </BAlert>
                            <BAlert v-model="isError" variant="danger" dismissible class="mt-2">
                                {{ errorMsg }}
                            </BAlert>

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
                                            <small>Kekuatan Kata Laluan: <strong>{{ strength.label
                                            }}</strong></small>
                                            <small v-if="form.newPassword && form.newPassword.length < 12">(gunakan
                                                12+
                                                aksara untuk keselamatan terbaik)</small>
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
                                        <li>Mesti ada huruf Besar dan Kecil (<span
                                                class="text-muted fst-italic bg-light"> a-z, A-Z
                                            </span>)</li>
                                        <li>Mesti ada sekurang-kurangnya 1 nombor (<span
                                                class="text-muted fst-italic bg-light"> 0 - 9 </span>).
                                        </li>
                                        <li>Mesti ada simbol khas seperti<span class="text-muted fst-italic bg-light">
                                                @, #, $, %
                                            </span>dan lain-lain.</li>
                                    </ul>

                                    <div v-if="submitted && v$?.form?.newPassword?.$error"
                                        class="invalid-feedback d-block">
                                        <div v-if="v$.form.newPassword.required.$invalid">Kata laluan
                                            baharu
                                            diperlukan
                                        </div>
                                        <div v-else-if="v$.form.newPassword.minLength.$invalid">Minimum
                                            12
                                            aksara</div>
                                        <div v-else-if="!newPasswordComplex(form.newPassword)">Gunakan
                                            huruf
                                            besar,
                                            huruf kecil, nombor & simbol</div>
                                    </div>
                                </BFormGroup>

                                <!-- Confirm Password -->
                                <BFormGroup class="mb-3" label="Sahkan Kata Laluan Baharu" label-for="confirmPassword">
                                    <BInputGroup>
                                        <BFormInput :type="show.confirm ? 'text' : 'password'" id="confirmPassword"
                                            v-model="form.confirmPassword"
                                            placeholder="Masukkan semula kata laluan baharu"
                                            :class="{ 'is-invalid': submitted && v$.form.confirmPassword.$error }" />
                                        <BButton variant="light" @click="show.confirm = !show.confirm">
                                            <i :class="show.confirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                        </BButton>
                                    </BInputGroup>
                                    <div v-if="submitted && v$?.form?.confirmPassword?.$error"
                                        class="invalid-feedback d-block">
                                        <div v-if="v$.form.confirmPassword.required.$invalid">Pengesahan
                                            diperlukan
                                        </div>
                                        <div v-else-if="v$.form.confirmPassword.matches.$invalid">Kata
                                            laluan tidak
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
                </BCol>
            </BRow>
        </div>


        <SweetAlert :show="success" type="success" title="Berjaya!" text="Kata laluan berjaya dikemaskini."
            :autoClose="1500" @closed="success" />

        <SweetAlert :show="isError" type="error" title="Ralat" :text="errorMsg" @closed="isError = false" />
    </Layout>
</template>

<script>
import { reactive, toRefs, computed } from "vue";
import { required, minLength, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Layout from "@/layouts/main";
import SweetAlert from "@/components/SweetAlert.vue";
import Loader from "@/components/widgets/loader";
import PageHeader from "@/components/page-header";
import { useRouter, useRoute } from "vue-router";
import { changePasswordManual } from "@/services/auth.service";
import { penggunaService } from "@/services/auth.service";

export default {
    components: { Layout, PageHeader, Loader, SweetAlert },
    data() {
        return {
            loading: false,
            id: null,
            nama: "",
            peranan: "",
        };
    },
    created() {
        const route = useRoute();
        const id = route.query.id;

        if (id) {
            this.loadProfil(id);
        } else {
            console.warn("No ID found in route.");
        }
    },
    methods: {
        async loadProfil(id) {
            try {
                this.loading = true;
                this.id = id;
                const res = await penggunaService.paparPengguna(id);
                const data = res.data;
                // console.log("Pelantikan data:", data);

                this.nama = data.nama ?? "-";
                this.peranan = data.peranan.toUpperCase() ?? "";

            } catch (err) {
                console.error("Error loading profile:", err);
            } finally {
                // enable watchers + hide overlay
                this.loading = false;
            }
        },
    },
    setup() {
        const route = useRoute();
        const userID = route.query.id;
        // console.log("User ID from query:", id);
        const state = reactive({
            form: {
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            },
            show: { current: false, newPass: false, confirm: false },
            submitted: false,
            loading: false,
            success: false,
            isError: false,
            errorMsg: null,
        });

        const newPasswordComplex = (value) => {
            if (!value) return false;
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
            return regex.test(value);
        };


        const rules = computed(() => {
            // const isAdmin = auth.currentUser?.peranan === "pengguna";

            return {
                form: {
                    // ✅ Only require currentPassword if admin
                    // currentPassword: isAdmin ? { required } : {},
                    newPassword: {
                        required,
                        minLength: minLength(12),
                        complex: helpers.withMessage(
                            "Gunakan huruf besar, huruf kecil, nombor & simbol",
                            (v) => newPasswordComplex(v)
                        ),
                    },
                    confirmPassword: {
                        required,
                        matches: helpers.withMessage(
                            "Kata laluan tidak sepadan",
                            (v) => v === state.form.newPassword
                        ),
                    },
                },
            };
        });


        const v$ = useVuelidate(rules, state);

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

        const router = useRouter();
        // console.log(userID);
        const submit = async () => {
            state.submitted = true;
            v$.value.$touch();
            if (v$.value.$invalid) return;

            try {
                state.loading = true;

                await changePasswordManual({
                    id: userID,
                    // currentPassword: state.form.currentPassword,
                    password: state.form.newPassword,
                    password_confirmation: state.form.confirmPassword,
                });

                // ✅ Only logout and redirect on success
                state.success = true;
                state.isError = false;
                state.errorMsg = null;

                // auth.logOut();
                router.back();

            } catch (err) {
                state.isError = true;
                state.success = false;

                // Get error message from backend
                const message = err?.response?.data?.message || "Gagal mengemaskini kata laluan.";
                state.errorMsg = message;

                // // ❌ If error message means same password, don't logout or redirect
                // if (message.includes("sama dengan kata laluan semasa")) {
                //     // console.warn("Kata laluan baru tidak boleh sama — tiada logout/redirect.");
                //     return;
                // }
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
            userID,
            newPasswordComplex,
        };
    },
};
</script>

<style scoped>
/* Skote-like subtle polish */
.progress {
    background-color: #eef2f7;
}
</style>
