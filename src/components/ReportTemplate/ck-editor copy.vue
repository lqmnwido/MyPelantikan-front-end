<template>
  <div>
    <Loader :loading="loading" class="loading-overlay" />

    <!-- Template Name -->
    <div class="mb-3">
      <label class="form-label fw-bold">Laporan bagi senarai:</label>
      <Multiselect v-model="templateName" :options="jenisPelantikanOptions" :searchable="true" :close-on-select="true"
        placeholder="Sila Pilih Jenis Pelantikan" label="label" track-by="value" valueProp="value"
        class="form-control form-control-sm w-100 custom-multiselect" />
    </div>

    <!-- TABS -->
    <BTabs justified nav-class="nav-tabs-custom" content-class="p-1 text-muted">
      <BTab @click="changeTab('editor')" :class="['nav-link', selectedTab === 'editor' ? 'active' : '']">
        <template #title><span class="d-none d-sm-inline-block">Editor</span></template>
      </BTab>
      <BTab @click="changeTab('preview')" :class="['nav-link', selectedTab === 'preview' ? 'active' : '']">
        <template #title><span class="d-none d-sm-inline-block">Preview</span></template>
      </BTab>
    </BTabs>

    <!-- ==================== EDITOR TAB ==================== -->
    <div v-if="selectedTab === 'editor'" class="mt-3">
      <div class="form-check mb-3">
        <input type="checkbox" class="form-check-input" id="livePreview" v-model="livePreview" />
        <label class="form-label" for="livePreview">Tunjukkan live preview semasa mengedit</label>
      </div>

      <!-- Draggable for text + table only -->
      <draggable :list="draggableBlocks" handle=".drag-handle" item-key="id" class="list-group"
        @end="syncDraggableOrder">
        <template #item="{ element: block, index: bIndex }">
          <div class="mb-3 list-group-item">
            <BCard>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center">
                  <span class="drag-handle me-2" style="cursor: grab">⠿</span>
                  <h6>
                    {{ block.type === "text" ? "Text Editor" : "Table Builder" }}
                    #{{ bIndex + 1 }}
                  </h6>
                </div>
                <button class="btn btn-sm btn-danger" @click="removeBlock(bIndex)">
                  Remove
                </button>
              </div>

              <!-- TEXT BLOCK -->
              <div v-if="block.type === 'text'">
                <QuillEditor v-model:content="block.content" theme="snow" contentType="html" :options="editorOptions" />
              </div>

              <!-- TABLE BLOCK -->
              <div v-else-if="block.type === 'table'">
                <!-- Jenis + Saringan -->
                <div class="mb-2 d-flex gap-2">
                  <div>
                    <label class="me-2 fw-bold">Jenis Pelantikan:</label>
                    <select v-model="block.filterJenis" class="form-select form-select-sm w-auto"
                      @change="onJenisChange(block)">
                      <option disabled value="">-- Select --</option>
                      <option v-for="opt in jenisPelantikan" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </div>
                  
                </div>

                <!-- Column Controls -->
                <div class="mb-2 d-flex align-items-center">
                  <button class="btn btn-sm btn-outline-success me-2" @click="addColumn(block)">
                    + Add Column
                  </button>
                </div>

                <!-- Table Headers -->
                <div class="table-responsive" style="overflow-x: auto; display: block">
                  <table class="table table-bordered" style="min-width: 100%">
                    <thead>
                      <tr>
                        <th style="width: 5%; text-align: center">
                          <label class="form-label small">Index Header</label>
                          <input type="text" v-model="block.indexHeader" class="form-control form-control-sm"
                            placeholder="#" />
                          <label class="form-label small mt-1">Start Row</label>
                          <input type="number" v-model.number="block.startRow" class="form-control form-control-sm"
                            placeholder="1" @input="updateRows(block)" />
                        </th>
                        <th v-for="(header, hIndex) in block.headers" :key="hIndex"
                          :style="{ width: header.width + '%' }">
                          <label class="form-label small">Header Name</label>
                          <input v-model="header.text" placeholder="Header Name"
                            class="form-control form-control-sm mb-1" @input="updateRows(block)" />
                          <label class="form-label small">Bind Field</label>
                          <select v-model="header.field" class="form-select form-select-sm mb-2"
                            @change="updateRows(block)">
                            <option v-for="field in variablesField" :key="field" :value="field">{{ field }}</option>
                            <option value="__custom__">Custom</option>
                          </select>
                          <div v-if="header.field === '__custom__'" class="mb-2">
                            <label class="form-label small">Custom Format</label>
                            <textarea v-model="header.format" rows="1" class="form-control form-control-sm"
                              @input="updateRows(block)" placeholder="Example: {{nama}} ( {{umur}} )" />
                          </div>
                          <label class="form-label small">Alignment</label>
                          <select v-model="header.align" class="form-select form-select-sm mb-1"
                            @change="updateRows(block)">
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                          </select>
                          <label class="form-label small">Width (%)</label>
                          <div class="input-group mb-2">
                            <input type="number" v-model.number="header.width" class="form-control form-control-sm"
                              @input="syncWidths(block)" />
                            <span class="input-group-text">%</span>
                          </div>
                          <button class="btn btn-sm btn-outline-danger w-100 mt-2" @click="removeColumn(block, hIndex)">
                            Remove
                          </button>
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
              </div>

              <!-- Live Preview -->
              <div v-if="livePreview" class="mt-3 p-2 border rounded bg-light">
                <div v-if="block.type === 'text'" class="ql-editor" v-html="block.content"></div>
                <div v-else-if="block.type === 'table'">
                  <div class="table-responsive" style="overflow-x: auto">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th :style="{ width: '5%', textAlign: 'center' }">
                            {{ block.indexHeader }}
                          </th>
                          <th v-for="(header, hIndex) in block.headers" :key="hIndex" :style="{
                            textAlign: header.align,
                            width: header.width + '%',
                          }" v-html="header.text"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rIndex) in block.rows" :key="rIndex">
                          <td :style="{ width: '5%', textAlign: 'center' }">
                            {{ getIndexNumber(block, rIndex) }}
                          </td>
                          <td v-for="(cell, cIndex) in row" :key="cIndex" :style="{
                            textAlign: block.headers[cIndex].align,
                            width: block.headers[cIndex].width + '%',
                          }" v-html="cell"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </BCard>
          </div>
        </template>
      </draggable>

      <!-- Fixed Nota, Alamat, and Tarikh -->
      <div v-for="block in fixedBlocks" :key="block.id" class="mb-3 list-group-item">
        <BCard>
          <!-- Nota -->
          <div v-if="block.type === 'nota'">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6>Nota:</h6>
              <button class="btn btn-sm btn-danger" @click="removeFixedBlock('nota')">Remove</button>
            </div>
            <ToastEditor v-model="block.content" />
          </div>


          <!-- Footer -->
          <div v-else-if="block.type === 'footer'">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6>Footer:</h6>
              <button class="btn btn-sm btn-danger" @click="removeFixedBlock('footer')">Remove</button>
            </div>
            <QuillEditor v-model:content="block.content" theme="snow" contentType="html" :options="editorOptions" />
          </div>

          <!-- Tarikh -->
          <div v-else-if="block.type === 'tarikh'">
            <h6>Tarikh:</h6>
            <p class="fw-bold">{{ block.date }}</p>
          </div>
        </BCard>
      </div>


      <!-- Controls -->
      <div class="text-start mb-3 d-flex justify-content-between">
        <div>
          <button class="btn btn-sm btn-primary me-2" @click="addBlock('text')">
            + Tambah Text Editor
          </button>
          <button class="btn btn-sm btn-primary me-2" @click="addBlock('table')">
            + Tambah Table
          </button>
          <button class="btn btn-sm btn-primary me-2" @click="addBlock('nota')">
            + Tambah Nota
          </button>
          <button class="btn btn-sm btn-primary" @click="addBlock('footer')">
            + Tambah Footer
          </button>
        </div>
        <div>
          <button class="btn btn-sm btn-danger me-2 btn-action" @click="handlBack">
            <span class="mdi mdi-cancel"></span> Batal
          </button>
          <button v-if="!isUpdate" class="btn btn-sm btn-success btn-action" @click="saveTemplate">
            <span class="mdi mdi-content-save"></span> Simpan
          </button>
          <button v-else class="btn btn-sm btn-success btn-action" @click="updateTemplate">
            <span class="mdi mdi-content-save-edit"></span> Kemaskini
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== PREVIEW TAB ==================== -->
    <div v-else-if="selectedTab === 'preview'" class="mt-3">
      <BCard>
        <!-- Show draggable blocks first -->
        <div v-for="block in draggableBlocks" :key="'preview-' + block.id" class="mb-3">
          <div v-if="block.type === 'text'" class="ql-editor" v-html="block.content"></div>
          <div v-else-if="block.type === 'table'">
            <div class="table-responsive" style="overflow-x: auto">
              <table class="table table-bordered">
                <thead class="table-secondary">
                  <tr>
                    <th :style="{ width: '5%', textAlign: 'center' }">
                      {{ block.indexHeader }}
                    </th>
                    <th v-for="(header, hIndex) in block.headers" :key="hIndex" :style="{
                      textAlign: header.align,
                      width: header.width + '%',
                    }" v-html="header.text"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rIndex) in block.rows" :key="rIndex">
                    <td :style="{ width: '5%', textAlign: 'center' }">
                      {{ getIndexNumber(block, rIndex) }}
                    </td>
                    <td v-for="(cell, cIndex) in row" :key="cIndex" :style="{
                      textAlign: block.headers[cIndex].align,
                      width: block.headers[cIndex].width + '%',
                    }" v-html="cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Show fixed blocks after -->
        <div v-for="block in fixedBlocks" :key="'preview-' + block.id" class="mb-3">
          <div v-if="block.type === 'nota'" class="note">
            <h3>Nota:</h3>
            <div class="mx-2" v-html="block.content"></div>
          </div>
          <div v-else-if="block.type === 'footer'" class="note">
            <div class="ql-editor" v-html="block.content"></div>
          </div>
          <div v-else-if="block.type === 'tarikh'">
            <p>{{ block.date }}</p>
          </div>
        </div>
      </BCard>
    </div>
    <SweetAlert :show="alert.successTambah" type="success" title="Berjaya!" text="Templat ditambah." :autoClose="1500"
      @closed="alert.successTambah = false" />

    <SweetAlert :show="alert.successKemaskini" type="success" title="Berjaya!" text="Templat dikemaskini."
      :autoClose="1500" @closed="alert.successKemaskini = false" />

    <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
      @closed="alert.error = false" />
  </div>

