<template>
  <Layout>
    <PageHeader title="Lookup Pelantikan" pageTitle="Pentadbir" />
    <EditableTable :headers="headers" :data="tableData" :TableLabel="TableLabel" @add-row="openModal"
      @row-updated="kemaskini" @delete-row="hapus" @recover-data="openRecoverModal" />

    <BModal v-model="showModal" hide-footer scrollable centered size="lg" hide-header>
      <div class="p-4 rounded">
        <div class="modal-header">
          <h4 class="mb-3"><strong>Tambah Jenis Pelantikan</strong></h4>
          <button type="button" class="close" @click="showModal = false" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <form>
            <div class="form-group mb-2" v-for="(entry, index) in data" :key="index">
              <div class="row g-2 align-items-center">
                <!-- Number -->
                <div class="col-auto text-end" style="width: 40px;">
                  <label class="col-form-label fw-bold">{{ index + 1 }}.</label>
                </div>

                <!-- Nama Pelantikan -->
                <div class="col">
                  <input type="text" class="form-control text" v-model="data[index]"
                    :placeholder="'Nama Pelantikan ' + (index + 1)" />
                </div>
                <!-- Kategori Pelantikan -->
                <div class="col" style="min-width: 200px;">
                  <Multiselect v-if="kategoriOptions.length" v-model="id_lkp_kategori_pelantikan[index]"
                    :options="kategoriOptions" :searchable="true" :object="true" :close-on-select="true"
                    placeholder="Kategori Pelantikan" label="label" track-by="label" class="select-search" />
                </div>

                <!-- Delete Button -->
                <div class="col-auto">
                  <button type="button" class="btn btn-danger btn-sm" @click="remove(index)"
                    v-if="data.length > 1">x</button>
                </div>

                <!-- Add Button (only last row) -->
                <div class="text-start py-2" style="padding-left:44px" v-if="index === data.length - 1">
                  <button type="button" class="btn btn-success btn-sm" @click="add">+</button>
                </div>
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
      <h4 class="mb-3 mt-3"><strong>{{ successTitle }}</strong></h4>
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
  data() {
    return {
      headers: [
        { name: 'Kod', align: 'center', bold: true, width: 10, editable: 'split' },
        { name: 'Kategori', align: 'center', bold: true, width: 10, editable: true },
        { name: 'Pelantikan', align: 'left', bold: true, width: 55, editable: true },
        { name: 'Status', align: 'center', bold: true, width: 10, editable: true },
      ],
      TableLabel: 'Senarai Jenis Pelantikan',
      tableData: [],
      data: [''],
      kekananan: [''],
      id_lkp_kategori_pelantikan: [],
      showModal: false,

      showConfirmModal: false,
      confirmMessage: '',
      confirmTitle: 'Pengesahan',
      confirmAction: null,

      showSuccessModal: false,
      successMessage: '',
      successTitle: 'Berjaya',

      shouldReloadOnSuccess: false,

      showRecoverModal: false,
      searchTerm: '',
      deletedData: [],
      selectedRecovery: [],

      kategoriPelantikanList: [{ id: null, nama: '' }],
    }
  },
  methods: {
    add() {
      this.data.push('');
      this.kekananan.push('');
    },
    remove(index) {
      this.data.splice(index, 1);
      this.kekananan.splice(index, 1);
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
        const rawData = await lookupService.getJenisPelantikan();

        this.tableData = rawData.map(item => ({
          id: item.id,
          fields: [
            { value: item.kod },
            {
              value: this.kategoriOptions.find(n => n.value === item.id_lkp_kategori_pelantikan)?.label || '—',
              type: 'select',
              options: this.kategoriOptions.map(n => ({
                value: n.label, // store/display label as value
                label: n.label  // display label in dropdown
              }))
            },
            { value: item.nama },
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
        const entries = this.data.map((nama, index) => ({
          nama,
          kekananan: this.kekananan[index],
          id_lkp_kategori_pelantikan: this.id_lkp_kategori_pelantikan[index]?.value
        }));

        const payload = { data: entries };
        const response = await lookupService.tambahJenisPelantikan(payload);

        const inserted = response.data?.inserted || [];
        const skipped = response.data?.skipped || [];

        // ✅ Check if any new data inserted
        if (inserted.length === 0) {
          this.showModal = false;
          this.successTitle = "Ralat";
          this.successMessage = `❌ Tiada data dimasukkan (${skipped} telah wujud atau tidak sah).`;
          this.showSuccessModal = true;
          return;
        }

        // Reset input fields
        this.showModal = false;
        this.data = [''];
        this.kekananan = [];
        this.id_lkp_kategori_pelantikan = [];

        // ✅ Success message only if something was inserted
        this.successMessage = "✅ Jenis pelantikan berjaya disimpan!";
        this.shouldReloadOnSuccess = true;
        this.showSuccessModal = true;

      } catch (error) {
        console.error("❌ Gagal Simpan Data:", error);
        if (error.response?.data?.errors) {
          alert("Ralat: " + JSON.stringify(error.response.data.errors));
        } else {
          alert("❌ Ralat semasa menghantar data.");
        }
      }
    },
    async kemaskini({ row }) {
      const id = row.id;
      const newKodValue = row.fields[0].value;
      const numberPartMatch = newKodValue.match(/\d+$/);
      const kekananan = numberPartMatch ? parseInt(numberPartMatch[0]) : null;

      // const id_lkp_kategori_pelantikan = row.fields[3].value;
      let id_lkp_kategori_pelantikan = row.fields[1].value;
      const kategoriOption = this.kategoriOptions.find(n => n.label === id_lkp_kategori_pelantikan);
      if (kategoriOption) {
        id_lkp_kategori_pelantikan = kategoriOption.value;
      }

      const nama = row.fields[2].value;

      const aktif = row.fields[3].value === 'Aktif' ? 1 : 0;

      try {
        await lookupService.kemaskiniJenisPelantikan(id, {
          kekananan,
          id_lkp_kategori_pelantikan,
          nama,
          aktif
        });

        this.successMessage = "✅ Data berjaya dikemaskini!";
        this.shouldReloadOnSuccess = false;
        this.showSuccessModal = true;

      } catch (err) {
        if (err.response && err.response.status === 422) {
          const message = err.response.data.message || 'Ralat tidak diketahui.';
          this.successTitle = "Ralat";
          this.successMessage = "⚠️ " + message;
          this.showSuccessModal = true;
          // window.location.reload();
        } else {
          console.error("❌ Gagal Kemaskini Data:", err);
          alert("❌ Ralat semasa mengemaskini data.");
        }
      }
    },
    async hapus({ id }) {
      this.confirmTitle = 'Pengesahan Hapus';
      this.confirmMessage = 'Adakah anda pasti untuk menghapus data ini?';
      this.confirmAction = async () => {
        try {
          await lookupService.hapusJenisPelantikan(id);
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
        const response = await lookupService.getDeletedJenisPelantikan(); // You must create this endpoint
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

        await lookupService.pulihJenisPelantikan({ ids: this.selectedRecovery });
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
    async loadKategoriPelantikanList() {
      try {
        const rawData = await lookupService.getKategoriPelantikan();
        this.kategoriPelantikanList = rawData || [];
      } catch (error) {
        console.error("❌ Gagal ambil senarai Pelantikan Gabungan:", error);
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
        await lookupService.hapusKekalJenisPelantikan({ ids: this.selectedRecovery });
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
    await this.loadKategoriPelantikanList();
    this.loadData();
  },
  computed: {
    filteredDeletedData() {
      const term = this.searchTerm.toLowerCase();
      return this.deletedData.filter(item =>
        item.nama.toLowerCase().includes(term)
      );
    },
    kategoriOptions() {
      return this.kategoriPelantikanList.map(n => ({
        value: n.id,
        label: n.nama,
        kod: n.kod,
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