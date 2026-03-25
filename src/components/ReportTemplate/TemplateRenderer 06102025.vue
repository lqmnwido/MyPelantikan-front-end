<template>
  <div class="container">
    <div v-if="template" class="template-renderer">
      <div v-for="block in template.blocks" :key="block.id" class="mb-0">

        <!-- Text Block -->
        <div v-if="block.type === 'text'" class="ql-editor" v-html="renderQuillContent(block.content)"></div>

        <!-- Table Block -->
        <div v-else-if="block.type === 'table'" class="position-relative">
          <table class="table table-bordered table-sm" style="font-family: Arial, sans-serif;">
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
              <tr v-for="(row, index) in getTableRows(block)" :key="row.__rowKey || index"
                :class="{ 'empty-row': isEmptyRow(row) }">

                <!-- Index Column -->
                <td v-if="block.indexHeader" style="text-align: center; vertical-align: top;">
                  {{ row.__index || '' }}
                </td>

                <!-- Data Columns -->
                <td v-for="(header, hIdx) in block.headers" :key="hIdx"
                  :style="{ textAlign: header.align, verticalAlign: 'top' }">

                  <!-- Manual input for this cell -->
                  <div v-if="row.__manual && row.__manualCells && row.__manualCells[hIdx]">
                    <span v-html="row.__manualCells[hIdx]"></span>
                    <!-- Empty placeholder for first column -->
                    <template v-if="header.format">
                      <br>
                      <span v-html="renderFormat(header.format, row, header)"></span>
                    </template>
                    <div v-if="hIdx === 0 && (!row.nama || row.__empty)"
                      class="text-left text-muted fw-bold fst-italic text-uppercase">
                      Kosong
                    </div>
                  </div>


                  <!-- Empty placeholder for first column -->
                  <div v-else-if="hIdx === 0 && (!row.nama || row.__empty)"
                    class="text-left text-muted fw-bold fst-italic text-uppercase">
                    Kosong
                  </div>

                  <!-- Normal formatted -->
                  <div v-else>
                    <div v-if="header.format">
                      <div v-if="!editing" v-html="renderFormat(header.format, row, header)"></div>
                      <div v-else-if="header.format.includes('catatan')" class="mt-1 d-flex align-items-center">
                        <input type="text" v-model="row.catatan" class="form-control form-control-sm fw-bold"
                          @blur="$emit('save-catatan', row)" />
                      </div>
                    </div>

                    <template v-if="Array.isArray(row[header.field])">
                      <div v-for="(val, idx) in row[header.field]" :key="idx">{{ val }}</div>
                    </template>

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
          <div v-if="!notaEditing[block.id]" class="mx-2 p-2" v-html="block.content"
            @click="$emit('enable-nota', block)" />
          <div v-else>
            <div :id="`toast-editor-${block.id}`" class="toast-editor"></div>
            <button class="btn btn-sm btn-primary mt-2" @click="$emit('save-nota', block)">Save</button>
            <button class="btn btn-sm btn-secondary mt-2 ms-2" @click="$emit('cancel-nota', block)">Cancel</button>
          </div>
        </div>

        <!-- Footer -->
        <div v-else-if="block.type === 'footer'" class="text-start mt-3 ql-editor LaporanFooter" v-html="block.content">
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
    template: { type: Object, required: true },
    data: { type: Array, required: true },
    editing: { type: Boolean, default: false },
    notaEditing: { type: Object, default: () => ({}) },
  },
  methods: {
    renderQuillContent(content) {
      if (!content) return "";

      // 1️⃣ Parse DOM
      const wrapper = document.createElement("div");
      wrapper.innerHTML = content;

      // 2️⃣ Find all ordered lists and rebuild numbering manually
      wrapper.querySelectorAll("ol").forEach((ol) => {
        ol.style.counterReset = "none";
        ol.style.listStyleType = "none";
      });

      return wrapper.innerHTML;
    },
    getTableRows(block) {
      let rows = [...this.data];

      // Filter if needed
      if (block.filterJenis) {
        rows = rows.filter(item => Number(item.id_jenis_pelantikan) === Number(block.filterJenis));
      }

      const rowCount = block.rowCount || rows.length;
      const startRow = block.startRow || 1;


      // Initialize table with empty objects
      const result = Array.from({ length: rowCount }, () =>
        Object.fromEntries(block.headers.map(h => [h.field, ""]))
      );

      // console.log("Data received:", this.data.length);
      // console.log("Rows generated:", rows.length, "Result length:", result.length);

      // --- Step 1: Apply manualInputs as a prefix ---
      if (block.manualInputs) {
        Object.entries(block.manualInputs).forEach(([key, value]) => {
          const [rIdx, cIdx] = key.split("-").map(Number);
          if (!result[rIdx]) return;
          if (!result[rIdx].__manualCells) result[rIdx].__manualCells = [];
          // Store as prefix instead of full replacement
          result[rIdx].__manualCells[cIdx] = value;
          result[rIdx].__manual = true;
        });
      }


      // --- Step 2: Map normal rows by peranan, without overwriting manual cells ---
      rows.forEach(dataRow => {
        if (dataRow.peranan) {
          // Find the manual row that matches peranan
          const rowIdx = result.findIndex(r => r.__manualCells?.[0] && r.__manualCells[0].includes(dataRow.peranan));
          if (rowIdx !== -1) {
            // Merge the dataRow fields into the result row
            Object.keys(dataRow).forEach(key => {
              if (key !== "__manualCells" && key !== "__manual") {
                result[rowIdx][key] = dataRow[key];
              }
            });
          } else {
            // fallback: append to first empty row
            const emptyIdx = result.findIndex((r, i) => !r.__manual && !r.nama && i >= (startRow - 1));
            if (emptyIdx !== -1) {
              Object.assign(result[emptyIdx], dataRow);
              result[emptyIdx].__filled = true; // mark row as used
            }
          }
        } else {
          // peranan null: append to first empty row starting from startRow
          const emptyIdx = result.findIndex((r, i) => !r.__manual && !r.nama && i >= (startRow - 1));
          if (emptyIdx !== -1) {
            Object.assign(result[emptyIdx], dataRow);
            result[emptyIdx].__filled = true; // mark row as used
          }
        }
      });


      // --- Step 3: Mark empty rows ---
      result.forEach(row => {
        if (!row.__manual && !row.nama) row.__empty = true;
      });

      // --- Step 4: Indexing (Fixed) ---
      let indexCounter = 1;
      result.forEach((row, idx) => {
        // Only start counting after startRow - 1
        if (idx >= startRow - 1) {
          // Include manual rows too — but skip if all manualCells are null
          const hasVisibleManual = row.__manualCells
            ? row.__manualCells.some(v => v && v.trim() !== "")
            : false;

          if (!row.__manual || hasVisibleManual) {
            row.__index = indexCounter++;
          } else {
            row.__index = "";
          }
        } else {
          row.__index = "";
        }
      });


      return result;
    },

    isEmptyRow(row) {
      return !row.nama || row.nama === "";
    },

    renderFormat(format, row, header) {
      let rendered = format.replace(/{{(.*?)}}/g, (match, key) => {
        const field = key.trim();
        const value = row[field] ?? "";
        if (field === "catatan") {
          return value ? `</br><strong>[ ${value} ]</strong>` : "";
        }
        return value;
      });

      if (header && header.text === "Tarikh Lahir / Umur") {
        const parts = [row.tarikh_lahir, row.umur].filter(v => v && v.trim().length > 0);
        return parts.join("<br>");
      }


      rendered = rendered.replace(/^[\r\n]+/, "").replace(/[\r\n]+$/, "");

      if (header && header.field === "__custom__") {
        // console.log(JSON.stringify(rendered));

        const lines = rendered
          .trim()
          .replace(/<br\s*\/?>/gi, "\n")
          .split(/\r?\n+/)
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (lines.length === 0) return "";
        if (lines.length === 1) return lines[0];

        // case: peranan exists
        if (row.peranan === null) {
          const before = row.nama?.trim() || "";
          const idx = lines.findIndex(l => l.includes(before));

          // Everything before peranan -> flatten
          const beforePeranan = lines.slice(0, idx + 1).join(" ");

          // Peranan onwards -> keep line breaks
          const afterPeranan = lines.slice(idx + 1).join("<br>");

          return `${beforePeranan}<br>${afterPeranan}`;
        }

        return lines.join("<br>");
      }


      return rendered.replace(/\r?\n+/g, "<br>");
    }
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

.template-renderer td {
  vertical-align: top;
  /* 🚀 content sticks to top */
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
  margin-bottom: 10px;
  font-family: Arial, sans-serif;
}

.empty-row td {
  background-color: #f8d7da !important;
}

p {
  padding-top: 20px;
  font-family: Arial, sans-serif;
  font-size: 12pt;
  line-height: 1.3;
}

.LaporanFooter {
  padding-top: 20px;
  margin-left: -12px;
  font-size: 12pt;
  line-height: 1.3;
}
</style>
