<template>
  <div>
    <!-- Template Name -->
    <div class="mb-3">
      <label class="form-label fw-bold">Nama Laporan:</label>
      <input type="text" v-model="templateName" class="form-control" placeholder="Masukkan nama Laporan" />
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

    <!-- EDITOR TAB -->
    <div v-if="selectedTab === 'editor'" class="mt-3">
      <div class="form-check mb-3">
        <input type="checkbox" class="form-check-input" id="livePreview" v-model="livePreview" />
        <label class="form-check-label" for="livePreview">Show live preview while editing</label>
      </div>

      <draggable v-model="blocks" handle=".drag-handle" item-key="id" class="list-group">
        <template #item="{ element: block, index: bIndex }">
          <div class="mb-3 list-group-item">
            <BCard>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center">
                  <span class="drag-handle me-2" style="cursor: grab;">⠿</span>
                  <h6>{{ block.type === "text" ? "Text Editor" : "Table Builder" }} #{{ bIndex + 1 }}</h6>
                </div>
                <button class="btn btn-sm btn-danger" @click="removeBlock(bIndex)">Remove</button>
              </div>

              <!-- TEXT BLOCK -->
              <div v-if="block.type === 'text'">
                <QuillEditor v-model:content="block.content" theme="snow" contentType="html" :options="editorOptions" />
              </div>

              <!-- TABLE BLOCK -->
              <div v-else-if="block.type === 'table'">
                <div class="mb-2 d-flex gap-2">
                  <!-- Jenis Pelantikan -->
                  <div>
                    <label class="me-2 fw-bold">Jenis Pelantikan:</label>
                    <select v-model="block.filterJenis" class="form-select form-select-sm w-auto"
                      @change="onJenisChange(block)">
                      <option disabled value="">-- Select --</option>
                      <option v-for="opt in jenisPelantikan" :key="opt.value" :value="opt.value">{{ opt.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Saringan (dependent dropdown) -->
                  <div>
                    <label class="me-2 fw-bold">Saringan:</label>
                    <select v-model="block.filterSaringan" class="form-select form-select-sm w-auto">
                      <option disabled value="">-- Select --</option>
                      <option v-for="s in getFilteredSaringan(block)" :key="s.value" :value="s.value">{{ s.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Column Controls -->
                <div class="mb-2 d-flex align-items-center">
                  <button class="btn btn-sm btn-outline-success me-2" @click="addColumn(block)">+ Add Column</button>
                </div>

                <!-- Table Headers -->
                <div class="table-responsive" style="overflow-x: auto; display: block;">
                  <table class="table table-bordered" style="min-width: 100%;">
                    <thead>
                      <tr>
                        <th style="width: 5%; text-align:center;">
                          <label class="form-label small">Index Header</label>
                          <input type="text" v-model="block.indexHeader" class="form-control form-control-sm"
                            placeholder="#" />
                          <label class="form-label small mt-1">Start Row</label>
                          <input type="number" v-model.number="block.startRow" class="form-control form-control-sm"
                            placeholder="1" />
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
                              @input="updateRows(block)" placeholder="Example: {{nama}} ( {{umur}} )"></textarea>
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
                  <div class="table-responsive" style="overflow-x: auto;">
                    <table class="table table-bordered" style="min-width: max-content;">
                      <thead>
                        <tr>
                          <th :style="{ width: '5%', textAlign: 'center' }">{{ block.indexHeader }}</th>
                          <th v-for="(header, hIndex) in block.headers" :key="hIndex"
                            :style="{ textAlign: header.align, width: header.width + '%' }" v-html="header.text"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rIndex) in block.rows" :key="rIndex">
                          <td :style="{ width: '5%', textAlign: 'center' }">{{ getIndexNumber(block, rIndex) }}</td>
                          <td v-for="(cell, cIndex) in row" :key="cIndex"
                            :style="{ textAlign: block.headers[cIndex].align, width: block.headers[cIndex].width + '%' }"
                            v-html="cell"></td>
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

      <div class="text-start mb-3 d-flex justify-content-between">
        <div>
          <button class="btn btn-sm btn-primary me-2" @click="addBlock('text')">+ Add Text Editor</button>
          <button class="btn btn-sm btn-success" @click="addBlock('table')">+ Add Table</button>
        </div>
        <button class="btn btn-sm btn-warning" @click="saveTemplate">💾 Simpan</button>
      </div>
    </div>

    <!-- PREVIEW TAB -->
    <div v-else-if="selectedTab === 'preview'" class="mt-3">
      <BCard>
        <div v-for="block in blocks" :key="'preview-' + block.id" class="mb-3">
          <div v-if="block.type === 'text'" class="ql-editor" v-html="block.content"></div>
          <div v-else-if="block.type === 'table'">
            <div class="table-responsive" style="overflow-x: auto;">
              <table class="table table-bordered" style="min-width: max-content;">
                <thead class="table-secondary">
                  <tr>
                    <th :style="{ width: '5%', textAlign: 'center' }">{{ block.indexHeader }}</th>
                    <th v-for="(header, hIndex) in block.headers" :key="hIndex"
                      :style="{ textAlign: header.align, width: header.width + '%' }" v-html="header.text"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rIndex) in block.rows" :key="rIndex">
                    <td :style="{ width: '5%', textAlign: 'center' }">{{ getIndexNumber(block, rIndex) }}</td>
                    <td v-for="(cell, cIndex) in row" :key="cIndex"
                      :style="{ textAlign: block.headers[cIndex].align, width: block.headers[cIndex].width + '%' }"
                      v-html="cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </BCard>
    </div>
  </div>
</template>

<script>
import { QuillEditor } from "@vueup/vue-quill";
import draggable from "vuedraggable";
import Quill from "quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { templateService } from "@/services/template.service.js";

// Custom HR Blot
const BlockEmbed = Quill.import("blots/block/embed");
class HrBlot extends BlockEmbed {
  static blotName = "hr";
  static tagName = "hr";
  static create() {
    let node = super.create();
    node.setAttribute("style", "border:none; border-top:2px solid #000; margin:1rem 0;");
    return node;
  }
}
Quill.register(HrBlot);
const icons = Quill.import("ui/icons");
icons.hr = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line></svg>';

export default {
  name: "GeneratedTemplate",
  components: { QuillEditor, draggable },
  props: {
    variablesField: { type: Array, default: () => [] },
    variableJson: { type: Object, default: () => ({}) },
    jenisPelantikan: { type: Array, default: () => [] },
    saringan: { type: Array, default: () => [] },
  },
  data() {
    return {
      selectedTab: "editor",
      livePreview: true,
      templateName: "",
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
                if (range) this.quill.insertEmbed(range.index, "hr", true, "user");
              },
            },
          },
        },
      },
    };
  },
  methods: {
    changeTab(tab) { this.selectedTab = tab; },
    addBlock(type) {
      if (type === "text") this.blocks.push({ id: Date.now() + Math.random(), type: "text", content: "" });
      else if (type === "table") this.blocks.push({
        id: Date.now() + Math.random(),
        type: "table",
        headers: [{ text: "Header", field: "", format: "", align: "left", width: 20 }],
        rows: [],
        filterJenis: "",
        filterSaringan: "",
        indexHeader: "#",
        startRow: 1
      });
    },
    removeBlock(index) { this.blocks.splice(index, 1); },
    addColumn(block) { block.headers.push({ text: "Header", field: "", format: "", align: "left", width: 20 }); this.updateRows(block); },
    removeColumn(block, index) { block.headers.splice(index, 1); this.updateRows(block); },

    applyCustomFormat(format, record) {
      return format.replace(/\n/g, "<br>").replace(/{{(.*?)}}/g, (match, field) => {
        const key = field.trim();
        return record[key] !== undefined ? record[key] : match;
      });
    },

    updateRows(block) {
      const selected = this.jenisPelantikan.find(j => j.value === block.filterJenis);
      const rowCount = selected ? selected.maxAhli : Math.max(...Object.values(this.variableJson).map(arr => arr.length), 0);
      const rows = [];
      for (let i = 0; i < rowCount; i++) {
        const record = {};
        for (const key of Object.keys(this.variableJson)) record[key] = this.variableJson[key][i] || '';
        const row = block.headers.map(h => {
          if (h.field === '__custom__' && h.format) return this.applyCustomFormat(h.format, record);
          if (h.field && this.variableJson[h.field] !== undefined) return this.variableJson[h.field][i] || '';
          return '';
        });
        rows.push(row);
      }
      block.rows = rows;
    },

    getIndexNumber(block, rIndex) { return rIndex + 1 < block.startRow ? "" : 1 + (rIndex - (block.startRow - 1)); },
    syncWidths(block) { block.headers.forEach(h => { h.width = Number(h.width); }); },

    async saveTemplate() {
      if (!this.templateName.trim()) {
        alert("Please enter a template name.");
        return;
      }
      const payload = { name: this.templateName, blocks: this.blocks };
      // console.log("Template Saved:", payload);
      alert("Template saved! Check console for details.");

      try {
        await templateService.simpanTemplateReport(payload);
        alert("Template saved successfully!");
      } catch (error) {
        console.log("Error:", error);
        alert("Failed to save template.");
      }
    },

    onJenisChange(block) {
      // Reset saringan if jenisPelantikan changes
      block.filterSaringan = '';
      this.updateRows(block);
    },

    getFilteredSaringan(block) {
      return this.saringan.filter(s => s.jenis_pelantikan === block.filterJenis);
    }
  }
}
</script>
