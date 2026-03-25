<template>
    <Layout>
        <PageHeader :title="pageTitle" pageTitle="Pelantikan" />
        <FormWizard :steps="wizardSteps" :formData="form" :topicLabel="topicLabel" @submit="handleFormSubmit"
            :mode="isEditMode">
            <template #default="{ stepIndex }">
                <div v-if="stepIndex === 0">
                    <LayoutForm :leftFields="leftTab4" :rightFields="filteredRightTab4" v-model:form="form" />
                </div>
            </template>
        </FormWizard>
        <SweetAlert :show="alert.success" type="success" title="Berjaya!" text="Calon telah dilantik."
            @closed="alert.success = false" />

        <SweetAlert :show="alert.kemaskini" type="success" title="Berjaya!" text="Calon telah dikemaskini."
            @closed="alert.success = false" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage "
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import FormWizard from "@/components/FormWizard.vue";
// import FormField from "@/components/FormField.vue";
import LayoutForm from "@/components/LayoutForm.vue";
import { adnService } from "@/services/adn.service.js";
import { lookupService } from "@/services/lookup.service.js";
import SweetAlert from "@/components/SweetAlert.vue";

// import DynamicInputGroup from "@/components/DynamicInputGroup.vue";
// import MaklumatAkademik from "@/components/MaklumatAkademik.vue";

// function formDataToJson(formData) {
//     const obj = {};
//     for (let [key, value] of formData.entries()) {
//         obj[key] = value;
//     }
//     return obj;
// }


