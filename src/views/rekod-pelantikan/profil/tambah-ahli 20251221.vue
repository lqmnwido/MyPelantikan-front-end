<template>
    <Layout>
        <div class="page-wrapper" style="position:relative;">
            <!-- Simple loading overlay -->
            <div v-if="loading" class="loading-overlay">
                <Loader :loading="loading" />
            </div>

            <PageHeader :title="pageTitle" pageTitle="Pelantikan" />

            <!-- Resume Upload -->
            <div class="border rounded p-4 mb-4 text-center"
                :class="isDragOver ? 'border-primary bg-light' : 'border-secondary'"
                style="width: 99%; margin-left: 5px; cursor: pointer;" @click="$refs.resumeInput.click()"
                @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">
                <i class="mdi mdi-file-pdf-box fs-2 mb-2 d-block text-danger"></i>

                <strong>Sila muat naik resume (PDF)</strong>
                <p class="mb-0 text-muted">
                    Klik atau seret & lepaskan fail di sini
                </p>

                <small v-if="resumePDF" class="text-success d-block mt-2">
                    ✔ {{ resumePDF.name }}
                </small>

                <input ref="resumeInput" type="file" accept="application/pdf" hidden @change="onFileChange" />
            </div>


            <FormWizard :steps="wizardSteps" :formData="form" :topicLabel="topicLabel" :mode="isEditMode"
                @form-submit="handleFormSubmit">
                <template #default="{ stepIndex }">
                    <div v-if="stepIndex === 0">
                        <LayoutForm :leftFields="leftTab1" :rightFields="rightTab1" v-model:form="form" />
                    </div>

                    <div v-else-if="stepIndex === 1">
                        <MaklumatAkademik v-model="form.akademik" />
                    </div>

                    <div v-else-if="stepIndex === 2">
                        <DynamicInputGroup v-model="form.dynamicFields" :inputGroupLabel="inputGroupLabelPerkhidmatan"
                            :kategoriOptions="kategoriOptions" />
                    </div>
                </template>
            </FormWizard>

            <SweetAlert :show="alert.success" type="success" title="Berjaya!" text="Maklumat telah disimpan."
                @closed="alert.success = false" />

            <SweetAlert :show="alert.kemaskini" type="success" title="Berjaya!" text="Maklumat telah dikemaskini."
                @closed="alert.success = false" />

            <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
                @closed="alert.error = false" />
        </div>
    </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import FormWizard from "@/components/FormWizard.vue";
import LayoutForm from "@/components/LayoutForm.vue";
import DynamicInputGroup from "@/components/DynamicInputGroup.vue";
import MaklumatAkademik from "@/components/MaklumatAkademik.vue";
import { lookupService } from "@/services/lookup.service";
import { profilService } from "@/services/profil.service";
import Loader from "@/components/widgets/loader";
import SweetAlert from "@/components/SweetAlert.vue";

// function formDataToJson(formData) {
//     const obj = {};
//     for (let [key, value] of formData.entries()) {
//         if (obj[key]) {
//             if (!Array.isArray(obj[key])) {
//                 obj[key] = [obj[key]];
//             }
//             obj[key].push(value);
//         } else {
//             obj[key] = value;
//         }
//     }
//     return obj;
// }

