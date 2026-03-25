<template>
  <Layout>
    <PageHeader title="Senarai Tamat Tempoh" pageTitle="Rekod Pelantikan" />
    <div>
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">Muat Naik Fail Template Excel untuk yang telah Tamat Tempoh</h4>
              <p class="card-title-desc">
                Sila gunakan fail Template Excel (.xlsx, .xls) untuk memuat naik rekod yang telah tamat tempoh.
                (<a href="/Tamat Tempoh.xlsx" download>Muat Turun Template Excel di sini</a>)
              </p>
              <input type="file" class="form-control" @change="handleFileUpload" accept=".xlsx, .xls" />
              <p class="card-title-desc mt-2">* Nombor IC diwajibkan isi.</p>
              <div v-if="headers.length" class="table-responsive mt-4">
                <h5 class="font-size-16 mb-3">Data Semakan</h5>
                <div style="overflow-x: auto;">
                  <table class="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th v-for="(header, index) in headers" :key="header"
                          :style="{ width: columnWidths[index] + 'px' }">
                          {{ header }}
                          <div v-if="isEditing" class="resizer" @mousedown="startResize($event, index)"></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rowIndex) in data" :key="rowIndex">
                        <td v-for="(cell, cellIndex) in row" :key="cellIndex"
                          :style="{ width: columnWidths[cellIndex] + 'px' }">
                          <span v-if="!isEditing">{{ cell }}</span>
                          <div v-else>
                            <DatePicker v-if="dateColumnIndices.includes(cellIndex)"
                              :model-value="data[rowIndex][cellIndex]"
                              @update:model-value="date => updateDateCell(date, rowIndex, cellIndex)"
                              :format="formatDate" auto-apply teleport-center />
                            <textarea v-else class="form-control" v-model="data[rowIndex][cellIndex]"
                              rows="1"></textarea>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-6 text-start">
                  <button @click="goBack" type="button" class="btn btn-secondary me-2 button-size">
                    Kembali
                  </button>
                </div>
                <div class="col-6 text-end">
                  <!-- Not Editing -->
                  <button v-if="headers.length && !isEditing" type="button" class="btn btn-primary me-2 button-size"
                    @click="enterEditMode">
                    Kemaskini
                  </button>

                  <!-- Editing -->
                  <button v-if="headers.length && isEditing" type="button" class="btn btn-danger me-2 button-size"
                    @click="cancelEdit">
                    Batal
                  </button>
                  <button v-if="headers.length && isEditing" type="button" class="btn btn-info me-2 button-size"
                    @click="saveChanges">
                    Simpan
                  </button>

                  <!-- Always Visible -->
                  <button v-if="headers.length && !isEditing" type="button" class="btn btn-success me-2 button-size"
                    @click="submitData">
                    Tambah Rekod
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SweetAlert :show="alert.success" type="success" title="Berjaya!" text="Rekod Telah Ditambah."
      @closed="alert.success = false" />

    <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
      @closed="alert.error = false" />
  </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import SweetAlert from "@/components/SweetAlert";
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import * as XLSX from 'xlsx';
import { tamatService } from "@/services/tamat.service.js";
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
  components: {
    Layout,
    PageHeader,
    SweetAlert,
    DatePicker
  },
  name: 'TambahRekodTamatTempoh',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const headers = ref([]);
    const data = ref([]);
    const originalData = ref([]); // To store a copy for reverting changes
    const columnWidths = ref([]);
    const resizingColumnIndex = ref(null);
    const startX = ref(0);
    const startWidth = ref(0);
    const isEditing = ref(false);
    const dateColumnIndices = ref([]);
    const alert = reactive({
      error: false,
      errorMessage: '',
      success: false,
    });

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        isEditing.value = false;
        const reader = new FileReader();
        reader.onload = (e) => {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length > 0) {
            headers.value = jsonData[0];
            dateColumnIndices.value = headers.value.reduce((acc, header, index) => {
              if (header === 'Tarikh Lantik' || header === 'Tarikh Tamat' || header === 'Tarikh Lanjutan') {
                acc.push(index);
              }
              return acc;
            }, []);

            const rawData = jsonData.slice(1);

            // Convert Excel date serial numbers to DD/MM/YYYY format
            data.value = rawData.map(row => {
              return row.map((cell, index) => {
                if (dateColumnIndices.value.includes(index) && typeof cell === 'number' && cell > 25569) { // Heuristic for Excel dates
                  const date = XLSX.SSF.parse_date_code(cell);
                  if (date) {
                    return `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
                  }
                }
                return cell;
              });
            });

            originalData.value = JSON.parse(JSON.stringify(data.value)); // Deep copy
            columnWidths.value = headers.value.map(() => 150); // Default width
          }
        };
        reader.readAsBinaryString(file);
      }
    };

    const formatDate = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${day}/${month}/${year}`; // Changed to DD/MM/YYYY
    };


    const goBack = () => {
      const from = route.query.from;
      if (from) {
        router.push(from);
      } else {
        router.back();
      }
    };

    const enterEditMode = () => {
      originalData.value = JSON.parse(JSON.stringify(data.value)); // Save current state before editing
      isEditing.value = true;
    };

    const cancelEdit = () => {
      data.value = JSON.parse(JSON.stringify(originalData.value)); // Revert to original data
      isEditing.value = false;
    };

    const saveChanges = () => {
      originalData.value = JSON.parse(JSON.stringify(data.value)); // Save current state as the new original
      isEditing.value = false;
    };

    const updateDateCell = (date, rowIndex, cellIndex) => {
      data.value[rowIndex][cellIndex] = formatDate(date);
    };

    const startResize = (event, index) => {
      resizingColumnIndex.value = index;
      startX.value = event.clientX;
      startWidth.value = columnWidths.value[index];
      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    };

    const doResize = (event) => {
      if (resizingColumnIndex.value !== null) {
        const diffX = event.clientX - startX.value;
        const newWidth = startWidth.value + diffX;
        if (newWidth > 50) { // Minimum width
          columnWidths.value[resizingColumnIndex.value] = newWidth;
        }
      }
    };

    const stopResize = () => {
      resizingColumnIndex.value = null;
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    };

    const submitData = async () => {
      try {
        await tamatService.uploadExcel(data.value);
        alert.success = true;
        router.push({ path: "/rekod-pelantikan/senarai-tamat-tempoh" });
      } catch (error) {
        alert.error = true;
        alert.errorMessage = error?.response?.data?.message || error.message || 'Ralat tidak diketahui'
      }
    };


    onMounted(() => {
      // Cleanup listeners on component unmount
      onUnmounted(() => {
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
      });
    });

    return {
      headers,
      data,
      columnWidths,
      isEditing,
      handleFileUpload,
      startResize,
      submitData,
      enterEditMode,
      goBack,
      cancelEdit,
      saveChanges,
      dateColumnIndices,
      formatDate,
      updateDateCell,
      alert
    };
  },
};
</script>

<style scoped>
.card-title-desc {
  font-size: 0.9rem;
  color: #6c757d;
}

.resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 5px;
  cursor: col-resize;
  height: 100%;
}

th {
  position: relative;
}

.button-size {
  min-width: 200px;
  max-width: 200px;
}
</style>
