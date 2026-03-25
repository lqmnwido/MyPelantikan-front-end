<template>
  <div class="container-fluid">
    <div class="card p-4 shadow-sm">
      <h5 class="mb-4">{{ topicLabel }}</h5>
      <hr style="margin-top: -10px;" />

      <!-- Top bar -->
      <div v-if="menuLength" class="d-flex flex-column gap-2 mb-3">
        <!-- Top row: Filter + Tambah -->
        <div v-if="filterOptions.length" class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <!-- Filter -->
          <div v-if="filterOptions.length" class="d-flex align-items-center gap-2">
            <label class="fw-semibold mb-0">{{ filterLabel }}:</label>
            <select :value="selectedFilter" @change="$emit('update:selectedFilter', $event.target.value)"
              class="form-select form-select-sm w-auto">

              <option value="All">Keseluruhan</option>
              <option v-for="opt in filterOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Tambah button -->
          <div v-if="filterOptions.length" class="align-items-end">
            <router-link v-if="cetak" class="btn btn-sm btn-secondary btn-print mx-2" :to="getMergedCetakLink">
              <span class="mdi mdi-file-pdf-outline"></span> Cetak Laporan
            </router-link>
            <router-link v-if="buttonTambah && buttonLabel" class="btn btn-sm btn-success btn-tambah"
              :to="getMergedButtonLink">
              {{ buttonLabel }}
            </router-link>
          </div>
        </div>
        <div v-else class="d-flex justify-content-end align-items-end flex-wrap gap-2">
          <router-link v-if="cetak" class="btn btn-sm btn-secondary btn-print" :to="getMergedCetakLink">
            <span class="mdi mdi-file-pdf-outline"></span> Cetak Laporan
          </router-link>
          <router-link v-if="buttonTambah && buttonLabel && carian" class="btn btn-sm btn-success btn-tambah"
            :to="getMergedButtonLink">
            {{ buttonLabel }}
          </router-link>
        </div>

        <!-- Bottom row: Papar + Carian -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <!-- Papar -->
          <div v-if="menuLength" class="d-flex align-items-center gap-2">
            <label class="fw-semibold mb-0">Papar</label>
            <select v-model.number="localPerPage" class="form-select form-select-sm w-auto" @change="emitPerPage">
              <option v-for="n in [5, 10, 25, 50, 100]" :key="n" :value="n">{{ n }}</option>
            </select>
            <span class="fw-semibold mb-0">rekod</span>
          </div>

          <!-- Carian -->
          <div v-if="carian" class="d-flex align-items-center gap-2">
            <label class="fw-semibold mb-0">Carian:</label>
            <input v-model="localSearch" @keyup.enter="emitSearch" type="text" class="form-control form-control-sm"
              :placeholder="autoSearchOnTyping ? 'Taip untuk carian...' : 'Taip dan tekan Enter'" :style="{ width: autoSearchOnTyping ? '188px' : '150px' }" />
            <template v-if="!autoSearchOnTyping">
              <button class="btn btn-sm btn-primary btn-cari" @click="emitSearch">Cari</button>
              <button class="btn btn-sm btn-outline-secondary btn-cari" @click="resetSearch" style="width: 90px;">Set Semula</button>
            </template>
          </div>
          <div v-else class="d-flex justify-content-end align-items-end flex-wrap gap-2">
            <router-link v-if="cetak" class="btn btn-sm btn-secondary btn-print mx-2" :to="getMergedCetakLink">
              <span class="mdi mdi-file-pdf-outline"></span> Cetak Laporan
            </router-link>
            <router-link v-if="buttonTambah && buttonLabel" class="btn btn-sm btn-success btn-tambah"
              :to="getMergedButtonLink">
              {{ buttonLabel }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th v-for="(header, i) in headers" :key="i"
                :style="{ width: columnWidths[i] || 'auto' }"
                @click="handleSort(fields[i])"

                :class="[
                    'align-middle', 
                    'text-' + (columnAlignments[i] || 'start'),
                    { 
                        // Conditional classes for sorting (from line 4)
                        'cursor-pointer': isSortable(fields[i]), 
                        'sorted-column': sortBy === fields[i] 
                    }
                ]"
                >
                {{ header }}
                
                <!-- <i v-if="sortBy === fields[i] && !sortDesc" class="mdi mdi-arrow-up-drop-circle-outline"></i>
                <i v-else-if="sortBy === fields[i] && sortDesc" class="mdi mdi-arrow-down-drop-circle-outline"></i>
                <i v-else-if="isSortable(fields[i])" class="mdi mdi-swap-vertical text-muted"></i> -->
            </th>
            </tr>
          </thead>

          <tbody v-if="!loading && dataItems.length">
            <template v-if="!onlyGroupByRows">
              <template v-for="(item, index) in dataItems" :key="index">
                <tr v-if="item.groupby">
                  <td :colspan="visibleColumnCount" class="fw-bold bg-light text-dark">
                    {{ item.groupby.label }}
                  </td>
                </tr>
                <tr v-else>
                  <td v-for="(field, i) in fields" :key="i"
                    :class="['align-middle', 'text-' + (columnAlignments[i] || 'start')]"
                    :style="{ width: columnWidths[i] || 'auto' }">

                    <template v-if="field === 'index'">
                      {{ item.index || '' }}
                    </template>

                    <template v-else-if="field === 'actions'">
                      <slot name="actions" :item="item" :index="index" />
                    </template>

                    <template v-else-if="field === 'gambar'">
                      <img :src="item.gambar || 'https://via.placeholder.com/100x100?text=Tiada+Gambar'" alt="Gambar"
                        class="img-thumbnail" style="width: 80px; height: 80px;" />
                    </template>

                    <template v-else-if="typeof field === 'object' && field.combine">
                      <span v-html="field.format
                        ? field.format(field.combine.map((k) => item[k]))
                        : field.combine.map((k) => item[k]).join(field.separator || ' ')
                        "></span>
                    </template>

                    <template v-else-if="field === 'file'">
                      <a :href="item.file" target="_blank">
                        <i class="mdi mdi-file-document-outline text-primary me-1"></i>
                        {{ getFileName(item.file) }}
                      </a>
                    </template>

                    <template v-else-if="['wakil', 'tarikh_lahir'].includes(field)">
                      <span v-html="item[field]" :class="getTextTransformClass(field)"></span>
                    </template>

                    <template v-else-if="field === 'catatan'">
                      <div style="white-space: pre-wrap;">{{ item[field] || '-' }}</div>
                    </template>

                    <template v-else>
                      <div v-html="item[field] || '-'" :class="getTextTransformClass(field)"></div>
                    </template>

                  </td>
                </tr>
              </template>
            </template>
          </tbody>


          <tbody v-else-if="loading" class="position-relative">
            <tr>
              <td :colspan="headers.length" class="text-center text-muted py-4">
                <Loader :loading="loading" class="loading-overlay" />
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td :colspan="headers.length" class="text-center text-muted py-4">
                Tiada data untuk dipaparkan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom info + pagination -->
      <div v-if="pagination" class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="text-muted small">
          <template v-if="total > 0">
            Memaparkan
            <strong>{{ from }}</strong> – <strong>{{ to }}</strong>
            daripada <strong>{{ total }}</strong> rekod
          </template>
        </div>

        <ul class="pagination pagination-sm mb-0">
          <li :class="['page-item', { disabled: page === 1 }]" @click="goTo(page - 1)">
            <a class="page-link" href="javascript:void(0)">‹</a>
          </li>

          <li v-for="p in pages" :key="p" :class="['page-item', { active: p === page, disabled: p === '…' }]"
            @click="p !== '…' && goTo(p)">
            <a class="page-link" href="javascript:void(0)">{{ p }}</a>
          </li>

          <li :class="['page-item', { disabled: page === lastPage }]" @click="goTo(page + 1)">
            <a class="page-link" href="javascript:void(0)">›</a>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script>