export default {
    name: "TambahPelantikan",
    components: {
        Layout,
        PageHeader,
        FormWizard,
        LayoutForm,
        DynamicInputGroup,
        MaklumatAkademik,
        SweetAlert,
        Loader
    },

    data() {
        return {
            loading: true, // pause watchers + show overlay
            isDragOver: false,
            kategoriOptions: [],
            // keep these arrays so we can find and set options later
            gelaranOptions: [],
            partiOptions: [],
            agamaOptions: [],
            bangsaOptions: [],
            kahwinOptions: [],
            poskodOptions: [],
            bandarOptions: [],
            negeriOptions: [],

            isEditMode: "add",
            wizardSteps: [
                { title: "Maklumat Peribadi" },
                { title: "Maklumat Akademik" },
                { title: "Ringkasan Perkhidmatan" },
            ],
            resumePDF: null,
            // initial reactive form object — never replace reference, only mutate
            form: {
                nama: "",
                phone: "",
                emel: "",
                ic: "",
                address: "",
                birthDate: "",
                gelaran: [],
                parti: "",
                agama: "",
                bangsa: "",
                jantina: "",
                perkahwinan: "",
                tempatLahir: "",
                gredJawatan: "",
                dynamicFields: {
                    sebelum: [{ tahun: "", jawatan: "", agensi: "", catatan: "" }],
                    semasa: [],
                },
                akademik: {
                    kelulusan: [],
                    anugerah: []
                },
                telBimbit: "",
                telRumah: "",
                alamatRumah: {
                    alamat: "",
                    poskod: "",
                    bandar: "",
                    negeri: ""
                },
                alamatSurat: {
                    samaSeperti: false,
                    alamat: "",
                    poskod: "",
                    bandar: "",
                    negeri: ""
                },
                gambar: null,
            },

            alert: {
                success: false,
                error: false,
                kemaskini: false,
                errorMessage: "",
            },

            inputGroupLabelPerkhidmatan: "Perkhidmatan",

            // Fields definitions (same as yours). We'll mutate options arrays in-place.
            leftTab1: [
                { label: 'Gambar', type: 'image-profile', info: 'Maximum Size: 5MB', model: 'gambar' },
                { label: 'Gelaran', type: 'multi-select', placeholder: 'Sila Pilih', model: 'gelaran', options: [] },
                { label: 'Nama', type: 'text', placeholder: 'Isikan Nama...', model: 'nama', required: true },
                { label: 'No Kad Pengenalan', type: 'number', maxlength: 12, allowDecimal: false, placeholder: 'Contoh: 001122060643', model: 'ic', isValid: null, validationMessage: '' },
                {
                    label: 'Jantina', type: 'radio', model: 'jantina', options: [
                        { label: 'Lelaki', value: 'L' },
                        { label: 'Perempuan', value: 'P' }
                    ]
                },
                { label: 'Tarikh Lahir', type: 'date', placeholder: 'Isikan tarikh lahir', model: 'birthDate' },
                { label: 'Tempat Lahir', type: 'text', placeholder: 'Isikan tempat lahir...', model: 'tempatLahir' },
                { label: 'No Telefon Bimbit', type: 'text', maxlength: 11, placeholder: 'Contoh: 0123456789', model: 'telBimbit' },
                { label: 'No Telefon Rumah', type: 'text', maxlength: 9, placeholder: 'Contoh: 09511232', model: 'telRumah' },
                { label: 'Emel', type: 'email', placeholder: 'contoh@email.com', model: 'emel' },
                { label: 'Agama', type: 'select-search', placeholder: 'SILA PILIH', model: 'agama', options: [] },
                { label: 'Bangsa', type: 'select-search', placeholder: 'SILA PILIH', model: 'bangsa', options: [] },

            ],
            rightTab1: [
                { label: 'Status Perkahwinan', type: 'select-search', placeholder: 'SILA PILIH', model: 'perkahwinan', options: [] },
                { label: 'Parti', type: 'select-search', placeholder: 'SILA PILIH', model: 'parti', options: [] },
                { label: 'Alamat Rumah', type: 'textarea', placeholder: 'Isikan alamat penuh...', model: 'alamatRumah.alamat' },
                {
                    label: 'Poskod', type: 'suggestion-text', maxlength: 5, placeholder: 'Isikan poskod...', model: 'alamatRumah.poskod',
                    fetchSuggestions: async (query) => {
                        const results = await lookupService.suggestPoskod(query);
                        return results;
                    }
                },
                {
                    label: 'Bandar', type: 'suggestion-text', placeholder: 'Isikan bandar...', model: 'alamatRumah.bandar',
                    fetchSuggestions: async (query) => {
                        const results = await lookupService.suggestBandar(query);
                        return results;
                    }
                },
                { label: 'Negeri', type: 'select-search', placeholder: 'SILA PILIH', model: 'alamatRumah.negeri', options: [] },
                { label: '', checkboxLabel: 'Sama seperti Alamat Rumah', type: 'checkbox', model: 'alamatSurat.samaSeperti' },
                { label: 'Alamat Surat-Menyurat', type: 'textarea', placeholder: 'Isikan alamat surat...', model: 'alamatSurat.alamat' },
                {
                    label: 'Poskod', type: 'suggestion-text', maxlength: 5, placeholder: 'Isikan poskod...', model: 'alamatSurat.poskod',
                    fetchSuggestions: async (query) => {
                        const results = await lookupService.suggestPoskod(query);
                        return results;
                    }
                },
                {
                    label: 'Bandar', type: 'suggestion-text', placeholder: 'Isikan bandar...', model: 'alamatSurat.bandar',
                    fetchSuggestions: async (query) => {
                        const results = await lookupService.suggestBandar(query);
                        return results;
                    }
                },
                { label: 'Negeri', type: 'select-search', placeholder: 'SILA PILIH', model: 'alamatSurat.negeri', options: [] },
            ],

            topicLabel: "Butiran Ahli",
        };
    },

    async mounted() {

        try {
            // Kick off all lookups in parallel
            await this.loadAllLookups();

            // If editing, load profile AFTER lookups (so we can map ids to options if needed)
            if (this.$route.query.kemaskini === 'true') {
                this.isEditMode = 'update';
                const id = this.$route.query.id;
                if (id) {
                    await this.loadProfil(id);
                }
            }
        } catch (err) {
            // console.error("Initial load error:", err);
            this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui'
            this.alert.error = true;
        } finally {
            // enable watchers + hide overlay
            this.loading = false;
        }
    },

    methods: {
        onDragOver() {
            this.isDragOver = true;
        },

        onDragLeave() {
            this.isDragOver = false;
        },

        onDrop(e) {
            this.isDragOver = false;
            const file = e.dataTransfer.files[0];
            this.validateAndSetFile(file);
        },

        onFileChange(e) {
            const file = e.target.files[0];
            this.validateAndSetFile(file);
        },

        validateAndSetFile(file) {
            if (!file) return;

            // PDF only
            if (file.type !== "application/pdf") {
                this.$refs.resumeInput.value = "";
                this.$swal?.fire("Ralat", "Hanya fail PDF dibenarkan", "error");
                return;
            }

            // Optional: max 5MB
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                this.$refs.resumeInput.value = "";
                this.$swal?.fire("Ralat", "Saiz fail maksimum 5MB", "error");
                return;
            }

            this.resumePDF = file;
        },

        handleFileUpload(event) {
            this.form.gambar = event.target.files[0];
        },

        async handleFormSubmit() {
            try {
                const data = this.form;
                const formData = new FormData();

                // Gambar
                if (data.gambar instanceof File) formData.append("gambar", data.gambar);

                // Simple fields
                formData.append("nama", data.nama || "");
                formData.append("nombor_ic", data.ic || "");
                formData.append("tarikh_lahir", data.birthDate ? new Date(data.birthDate).toISOString().split("T")[0] : "");
                formData.append("emel", data.emel || "");
                formData.append("jantina", data.jantina || "");
                formData.append("status_kahwin", data.perkahwinan || "");
                formData.append("gelaran", data.gelaran.join(",") || "");
                formData.append("parti", data.parti || "");
                formData.append("bangsa", data.bangsa || "");
                formData.append("agama", data.agama || "");
                formData.append("tempatLahir", data.tempatLahir || "");
                formData.append("telBimbit", data.telBimbit || "");
                formData.append("telRumah", data.telRumah || "");

                // Alamat
                ["alamatRumah", "alamatSurat"].forEach(type => {
                    const a = data[type] || {};
                    formData.append(`${type}[alamat]`, a.alamat || "");
                    formData.append(`${type}[poskod]`, a.poskod || "");
                    formData.append(`${type}[bandar]`, a.bandar || "");
                    formData.append(`${type}[negeri]`, a.negeri || "");
                });

                const kelulusan = data.akademik?.kelulusan
                    ? Array.isArray(data.akademik.kelulusan)
                        ? data.akademik.kelulusan
                        : [data.akademik.kelulusan]
                    : data.akademik.kelulusan;

                const anugerah = data.akademik?.anugerah
                    ? Array.isArray(data.akademik.anugerah)
                        ? data.akademik.anugerah
                        : [data.akademik.anugerah]
                    : data.akademik.anugerah;


                // console.log("✅ kelulusan:", kelulusan, " anugerah:", anugerah);
                formData.append("akademik", JSON.stringify({ kelulusan, anugerah }));



                // Perkhidmatan: Sebelum
                (data.dynamicFields?.sebelum || []).forEach((entry, i) => {
                    ["tahun", "jawatan", "agensi", "catatan"].forEach(f => {
                        formData.append(`perkhidmatan[sebelum][${i}][${f}]`, entry[f] || "");
                    });
                    // optional: include jenis_perkhidmatan explicitly
                    formData.append(`perkhidmatan[sebelum][${i}][jenis_perkhidmatan]`, "terdahulu");
                });

                // Perkhidmatan: Semasa
                (data.dynamicFields?.semasa || []).forEach((group, i) => {
                    (group.entries || []).forEach((entry, j) => {
                        ["id", "catatan"].forEach(f => {
                            formData.append(`perkhidmatan[semasa][${i}][entries][${j}][${f}]`, entry[f] || "");
                        });
                        // Add jenis_perkhidmatan 
                    });
                });

                // console.log(formDataToJson(formData));
                // Determine update vs create
                const id = this.$route.query.id;
                if (this.isEditMode === "update" && id) {
                    await profilService.updateProfil(id, formData);
                    this.alert.kemaskini = true;
                } else {
                    await profilService.createProfil(formData);
                    this.alert.success = true;
                }

                // console.log("✅ FormData ready to send:", formDataToJson(formData));
                this.$router.push({ path: "/rekod-pelantikan/senarai-profil" });
            } catch (error) {
                // console.error("❌ Gagal hantar profil:", error);
                this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui'
                this.alert.error = true;
            }
        },
        // Loads all lookups concurrently, then apply all options in batch.
        async loadAllLookups() {
            try {
                const res = await lookupService.allLookup();
                this.agamaOptions = res.agama;
                this.bangsaOptions = res.bangsa;
                this.gelaranOptions = res.gelaran;
                this.partiOptions = res.parti;
                this.kahwinOptions = res.statusKahwin;
                this.poskodOptions = res.poskod;
                this.bandarOptions = res.bandar;
                this.negeriOptions = res.negeri;
                this.kategoriOptions = res.jenisPelantikan;
                this.applyFieldOptions();
            } catch (err) {
                // console.error("Error loading lookups:", err);
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui'
                this.alert.error = true;
            }
        },

        applyFieldOptions() {
            // map helper
            const mapToOption = (list, valueKey = 'id', labelKey = 'nama') => {
                if (!Array.isArray(list)) return [];
                return list.map(n => ({
                    value: n[valueKey],
                    label: n[labelKey] ?? n.singkatan ?? n.nama ?? String(n[valueKey])
                }));
            };


            // gelaran
            const gelaranField = this.leftTab1.find(f => f.model === 'gelaran');
            if (gelaranField) gelaranField.options = mapToOption(this.gelaranOptions, 'id', 'singkatan');

            // console.log("Gelaran options:", this.leftTab1.find(f => f.model === 'gelaran').options);

            // parti
            const partiField = this.rightTab1.find(f => f.model === 'parti');
            if (partiField) partiField.options = mapToOption(this.partiOptions, 'id', 'singkatan');

            // agama
            const agamaField = this.leftTab1.find(f => f.model === 'agama');
            if (agamaField) agamaField.options = mapToOption(this.agamaOptions, 'id', 'nama');

            // bangsa
            const bangsaField = this.leftTab1.find(f => f.model === 'bangsa');
            if (bangsaField) bangsaField.options = mapToOption(this.bangsaOptions, 'id', 'nama');

            // kahwin
            const kahwinField = this.rightTab1.find(f => f.model === 'perkahwinan');
            if (kahwinField) kahwinField.options = mapToOption(this.kahwinOptions, 'id', 'nama');

            // negeri fields
            const negeriRumahField = this.rightTab1.find(f => f.model === 'alamatRumah.negeri');
            const negeriSuratField = this.rightTab1.find(f => f.model === 'alamatSurat.negeri');
            const negeriOptionsMapped = mapToOption(this.negeriOptions, 'id', 'nama');
            if (negeriRumahField) negeriRumahField.options = negeriOptionsMapped;
            if (negeriSuratField) negeriSuratField.options = negeriOptionsMapped;
        },

        // Load profile and assign values while preserving reactivity
        async loadProfil(id) {
            try {
                const res = await profilService.viewProfils(id);
                const data = res.data?.data;
                if (!data) return;

                // Build a minimal mapping object (avoid expensive mapping inside Vue reactivity)
                const mapped = {
                    nama: data.nama || "",
                    ic: data.nombor_ic || "",
                    emel: data.emel || "",
                    birthDate: data.tarikh_lahir || "",
                    jantina: data.jantina || "",
                    gelaran: (data.gelaran_list || []).map(i => i.id) || [],
                    agama: data.agama?.id ?? "",
                    bangsa: data.bangsa?.id ?? "",
                    parti: data.parti?.id ?? "",
                    perkahwinan: data.status_kahwin?.id ?? "",
                    telBimbit: data.telefons?.find(t => t.jenis === 'Telefon Bimbit')?.no ?? "",
                    telRumah: data.telefons?.find(t => t.jenis === 'Telefon Rumah')?.no ?? "",
                    alamatRumah: this.extractAlamat(data.alamats, 'Alamat Rumah'),
                    alamatSurat: this.extractAlamat(data.alamats, 'Alamat Surat Menyurat'),
                    tempatLahir: (this.extractAlamat(data.alamats, 'Tempat Lahir') || {}).alamat || "",
                    akademik: {
                        kelulusan: data.akademiks ?? [],
                        anugerah: data.anugerahs ?? [],
                    },
                    dynamicFields: {
                        sebelum: data.perkhidmatans_terdahulu?.length > 0 ? data.perkhidmatans_terdahulu : [{ tahun: "", jawatan: "", agensi: "", catatan: "" }],
                        semasa: (data.perkhidmatans_semasa ?? []).map(group => ({
                            kategori_nama: group.id_lkp_jenis_pelantikan,
                            entries: group.entries ?? []
                        }))
                    },
                    gambar: data.gambar ?? null,
                };

                // Merge mapped keys into existing form object (preserves reactivity)
                Object.keys(mapped).forEach(k => {
                    // For nested objects like alamatRumah/Surat and akademik/dynamicFields, ensure we merge deeply
                    if (typeof mapped[k] === 'object' && mapped[k] !== null && !Array.isArray(mapped[k])) {
                        this.form[k] = { ...this.form[k], ...mapped[k] };
                    } else {
                        this.$set ? this.$set(this.form, k, mapped[k]) : (this.form[k] = mapped[k]);
                    }
                });

                // Ensure dynamicFields groups at least exist
                if (!this.form.dynamicFields) this.form.dynamicFields = { sebelum: [], semasa: [] };
                if (!Array.isArray(this.form.dynamicFields.sebelum)) this.form.dynamicFields.sebelum = [];
                if (!Array.isArray(this.form.dynamicFields.semasa)) this.form.dynamicFields.semasa = [];

                // preview image used by LayoutForm if needed
                this.previewImage = data.gambar ?? null;
            } catch (err) {
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui'
                this.alert.error = true;
            }
        },

        extractAlamat(alamats, jenis) {
            const alamat = (alamats || []).find(a => a.jenis === jenis);
            return alamat ? {
                alamat: alamat.alamat ?? "",
                poskod: alamat.poskod ?? "",
                bandar: alamat.bandar ?? "",
                negeri: alamat.id_negeri ?? "",
                samaSeperti: false,
            } : {
                alamat: "",
                poskod: "",
                bandar: "",
                negeri: "",
                samaSeperti: false,
            };
        },

        handlePoskodChange(poskodValue, alamatKey) {
            if (this.loading) return;

            let poskodExist = null;

            if (poskodValue) {
                if (typeof poskodValue === 'object') {
                    poskodExist = this.poskodOptions.find(p =>
                        p.id_lkp_bandar === poskodValue.id_lkp_bandar ||
                        String(p.kod) === String(poskodValue.value)
                    );
                } else if (typeof poskodValue === 'string' && poskodValue.length >= 4) {
                    poskodExist = this.poskodOptions.find(p => String(p.kod) === String(poskodValue));
                }
            }

            if (!poskodExist) return;

            const relatedBandar = this.bandarOptions.find(
                b => b.id === poskodExist.id_lkp_bandar
            );

            // console.log(relatedBandar);

            if (relatedBandar) {
                this.form[alamatKey].bandar = relatedBandar.nama || "";
                const relatedNegeri = this.negeriOptions.find(
                    n => n.id === relatedBandar.id_lkp_negeri
                );
                if (relatedNegeri) {
                    this.form[alamatKey].negeri = relatedNegeri.id || relatedNegeri.nama || "";
                }
            }
        },

        handleBandarChange(bandarNama, alamatKey) {
            if (this.loading) return;
            if (!bandarNama || typeof bandarNama !== 'string') return;

            const bandarExist = this.bandarOptions.find(
                b => String(b.nama?.toLowerCase().trim()) === String(bandarNama.toLowerCase().trim())
            );

            if (bandarExist) {
                const relatedNegeri = this.negeriOptions.find(
                    n => n.id === bandarExist.id_lkp_negeri
                );
                if (relatedNegeri) {
                    this.form[alamatKey].negeri = relatedNegeri.id ?? relatedNegeri.nama ?? "";
                }
            }
        },

        icIntoDOB(ic) {
            const icField = this.leftTab1.find(f => f.model === 'ic');

            if (ic && ic.length >= 6) {
                const yy = ic.substring(0, 2);
                const mm = ic.substring(2, 4);
                const dd = ic.substring(4, 6);

                const month = parseInt(mm, 10);
                const day = parseInt(dd, 10);

                if (month < 1 || month > 12 || day < 1 || day > 31) {
                    if (icField) {
                        icField.isValid = false;
                        icField.validationMessage = "Isi No. Kad Pengenalan yang sah";
                    }
                    this.form.birthDate = ""; // Clear the birth date
                    return;
                } else {
                    if (icField) {
                        icField.isValid = true;
                        icField.validationMessage = "";
                    }
                }

                const fullYear = parseInt(yy) >= 50 ? "19" + yy : "20" + yy;
                this.form.birthDate = `${fullYear}-${mm}-${dd}`;
            } else {
                if (icField) {
                    icField.isValid = null;
                    icField.validationMessage = "";
                }
                this.form.birthDate = "";
            }
        }
    },

    watch: {
        'form.ic': {
            immediate: true,
            handler(newVal) {
                this.icIntoDOB(newVal);
            }
        },
        // Only run watchers after initial load
        'form.alamatSurat.samaSeperti'(val) {
            if (this.loading) return;
            if (val) {
                this.form.alamatSurat = {
                    ...this.form.alamatRumah,
                    samaSeperti: true,
                };
            } else {
                this.form.alamatSurat = {
                    ...this.form.alamatSurat,
                    alamat: "",
                    poskod: "",
                    bandar: "",
                    negeri: "",
                    samaSeperti: false,
                };
            }
        },

        'form.alamatRumah.poskod'(val) {
            if (this.loading) return;
            this.handlePoskodChange(val, 'alamatRumah');
        },
        'form.alamatSurat.poskod'(val) {
            if (this.loading) return;
            this.handlePoskodChange(val, 'alamatSurat');
        },

        'form.alamatRumah.bandar'(val) {
            if (this.loading) return;
            this.handleBandarChange(val, 'alamatRumah');
        },
        'form.alamatSurat.bandar'(val) {
            if (this.loading) return;
            this.handleBandarChange(val, 'alamatSurat');
        }
    },

    computed: {
        pageTitle() {
            return this.isEditMode === 'update' ? 'Kemaskini Profil' : 'Tambah Profil';
        },
    }
};
</script>

<style scoped>
.loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 60;
}

.spinner {
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    font-weight: 600;
}

.upload-zone {
    width: 99%;
    margin-left: 5px;
    border: 2px dashed #0dcaf0;
    background-color: #e7f7fb;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.3s, border-color 0.3s;
}

.upload-zone.dragover {
    background-color: #cff4fc;
    border-color: #0aa2c0;
}
</style>
