<template>
    <Layout>
        <PageHeader title="Lookup Keanggotaan" pageTitle="Pentadbir" />
        <EditableTable :headers="headers" :data="tableData" :TableLabel="TableLabel" @add-row="openModal"
            @row-updated="kemaskini" @delete-row="hapus" @recover-data="openRecoverModal" />

        <BModal v-model="showModal" hide-footer scrollable centered size="lg" hide-header>
            <div class="p-4 rounded">
                <div class="modal-header">
                    <h4 class="mb-3"><strong>Tambah Jawatan</strong></h4>
                    <button type="button" class="close" @click="showModal = false" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <form>
                        <div class="form-group row align-items-center mb-1" v-for="(entry, index) in data" :key="index">
                            <label class="col-1 col-form-label">{{ (index + 1) }}.</label>
                            <div class="col-4">
                                <input type="text" class="form-control text" v-model="data[index]"
                                    :placeholder="'Jawatan ' + (index + 1)" />
                            </div>
                            <!-- Kapasiti -->
                            <div class="col-2">
                                <input type="number" class="form-control text" v-model="kapasiti[index]"
                                    placeholder="Kapasiti" min="1" />
                            </div>
                            <div class="col-4">
                                <Multiselect v-if="PelantikanOptions.length" v-model="id_lkp_jenis_pelantikan[index]"
                                    :options="PelantikanOptions" :searchable="true" :object="true"
                                    :close-on-select="true" placeholder="Jenis Pelantikan" label="label"
                                    track-by="label" class="select-search" />
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
                                <th style="width: 5%;">
                                    <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                                </th>
                                <th style="width: 5%;">ID</th>
                                <th style="width: 30%;">Jawatan</th>
                                <th style="width: 60px;">Jenis Pelantikan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredDeletedData" :key="item.id">
                                <td>
                                    <input type="checkbox" :value="item.id" v-model="selectedRecovery">
                                </td>
                                <td>{{ item.id }}</td>
                                <td>{{ item.nama }}</td>
                                <td>{{this.PelantikanOptions.find(n => n.value === item.id_lkp_jenis_pelantikan)?.label
                                    || '—'}}</td>
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
    data() {
        return {
            headers: [
                { name: 'Kod', align: 'center', bold: true, width: 10, editable: false },
                { name: 'Jenis Pelantikan', align: 'center', bold: true, width: 20, editable: false },
                { name: 'Jawatan', align: 'left', bold: true, width: 30, editable: true },
                { name: 'kapasiti', align: 'center', bold: true, width: 10, editable: true },
                { name: 'Status', align: 'center', bold: true, width: 10, editable: true },
            ],
            TableLabel: 'Senarai Jawatan',
            tableData: [],
            data: [''],
            kapasiti: [],
            id_lkp_jenis_pelantikan: [],
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
            selectAll: false,

            shouldReloadOnSuccess: false,

            jenisPelantikanList: [{}],
        }
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
                const rawData = await lookupService.getJawatan();
                // console.log(this.PelantikanOptions);

                this.tableData = rawData.map(item => ({
                    id: item.id,
                    fields: [
                        { value: item.kod },
                        {
                            value: this.PelantikanOptions.find(n => n.value === item.id_lkp_jenis_pelantikan)?.label || '—',
                            type: 'select',
                            options: this.PelantikanOptions.map(n => ({
                                value: n.label, // store/display label as value
                                label: n.label  // display label in dropdown
                            }))
                        },
                        { value: item.nama },
                        { value: item.kapasiti || 0 },
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


                // Prepare structured data [{ nama, id }]
                const entries = this.data.map((nama, index) => ({
                    nama,
                    kapasiti: this.kapasiti[index] || 0,
                    id_lkp_jenis_pelantikan: this.id_lkp_jenis_pelantikan[index].value
                }));

                const payload = { data: entries };
                const response = await lookupService.tambahJawatan(payload);

                this.showModal = false;
                this.data = [''];
                this.kapasiti = [0];
                this.id_lkp_jenis_pelantikan = [''];


                const newData = response.data?.inserted || [];

                const updatedTable = [...this.tableData];
                newData.forEach(item => {
                    updatedTable.push({
                        fields: [
                            { value: item.id_lkp_jenis_pelantikan },
                            { value: item.nama },
                            { value: item.kapasiti },
                            { value: item.aktif == 1 ? 'Aktif' : 'Tidak Aktif' },
                        ]
                    });
                });

                // this.tableData = updatedTable;
                this.successMessage = "✅ Pelantikan berjaya disimpan!";
                this.shouldReloadOnSuccess = true;
                this.showSuccessModal = true;

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
            const id = row.id;
            let kod = row.fields[0].value;

            // row.fields[1].value = label
            const label = row.fields[1].value;

            // Cari option berdasarkan label
            const PelantikanOption =
                this.PelantikanOptions.find(n => n.label === label);

            // Jika jumpa, ambil value (id sebenar)
            const id_lkp_jenis_pelantikan = PelantikanOption
                ? PelantikanOption.value
                : null;

            const nama = row.fields[2].value;
            const kapasiti = row.fields[3].value || 0;
            const aktif = row.fields[4].value === 'Aktif' ? 1 : 0;

            try {
                await lookupService.kemaskiniJawatan(id, {
                    kod,
                    id_lkp_jenis_pelantikan,
                    nama,
                    kapasiti,
                    aktif
                });

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
                    await lookupService.hapusJawatan(id);
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
                const response = await lookupService.getDeletedJawatan(); // You must create this endpoint
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

                await lookupService.pulihJawatan({ ids: this.selectedRecovery });
                this.successMessage = '✅ Data berjaya dipulihkan!';
                this.shouldReloadOnSuccess = true;
                this.showRecoverModal = false;
                this.showSuccessModal = true;
            } catch (err) {
                console.error("❌ Gagal Pulih Data:", err);
                alert("Gagal memulihkan data.");
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
                await lookupService.hapusKekalJawatan({ ids: this.selectedRecovery });
                this.successMessage = '✅ Data berjaya dihapuskan secara kekal!';
                this.showRecoverModal = false;
                this.showConfirmModal = false;
                this.showSuccessModal = true;
            } catch (err) {
                console.error("❌ Gagal Hapus Data:", err);
                alert("Gagal menghapuskan data.");
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
        async loadJenisPelantikanList() {
            try {
                const rawData = await lookupService.getSenaraiJenisPelantikan();
                // console.log("Jenis Pelantikan List:", rawData);
                this.jenisPelantikanList = rawData || [];
            } catch (error) {
                console.error("❌ Gagal ambil senarai Pelantikan Gabungan:", error);
            }
        },

    },
    async mounted() {
        await this.loadJenisPelantikanList();
        this.loadData();
    },
    computed: {
        filteredDeletedData() {
            const term = this.searchTerm.toLowerCase();
            return this.deletedData.filter(item =>
                item.nama.toLowerCase().includes(term)
            );
        },
        PelantikanOptions() {
            return this.jenisPelantikanList.map(n => ({
                value: n.value,
                label: n.label,
            }));


        },

    }
}
</script>

<style>
.text {
    height: 42px;
}

.select-search {
    width: 100% !important;
    font-size: small;
    padding: 0 !important;
}
</style>