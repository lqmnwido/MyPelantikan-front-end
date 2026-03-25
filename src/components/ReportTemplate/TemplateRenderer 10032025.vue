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
                <td v-for="header in block.headers" :key="header.field"
                  :style="{ textAlign: header.align, verticalAlign: 'top' }">

                  <!-- Empty row placeholder -->
                  <div v-if="isEmptyRow(row) && header === block.headers[0]"
                    class="text-left text-muted fw-bold fst-italic text-uppercase">
                    Kosong
                  </div>

                  <div v-else>
                    <!-- Formatted -->
                    <div v-if="header.format">
                      <div v-if="!editing" v-html="renderFormat(header.format, row, header)"></div>

                      <!-- Editable catatan -->
                      <div v-else-if="header.format.includes('catatan')" class="mt-1 d-flex align-items-center">
                        <input type="text" v-model="row.catatan" class="form-control form-control-sm fw-bold"
                          @blur="$emit('save-catatan', row)" />
                      </div>
                    </div>

                    <!-- Array Field -->
                    <template v-if="Array.isArray(row[header.field])">
                      <div v-for="(val, idx) in row[header.field]" :key="idx">{{ val }}</div>
                    </template>

                    <!-- Plain -->
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
        // let i = 1;
        // ol.querySelectorAll("li").forEach((li) => {
        //   // Remove Quill's inline counter styles
        //   li.style.counterIncrement = "none";
        //   li.style.listStyleType = "none";

        //   // Clean existing numbering text
        //   li.innerHTML = li.innerHTML.replace(/^\s*\d+(\.\d+)*\.\s*/, "");

        //   // Prepend our clean number
        //   li.innerHTML = `<span style="margin-right:6px;">${i}.</span> ${li.innerHTML}`;
        //   i++;
        // });

        // Remove counter-reset from ol (disable nested numbering)
        ol.style.counterReset = "none";
        ol.style.listStyleType = "none";
      });

      return wrapper.innerHTML;
    },
    getTableRows(block) {
      let rows = [...this.data];

      if (block.filterJenis) {
        rows = rows.filter(item => Number(item.id_jenis_pelantikan) === Number(block.filterJenis));
      }

      const rowCount = block.rowCount || rows.length;
      const startRow = block.startRow || 1;

      // Separate Ahli vs Non-Ahli
      const nonAhli = rows.filter(r => r.peranan !== null);
      const ahli = rows.filter(r => r.peranan === null);

      // Build result array with references (not clones)
      const result = Array(rowCount).fill(null);

      let rowIndex = 0;

      // Fill non-Ahli first (use original reference, not spread)
      for (let i = 0; i < nonAhli.length && rowIndex < result.length; i++) {
        result[rowIndex] = nonAhli[i];
        result[rowIndex].__rowKey = `nonahli-${i}`;
        rowIndex++;
      }

      // Fill Ahli starting from startRow-1
      let ahliIndex = startRow - 1;
      for (let i = 0; i < ahli.length && ahliIndex < result.length; i++) {
        result[ahliIndex] = ahli[i];
        result[ahliIndex].__rowKey = `ahli-${i}`;
        ahliIndex++;
      }

      // Fill empty rows with placeholders
      for (let i = 0; i < result.length; i++) {
        if (!result[i]) {
          result[i] = Object.fromEntries(block.headers.map(h => [h.field, ""]));
        }
      }

      // Generate indexes
      let indexCounter = 1;
      result.forEach((row, idx) => {
        if (idx >= (startRow - 1)) {
          row.__index = indexCounter++;
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
