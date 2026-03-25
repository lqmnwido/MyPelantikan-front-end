<template>
    <Layout>
        <PageHeader title="Lookup Poskod" pageTitle="Pentadbir" />
        <EditableTable :headers="headers" :data="tableData" :TableLabel="TableLabel" @add-row="openModal"
            @row-updated="kemaskini" @delete-row="hapus" @recover-data="openRecoverModal" />

        <BModal v-model="showModal" hide-footer scrollable centered size="lg" hide-header>
            <div class="p-4 rounded">
                <div class="modal-header">
                    <h4 class="mb-3"><strong>Tambah Poskod</strong></h4>
                    <button type="button" class="close" @click="showModal = false" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <form>
                        <div class="form-group row align-items-center mb-1" v-for="(entry, index) in data" :key="index">
                            <label class="col-1 col-form-label">{{ (index + 1) }}.</label>
                            <div class="col-6">
                                <input type="text" class="form-control" style="height: 42px;" maxlength="5"
                                    v-model="data[index].kod" :placeholder="'Poskod ' + (index + 1)"
                                    @input="onlyDigits(index)" />
                            </div>
                            <div class="col-4">
                                <Multiselect v-if="bandarOptions.length" v-model="data[index].id_lkp_bandar"
                                    :options="bandarOptions" :searchable="true" :object="true" :close-on-select="true"
                                    placeholder="Sila Pilih" label="label" track-by="label" class="select-search" />
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
                                <th>Nama</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredDeletedData" :key="item.id">
                                <td>
                                    <input type="checkbox" :value="item.id" v-model="selectedRecovery">
                                </td>
                                <td>{{ item.id }}</td>
                                <td>{{ item.kod }}</td>
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
import Multiselect from '@vueform/multiselect';
import { lookupService } from '@/services/lookup.service'

export default {
    components: {
        Layout,
        PageHeader,
        EditableTable,
        Multiselect
    },
    data() {
        return {
            headers: [
                { name: 'ID', align: 'center', bold: true, width: 10, editable: false },
                { name: 'Kod', align: 'left', bold: true, width: 30, editable: true },
                { name: 'Bandar', align: 'center', bold: true, width: 35, editable: true },
                { name: 'Status', align: 'center', bold: true, width: 10, editable: true },
            ],
            TableLabel: 'Senarai Poskod',
            tableData: [],
            data: [{ kod: '', id_lkp_bandar: '' }],
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

            bandarList: [{ id: null, nama: 'Memuat...' }],
        }
    },
    methods: {
        add() {
            // this.data.push('');
            this.data.push({ kod: '', id_lkp_bandar: '' });
        },
        remove(index) {
            this.data.splice(index, 1);
        },
        openModal() {
            this.data = [{ kod: '', id_lkp_bandar: '' }]; // Reset form
            this.showModal = true;
        },
        async loadData() {
            try {
                // const response = await lookupService.getPoskod();
                const rawData = await lookupService.getPoskod(); // already .data
                // console.log("📦 Received Poskod:", rawData);
                // const rawData = response?.data || [];

                this.tableData = rawData.map(item => ({
                    fields: [
                        { value: item.id },
                        { value: item.kod },
                        {
                            value: this.bandarOptions.find(n => n.value === item.id_lkp_bandar)?.label || '—',
                            type: 'select',
                            options: this.bandarOptions.map(n => ({
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
                const payload = {
                    data: this.data.map(entry => ({
                        kod: entry.kod,
                        id_lkp_bandar: entry.id_lkp_bandar?.value || null,
                    }))
                };
                const response = await lookupService.tambahPoskod(payload);

                this.showModal = false;
                this.data = [{ kod: '', id_lkp_bandar: '' }]; // Reset input

                // Append new data manually, avoid DOM issue
                const newData = response.data?.Poskod || [];
                const updatedTable = [...this.tableData];

                newData.forEach(item => {
                    updatedTable.push({
                        fields: [
                            { value: item.id },
                            { value: item.kod },

                        ]
                    });
                });
                // alert("✅ Poskod berjaya disimpan!");
                this.successMessage = "✅ Poskod berjaya disimpan!";
                this.shouldReloadOnSuccess = true;
                this.showSuccessModal = true;
                // window.location.reload();
                // this.tableData = updatedTable; // Vue reactivity will update the DOM safely
            } catch (error) {
                console.error("❌ Gagal Simpan Data:", error);
                if (error.response?.data?.errors) {
                    alert("Ralat: " + JSON.stringify(error.response.data.errors));
                } else {
                    alert("Ralat semasa menghantar data.");
                }
            }
        },
        async kemaskini({ row }) {
            const id = row.fields[0].value;
            const kod = row.fields[1].value;

            let id_lkp_bandar = row.fields[2].value;
            const bandarOption = this.bandarOptions.find(n => n.label === id_lkp_bandar);
            if (bandarOption) {
                id_lkp_bandar = bandarOption.value;
            }

            const aktif = row.fields[3].value === 'Aktif' ? 1 : 0;
            try {
                await lookupService.kemaskiniPoskod(id, { kod, id_lkp_bandar, aktif });

                // const bandarLabelUpdated = this.bandarOptions.find(n => n.value === response.data.id_lkp_bandar)?.label || '—';

                this.successMessage = "✅ Data berjaya dikemaskini!";
                this.shouldReloadOnSuccess = false;
                this.showSuccessModal = true;
            } catch (err) {
                if (err.response && err.response.status === 422) {
                    // Laravel returned validation error or duplicate name
                    const message = err.response.data.message || 'Ralat tidak diketahui.';
                    alert("⚠️ " + message);
                } else {
                    console.error("❌ Gagal Kemaskini Data:", err);
                    alert("❌ Ralat semasa mengemaskini data.");
                }
            }

            // window.location.reload();
        },
        async hapus({ id }) {
            this.confirmTitle = 'Pengesahan Hapus';
            this.confirmMessage = 'Adakah anda pasti untuk menghapus data ini?';
            this.confirmAction = async () => {
                try {
                    await lookupService.hapusPoskod(id);
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
                const response = await lookupService.getDeletedPoskod(); // You must create this endpoint
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

                await lookupService.pulihPoskod({ ids: this.selectedRecovery });
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
        async loadBandarList() {
            try {
                const rawData = await lookupService.getBandar();
                this.bandarList = rawData || [];
            } catch (error) {
                console.error("❌ Gagal ambil senarai bandar:", error);
            }
        },
        onlyDigits(index) {
            const value = this.data[index].kod.toString().replace(/\D/g, '').slice(0, 5);
            this.data[index].kod = value;
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
                await lookupService.hapusKekalPoskod({ ids: this.selectedRecovery });
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
        this.loadBandarList();
        await this.loadData();
    },
    computed: {
        filteredDeletedData() {
            const term = this.searchTerm.toLowerCase();
            return this.deletedData.filter(item =>
                String(item.kod).toLowerCase().includes(term)
            );
        },
        bandarOptions() {
            return this.bandarList.map(n => ({
                value: n.id,
                label: n.nama,
            }));


        },
    }
}
</script>

<style>
.select-search {
    width: 100% !important;
    font-size: small;
    padding: 0 !important;
}
</style>