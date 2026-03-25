<template>
    <Layout>
        <PageHeader title="Lookup Parti" pageTitle="Pentadbir" />
        <EditableTable :headers="headers" :data="tableData" :TableLabel="TableLabel" @add-row="openModal"
            @row-updated="kemaskini" @delete-row="hapus" @recover-data="openRecoverModal" />

        <BModal v-model="showModal" hide-footer scrollable centered size="lg" hide-header>
            <div class="p-4 rounded">
                <div class="modal-header">
                    <h4 class="mb-3"><strong>Tambah Parti</strong></h4>
                    <button type="button" class="close" @click="showModal = false" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <form>
                        <div class="form-group row align-items-center mb-1" v-for="(entry, index) in data" :key="index">
                            <label class="col-1 col-form-label">{{ (index + 1) }}.</label>
                            <div class="col-1">
                                <div class="image-upload-wrapper">
                                    <label :for="'image-upload-' + index" class="d-block">
                                        <img v-if="previewImage[index]" :src="previewImage[index]" class="rounded"
                                            style="height: 40px; width: 50px;" />
                                        <div v-else
                                            class="d-flex align-items-center justify-content-center bg-light rounded"
                                            style="height: 45px; font-size:2rem; color:#aaa;">
                                            <i class="mdi mdi-image"></i>
                                        </div>
                                    </label>
                                    <input :id="'image-upload-' + index" type="file" accept="image/*"
                                        @change="handleImageUpload(index, $event)" class="d-none" />
                                    <button v-if="previewImage[index]" @click.prevent="removeImage(index)"
                                        class="btn btn-sm btn-danger remove-image-btn">&times;</button>
                                </div>
                            </div>
                            <div class="col-4">
                                <input type="text" class="form-control input" v-model="data[index]"
                                    :placeholder="' Parti ' + (index + 1)" />
                            </div>
                            <div class="col-2">
                                <input type="text" class="form-control input" v-model="singkatan[index]"
                                    :placeholder="'Singkatan'" />
                            </div>
                            <div class="col-3">
                                <Multiselect v-if="gabunganOptions.length" v-model="id_lkp_parti_gabungan[index]"
                                    :options="gabunganOptions" :searchable="true" :object="true" :close-on-select="true"
                                    placeholder="Parti Gabungan" label="label" track-by="label" class="select-search" />
                            </div>
                            <div class="col-1 text-end">
                                <button type="button" class="btn btn-danger btn-sm" @click="remove(index)"
                                    v-if="data.length > 1">
                                    x
                                </button>
                            </div>

                            <div class="text-start py-2" style="padding-left:70px" v-if="index === data.length - 1">
                                <button type="button" class="btn btn-success btn-sm" @click="add">+</button>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Tutup</button>
                    <button type="button" class="btn btn-primary" @click="simpan">Simpan</button>
                </div>
            </div>
        </BModal>

        <!-- Confirmation Modal -->
        <BModal v-model="showConfirmModal" hide-footer hide-header centered>
            <h4 class="mb-3 mt-3"><strong>{{ confirmTitle }}</strong></h4>

            <div>{{ confirmMessage }}</div>
            <div class="modal-footer">
                <button class="btn btn-secondary" @click="showConfirmModal = false">Batal</button>
                <button class="btn btn-danger" @click="confirmAction">Ya, Teruskan</button>
            </div>
        </BModal>

        <!-- Success Modal -->
        <BModal v-model="showSuccessModal" hide-footer hide-header centered>
            <h4 class="mb-3 mt-3"><strong>Berjaya</strong></h4>
            <div class="modal-body">
                <div>{{ successMessage }}</div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" @click="handleSuccessOk">OK</button>
            </div>
        </BModal>

        <!-- Recover Modal -->
        <BModal v-model="showRecoverModal" hide-footer hide-header centered size="lg">
            <h4 class="mb-3 mt-3"><strong>Pulih Data Yang Terhapus</strong></h4>
            <div class="modal-body">
                <div v-if="deletedData.length === 0">Tiada data terhapus.</div>
                <div v-else>
                    <div class="mb-3">
                        <input v-model="searchTerm" type="text" class="form-control" placeholder="Carian..." />
                    </div>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th style="width: 10%;">
                                    <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                                </th>
                                <th style="width: 30px;">ID</th>
                                <th>Singkatan</th>
                                <th>Nama</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredDeletedData" :key="item.id">
                                <td>
                                    <input type="checkbox" :value="item.id" v-model="selectedRecovery">
                                </td>
                                <td>{{ item.id }}</td>
                                <td>{{ item.singkatan }}</td>
                                <td>{{ item.nama }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" @click="showRecoverModal = false">Tutup</button>
                <button v-if="deletedData.length > 0" class="btn btn-danger" @click="hapusKekal">Hapus Kekal</button>
                <button v-if="deletedData.length > 0" class="btn btn-success" @click="pulihkan">Pulih</button>
            </div>
        </BModal>

    </Layout>
</template>

<script>
import Layout from '@/layouts/main.vue'
import PageHeader from '@/components/page-header.vue'
import EditableTable from '@/components/EditableTable.vue'
import { lookupService } from '@/services/lookup.service'
import Multiselect from '@vueform/multiselect';

export default {
    components: {
        Layout,
        PageHeader,
        EditableTable,
        Multiselect,
    },
    props: {
        modelValue: {
            type: [Array],
            default: () => [],
        },
    },
    data() {
        return {
            previewImage: [],
            uploadedFile: null,
            headers: [
                { name: 'ID', align: 'center', bold: true, width: 5, editable: false },
                { name: 'Logo', align: 'center', width: 10, editable: true, gambar: true },
                { name: 'Singkatan', align: 'center', bold: true, width: 10, editable: true },
                { name: 'Nama', align: 'left', bold: true, width: 40, editable: true },
                { name: 'Parti Gabungan', align: 'center', bold: true, width: 10, editable: true },
                { name: 'Status', align: 'center', bold: true, width: 10, editable: true },
            ],
            TableLabel: 'Senarai Parti',
            tableData: [],
            data: [''],
            bendera: [''],
            singkatan: [''],
            id_lkp_parti_gabungan: [],
            showModal: false,

            showConfirmModal: false,
            confirmMessage: '',
            confirmTitle: 'Pengesahan',
            confirmAction: null,

            showSuccessModal: false,
            successMessage: '',

            showRecoverModal: false,
            searchTerm: '',
            deletedData: [],
            selectedRecovery: [],

            shouldReloadOnSuccess: false,

            gabunganPartiList: [{ id: null, nama: '' }],
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(newVal) {
                if (Array.isArray(newVal)) {
                    this.previewImage = [];
                    newVal.forEach((file, index) => {
                        if (typeof file === 'string') {
                            this.$set(this.previewImage, index, file); // backend image URL
                        } else if (file instanceof File) {
                            this.readImageFile(file, index); // uploaded file
                        } else {
                            this.$set(this.previewImage, index, null); // clear if neither
                        }
                    });
                    // this.previewImage = [newVal]; // backend image URL
                } else if (newVal instanceof File) {
                    this.readImageFile(newVal); // uploaded file
                }

            },
        },
        // modelValue: {
        //     immediate: true,
        //     handler(newVal) {
        //         if (typeof newVal === 'string') {
        //             this.previewImage = newVal; // backend image URL
        //         } else if (newVal instanceof File) {
        //             this.readImageFile(newVal); // uploaded file
        //         }

        //     },
        // },
    },
    methods: {
        add() {
            this.data.push('');
        },
        remove(index) {
            this.data.splice(index, 1);
        },
        openModal() {
            this.showModal = true;
            this.editIndex = null;
            this.modalData = {
                id: null,
                nama: '',
                aktif: '1',
            };
        },
        async loadData() {
            try {
                const rawData = await lookupService.getParti();

                this.tableData = rawData.map(item => ({
                    fields: [
                        { value: item.id },
                        { value: item.bendera },
                        { value: item.singkatan },
                        { value: item.nama },
                        {
                            value: this.gabunganOptions.find(n => n.value === item.id_lkp_parti_gabungan)?.label || '—',
                            type: 'select',
                            options: this.gabunganOptions.map(n => ({
                                value: n.label, // store/display label as value
                                label: n.label  // display label in dropdown
                            }))
                        },
                        {
                            value: item.aktif == 1 ? 'Aktif' : 'Tidak Aktif',
                            type: 'select',
                            options: [
                                { value: 'Aktif', label: 'Aktif' },
                                { value: 'Tidak Aktif', label: 'Tidak Aktif' }
                            ]
                        },
                    ]
                }));
            } catch (err) {
                console.error("❌ Failed to load Data:", err);
                this.tableData = [];
            }
        },
        async simpan() {
            try {
                const formData = new FormData();

                this.data.forEach((nama, index) => {
                    formData.append(`data[${index}][nama]`, nama);
                    formData.append(`data[${index}][singkatan]`, this.singkatan[index] || nama);
                    formData.append(`data[${index}][id_lkp_parti_gabungan]`, this.id_lkp_parti_gabungan[index]?.value || '');

                    if (this.bendera[index]) {
                        formData.append(`data[${index}][bendera]`, this.bendera[index]);
                    }
                });

                const response = await lookupService.tambahParti(formData);

                this.showModal = false;
                this.data = [''];
                this.bendera = [''];
                this.singkatan = [''];
                this.id_lkp_parti_gabungan = [];

                this.successMessage = "✅ " + response.data.message;
                this.shouldReloadOnSuccess = true;
                this.showSuccessModal = true;
            } catch (error) {
                console.error("❌ Gagal Simpan Data:", error);

                if (error.response) {
                    const statusCode = error.response.status;
                    const serverMessage = error.response.data.message || 'Ralat tidak diketahui.';

                    if (statusCode === 409) {
                        alert("⚠️ Konflik Data: " + serverMessage);
                        this.showModal = false;
                        this.loadData(); // Reload table to reflect any inserted data
                        return; // Stop execution
                    }

                    // 4. Handle other known errors (like 422 validation errors if you add them)
                    if (statusCode === 422) {
                        alert("⚠️ Ralat Pengesahan: " + serverMessage);
                        return;
                    }

                    // 5. For 500 or other unhandled errors
                    alert(`❌ Ralat Pelayan (${statusCode}): ${serverMessage}`);

                } else {
                    // 6. Network/Unknown error
                    alert("Ralat semasa menghantar data. Sila semak sambungan internet anda.");
                }
            }
        },
        async kemaskini({ row }) {
            const id = row.fields[0].value;
            const logoField = row.fields[1];
            const singkatan = row.fields[2].value;
            const nama = row.fields[3].value;
            let id_lkp_parti_gabungan = row.fields[4].value;
            const gabunganOption = this.gabunganOptions.find(n => n.label === id_lkp_parti_gabungan);
            if (gabunganOption) {
                id_lkp_parti_gabungan = gabunganOption.value;
            }
            const aktif = row.fields[5].value === 'Aktif' ? 1 : 0;

            const formData = new FormData();
            formData.append('nama', nama);
            formData.append('singkatan', singkatan);
            formData.append('id_lkp_parti_gabungan', id_lkp_parti_gabungan || '');
            formData.append('aktif', aktif);

            if (logoField.file) {
                formData.append('bendera', logoField.file);
            }

            formData.append('_method', 'PUT');

            console.log("--- Debugging FormData ---");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
            console.log("--------------------------");

            try {
                // The service call now sends FormData
                await lookupService.kemaskiniParti(id, formData);

                this.successMessage = "✅ Data berjaya dikemaskini!";
                this.shouldReloadOnSuccess = false;
                this.showSuccessModal = true;

            } catch (err) {
                console.error("❌ Gagal Kemaskini Data:", err);
                alert("❌ Ralat semasa mengemaskini data.");
            }
        },
        async hapus({ id }) {
            this.confirmTitle = 'Pengesahan Hapus';
            this.confirmMessage = 'Adakah anda pasti untuk menghapus data ini?';
            this.confirmAction = async () => {
                try {
                    await lookupService.hapusParti(id);
                    // this.tableData.splice(index, 1);
                    this.showConfirmModal = false;
                    this.successMessage = '✅ Data berjaya dihapuskan!';
                    this.showSuccessModal = true;
                } catch (err) {
                    console.error("❌ Gagal Hapus Data:", err);
                    this.showConfirmModal = false;
                    this.successMessage = '❌ Ralat semasa menghapus data.';
                    this.showSuccessModal = true;
                }
            };
            this.showConfirmModal = true;
        },
        async openRecoverModal() {
            try {
                const response = await lookupService.getDeletedParti(); // You must create this endpoint
                this.deletedData = response || [];
                this.selectedRecovery = [];
                this.showRecoverModal = true;
            } catch (err) {
                console.error("❌ Gagal ambil data terhapus:", err);
                alert("Gagal mengambil data terhapus.");
            }
        },
        async pulihkan() {
            try {
                if (!this.selectedRecovery.length) {
                    alert("Sila pilih data untuk dipulihkan.");
                    return;
                }

                await lookupService.pulihParti({ ids: this.selectedRecovery });
                this.successMessage = '✅ Data berjaya dipulihkan!';
                this.shouldReloadOnSuccess = true;
                this.showRecoverModal = false;
                this.showSuccessModal = true;
            } catch (err) {
                console.error("❌ Gagal Pulih Data:", err);
                alert("Gagal memulihkan data.");
            }
        },
        handleSuccessOk() {
            this.showSuccessModal = false;
            if (this.shouldReloadOnSuccess) {
                window.location.reload();
            } else {
                this.loadData();
            }
        },
        async loadPartiGabunganList() {
            try {
                const rawData = await lookupService.getPartiGabungan();
                this.gabunganPartiList = rawData || [];
            } catch (error) {
                console.error("❌ Gagal ambil senarai Parti Gabungan:", error);
            }
        },
        handleImageUpload(index, event) {
            const file = event.target.files[0];
            if (file) {
                // store actual file for backend
                this.bendera[index] = file;

                // preview image
                this.readImageFile(file, index);
            }
        },

        readImageFile(file, index) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewImage[index] = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        removeImage(index) {
            this.previewImage[index] = null;
            this.bendera[index] = null;

            // Reset the file input to allow re-selecting the same file
            const fileInput = document.getElementById('image-upload-' + index);
            if (fileInput) {
                fileInput.value = null;
            }
        },
        toggleSelectAll() {
            if (this.selectAll) {
                this.selectedRecovery = this.filteredDeletedData.map(item => item.id);
            } else {
                this.selectedRecovery = [];
            }
        },

        async hapusKekal() {
            if (!this.selectedRecovery.length) {
                alert("Sila pilih data untuk dihapuskan.");
                return;
            }
            this.confirmTitle = 'Hapus Kekal';
            this.confirmMessage = 'Adakah anda pasti untuk menghapus data ini secara kekal? Tindakan ini tidak boleh dibatalkan.';
            this.confirmAction = this.confirmHapusKekal;
            this.showConfirmModal = true;
        },
        async confirmHapusKekal() {
            try {
                await lookupService.hapusKekalParti({ ids: this.selectedRecovery });
                this.successMessage = '✅ Data berjaya dihapuskan secara kekal!';
                this.showRecoverModal = false;
                this.showConfirmModal = false;
                this.showSuccessModal = true;
            } catch (err) {
                console.error("❌ Gagal Hapus Data:", err);
                alert("Gagal menghapuskan data.");
            }
        },
    },
    async mounted() {
        await this.loadPartiGabunganList();
        this.loadData();
    },
    computed: {
        filteredDeletedData() {
            const term = this.searchTerm.toLowerCase();
            return this.deletedData.filter(item =>
                item.nama.toLowerCase().includes(term)
            );
        },
        gabunganOptions() {
            return this.gabunganPartiList.map(n => ({
                value: n.id,
                label: n.singkatan,
            }));


        },

    }
}
</script>

<style>
.input {
    height: 42px;
}

.select-search {
    width: 100% !important;
    font-size: small;
    padding: 0 !important;
}


.image-upload-wrapper {
    position: relative;
    width: 60px;
    height: 45px;
    max-width: 50px;
}

.remove-image-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    border-radius: 50%;
    width: 15px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
    z-index: 10;
}

@media (max-width: 768px) {
    .image-upload-wrapper {
        max-width: 80px;
        /* allow bigger touch target on small screens */
    }
}

.image-upload-wrapper:hover {
    box-shadow: 0 0 0 3px #ddd;
}


.image-upload-label {
    margin-bottom: -1px;
    display: block;
    width: 42px;
    height: 42px;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.2s ease-in-out;
}

.image-upload-label:hover {
    box-shadow: 0 0 0 3px #ddd;
}

.profile-image-modern {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.profile-placeholder-modern {
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    font-size: 2rem;
    color: #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>