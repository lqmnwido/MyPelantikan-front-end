<template>
  <div class="container">
    <div v-if="template" class="template-renderer">
      <div v-for="block in processedBlocks" :key="`${block.id}-${block.type}`" class="block-container">

        <!-- Text Block -->
        <div v-if="block.type === 'text'" class="ql-editor text-block" v-html="renderQuillContent(block.content)"></div>

        <!-- Table Block -->
        <div v-else-if="block.type === 'table'" class="position-relative table-block">
          <table class="table table-bordered table-sm styled-table">
            <thead>
              <tr>
                <th v-if="block.indexHeader" style="width: 1%; text-align: center;">
                  {{ block.indexHeader }}
                </th>
                <th v-for="header in block.headers" :key="header.field"
                  :style="{ textAlign: header.align, width: header.width + '%' }">
                  {{ header.text }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in block.tableRows" :key="row.__rowKey || index"
                :class="{ 'empty-row': isEmptyRow(row) && !isMenteriCatatanInRow(row) }">
                <!-- Index Column -->
                <td v-if="block.indexHeader" class="text-center align-top">
                  {{ row.__index || '' }}
                </td>

                <!-- Data Columns -->
                <td v-for="(header, hIdx) in block.headers" :key="hIdx"
                  :style="{ textAlign: header.align, verticalAlign: 'top' }">
                  <!-- Manual input -->
                  <div v-if="row.__manual && row.__manualCells && row.__manualCells[hIdx]">
                    <span v-html="row.__manualCells[hIdx]"></span>
                    <template v-if="header.format">
                      <br />
                      <span v-html="renderFormat(header.format, row, header)"></span>
                    </template>
                    <div v-if="hIdx === 0 && (!row.nama || row.__empty) && !isMenteriCatatanInRow(row)"
                      class="text-left text-muted fw-bold fst-italic text-uppercase">
                      Kosong
                    </div>

                  </div>

                  <!-- Empty placeholder -->
                  <div v-else-if="hIdx === 0 && (!row.nama || row.__empty) && !isMenteriCatatanInRow(row)"
                    class="text-left text-muted fw-bold fst-italic text-uppercase">
                    Kosong
                  </div>

                  <!-- Normal formatted -->
                  <div v-else>
                    <div v-if="header.format">
                      <div v-html="renderFormat(header.format, row, header)"></div>
                    </div>
                    <template v-if="Array.isArray(row[header.field])">
                      <div v-for="(val, idx) in row[header.field]" :key="idx">
                        {{ formatValue(val) }}
                      </div>
                    </template>

                    <div v-else>
                      {{ row[header.field] || '' }}
                    </div>
                  </div>

                  <span v-if="!editing" v-html="formatCatatan(row.__catatanCells[hIdx])"></span>

                  <div v-if="editing" class="mt-2">
                    <textarea class="form-control form-control-sm" rows="2"
                      v-model="row.__catatanCells[hIdx]"></textarea>
                  </div>

                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Nota Block -->
        <div v-else-if="block.type === 'nota'" class="note-block">
          <!-- <h3 class="fw-bold text-decoration-underline">Nota:</h3> -->
          <div v-if="!notaEditing[block.id]" class="mx-2 p-2 ql-editor note-content" v-html="block.content"
            @click="$emit('enable-nota', block)" />
          <div v-else>
            <div :id="`toast-editor-${block.id}`" class="toast-editor"></div>
            <button class="btn btn-sm btn-primary mt-2" @click="$emit('save-nota', block)">
              Simpan
            </button>
            <button class="btn btn-sm btn-secondary mt-2 ms-2" @click="$emit('cancel-nota', block)">
              Batal
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div v-else-if="block.type === 'footer'" class="text-start mt-3 ql-editor footer-block" v-html="block.content">
        </div>

        <!-- Tarikh Block -->
        <div v-else-if="block.type === 'tarikh'" class="tarikh-block">
          <p>{{ getFormattedDate() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TemplateRenderer",
  props: {
    template: { type: Object, required: true },
    data: { type: Array, required: true },
    editing: { type: Boolean, default: false },
    catatanTemplate: { type: Object, default: () => ({}) },
    notaEditing: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      processedBlocks: []
    }
  },
  watch: {
    template: {
      handler(newTemplate) {
        if (newTemplate && newTemplate.blocks) {
          this.processedBlocks = newTemplate.blocks.map(block => {
            if (block.type === 'table') {
              return {
                ...block,
                tableRows: this.getTableRows(block)
              };
            }
            return block;
          });
        }
      },
      immediate: true,
      deep: true
    },
    data: {
      handler() {
        if (this.template && this.template.blocks) {
          this.processedBlocks = this.template.blocks.map(block => {
            if (block.type === 'table') {
              return {
                ...block,
                tableRows: this.getTableRows(block)
              };
            }
            return block;
          });
        }
      },
      deep: true
    }
  },
  methods: {
    isMenteriCatatanInRow(row) {
      if (!row.__catatanCells || !Array.isArray(row.__catatanCells)) {
        return false;
      }
      return row.__catatanCells.some(catatan =>
        typeof catatan === 'string' && (catatan.includes('Menteri') || catatan.includes('menteri')) || (catatan.includes('Peguam') || (catatan.includes('peguam')))
      );
    },
    saveAllCatatan() {
      if (!this.processedBlocks) return;
      this.processedBlocks.forEach(pBlock => {
        if (pBlock.type !== 'table') return;

        const allCatatan = {};
        pBlock.tableRows.forEach((row, rIdx) => {
          if (row.__catatanCells && Array.isArray(row.__catatanCells)) {
            row.__catatanCells.forEach((catatan, cIdx) => {
              if (catatan !== undefined && catatan !== null && catatan !== '') {
                const key = `${rIdx}-${cIdx}`;
                allCatatan[key] = catatan;
              }
            });
          }
        });

        this.$emit("update-catatan-template", {
          blockId: pBlock.id,
          content: {
            catatan_template: allCatatan
          }
        });
      });
    },
    updateCatatanTemplate(catatanTemplate, rowIndex, headerIndex, blockId) {
      const key = `${rowIndex}-${headerIndex}`;
      this.$emit("update-catatan-template", {
        blockId,
        content: {
          catatan_template: {
            [key]: catatanTemplate || ""
          }
        }
      });
    },
    renderQuillContent(content) {
      if (!content) return "";
      const wrapper = document.createElement("div");
      wrapper.innerHTML = content;
      wrapper.querySelectorAll("ol").forEach((ol) => {
        ol.style.counterReset = "none";
        ol.style.listStyleType = "none";
      });
      return wrapper.innerHTML;
    },
    getFormattedDate() {
      const date = new Date();
      const options = { month: "long", year: "numeric" };
      return date.toLocaleDateString("ms-MY", options);
    },
    formatCatatan(text) {
      if (!text) return '';
      return String(text).replace(/\n/g, '<br>');
    },
    formatValue(val) {
      if (val === null || val === undefined || val === 'null') {
        return '';
      }
      if (typeof val === 'string') {
        return val.replace(/\bnull\b/gi, '').trim();
      }
      return val;
    },
    getTableRows(block) {
      if (!block) return [];
      let rows = [...this.data];
      if (block.filterJenis) {
        rows = rows.filter(
          (item) =>
            Number(item.id_jenis_pelantikan) === Number(block.filterJenis)
        );
      }

      let maxManualRow = 0;
      if (block.manualInputs) {
        const manualKeys = Object.keys(block.manualInputs).map(k => parseInt(k.split('-')[0], 10));
        if (manualKeys.length > 0) {
          maxManualRow = Math.max(...manualKeys);
        }
      }

      let maxCatatanRow = 0;
      if (block.catatan_template) {
        const catatanKeys = Object.keys(block.catatan_template).map(k => parseInt(k.split('-')[0], 10));
        if (catatanKeys.length > 0) {
          maxCatatanRow = Math.max(...catatanKeys);
        }
      }

      const baseRowCount = block.rowCount || rows.length || (block.dataRowCount || 0);
      const rowCount = Math.max(baseRowCount, maxManualRow + 1, maxCatatanRow + 1);

      const startRow = block.startRow || 1;
      const result = Array.from({ length: rowCount }, () => ({ __catatanCells: [] }));

      if (block.manualInputs) {
        Object.entries(block.manualInputs).forEach(([key, value]) => {
          const [rIdx, cIdx] = key.split("-").map(Number);
          if (!result[rIdx].__manualCells)
            result[rIdx].__manualCells = [];
          result[rIdx].__manualCells[cIdx] = value;
          result[rIdx].__manual = true;
        });
      }

      if (block.catatan_template) {
        Object.entries(block.catatan_template).forEach(([key, value]) => {
          const [rIdx, cIdx] = key.split("-").map(Number);
          if (!result[rIdx].__catatanCells)
            result[rIdx].__catatanCells = [];
          result[rIdx].__catatanCells[cIdx] = value;
          result[rIdx].__catatan = true;
        });
      }
      rows.forEach((dataRow) => {
        let rowIdx = -1;

        const matchExactWord = (cell, word) => {
          if (!cell || !word) return false;
          // Create a temporary div to safely parse potential HTML in the cell
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = cell;
          const cellText = (tempDiv.textContent || tempDiv.innerText || "").trim();
          const wordText = (word || "").trim();
          return cellText.toLowerCase() === wordText.toLowerCase();
        };

        if (dataRow.peranan) {
          rowIdx = result.findIndex((r) =>
            !r.nama &&
            r.__manualCells?.some((cell) =>
              matchExactWord(cell, dataRow.peranan)
            )
          );
        }

        if (dataRow.wakil) {
          rowIdx = result.findIndex((r) =>
            !r.nama &&
            r.__manualCells?.some((cell) =>
              matchExactWord(cell, dataRow.wakil)
            )
          );
        }

        if (rowIdx !== -1) {
          Object.keys(dataRow).forEach((key) => {
            if (key !== "__manualCells" && key !== "__manual") {
              result[rowIdx][key] = dataRow[key];
            }
          });
        } else {
          const emptyIdx = result.findIndex(
            (r, i) => !r.__manual && !r.nama && i >= startRow - 1
          );
          if (emptyIdx !== -1) Object.assign(result[emptyIdx], dataRow);
        }
      });

      result.forEach((row) => {
        if (!row.__manual && !row.nama) row.__empty = true;
      });

      let indexCounter = 1;
      result.forEach((row, idx) => {
        row.__index = idx >= startRow - 1 ? indexCounter++ : "";
      });

      return result;
    },
    isEmptyRow(row) {
      return !row.nama || row.nama === "";
    },
    renderFormat(format, row, header) {
      let rendered = format.replace(/{{(.*?)}}/g, (_, key) => {
        const field = key.trim();
        const value = row[field] ?? "";
        return value;
      });

      if (header && header.text === "Tarikh Lahir / Umur") {
        const parts = [row.tarikh_lahir, row.umur].filter(
          (v) => v && v.trim().length > 0
        );
        return parts.join("<br>");
      }

      rendered = rendered.replace(/^[\r\n]+/, "").replace(/[\r\n]+$/, "");
      if (header && header.field === "__custom__") {
        const lines = rendered
          .trim()
          .replace(/<br\s*\/?>/gi, "\n")
          .split(/\r?\n+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (lines.length === 0) return "";
        if (lines.length === 1) return lines[0];
        return lines.join("<br>");
      }

      return rendered.replace(/\r?\n+/g, "<br>");
    },
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.block-container {
  margin-bottom: 1rem;
  font-size: 12pt;
  line-height: 1.4;
  font-family: Arial, sans-serif;
}

/* General Table Styling */
.styled-table {
  width: 100%;
  border-collapse: collapse;
  page-break-inside: always;
}

.styled-table th,
.styled-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  height: 40px;
  vertical-align: top;
}

.styled-table th {
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

/* Empty row highlight */
.empty-row td {
  background-color: #f8d7da !important;
}

/* Block Styles */
.text-block,
.table-block,
.note-block,
.footer-block,
.tarikh-block {
  font-family: Arial, sans-serif;
  font-size: 12pt;
  line-height: 1.4;
}

/* Nota Section */
.note-block h3 {
  font-weight: bold;
  text-decoration: underline;
  font-size: 14pt;
  margin-bottom: 10px;
}

.note-content {
  background-color: #f9f9f9;
  border-left: 3px solid #007bff;
  padding: 8px;
}

/* Footer Style */
.footer-block {
  margin-top: 20px;
  padding-top: 10px;
  font-size: 12pt;
  line-height: 1.4;
}

/* Tarikh */
.tarikh-block p {
  padding-top: 10px;
  font-size: 12pt;
  line-height: 1.4;
}
</style>
