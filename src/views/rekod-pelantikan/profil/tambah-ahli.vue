<template>
    <Layout>
        <div class="page-wrapper" style="position:relative;">
            <!-- Simple loading overlay -->
            <div v-if="loading" class="loading-overlay">
                <Loader :loading="loading" />
            </div>

            <PageHeader :title="pageTitle" pageTitle="Pelantikan" />

            <div v-if="stepIndex === 0" class="alert alert-info p-3 mb-4 rounded shadow-sm"
                style="width: 99%; margin-left: 5px;">
                <div class="d-flex align-items-start">
                    <i class="mdi mdi-information-outline fs-2 text-primary me-3"></i>
                    <div class="flex-grow-1">
                        <p class="mb-2">
                            Klik butang <span class="fw-bold">Muat Naik Resume</span> untuk memuat naik resume dalam
                            format PDF.
                        </p>
                        <p class="mb-2 text-muted">
                            Sistem akan cuba mengisi maklumat secara automatik berdasarkan kandungan resume yang dimuat
                            naik.
                        </p>
                        <button class="btn btn-primary mb-0" @click="paparDragDrop">
                            <i class="mdi mdi-upload me-2"></i> Muat Naik Resume
                        </button>
                    </div>
                </div>
            </div>


            <!-- Resume Upload -->
            <div v-if="butangPapar" class="border rounded p-4 mb-4 position-relative text-center"
                :class="isDragOver ? 'border-primary bg-light' : 'border-secondary'"
                style="width: 99%; margin-left: 5px; cursor: pointer;" @click="$refs.resumeInput.click()"
                @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">

                <!-- Close button -->
                <button type="button" @click.stop="butangPapar = false"
                    class="btn-close position-absolute top-0 end-0 m-2" aria-label="Close">
                </button>

                <i class="mdi mdi-file-pdf-box fs-2 mb-2 d-block text-danger"></i>

                <strong>Sila muat naik resume (PDF)</strong>
                <p class="mb-0 text-muted">
                    Klik atau seret & lepaskan fail di sini
                </p>

                <!-- Selected PDF -->
                <div v-if="resumePDF" class="d-flex justify-content-center align-items-center mt-2">
                    <small class="text-success me-2">✔ {{ resumePDF.name }}</small>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click.stop="removeFile">
                        Buang
                    </button>
                </div>

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

                    <div v-else-if="stepIndex === 3">
                        <LainLainMaklumatGroup v-model="form.lainLainField"
                            :inputGroupLabel="inputGroupLabelPerkhidmatan" :kategoriOptions="kategoriOptions" />
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
import LainLainMaklumatGroup from "@/components/LainLainMaklumatGroup.vue";
import LayoutForm from "@/components/LayoutForm.vue";
import DynamicInputGroup from "@/components/DynamicInputGroup.vue";
import MaklumatAkademik from "@/components/MaklumatAkademik.vue";
import { lookupService } from "@/services/lookup.service";
import { profilService } from "@/services/profil.service";
import Loader from "@/components/widgets/loader";
import SweetAlert from "@/components/SweetAlert.vue";

