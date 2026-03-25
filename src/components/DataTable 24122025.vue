<template>
  <div class="container-fluid">
    <div class="card p-4 shadow-sm">
      <h5 class="mb-4">{{ topicLabel }}</h5>
      <hr style="margin-top: -10px;" />

      <div>
        <div v-if="shouldShowFilter || shouldShowButton || shouldShowPrint">
          <!-- FILTER + BUTTON BAR -->
          <div v-if="shouldShowFilter"
            class="d-flex justify-content-between align-items-center mb-4 mt-2 flex-wrap gap-3">
            <div class="d-flex align-items-center gap-2">
              <label class="fw-semibold">{{ filterLabel }}:</label>
              <select v-model="selectedFilter" class="form-select d-inline-block w-auto">
                <option value="All">Keseluruhan</option>
                <option v-for="opt in filterOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <router-link v-if="shouldShowPrint" :to="{ path: printLink, query: { from: $route.fullPath } }"
                class="btn text-danger" @click="onCustomAction" style="font-size: 24px;" title="Cetak Laporan">
                <i class="bx bxs-printer"></i>
              </router-link>
              <router-link v-if="shouldShowButton" :to="getMergedButtonLink" class="btn btn-success"
                @click="onCustomAction">
                {{ buttonLabel }}
              </router-link>
            </div>
          </div>

          <div v-else class="d-flex justify-content-end align-items-end mb-4 mt-2 flex-wrap gap-3">
            <router-link v-if="shouldShowPrint" :to="{ path: printLink, query: { from: $route.fullPath } }"
              class="btn text-danger" @click="onCustomAction" style="font-size: 24px; margin-bottom: -10px;"
              title="Cetak Laporan">
              <i class="bx bxs-printer"></i>
            </router-link>
            <router-link v-if="shouldShowButton" :to="getMergedButtonLink" class="btn btn-success"
              @click="onCustomAction">
              {{ buttonLabel }}
            </router-link>
          </div>
        </div>

        <!-- TABLE -->
        <table ref="dataTable" class="table table-sm">
          <thead>
            <tr>
              <th v-for="(header, i) in headers" :key="i" :class="['text-' + (columnAlignments[i] || 'left')]"
                :style="{ width: columnWidths?.[i] || 'auto' }">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- IF HAS NON-GROUP DATA -->
            <template v-if="dataItems.length > 0">
              <template v-if="!onlyGroupByRows">
                <template v-for="(item, index) in dataItems" :key="index">
                  <tr v-if="item.groupby">
                    <td :colspan="visibleColumnCount" class="fw-bold bg-light text-dark">
                      {{ item.groupby.label }}
                    </td>
                  </tr>

                  <tr v-else>
                    <td v-for="(field, i) in fields" :key="i"
                      :class="['align-middle', 'text-' + (columnAlignments[i] || 'left')]"
                      :style="{ width: columnWidths?.[i] || 'auto' }">
                      <template v-if="field === 'index'">
                        {{ getTrueRowIndex(index) }}
                      </template>

                      <template v-else-if="field === 'actions'">
                        <slot name="actions" :item="item" :index="index" />
                      </template>

                      <template v-else-if="field === 'gambar'">
                        <img :src="item.gambar" alt="Gambar" class="img-thumbnail"
                          style="width: 100px; height: 100px;" />
                      </template>

                      <template v-else-if="typeof field === 'object' && field.combine">
                        <span v-html="field.format
                          ? field.format(field.combine.map((k) => item[k]))
                          : field.combine.map((k) => item[k]).join(field.separator || ' ')
                          "></span>
                      </template>

                      <template v-else-if="field === 'file'">
                        <a :href="item.file" target="_blank" class="text-decoration-underline">
                          <i class="mdi mdi-file-document-outline text-primary me-1"></i>
                          {{ getFileName(item.file) }}
                        </a>
                      </template>

                      <template v-else-if="['wakil', 'tarikh_lahir'].includes(field)">
                        <span v-html="item[field]" :class="getTextTransformClass(field)" />
                      </template>
                      <template v-else>
                        <span :class="getTextTransformClass(field)">
                          <span v-if="field === 'nama'" v-html="item[field]"></span>
                          <span v-else>{{ item[field] }}</span>
                        </span>
                      </template>
                    </td>
                  </tr>
                </template>
              </template>
            </template>

            <!-- NO DATA ROW -->
            <tr v-else>
              <td :colspan="actualVisibleColumnCount" class="text-center text-muted">
                Tiada data untuk dipaparkan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import "datatables.net-bs4";