</template>

<script>
import { QuillEditor } from "@vueup/vue-quill";
import draggable from "vuedraggable";
import Quill from "quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import Multiselect from '@vueform/multiselect';
import SweetAlert from "@/components/SweetAlert.vue";
import Loader from "@/components/widgets/loader";
import { templateService } from "@/services/template.service.js";
import ToastEditor from "./ToastEditor.vue";

// Custom HR Blot
const BlockEmbed = Quill.import("blots/block/embed");
class HrBlot extends BlockEmbed {
  static blotName = "hr";
  static tagName = "hr";
  static create() {
    let node = super.create();
    node.setAttribute(
      "style",
      "border:none; border-top:2px solid #000; margin:0;"
    );
    return node;
  }
}
Quill.register(HrBlot);
const icons = Quill.import("ui/icons");
icons.hr =
  '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line></svg>';

export default {
  name: "GeneratedTemplate",
  components: { QuillEditor, draggable, SweetAlert, Loader, Multiselect, ToastEditor },
  props: {
    initialData: { type: Object, default: () => null }, // <-- pass template data if editing
    variablesField: { type: Array, default: () => [] },
    variableJson: { type: Object, default: () => ({}) },
    jenisPelantikan: { type: Array, default: () => [] },
    jenisPelantikanOptions: { type: Array, default: () => [] },
    
  },
  data() {
    return {
      loading: false,
      alert: {
        successKemaskini: false,
        successTambah: false,
        error: false,
        errorMessage: '',
      },
      localTemplateId: this.templateId,
      selectedTab: "editor",
      livePreview: true,
      templateName: "",
      selectedJenisPelantikanName: null,
      blocks: [],
      editorOptions: {
        modules: {
          toolbar: {
            container: [
              [{ font: [] }, { size: [] }],
              ["bold", "italic", "underline", "strike"],
              ["hr"],
              [{ color: [] }, { background: [] }],
              [{ script: "sub" }, { script: "super" }],
              [{ header: [1, 2, 3, false] }],
              [{ align: [] }],
              [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
              [{ indent: "-1" }, { indent: "+1" }],
            ],
            handlers: {
              hr: function () {
                const range = this.quill.getSelection();
                if (range)
                  this.quill.insertEmbed(range.index, "hr", true, "user");
              },
            },
          },
          keyboard: {
            bindings: {
              list: false
            }
          }
        },
      },
    };
  },
  computed: {
    isUpdate() {
      return !!this.localTemplateId;
    },
    draggableBlocks() {
      return this.blocks.filter(
        (b) => b.type === "text" || b.type === "table"
      );
    },
    fixedBlocks() {
      return this.blocks.filter(
        (b) => b.type === "nota" || b.type === "tarikh" || b.type === "footer"
      );
    },
  },
  watch: {
    selectedJenisPelantikanName(newVal) {
      let name = '';
      if (newVal && typeof newVal === 'object') {
        name = newVal.name;
      } else {
        name = newVal;
      }

      if (typeof name === 'string') {
        this.templateName = name;
      } else {
        this.templateName = '';
      }
    },
    variableJson: {
      handler() {
        this.blocks.forEach((b) => {
          if (b.type === "table") this.updateRows(b);
        });
      },
      deep: true,
    },
  },
  mounted() {
    if (this.initialData) {
      this.selectedJenisPelantikanName = this.initialData.name || null;
      this.blocks = this.initialData.blocks || [];
      this.blocks.forEach((b) => {
        if (b.type === "table") {
          b.dataRowCount = b.rowCount - ((b.startRow || 1) - 1);
          this.updateRows(b);
        }
      });

      this.ensureTarikhBlock();
      return;
    }

    const id = this.$route.query.id;
    if (id) {
      this.localTemplateId = id;
      this.loadTemplate(id);
    } else {
      this.ensureTarikhBlock();
    }
  },
  beforeUnmount() {
    // All editor cleanup is now handled by the ToastEditor component
  },
  methods: {
    changeTab(tab) {
      this.selectedTab = tab;
    },
    async loadTemplate(id) {
      this.loading = true;
      try {
        const res = await templateService.getTemplateReport(id);

        const template = res.template || {};
        this.selectedJenisPelantikanName = template.name || null;
        this.blocks = template.blocks || [];

        this.blocks.forEach((b) => {
          if (b.type === "table") {
            b.dataRowCount = b.rowCount - ((b.startRow || 1) - 1);
            this.updateRows(b);
          }
        });

      } catch (err) {
        this.alert.error = true;
        this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
        // console.error("Failed to load template:", err);
      } finally {
        this.loading = false;
      }
    },

    ensureTarikhBlock() {
      let tarikh = this.blocks.find((b) => b.type === "tarikh");

      if (!tarikh) {
        const date = new Date();
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear();
        tarikh = {
          id: `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          type: "tarikh",
          date: `${month} ${year}`,
        };
        this.blocks.push(tarikh);
      }

      this.reorderFixedBlocks();
    },

    reorderFixedBlocks() {
      const draggables = this.draggableBlocks;
      const nota = this.blocks.find((b) => b.type === "nota");
      const footer = this.blocks.find((b) => b.type === "footer");
      const tarikh = this.blocks.find((b) => b.type === "tarikh");

      this.blocks = [
        ...draggables,
        ...(nota ? [nota] : []),
        ...(footer ? [footer] : []),
        ...(tarikh ? [tarikh] : []),
      ];
    },

    addBlock(type) {
      if (type === "text") {
        this.blocks.push({
          id: Date.now() + Math.random(),
          type: "text",
          content: "",
        });
      } else if (type === "table") {
        const newTable = {
          id: Date.now() + Math.random(),
          type: "table",
          headers: [
            { text: "Header", field: "", format: "", align: "left", width: 20 },
          ],
          rows: [],
          filterJenis: "",
          indexHeader: "#",
          startRow: 1,
        };
        this.blocks.push(newTable);
        this.updateRows(newTable);
      } else if (type === "nota") {
        if (!this.blocks.find((b) => b.type === "nota")) {
          const newBlock = {
            id: Date.now() + Math.random(),
            type: "nota",
            content: "",
          };
          this.blocks.push(newBlock);
        }
      } else if (type === "footer") {
        if (!this.blocks.find((b) => b.type === "footer")) {
          this.blocks.push({
            id: Date.now() + Math.random(),
            type: "footer",
            content: "",
          });
        }
      }

      this.ensureTarikhBlock();
    },

    removeFixedBlock(type) {
      this.blocks = this.blocks.filter((b) => b.type !== type);
      this.ensureTarikhBlock();
    },

    removeBlock(index) {
      const toRemove = this.draggableBlocks[index];
      if (!toRemove) return;
      const idx = this.blocks.findIndex((b) => b.id === toRemove.id);
      if (idx !== -1) this.blocks.splice(idx, 1);
    },

    addColumn(block) {
      block.headers.push({
        text: "Header",
        field: "",
        format: "",
        align: "left",
        width: 20,
      });
      this.updateRows(block);
    },

    removeColumn(block, index) {
      block.headers.splice(index, 1);
      this.updateRows(block);
    },

    applyCustomFormat(format, record) {
      return format
        .replace(/\n/g, "<br>")
        .replace(/{{(.*?)}}/g, (match, field) => {
          const key = field.trim();
          return record[key] !== undefined ? record[key] : match;
        });
    },

    updateRows(block, recalculate = false) {
      let dataRowCount = 0;
      if (block.dataRowCount && !recalculate) {
        dataRowCount = block.dataRowCount;
      } else if (block.rowCount && !recalculate) {
        dataRowCount = block.rowCount - ((block.startRow || 1) - 1);
      } else {
        const selected = this.jenisPelantikan.find(
          (j) => j.value === block.filterJenis
        );
        if (selected && Number.isInteger(selected.maxAhli)) {
          dataRowCount = selected.maxAhli;
        } else {
          const lengths = Object.values(this.variableJson).map((arr) =>
            Array.isArray(arr) ? arr.length : 0
          );
          dataRowCount = lengths.length ? Math.max(...lengths) : 0;
        }
      }

      const totalRows = dataRowCount + (block.startRow || 1) - 1;

      const rows = [];
      for (let i = 0; i < totalRows; i++) {
        const record = {};
        const dataIndex = i - ((block.startRow || 1) - 1);

        if (dataIndex >= 0 && dataIndex < dataRowCount) {
            for (const key of Object.keys(this.variableJson)) {
              record[key] =
                (Array.isArray(this.variableJson[key])
                  ? this.variableJson[key][dataIndex]
                  : undefined) || "";
            }
        }

        const row = block.headers.map((h) => {
          if (dataIndex < 0) {
              return "";
          }
          if (h.field === "__custom__" && h.format)
            return this.applyCustomFormat(h.format, record);
          if (h.field && this.variableJson[h.field] !== undefined)
            return this.variableJson[h.field][dataIndex] || "";
          return "";
        });
        rows.push(row);
      }
      block.rows = rows;
    },

    getIndexNumber(block, rIndex) {
      if (rIndex + 1 < (block.startRow || 1)) return "";
      return 1 + (rIndex - ((block.startRow || 1) - 1));
    },

    syncWidths(block) {
      block.headers.forEach((h) => {
        h.width = Number(h.width || 0);
      });
    },

    syncDraggableOrder() {
      const newDraggables = this.draggableBlocks;
      const indices = [];
      this.blocks.forEach((b, i) => {
        if (b.type === "text" || b.type === "table") indices.push(i);
      });

      if (indices.length !== newDraggables.length) {
        const fixed = this.blocks.filter(
          (b) => b.type === "nota" || b.type === "tarikh"
        );
        this.blocks = [...newDraggables, ...fixed];
        return;
      }

      const newBlocks = [...this.blocks];
      let j = 0;
      for (const idx of indices) {
        newBlocks[idx] = newDraggables[j++];
      }
      this.blocks = newBlocks;
    },

    async saveTemplate() {
      if (!this.templateName) {
        alert("Nama laporan diperlukan.");
        return;
      }
      const blocksWithRowCount = this.blocks.map((block) => {
        if (block.type === "table") {
          return {
            ...block,
            rows: undefined,
            rowCount: block.rows.length,
          };
        }
        return block;
      });
      const payload = { name: this.templateName, blocks: blocksWithRowCount };
      // console.log("Saving template with payload:", payload);
      try {
        await templateService.simpanTemplateReport(payload);
        this.alert.successTambah = true;
        this.$router.push('/pentadbir/senarai-laporan');
      } catch (err) {
        this.alert.error = true;
        this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
        // console.log("Error:", error);
        // alert("Gagal untuk menyimpan template.");
      }
    },

    async updateTemplate() {
      if (!this.templateName) {
        alert("Nama laporan diperlukan.");
        return;
      }

      const blocksWithRowCount = this.blocks.map((block) => {
        if (block.type === "table") {
          return {
            ...block,
            rows: undefined,
            rowCount: block.rows.length
          };
        }
        return block;
      });

      const payload = { name: this.templateName, blocks: blocksWithRowCount };
      // console.log("Updating template with payload:", payload);

      // console.log("Updating template with ID:", this.localTemplateId, payload);

      try {
        await templateService.kemaskiniTemplateReport(this.localTemplateId, payload);
        this.alert.successKemaskini = true;
        this.$router.push('/pentadbir/senarai-laporan');
      } catch (err) {
        this.alert.error = true;
        this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
      }
    },

    onJenisChange(block) {
      this.updateRows(block, true);
    },

    

    headerFieldChanged(block) {
      this.updateRows(block);
    },

    handlBack() {
      this.$router.back();
    },

  },
};
</script>

<style scoped>
.note h3 {
  font-weight: bold;
  text-decoration: underline;
  font-size: 14pt;
  margin-bottom: 10px;
  font-family: Arial, sans-serif;
}

.btn-action {
  width: 100px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  width: 100%;
  background: rgba(255, 255, 255, 0.6);
}

.custom-multiselect {
  max-width: 100%;
  /* Adjust this value as needed */
}
</style>