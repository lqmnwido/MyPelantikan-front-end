<template>
  <div class="container">
    <div v-if="template" class="template-renderer">
      <div v-for="block in template.blocks" :key="block.id" class="mb-0">
        <!-- Text Block -->
        <div v-if="block.type === 'text'" class="ql-editor" v-html="block.content"></div>

        <!-- Table Block -->
        <div v-else-if="block.type === 'table'" class="position-relative">
          <table class="table table-bordered table-sm" style="font-family: Arial, sans-serif;">
            <thead>
              <tr>
                <th v-if="block.indexHeader" style="width: 1%; text-align: center;">{{ block.indexHeader }}</th>
                <th v-for="header in block.headers" :key="header.field"
                  :style="{ textAlign: header.align, width: header.width + '%' }">
                  {{ header.text }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in getTableRows(block)" :key="index" :class="{ 'empty-row': isEmptyRow(row) }">
                <!-- Index -->
                <td v-if="block.indexHeader" style="text-align: center; vertical-align: top;"
                  :class="{ 'empty-row': isEmptyRow(row) }">
                  {{ index >= block.startRow - 1 ? index - (block.startRow - 2) : '' }}
                </td>

                <!-- Data + optional catatan field -->
                <td v-for="header in block.headers" :key="header.field"
                  :style="{ textAlign: header.align, verticalAlign: 'top' }" :class="{ 'empty-row': isEmptyRow(row) }">
                  <!-- If row is empty -->
                  <div v-if="isEmptyRow(row) && header === block.headers[0]"
                    class="text-left text-muted fw-bold fst-italic text-uppercase">
                    Kosong
                  </div>
                  <div v-else>
                    <!-- If header has a format string -->
                    <div v-if="header.format">
                      <!-- Show formatted text if NOT editing -->
                      <div v-if="!editing" v-html="renderFormat(header.format, row)"></div>

                      <!-- Show input if editing and it's a catatan -->
                      <div v-else-if="header.format.includes('catatan')" class="mt-1">
                        <input type="text" v-model="row.catatan" class="form-control form-control-sm fw-bold" />
                      </div>
                    </div>


                    <!-- Otherwise show plain field -->
                    <div v-else>
                      {{ row[header.field] || '' }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Nota Block -->
        <div v-else-if="block.type === 'nota'" class="mt-4 note">
          <h3 class="fw-bold">Nota:</h3>
          <div class="ql-editor mx-2" v-html="block.content"></div>
        </div>

        <!-- Tarikh Block -->
        <div v-else-if="block.type === 'tarikh'" class="text-start mt-3">
          <p>{{ block.date }}</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TemplateRenderer",
  props: {
    template: { type: Object, required: true, },
    data: { type: Array, required: true },
    editing: { type: Boolean, default: false }
  },
  data() {
    return {
      editingTables: [],
    };
  },
  methods: {
    getTableRows(block) {
      let rows = [...this.data];
      if (block.filterJenis) {
        rows = rows.filter((item) =>
          Number(item.id_jenis_pelantikan) === Number(block.filterJenis)
        );
      }

      const totalRows = block.rowCount || rows.length;
      const result = [];

      for (let i = 0; i < totalRows; i++) {
        if (rows[i]) {
          result.push(rows[i]);
        } else {
          // Empty row
          const emptyRow = {};
          block.headers.forEach((h) => (emptyRow[h.field] = ""));
          result.push(emptyRow);
        }
      }
      return result;
    },
    isEmptyRow(row) {
      return Object.values(row).every((val) => !val);
    },
    isEditing() {
      return this.editing;
    },
    renderFormat(format, row) {
      return format.replace(/{{(.*?)}}/g, (match, key) => {
        const field = key.trim();
        let value = row[field] ?? "";

        if (field === "catatan") {
          // If has value -> wrap with [ ] and make bold
          return value ? `<strong>[ ${value} ]</strong>` : "";
        }



        return value;
      }).replace(/\n/g, "<br>"); // handle newlines
    },
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.template-renderer table {
  width: 100%;
  border-collapse: collapse;
  page-break-inside: always;
}

.template-renderer th,
.template-renderer td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  height: 40px;
}

.template-renderer th {
  background-color: #f4f4f4;
}

thead {
  display: table-header-group;
}

tbody {
  display: table-row-group;
}

tr {
  page-break-inside: avoid;
}

.note h3 {
  font-weight: bold;
  text-decoration: underline;
  font-size: 14pt;
  /* Make the heading slightly larger */
  margin-bottom: 10px;
  font-family: Arial, sans-serif;
}

/* Highlight empty rows */
.empty-row {
  background-color: #ffe5e5 !important;
}

p {
  padding-top: 20px;
  font-family: Arial, sans-serif;
  font-size: 12pt;
  line-height: 1.3;

}
</style>