import "datatables.net-bs4/css/dataTables.bootstrap4.min.css";

export default {
  name: "DataTable",
  props: {
    headers: Array,
    fields: Array,
    items: Array,
    columnAlignments: { type: Array, default: () => [] },
    filterOptions: { type: Array, default: () => [] },
    filterLabel: { type: String, default: "Filter by" },
    filterShow: { type: Boolean, default: false },
    buttonLabel: { type: String, default: "Tambah" },
    buttonTambah: { type: Boolean, default: false },
    buttonLink: { type: String, default: null },
    printLink: { type: String, default: null },
    topicLabel: { type: String, default: "Data Table" },
    filterKey: { type: String, default: "" },
    fieldTextTransform: { type: Object, default: () => ({}) },
    pageLength: { type: Number, default: 5 },
    searching: { type: Boolean, default: true },
    lengthChange: { type: Boolean, default: true },
    paging: { type: Boolean, default: true },
    print: { type: Boolean, default: false },
    columnWidths: { type: Array, default: () => [] },
    buttonParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const params = new URLSearchParams(window.location.search);
    return {
      selectedFilter: params.get(this.filterKey) || "All",
      dataTableInstance: null,
      isLoading: true,
      actualVisibleColumnCount: 0,
    };
  },
  watch: {
    selectedFilter(newVal) {
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set(this.filterKey, newVal);
      window.location.search = queryParams.toString();
    },
  },
  mounted() {
    this.$nextTick(() => {
      const waitUntilRendered = setInterval(() => {
        const tbody = this.$refs.dataTable?.querySelector("tbody");
        const hasRows = tbody && tbody.querySelector("tr");

        if (hasRows) {
          clearInterval(waitUntilRendered);
          this.isLoading = false;
          this.initDataTable();
        }
      }, 100);
    });
  },
  methods: {
    initDataTable() {
      const table = $(this.$refs.dataTable);

      if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().destroy();
      }

      const hasData = this.items && this.items.length > 0;

      this.dataTableInstance = table.DataTable({
        columns: this.headers.map((_, index) => ({
          data: index,
          defaultContent: "",
        })),
        ordering: false,
        lengthMenu: [5, 10, 25, 50, 100],
        lengthChange: hasData ? this.lengthChange : false,
        searching: hasData ? this.searching : false,
        paging: hasData ? this.paging : false,
        pageLength: this.pageLength,
        info: hasData,
        language: {
          // emptyTable: "Tiada data untuk dipaparkan",
          lengthMenu: "Papar _MENU_ data setiap halaman",
        },
      });


      this.$nextTick(() => {
        // ✅ Set actual column count after table rendered
        const thCount = this.$refs.dataTable.querySelectorAll("thead th").length;
        this.actualVisibleColumnCount = thCount;
      });
      this.applyFilter();
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
    onCustomAction() {
      this.$emit("custom-action");
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
    getTrueRowIndex(index) {
      let count = 0;
      for (let i = 0; i <= index; i++) {
        if (!this.items[i].groupby) {
          count++;
        }
      }
      return count;
    },

  },
  computed: {
    shouldShowButton() {
      return this.buttonTambah && this.buttonLabel;
    },
    shouldShowPrint() {
      return this.print;
    },
    shouldShowFilter() {
      return this.filterShow && this.filterOptions && this.filterLabel;
    },
    visibleColumnCount() {
      // Match the number of displayed <th> columns
      return this.headers?.length || this.fields?.length || 1;
    },
    dataItems() {
      return this.items || [];
    },
    onlyGroupByRows() {
      return this.dataItems.length > 0 && this.dataItems.every(item => item.groupby);
    },
    computedColspan() {
      return this.fields.length;
    },
    getMergedButtonLink() {
      return {
        path: this.buttonLink,
        query: {
          ...this.buttonParams, // your custom params
          // from: this.$route.fullPath // preserve the origin route
        }
      }
    },


    // computedColspan() {
    //   return this.fields.filter(f => {
    //     if (!f) return false;
    //     if (typeof f === 'object' && f.hidden) return false;
    //     return true;
    //   }).length;
    // }
  },
};
</script>

<style scoped>
.badge-pill {
  display: inline-block;
  background-color: #e6eaff;
  color: #2f5bebb8;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  margin: 2px 4px;
  white-space: nowrap;
}

.icon-btn {
  background: transparent;
  border: none;
  padding: 4px;
  font-size: 1.1rem;
  cursor: pointer;
}

.icon-btn:hover {
  opacity: 0.7;
}
</style>

<!-- can you insert back "No data available in table" in the table -->