import Tesseract from "tesseract.js";
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
        LainLainMaklumatGroup,
        LayoutForm,
        DynamicInputGroup,
        MaklumatAkademik,
        SweetAlert,
        Loader
    },

    data() {
        return {
            stepIndex: 0,
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
                { title: "Lain-Lain Maklumat" },
            ],
            resumePDF: null,
            resumeText: "",
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
                    // lainLain: [],
                },
                lainLainField: {
                    lainLain: [],
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
                tarikhBersara: "",
            },

            butangPapar: false,
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
                { label: 'Tarikh Lahir', type: 'date', placeholder: 'Isikan Tarikh Lahir', model: 'birthDate' },
                { label: 'Tempat Lahir', type: 'text', placeholder: 'Isikan Tempat Lahir...', model: 'tempatLahir' },
                { label: 'No Telefon Bimbit', type: 'text', maxlength: 11, placeholder: 'Contoh: 0123456789', model: 'telBimbit' },
                { label: 'No Telefon Rumah', type: 'text', maxlength: 10, placeholder: 'Contoh: 09511232', model: 'telRumah' },
                { label: 'Emel', type: 'email', placeholder: 'contoh@email.com', model: 'emel' },
                { label: 'Agama', type: 'select-search', placeholder: 'SILA PILIH', model: 'agama', options: [] },
                { label: 'Bangsa', type: 'select-search', placeholder: 'SILA PILIH', model: 'bangsa', options: [] },

            ],
            rightTab1: [
                { label: 'Status Perkahwinan', type: 'select-search', placeholder: 'SILA PILIH', model: 'perkahwinan', options: [] },
                { label: 'Parti', type: 'select-search', placeholder: 'SILA PILIH', model: 'parti', options: [] },
                { label: 'Alamat Rumah', type: 'textarea', placeholder: 'Isikan Alamat Penuh...', model: 'alamatRumah.alamat' },
                {
                    label: 'Poskod', type: 'suggestion-text', maxlength: 5, placeholder: 'Isikan Poskod...', model: 'alamatRumah.poskod',
                    fetchSuggestions: async (query) => {
                        const results = await lookupService.suggestPoskod(query);
                        return results;
                    }
                },
                {
                    label: 'Bandar', type: 'suggestion-text', placeholder: 'Isikan Bandar...', model: 'alamatRumah.bandar',
                    fetchSuggestions: async (query) => {
                        const results = await lookupService.suggestBandar(query);
                        return results;
                    }
                },
                { label: 'Negeri', type: 'select-search', placeholder: 'SILA PILIH', model: 'alamatRumah.negeri', options: [] },
                { label: '', checkboxLabel: 'Sama seperti Alamat Rumah', type: 'checkbox', model: 'alamatSurat.samaSeperti' },
                { label: 'Alamat Surat-Menyurat', type: 'textarea', placeholder: 'Isikan Alamat Surat-Menyurat...', model: 'alamatSurat.alamat' },
                {
                    label: 'Poskod', type: 'suggestion-text', maxlength: 5, placeholder: 'Isikan Poskod...', model: 'alamatSurat.poskod',
                    fetchSuggestions: async (query) => {
                        const results = await lookupService.suggestPoskod(query);
                        return results;
                    }
                },
                {
                    label: 'Bandar', type: 'suggestion-text', placeholder: 'Isikan Bandar...', model: 'alamatSurat.bandar',
                    fetchSuggestions: async (query) => {
                        const results = await lookupService.suggestBandar(query);
                        return results;
                    }
                },
                { label: 'Negeri', type: 'select-search', placeholder: 'SILA PILIH', model: 'alamatSurat.negeri', options: [] },
                { label: 'Tarikh Bersara', type: 'date', placeholder: 'Isikan Tarikh Bersara Jika Ada...', model: 'tarikhBersara'},
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
        removeFile() {
            this.resumePDF = null;
            this.resumeText = "";
            this.form = { ...this.form, resume: null }; // Optional: if you store file in form
            this.$refs.resumeInput.value = null; // Reset input
        },

        paparDragDrop() {
            this.butangPapar = true;
        },

        async extractTextFromPDF(file) {
            if (!file) return "";

            try {
                // Import as namespace (* as) — this works for ESM without default export
                const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

                // Set worker from CDN (matched to your exact version)
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let fullText = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(" ") + "\n";
                }

                return fullText;
            } catch (err) {
                console.error("PDF parsing error:", err);
                return "";
            }
        },

        async pdfPageToImage(file) {
            const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

            pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const images = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport }).promise;

                const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
                images.push(blob);
            }

            return images;
        },

        async extractTextWithOCRFromPDF(file) {
            const images = await this.pdfPageToImage(file);
            let fullText = "";
            // console.log(`🖼️ Converted PDF to ${images.length} image(s) for OCR`);

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                console.log(`Processing page ${i + 1}/${images.length} with Tesseract...`);
                const { data } = await Tesseract.recognize(img, "eng+msa", {  // English + Malay for better accuracy
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            console.log(`Page ${i + 1} progress: ${Math.round(m.progress * 100)}%`);
                        }
                    },
                });
                fullText += data.text + "\n";
                // console.log(`Page ${i + 1} OCR result:`, data.text);
            }

            return fullText;
        },

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
            if (!file || file.type !== "application/pdf") {
                this.$swal?.fire("Ralat", "Hanya fail PDF dibenarkan", "error");
                return;
            }
            this.resumePDF = file;

            this.extractTextFromPDF(file).then((text) => {
                // console.log("📄 Extracted text from PDF (normal):", text);
                // console.log("Length:", text.length, "characters");

                // Improved fallback: Trigger OCR if text is empty, short, lacks key resume keywords, or has garbled numbers like "6201 1 6"
                const isInsufficient = !text.trim() || text.length < 200 || !text.match(/Nama|Tarikh Lahir|No\. K\/P/i) || text.match(/\d\s+\d/);
                if (isInsufficient) {
                    // console.log("⚠️ Insufficient text found → falling back to OCR...");
                    this.extractTextWithOCRFromPDF(file).then((ocrText) => {
                        // console.log("🔍 OCR extracted text:", ocrText);
                        // console.log("OCR Length:", ocrText.length, "characters");
                        this.resumeText = ocrText;  // For debugging/display
                        this.parseResumeText(ocrText);  // Parse and populate form
                    }).catch(err => {
                        console.error("OCR error:", err);
                    });
                } else {
                    // console.log("✅ Using normal text extraction");
                    this.resumeText = text;  // For debugging/display
                    this.parseResumeText(text);  // Parse and populate form
                }
            }).catch(err => {
                console.error("Error during text extraction:", err);
            });
        },

        // New method: Parse the extracted text and auto-populate form fields
        parseResumeText(text) {
            const patterns = {
                gelaran: /Gelaran?\s*:\s*([^\n]+)/i,
                nama: /Nama\s*:\s*([\s\S]*?)(?=Jawatan|Tarikh|No\.?\s*K\/?P|$)/i,
                jawatanTerkini: /Jawatan\s+(?:Terkini|Sekarang)\s*:\s*([\s\S]*?)(?=Tarikh\s+Bersara|No\.?\s*K\/?P|Tarikh\s+Lahir|$)/i,
                tarikhBersara: /Tarikh\s+Bersara\s*:\s*([\s\S]*?)(?=No\.?\s*K\/?P|Tarikh\s+Lahir|$)/i,
                ic: /No\.?\s*K\/?P(?:\s*\(Baru\))?\s*:\s*([\s\S]*?)(?=\s*(?:Tarikh\s+Lahir|$))/i,
                birthDate: /Tarikh Lahir(?:\s*\/\s*Umur)?\s*:\s*(\d{1,2}\s+\w+\s+\d{4})/i,
                tempatLahir: /Tempat\s+Lahir\s*:\s*([\s\S]*?)(?=Taraf\s+Perkahwinan|Agama|Alamat|$)/i,
                alamat: /Alamat(?:\s*Rumah)?\s*:\s*([\s\S]*?)(?=\n\s*(?:No\.?\s*Tel|Emel|Parti|Bangsa|Agama|$))/i,
                telBimbit: /No\.?\s*Tel(?:\.?\s*Bimbit|efon)?\s*:\s*([\s\S]*?)(?=\s*(?:Emel|Parti|Bangsa|Agama|Kelulusan|Anugerah|$))/i,
                emel: /Emel\s*:\s*([^\n]+)/i,
                parti: /Parti\s*:\s*([^\n]+)/i,
                bangsa: /Bangsa\s*:\s*([^\n]+)/i,
                agama: /Agama\s*:\s*([^\n]+)/i,
                anugerah: /Anugerah\s*\/\s*Pingat\s*:\s*([\s\S]*?)(?=Halaman|Kelulusan|Lampiran|RAHSIA|$)/i,
                // kelulusan: /Kelulusan\s*[:：]?\s*([\s\S]*?)(?=Anugerah\s*\/\s*Pingat|Halaman|$)/i,
                // kelulusan: /Kelulusan\s+Akademik\s*:\s*([\s\S]*?)(?=Anugerah|Halaman|$)/i,
                kelulusan: /Kelulusan(?:\s+Akademik)?\s*[:：]?\s*([\s\S]*?)(?=Anugerah\s*\/\s*Pingat|Anugerah|Halaman|$)/i,
            };

            Object.entries(patterns).forEach(([key, regex]) => {
                const match = text.match(regex);
                if (match && match[1]) {
                    let value = match[1].trim();
                    // console.log(`Extracted ${key}: ${value}`);

                    if (key === 'gelaran') {
                        this.form.gelaran = [value.replace(/’/g, "'")];
                    }
                    else if (key === 'nama') {
                        this.form.nama = value;
                    }
                    else if (key === 'ic') {
                        const cleanedIc = value.replace(/[-\s]/g, '').trim();
                        this.form.ic = cleanedIc;

                        if (cleanedIc.length === 12) {
                            const lastDigit = parseInt(cleanedIc.charAt(11), 10);
                            if (!isNaN(lastDigit)) {
                                this.form.jantina = lastDigit % 2 === 1 ? 'L' : 'P';
                                // console.log(`Jantina auto-set: ${this.form.jantina === 'L' ? 'Lelaki' : 'Perempuan'}`);
                            }
                        }
                    }
                    else if (key === 'birthDate') {
                        const months = {
                            Januari: '01', Februari: '02', Mac: '03', April: '04',
                            Mei: '05', Jun: '06', Julai: '07', Ogos: '08',
                            September: '09', Oktober: '10', November: '11', Disember: '12'
                        };
                        const parts = value.split(/\s+/);
                        if (parts.length >= 3) {
                            const day = parts[0].padStart(2, '0');
                            const monthName = parts[1];
                            const year = parts[2];
                            const month = months[monthName];
                            if (month) {
                                this.form.birthDate = `${year}-${month}-${day}`;
                            }
                        }
                    }
                    else if (key === 'tarikhBersara') {
                        const dateParts = value.split(/\s+/);
                        if (dateParts.length === 3) {
                            const day = dateParts[0].padStart(2, '0');
                            const monthName = dateParts[1];
                            const year = dateParts[2];
                            const months = {
                                Januari: '01', Februari: '02', Mac: '03', April: '04',
                                Mei: '05', Jun: '06', Julai: '07', Ogos: '08',
                                September: '09', Oktober: '10', November: '11', Disember: '12'
                            };
                            const month = months[monthName];
                            if (month) {
                                this.form.tarikhBersara = `${year}-${month}-${day}`;
                            }
                        }
                    }
                    else if (key === 'tempatLahir') {
                        this.form.tempatLahir = value;
                    }
                    else if (key === 'alamat') {
                        const fullAddress = value.replace(/\s+/g, ' ').trim();

                        // Find poskod with index
                        const poskodMatch = fullAddress.match(/\b\d{5}\b/);

                        if (!poskodMatch) {
                            this.form.alamatRumah.alamat = fullAddress;
                            return;
                        }

                        const poskod = poskodMatch[0];
                        this.form.alamatRumah.poskod = poskod;

                        const poskodIndex = poskodMatch.index;

                        // EVERYTHING before poskod = alamat
                        let alamat = fullAddress.slice(0, poskodIndex).replace(/,\s*$/, '').trim();

                        // EVERYTHING after poskod
                        let after = fullAddress.slice(poskodIndex + poskod.length).trim();

                        this.form.alamatRumah.alamat = alamat;

                        if (after) {
                            const afterParts = after.replace(/^,/, '').split(',').map(p => p.trim());

                            this.form.alamatRumah.bandar = afterParts[0] || '';
                            this.form.alamatRumah.negeri = afterParts[1] || '';
                        }
                    }
                    else if (key === 'telBimbit') {
                        this.form.telBimbit = value.replace(/[-\s]/g, '');
                    }
                    else if (key === 'emel') {
                        this.form.emel = value;
                    }
                    else if (key === 'parti') {
                        const extractedParti = value.toLowerCase().trim();
                        const partiOption = this.partiOptions.find(opt =>
                            opt.singkatan?.toLowerCase() === extractedParti ||
                            opt.nama?.toLowerCase().includes(extractedParti)
                        );
                        this.form.parti = partiOption ? partiOption.id : value;
                    }
                    else if (key === 'bangsa') {
                        const extractedBangsa = value.toLowerCase().trim();
                        const bangsaOption = this.bangsaOptions.find(opt =>
                            opt.nama?.toLowerCase() === extractedBangsa ||
                            opt.singkatan?.toLowerCase() === extractedBangsa
                        );
                        this.form.bangsa = bangsaOption ? bangsaOption.id : value;
                    }
                    else if (key === 'agama') {
                        const extractedAgama = value.toLowerCase().trim();
                        const agamaOption = this.agamaOptions.find(opt =>
                            opt.nama?.toLowerCase() === extractedAgama
                        );
                        this.form.agama = agamaOption ? agamaOption.id : value;
                    }
                    // ============ ANUGERAH / PINGAT ============
                    else if (key === 'anugerah') {
                        const lines = value.split(/\n/).map(l => l.trim()).filter(Boolean);
                        const items = [];

                        lines.forEach(line => {
                            // Case 1: Numbered format e.g. "1. Darjah Setia Pangkuan Negeri (D.S.P.N.)"
                            const numberedMatch = line.match(/^\d+\.\s*([^(]+?)\s*\(\s*([^)]+?)\s*\)/i);
                            if (numberedMatch) {
                                let nama = numberedMatch[1].trim();
                                let singkatan = numberedMatch[2].trim();

                                // Optional: Clean singkatan further if needed (remove trailing dot sometimes)
                                singkatan = singkatan.replace(/\.$/, '').trim() + (singkatan.endsWith('.') ? '.' : '');

                                items.push({
                                    nama,
                                    singkatan,
                                    tahun: "",
                                    catatan: ""
                                });
                                return;
                            }

                            // Case 2: Comma-separated abbreviations e.g. "D.P.N.S, A.M.N" or "D.S.P.N., K.M.N."
                            const rawParts = line.split(/[,;]\s*/).map(p => p.trim()).filter(Boolean);

                            rawParts.forEach((part, index) => {
                                // Preserve dots — only clean problematic unicode & extra spaces around dots
                                let normalized = part
                                    .replace(/[\u2024\u2027\u2219\u00B7]/g, '.')     // Unicode middle dots → ASCII .
                                    .replace(/[\u200B\u200C\u200D]/g, '')            // Zero-width junk
                                    .replace(/\s*\.\s*/g, '.')                       // Normalize spaces around dots → no space
                                    .replace(/\s{2,}/g, ' ');                        // Collapse multiple spaces (but keep if between words)

                                // If it's purely abbreviation-like (contains dots or uppercase), use as-is for both fields
                                // Do NOT remove all spaces — only if it's a single word without dots
                                if (!normalized.includes('.') && !/[A-Z]{2,}/.test(normalized)) {
                                    normalized = normalized.replace(/\s+/g, '');  // Last resort for non-abbr
                                }

                                items.push({
                                    nama: normalized,
                                    singkatan: normalized,          // same as requested for comma case
                                    tahun: "",
                                    catatan: "",
                                    kekananan: index + 1            // keep only if you actually use this field
                                });
                            });
                        });

                        this.form.akademik.anugerah = items;
                        console.log("Parsed Anugerah:", items);
                    }
                    // ============ KELULUSAN AKADEMIK ============
                    else if (key === 'kelulusan') {
                        const lines = value
                            .split(/\s*(?:\(\w+\)|\d+\.\s*|•|\*|\+)\s*/) // added \+ to remove stray plus
                            .map(l => l.trim())
                            .filter(l => l && /[a-zA-Z]/.test(l)); // only keep lines with letters

                        const items = [];

                        lines.forEach(rawLine => {
                            let line = rawLine.trim();

                            const yearMatch = line.match(/\(\s*([^)]*?)\s*\)$/);
                            const tahun = yearMatch ? yearMatch[1].trim() : "";

                            // Remove year part
                            line = line.replace(/\s*\(\s*[^)]*?\s*\)$/, '').trim();

                            // Remove "Akademik" if present
                            line = line.replace(/\bAkademik\b/gi, '').trim();

                            if (!line) return;

                            const commaIndex = line.indexOf(',');
                            if (commaIndex === -1) {
                                items.push({
                                    program: line,
                                    institusi: "",
                                    tahun: tahun,
                                    catatan: ""
                                });
                                return;
                            }

                            const program = line.substring(0, commaIndex).trim();
                            let institusi = line.substring(commaIndex + 1).trim();
                            institusi = institusi.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();

                            items.push({
                                program: program,
                                institusi: institusi,
                                tahun: tahun,
                                catatan: ""
                            });
                        });

                        this.form.akademik.kelulusan = items;
                        // console.log("Parsed Kelulusan Akademik:", items);
                    }
                }
            });

            // // Ringkasan Perkhidmatan (unchanged)
            // if (text.includes('RINGKASAN PERKHIDMATAN')) {
            //     const serviceRegex = /(\d{2}\/\d{2}\/\d{4})\s*([\s\S]*?)(?=Halaman|\d{2}\/\d{2}\/\d{4}|$)/gi;
            //     let match;
            //     const existingEntries = this.form.dynamicFields.semasa.length;

            //     while ((match = serviceRegex.exec(text)) !== null) {
            //         const tahun = match[1].trim();
            //         let catatan = match[2].replace(/\n/g, ' ').trim();
            //         catatan = catatan.replace(/Suruhanjaya Perkhidmatan Pendidikan/g, '').trim();
            //         catatan = catatan.replace(/^Pengerusi,?\s*/, '').trim();

            //         this.form.dynamicFields.semasa.push({
            //             tahun,
            //             jawatan: 'Pengerusi',
            //             agensi: 'Suruhanjaya Perkhidmatan Pendidikan',
            //             catatan: catatan || 'Pengerusi, Suruhanjaya Perkhidmatan Pendidikan'
            //         });
            //     }

            //     if (this.form.dynamicFields.semasa.length > existingEntries) {
            //         console.log("Added service history entries:", this.form.dynamicFields.semasa);
            //     }
            // }

            this.$forceUpdate();
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
                formData.append("tarikhBersara", data.tarikhBersara ? new Date(data.tarikhBersara).toISOString().split("T")[0] : "");

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

                // Perkhidmatan: Lain-lain
                (data.lainLainField?.lainLain || []).forEach((group, i) => {
                    formData.append(`lain_lain_maklumat[${i}][nama_maklumat]`, group.kategori_nama || "");
                    (group.entries || []).forEach((entry, j) => {
                        ["tahun", "catatan"].forEach(f => {
                            formData.append(`lain_lain_maklumat[${i}][entries][${j}][${f}]`, entry[f] || "");
                        });
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
                        })),
                    },
                    lainLainField: {
                        lainLain: (data.lain_lain_maklumat ?? []).map(group => ({
                            kategori_nama: group.nama_maklumat,
                            entries: group.entries ?? []
                        }))
                    },
                    gambar: data.gambar ?? null,
                    tarikhBersara: data.tarikh_bersara || "",
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
                if (!this.form.lainLainField) this.form.lainLainField = { lainLain: [] };
                if (!Array.isArray(this.form.lainLainField.lainLain)) this.form.lainLainField.lainLain = [];

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
                    this.form.birthDate = "";
                } else {
                    if (icField) {
                        icField.isValid = true;
                        icField.validationMessage = "";
                    }
                    const fullYear = parseInt(yy) >= 50 ? "19" + yy : "20" + yy;
                    this.form.birthDate = `${fullYear}-${mm}-${dd}`;
                }

                // Auto-set Jantina from last digit
                if (ic.length === 12) {
                    const lastDigit = parseInt(ic.charAt(11), 10);
                    if (!isNaN(lastDigit)) {
                        this.form.jantina = lastDigit % 2 === 1 ? 'L' : 'P';
                    }
                }
            } else {
                if (icField) {
                    icField.isValid = null;
                    icField.validationMessage = "";
                }
                this.form.birthDate = "";
                this.form.jantina = ""; // Clear if IC incomplete
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