import Loader from "@/components/widgets/loader";
// import Loader from "./widgets/loader.vue";

export default {
  name: 'DataTable',
  components: { Loader },
  props: {
    headers: Array,
    fields: Array,
    items: Array,
    topicLabel: String,

    // server-side pagination props
    serverSide: Boolean,
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 5 },
    loading: { type: Boolean, default: false },

    columnAlignments: { type: Array, default: () => [] },
    columnWidths: { type: Array, default: () => [] },
    filterOptions: { type: Array, default: () => [] },
    filterLabel: { type: String, default: "Filter by" },
    buttonLabel: { type: String, default: "" },
    buttonTambah: { type: Boolean, default: false },
    link: { type: String, default: "" },
    linkCetak: { type: String, default: "" },
    cetak: { type: Boolean, default: false },
    params: { type: Object, default: () => ({}) },

    onlyGroupByRows: { type: Boolean, default: false },

    pagination: { type: Boolean, default: true },
    carian: { type: Boolean, default: true },
    menuLength: { type: Boolean, default: true },
    fieldTextTransform: { type: Object, default: () => ({}) },

    selectedFilter: { type: [String, Number], default: 'All' },
    filterKey: { type: String, default: '' },
    autoSearchOnTyping: { type: Boolean, default: false },

    sortBy: { type: String, default: '' },
    sortDesc: { type: Boolean, default: false },

  },
  emits: ['change-page', 'change-per-page', 'search', 'sort-change'],
  data() {
    return {
      localSearch: '',
      localPerPage: this.perPage,
      // selectedFilter: 'All',
    };
  },
  computed: {
    dataItems() {
      return this.items || [];
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.total / this.perPage));
    },
    from() {
      if (!this.total) return 0;
      return (this.page - 1) * this.perPage + 1;
    },
    to() {
      return Math.min(this.total, this.page * this.perPage);
    },
    pages() {
      const total = this.lastPage;
      const current = this.page;
      const delta = 2;
      const pages = [];
      for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i);
      }
      if (pages[0] > 1) {
        if (pages[0] > 2) pages.unshift('…');
        pages.unshift(1);
      }
      if (pages[pages.length - 1] < total) {
        if (pages[pages.length - 1] < total - 1) pages.push('…');
        pages.push(total);
      }
      return pages;
    },
    visibleColumnCount() {
      return this.headers.length;
    },
    getMergedButtonLink() {
      return {
        path: this.link,
        query: {
          ...this.params,
        }
      }
    },
    getMergedCetakLink() {
      return { 
        path: this.linkCetak,
        query: {
          ...this.params,
        }
      }
    },

  },
  watch: {
    perPage(newVal) {
      this.localPerPage = newVal;
    },
    selectedFilter() {
      this.emitSearch();
    },
    localSearch() {
      if (this.autoSearchOnTyping) {
        this.emitSearch();
      }
    },
  },
  methods: {
    emitSearch() {
      this.$emit('search', this.localSearch.trim());
    },
    resetSearch() {
      this.localSearch = '';
      this.emitSearch();
    },
    emitPerPage() {
      this.$emit('change-per-page', this.localPerPage);
    },
    goTo(p) {
      if (p < 1 || p > this.lastPage || p === this.page) return;
      this.$emit('change-page', p);
    },
    getTextTransformClass(field) {
      const style = this.fieldTextTransform?.[field];
      switch (style) {
        case "uppercase":
          return "text-uppercase";
        case "capitalize":
          return "text-capitalize";
        case "lowercase":
          return "text-lowercase";
        default:
          return "";
      }
    },
    getFileName(filePath) {
      return filePath ? filePath.split("/").pop() : "Tiada Fail";
    },
    isSortable(field) {
      return !['index', 'actions', 'gambar'].includes(field);
    },
    handleSort(field) {
      if (!this.isSortable(field)) return;

        let newSortDesc = false;
        if (this.sortBy === field) {
          newSortDesc = !this.sortDesc;
        } else {
          newSortDesc = false;
        }

        this.$emit('sort-change', {
          sortBy: field,
          sortDesc: newSortDesc,
        });
    },
    getTrueRowIndex(index) {
      let count = 0;
      for (let i = 0; i <= index; i++) {
        if (!this.items[i].groupby) {
          count++;
        }
      }
      return (this.page - 1) * this.perPage + count;
    },
    applyFilter() {
      if (!this.dataTableInstance) return;

      const keyword = this.selectedFilter === "All" ? "" : this.selectedFilter;
      this.dataTableInstance.search("").draw();

      const columnIndex = this.fields.findIndex((f) => f === this.filterKey);
      if (columnIndex !== -1) {
        this.dataTableInstance.column(columnIndex).search(keyword).draw();
      }
    },
  }
};
</script>

<style scoped>
/* .loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  width: 100%;
  background: rgba(255, 255, 255, 0.6); 
} */

tbody.position-relative {
  position: relative;
}

.btn-tambah {
  width: 188px;
}

.btn-print {
  width: 150px;
}

.btn-cari {
  width: 90px;
}

.table {
  min-height: 130px;
}
</style>