export default {
    components: { Layout, PageHeader, FormWizard, LayoutForm, SweetAlert },
    name: "TambahPelantikan",
    data() {
        return {
            isEditMode: "add",
            wizardSteps: [
                { title: "Maklumat Lantikan" }
            ],
            form: {
                parti: "",
                DynamicInputGroup: [""],
                DunOptions: [],
                AgongOptions: [],
                id_jenis_pelantikan: "",
            },

            //inputGroup Label for perkhidmatan
            inputGroupLabelPerkhidmatan: "Perkhidmatan",

            //4th Tab Fields
            leftTab4: [
                {
                    label: 'Kategori', type: 'select', placeholder: '- PILIH KATEGORI -', model: 'kategori', required: true, options: [
                        { label: 'Dipilih oleh Dewan Undangan Negeri', value: 'DUN' },
                        { label: 'Dilantik Yang Di-Pertuan Agong', value: 'AGONG' },
                    ]
                },
                {
                    label: 'Penggal', type: 'select', placeholder: '- PILIH PENGGAL -', model: 'penggal', required: true, options: [
                        { label: 'Pertama', value: 1 },
                        { label: 'Kedua', value: 2 },
                    ]
                },
                { label: 'Parti', type: 'select-search', placeholder: '- SILA PILIH -', model: 'parti', required: true, options: [] },

            ],
            alert: {
                success: false,
                error: false,
                kemaskini: false,
                errorMessage: '',
            },
            topicLabel: "Butiran Ahli",
        };
    },
    async mounted() {
        const id = this.$route.query.id;

        try {
            // Jalankan semua serentak
            await Promise.all([
                this.loadPartiOptions(),
                this.loadDunOptions(),
                this.loadAgongOptions(),
                this.loadJenisPelantikanID(),
            ]);

            
            if (this.$route.query.kemaskini === 'true') {
                this.isEditMode = 'update';
                if (id) await this.loadAhli(id);
            }else{
                if (id) await this.loadProfil(id);
            }

        } catch (error) {
            console.error("❌ Ralat load data:", error);
            this.alert.error = true;
        }
    },
    watch: {
        'form.kategori'(newVal) {
            if (newVal === 'AGONG') {
                this.form.negeriDun = null;
            } else if (newVal === 'DUN') {
                this.form.wilayahAgong = null;
            }
        },

        // 'form.parti'{

        // }
    },
    methods: {
        async handleFormSubmit() {
            try {
                const id = this.$route.query.id;

                const data = this.form;
                const formData = new FormData();

                for (let [key, value] of formData.entries()) {
                    if (value === "null" || value === "undefined" || value === null || value === undefined) {
                        formData.set(key, "");
                    }
                }

                formData.append('id', id);
                formData.append('kategori', data.kategori);
                formData.append('penggal', data.penggal);
                formData.append('parti', data.parti);
                formData.append('negeriDun', data.negeriDun);
                formData.append('wilayahAgong', data.wilayahAgong);

                const tarikh_lantik = data.tarikh_lantik
                    ? new Date(data.tarikh_lantik).toISOString().split('T')[0]
                    : '';

                const tarikh_tamat = data.tarikh_tamat
                    ? new Date(data.tarikh_tamat).toISOString().split('T')[0]
                    : '';

                formData.append('tarikh_lantik', tarikh_lantik);
                formData.append('tarikh_tamat', tarikh_tamat);
                formData.append('id_jenis_pelantikan', data.id_jenis_pelantikan);
                // console.log("✅ FormData ready to send:", formDataToJson(formData));


                const id_pelantikan = this.$route.query.id;

                if (this.isEditMode === 'update' && id_pelantikan) {
                    await adnService.kemaskiniAhliADN(id_pelantikan, formData);
                    this.alert.kemaskini = true;
                } else {
                    await adnService.lantikAhli(formData);
                    this.alert.success = true;
                }

                this.$router.push({ path: "/rekod-pelantikan/senarai-pelantikan/kategori/ahli-dewan-negara" });
            } catch (error) {
                // console.error("Error preparing form data:", error);
                this.alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui';
                this.alert.error = true;
                return;
            }
        },
        async loadPartiOptions() {
            try {
                const response = await lookupService.getParti();
                const partiField = this.leftTab4.find(f => f.model === 'parti');
                partiField.options = response.map(parti => ({
                    label: parti.singkatan,
                    value: parti.id
                }));

                // console.log("Parti options loaded:", partiField.options);
            } catch (err) {
                // console.error("Failed to load parti options:", err);
                this.alert.error = true;
            }
        },
        async loadDunOptions() {
            try {
                const response = await lookupService.getNegeriDUN();
                // const negeriField = this.fields.find(f => f.model === 'negeriDun');
                this.DunOptions = response.map(negeri => ({
                    label: negeri.nama,
                    value: negeri.nama
                }));

                // console.log("Negeri DUN options loaded:", this.DunOptions);
            } catch (err) {
                // console.error("Failed to load Negeri DUN options:", err);
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
                this.alert.error = true;
            }
        },
        async loadAgongOptions() {
            try {
                const response = await lookupService.getWilayahAgong();
                // const wilayahField = this.fields.find(f => f.model === 'wilayahAgong');
                this.AgongOptions = response.map(wilayah => ({
                    label: wilayah.nama,
                    value: wilayah.nama
                }));
                this.AgongOptions.push({ label: '40 Ahli Lantikan YDPA', value: 99 });

                // console.log("Wilayah Agong options loaded:", this.AgongOptions);
            } catch (err) {
                this.alert.error = true;
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';

                // console.error("Failed to load Wilayah Agong options:", err);
            }
        },
        async loadJenisPelantikanID() {
            try {
                await lookupService.getJenisPelantikan();
                this.id_jenis_pelantikan = 1 || null;

                this.form.id_jenis_pelantikan = this.id_jenis_pelantikan;
                // console.log("Jenis Pelantikan ID options loaded:", this.id_jenis_pelantikan);
            } catch (err) {
                // console.error("Failed to load Jenis Pelantikan ID options:", err);
                this.alert.error = true;
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
            }
        },
        async loadAhli(id) {
            try {
                const res = await adnService.maklumatAhliADN(id);
                const data = res.data.data;

                // this.loadProfil(data.parti);
                // console.log("✅ Profil Parti loaded:", data.parti);
            
                // Populate your form here
                this.form = {
                    kategori: data.kategori ?? null,
                    penggal: data.penggal ?? null,
                    parti: data.parti ?? null,
                    negeriDun: data.DUN ?? null,
                    wilayahAgong: data.AGONG ?? null,
                    tarikh_lantik: data.tarikh_lantik ?? null,
                    tarikh_tamat: data.tarikh_tamat ?? null,
                    id_jenis_pelantikan: data.id_lkp_jenis_pelantikan,
                };

            } catch (err) {
                // console.error("❌ Error loading profil for edit:", err);
                this.alert.error = true;
            }
        },
        async loadProfil(id) {
            const res = await lookupService.profilParti(id);

            const parti = res.data.data.parti;
            // console.log(parti.nama);
            this.form.parti = parti.id;

        }
    },
    computed: {
        pageTitle() {
            return this.isEditMode === 'update' ? 'Kemaskini Ahli Dewan Negara' : 'Lantik Ahli Dewan Negara';
        },
        filteredRightTab4() {
            const fields = [];

            if (this.form.kategori === 'DUN') {
                fields.push({ label: 'Negeri', type: 'select-search', placeholder: '- SILA PILIH -', model: 'negeriDun', required: true, options: this.DunOptions });
            }

            if (this.form.kategori === 'AGONG') {
                fields.push({ label: 'Wilayah', type: 'select-search', placeholder: '- SILA PILIH -', model: 'wilayahAgong', required: true, options: this.AgongOptions });
            }

            // Tarikh Tamat is always shown
            fields.push({ label: 'Tarikh Lantik', type: 'date', model: 'tarikh_lantik', required: true});

            fields.push({ label: 'Tarikh Tamat', type: 'date', model: 'tarikh_tamat', required: true});

            return fields;
        }
    },


};
</script>
