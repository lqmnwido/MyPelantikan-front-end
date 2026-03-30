<template>
  <div class="container p-4 mb-5">
    <!-- PDF Content -->
    <div ref="pdfContent" class="pdf-content">
      <!-- Page A -->
      <div class="page">
        <div class="row mb-3">
          <div class="col text-start fw-bold">
            <div class="dropdown" v-if="showGearButton">
              <button class="btn btn-sm btn-light" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown"
                aria-expanded="false">
                <i class="bx bx-cog"></i>
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li v-for="(field, key) in personalFieldOptions" :key="key">
                  <div class="dropdown-item">
                    <input class="form-check-input" type="checkbox" v-model="internalVisibleFields[key]"
                      :id="'check-' + key">
                    <label class="form-check-label" :for="'check-' + key">
                      {{ field.label }}
                    </label>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="col text-end fw-bold">
            <span v-if="!editing" @click="editing = true" style="cursor: pointer;">
              {{ editableLampiran }}
              <i class="bx bx-pencil ms-1 text-muted" v-if="showGearButton" style="font-size: 0.8rem;"></i>
            </span>
            <input v-else v-model="editableLampiran" @blur="saveLampiran" @keydown.enter.prevent="saveLampiran"
              class="form-control form-control-sm d-inline w-auto" />
          </div>
        </div>

        <div class="text-center mb-3">
          <img :src="profileImage" class="img-thumbnail mb-1" width="130px" style="height: 150px !important;"/>
          <div class="fw-bold"><u>PERIHAL DIRI</u></div>
        </div>

        <h5 class="fw-bold">A: <u>PERIBADI</u></h5>
        <div class="info-section">
          <div class="row-info mb-3 px-3" v-for="(value, key) in personalFields" :key="key">
            <div class="label">{{ key }}</div>
            <div class="colon">:</div>
            <div class="value">
              <template v-if="Array.isArray(value)">
                <div v-for="(line, idx) in value" :key="idx">
                  {{ line }}
                  <template v-if="idx < value.length - 1"><br /><br /></template>
                </div>
              </template>
              <template v-else>
                {{ value }}
              </template>
            </div>

            <!-- Insert dropdown below Nama -->
            <template
              v-if="key === 'Nama' && ((resume.personal.jawatan && resume.personal.jawatan.length > 0) || (resume.personal.pelantikan_terakhir && resume.personal.pelantikan_terakhir.length > 0)) && internalVisibleFields.jawatan">
              <div>
                <div class="label" v-if="!editingJawatanLabel" @click="editingJawatanLabel = true"
                  style="cursor: pointer;">
                  {{ jawatanLabel }}
                  <i class="bx bx-pencil ms-1 text-muted" v-if="showGearButton" style="font-size: 0.8rem;"></i>
                </div>

                <select v-else v-model="jawatanLabel" @blur="saveJawatanLabel" @change="saveJawatanLabel"
                  class="form-select form-select-md w-auto d-inline">
                  <option value="Jawatan Terkini">Jawatan Terkini</option>
                  <option value="Jawatan Terakhir">Jawatan Terakhir</option>
                </select>
              </div>
              <div class="colon">:</div>
              <div class="value">
                <template v-if="jawatanLabel === 'Jawatan Terakhir'">
                  <div v-if="!editingCustomJawatan" @click="editingCustomJawatan = true" style="cursor: pointer;">
                    <span style="white-space: pre-wrap;">{{ customJawatanTerakhir || normalizedJawatan.join('\n') }}</span>
                    <i class="bx bx-pencil ms-1 text-muted" v-if="showGearButton" style="font-size: 0.8rem;"></i>
                  </div>
                  <div v-else>
                    <textarea v-model="customJawatanTerakhir" class="form-control form-control-sm mb-1" rows="3"></textarea>
                    <button class="btn btn-xs btn-primary py-0 px-2" @click="saveCustomJawatan">Simpan</button>
                  </div>
                </template>
                <template v-else>
                  <template v-if="normalizedJawatan.length > 1">
                    <ol class="mb-0 ps-3">
                      <li v-for="(jawatan, index) in normalizedJawatan" :key="index">
                        {{ jawatan }}
                      </li>
                    </ol>
                  </template>
                  <template v-else>
                    {{ normalizedJawatan[0] }}
                  </template>
                </template>
              </div>

            </template>
          </div>

          <!-- Tarikh Bersara block -->
          <!-- <div class="row-info mb-3 px-3" v-if="resume.personal.tarikhBersara && internalVisibleFields.tarikhBersara">
            <div class="label">Tarikh Bersara</div>
            <div class="colon">:</div>
            <div class="value">
              {{ resume.personal.tarikhBersara }}
            </div>
          </div> -->

          <!-- ✅ Kelulusan only if exists -->
          <div class="row-info-kelulusan mb-2 align-items-start px-3"
            v-if="resume.personal.kelulusan && resume.personal.kelulusan.length && internalVisibleFields.kelulusan">
            <div class="label">Kelulusan Akademik</div>
            <div class="colon">:</div>
            <div class="value" style="margin-left: -15px;">
              <ul class="mb-1">
                <li v-for="(item, i) in resume.personal.kelulusan" :key="i">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <!-- <div class="row-info mb-4 px-3"
            v-if="Array.isArray(resume.personal.anugerah) && resume.personal.anugerah.length">
            <div class="label">Anugerah / Pingat:</div>
            <div class="colon">:</div>
            <div class="value">{{ resume.personal.anugerah.join(", ") }}</div>
          </div> -->

          <!-- ✅ Anugerah / Pingat with dropdown -->
          <div class="row-info mb-4 px-3"
            v-if="Array.isArray(resume.personal.anugerah) && resume.personal.anugerah.length && internalVisibleFields.anugerah">
            <div class="label">
              <!-- Clickable label -->
              <div v-if="!editingAnugerahLabel" @click="editingAnugerahLabel = true" style="cursor: pointer;">
                Anugerah / Pingat
                <i class="bx bx-pencil ms-1 text-muted" v-if="showGearButton" style="font-size: 0.8rem;"></i>
              </div>

              <!-- Dropdown for mode selection -->
              <select v-else v-model="anugerahLabelMode" @blur="saveAnugerahMode" @change="saveAnugerahMode"
                class="form-select form-select-md w-auto d-inline">
                <option value="Singkatan">Singkatan</option>
                <option value="Nama Penuh">Nama Penuh</option>
              </select>
            </div>

            <div class="colon">:</div>

            <div class="value">
              <!-- ✅ Short form (comma separated) -->
              <template v-if="anugerahLabelMode === 'Singkatan'">
                {{ resume.personal.anugerah.join(", ") }}
              </template>

              <!-- ✅ Full form (numbered list) -->
              <template v-else>
                <ol class="mb-0 ps-3">
                  <li v-for="(item, index) in resume.personal.anugerah_penuh" :key="index">
                    {{ item }}
                  </li>
                </ol>
              </template>
            </div>
          </div>


        </div>
      </div>

      <!-- Page B -->
      <div v-if="resume.perkhidmatan && resume.perkhidmatan.length > 0" class="page page-break">
        <h5 class="fw-bold mt-3">B: <u>RINGKASAN PERKHIDMATAN</u></h5>
        <table class="table table-bordered mt-2">
          <thead class="table-light">
            <tr>
              <th style="width: 220px;" class="text-center">Tahun</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in resume.perkhidmatan" :key="index">
              <td class="text-center">{{ record.tahun }}</td>
              <td>
                <div v-if="record.catatan === null && record.agensi === null">
                  <div>
                    <template v-for="(part, i) in record.jawatan.split('<br/>')" :key="i">
                      {{ part.trim() }}<br />
                    </template>
                  </div>
                </div>
                <div v-else>{{ record.jawatan }},</div>
                <div style="white-space: pre-wrap;">{{ record.agensi }}</div>
                <div v-if="record.catatan && record.catatan.trim() !== ''" style="font-style: italic;">
                  ({{ record.catatan }})
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- New Dynamic Sections -->
      <div v-for="section in dynamicSections" :key="section.title" class="page page-break">
        <h5 class="fw-bold mt-3"><u>{{ section.title }}</u></h5>
        <table class="table table-bordered mt-2">
          <thead class="table-light">
            <tr>
              <th style="width: 220px;" class="text-center">Tahun</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in section.entries" :key="entry.id">
              <td class="text-center">{{ entry.tahun }}</td>
              <td style="white-space: pre-wrap;">{{ entry.catatan }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import html2pdf from "html2pdf.js";
import { saveAs } from 'file-saver';
import htmlDocx from 'html-docx-js/dist/html-docx';

export default {
  name: "ResumeCard",
  props: {
    resume: Object,
    lampiran: String,
    visibleFields: Object,
    profileImage: String,
    userId: { type: Number, required: false, default: 0 }, // use as key for localStorage
  },
  emits: ["update:lampiran"],
  data() {
    return {
      editing: false,
      editableLampiran: "Lampiran -",
      jawatanLabel: "Jawatan Terkini",
      editingJawatanLabel: false,
      anugerahLabelMode: "Singkatan",
      editingAnugerahLabel: false,
      showGearButton: true,
      editingCustomJawatan: false,
      customJawatanTerakhir: "",
      personalFieldOptions: {
        gelaran: { label: "Gelaran" },
        nama: { label: "Nama" },
        noKp: { label: "No. K/P" },
        tarikhLahir: { label: "Tarikh Lahir" },
        tempatLahir: { label: "Tempat Lahir" },
        alamat: { label: "Alamat" },
        telefon: { label: "No. Telefon" },
        statusKahwin: { label: "Status Kahwin" },
        jawatan: { label: "Jawatan" },
        emel: { label: "Emel" },
        parti: { label: "Parti" },
        bangsa: { label: "Bangsa" },
        agama: { label: "Agama" },
        kelulusan: { label: "Kelulusan Akademik" },
        anugerah: { label: "Anugerah / Pingat" },
        tarikhBersara: { label: "Tarikh Bersara" },
      },
      internalVisibleFields: {},
    };
  },
  computed: {
    normalizedJawatan() {
      let jawatanData = [];
      if (this.jawatanLabel === "Jawatan Terkini") {
        jawatanData = this.resume.personal.jawatan;
      } else if (this.jawatanLabel === "Jawatan Terakhir") {
        jawatanData = this.resume.personal.pelantikan_terakhir;
      }

      if (!jawatanData) return [];
      if (Array.isArray(jawatanData)) return jawatanData;
      // If it's a string, split by newlines
      return jawatanData.split(/\r?\n/).map(x => x.trim()).filter(x => x);
    },

    dynamicSections() {
      console.log("Resume data in ResumeCard:", this.resume);
      if (!this.resume || !this.resume.lain_lain_maklumat) {
        return [];
      }

      let startCharCode = (this.resume.perkhidmatan && this.resume.perkhidmatan.length > 0) ? 67 : 66;

      return this.resume.lain_lain_maklumat.map((section, index) => {
        const letter = String.fromCharCode(startCharCode + index);
        return {
          title: `${letter}: ${section.nama_maklumat.toUpperCase()}`,
          entries: section.entries,
        };
      });
    },

    personalFields() {
      const personal = this.resume.personal;

      // console.log("Resume:", this.resume);
      const allFields = {
        gelaran: { label: "Gelaran", value: personal.gelaran },
        nama: { label: "Nama", value: personal.nama },
        tarikhBersara: { label: "Tarikh Bersara", value: personal.tarikhBersara },
        noKp: { label: "No. K/P", value: personal.noKp },
        tarikhLahir: { label: "Tarikh Lahir", value: personal.tarikhLahir },
        tempatLahir: { label: "Tempat Lahir", value: personal.tempatLahir },
        alamat: { label: "Alamat Rumah", value: personal.alamat },
        telefon: { label: "No. Telefon", value: personal.telefon },
        statusKahwin: { label: "Status Kahwin", value: personal.statusKahwin },
        emel: { label: "Emel", value: personal.emel },
        parti: { label: "Parti", value: personal.parti },
        bangsa: { label: "Bangsa", value: personal.bangsa },
        agama: { label: "Agama", value: personal.agama },
      };

      const fields = {};
      for (const key in allFields) {
        if (this.internalVisibleFields[key]) {
          const field = allFields[key];
          if (field.value !== null && field.value !== undefined && String(field.value).trim() !== "") {
            fields[field.label] = field.value;
          }
        }
      }
      return fields;
    },
  },
  created() {
    // 1. Initialize master list of visible fields from options (default to true)
    let masterVisibleFields = {};
    for (const key in this.personalFieldOptions) {
      masterVisibleFields[key] = true;
    }

    // 2. Apply prop overrides if provided (e.g. from parent component)
    if (this.visibleFields) {
      masterVisibleFields = { ...masterVisibleFields, ...this.visibleFields };
    }

    // 3. Load from localStorage to persist user choices
    const storageKey = `resume_visibleFields_${this.userId}`;
    const storedVisibleFields = localStorage.getItem(storageKey);
    
    if (storedVisibleFields) {
      try {
        const parsed = JSON.parse(storedVisibleFields);
        // Merge stored values with master to handle newly added fields in code
        this.internalVisibleFields = { ...masterVisibleFields, ...parsed };
      } catch (e) {
        this.internalVisibleFields = masterVisibleFields;
      }
    } else {
      this.internalVisibleFields = masterVisibleFields;
    }

    // 4. Load other report settings from localStorage
    const storedLampiran = localStorage.getItem(`resume_lampiran_${this.userId}`);
    const storedJawatan = localStorage.getItem(`resume_jawatanLabel_${this.userId}`);
    const storedAnugerahMode = localStorage.getItem(`resume_anugerahMode_${this.userId}`);

    if (storedLampiran) {
      this.editableLampiran = storedLampiran;
      this.$emit("update:lampiran", this.editableLampiran);
    }
    
    if (storedJawatan) {
      this.jawatanLabel = storedJawatan;
    } else if (!this.resume.personal.jawatan || (Array.isArray(this.resume.personal.jawatan) && this.resume.personal.jawatan.length === 0) || (typeof this.resume.personal.jawatan === 'string' && this.resume.personal.jawatan.trim() === '')) {
      this.jawatanLabel = "Jawatan Terakhir";
    }

    if (storedAnugerahMode) {
      this.anugerahLabelMode = storedAnugerahMode;
    }

    const storedCustomJawatan = localStorage.getItem(`resume_customJawatanTerakhir_${this.userId}`);
    if (storedCustomJawatan) {
      this.customJawatanTerakhir = storedCustomJawatan;
    }
  },
  watch: {
    internalVisibleFields: {
      handler(newVal) {
        localStorage.setItem(`resume_visibleFields_${this.userId}`, JSON.stringify(newVal));
      },
      deep: true,
    },
  },
  methods: {
    closeAllEditors() {
      if (this.editing) this.saveLampiran();
      if (this.editingJawatanLabel) this.saveJawatanLabel();
      if (this.editingCustomJawatan) this.saveCustomJawatan();
      if (this.editingAnugerahLabel) this.saveAnugerahMode();
    },
    saveCustomJawatan() {
      this.editingCustomJawatan = false;
      localStorage.setItem(`resume_customJawatanTerakhir_${this.userId}`, this.customJawatanTerakhir);
    },
    saveLampiran() {
      this.editing = false;
      if (!this.editableLampiran.trim()) this.editableLampiran = "Lampiran -";
      localStorage.setItem(`resume_lampiran_${this.userId}`, this.editableLampiran);
      this.$emit("update:lampiran", this.editableLampiran);
    },
    saveJawatanLabel() {
      this.editingJawatanLabel = false;
      if (!this.jawatanLabel.trim()) this.jawatanLabel = "Jawatan Terkini";
      localStorage.setItem(`resume_jawatanLabel_${this.userId}`, this.jawatanLabel);
    },
    exportToWord() {
      this.closeAllEditors();
      this.showGearButton = false;
      this.$nextTick(() => {

        const element = this.$refs.pdfContent;
        const noKp = this.resume.personal.noKp || "";
        const nama = this.resume.personal.nama || "";
        const last4NoKp = noKp.slice(-4);
        const formattedNama = nama.toUpperCase().replace(/\s+/g, "_");
        const fileName = `${last4NoKp}_${formattedNama}.docx`;

        // Clone rendered HTML
        const htmlContent = element.innerHTML;
        const container = document.createElement("div");
        container.innerHTML = htmlContent;

        // ✅ Remove existing Lampiran span to prevent duplicate
        const existingLampiranSpan = container.querySelector(".row .col.text-end span");
        let lampiranText = "Lampiran -";
        if (existingLampiranSpan) {
          lampiranText = existingLampiranSpan.innerText || "Lampiran -";
          existingLampiranSpan.remove();
        }

        // ✅ Enlarge image before export
        const img = container.querySelector("img");
        if (img) {
          img.setAttribute("width", "130");
          img.setAttribute("height", "150");
          img.style.width = "130px";
          img.style.height = "150px !important";
        }

        // ✅ Add Lampiran fixed top-right header (once)
        const fixedLampiran = `<div style="
      position:absolute;
      top:10px;
      right:20px;
      font-weight:bold;
      text-align:right;
    ">${lampiranText}</div>`;

        // Convert .row-info rows into table layout (Section A)
        const rows = Array.from(container.querySelectorAll(".row-info, .row-info-kelulusan"));
        rows.forEach((row) => {
          const label = row.querySelector(".label")?.innerText || "";
          const colon = row.querySelector(".colon")?.innerText || ":";
          const value = row.querySelector(".value")?.innerHTML || "";

          const isSectionA = row.closest(".info-section") !== null;
          const borderStyle = isSectionA ? "border:none;" : "border:1px solid black;";

          const table = document.createElement("table");
          table.setAttribute("cellspacing", "0");
          table.setAttribute("cellpadding", "3");
          table.style.width = "100%";
          table.style.marginBottom = "5px";
          table.style.borderCollapse = "collapse";
          table.style.border = isSectionA ? "none" : "1px solid black";

          let tableHtml = `
            <tr>
              <td style="width:200px;vertical-align:top;padding:4px;${borderStyle}">
                ${label}
              </td>
              <td style="width:10px;vertical-align:top;padding:4px;${borderStyle}">
                ${colon}
              </td>
              <td style="vertical-align:top;padding:4px;${borderStyle}">
                ${value}
              </td>
            </tr>`;

          // ✅ Handle Jawatan row (Terkini / Terakhir) as a SEPARATE row
          if (label === "Nama" && this.internalVisibleFields.jawatan) {
            const currentJawatanLabel = this.jawatanLabel;
            let jawatanHtml = "";

            if (currentJawatanLabel === "Jawatan Terakhir") {
              const val = this.customJawatanTerakhir || this.normalizedJawatan.join('\n');
              jawatanHtml = val.replace(/\n/g, '<br>');
            } else {
              const jawatanList = this.normalizedJawatan;
              if (jawatanList.length > 1) {
                // Use inside position and minimal margin to prevent over-indentation in Word
                jawatanHtml = `<ol style="margin-top:0; margin-bottom:0; margin-left:0; padding-left:0; list-style-position: inside;">` +
                  jawatanList.map(j => `<li style="margin-bottom:2px;">${j}</li>`).join("") +
                  `</ol>`;
              } else {
                jawatanHtml = (jawatanList[0] || "").replace(/\n/g, '<br>');
              }
            }

            if (jawatanHtml) {
              tableHtml += `
                <tr>
                  <td style="width:200px;vertical-align:top;padding:4px;${borderStyle}">
                    ${currentJawatanLabel}
                  </td>
                  <td style="width:10px;vertical-align:top;padding:4px;${borderStyle}">
                    :
                  </td>
                  <td style="vertical-align:top;padding:4px;${borderStyle}">
                    ${jawatanHtml}
                  </td>
                </tr>`;
            }
          }

          table.innerHTML = tableHtml;
          row.replaceWith(table);
        });

        // ✅ Ensure Section B table has visible borders
        const sectionBTables = container.querySelectorAll(".table");
        sectionBTables.forEach(tbl => {
          tbl.style.border = "1px solid black";
          tbl.style.borderCollapse = "collapse";
          tbl.style.whiteSpace = "pre-wrap";
          tbl.querySelectorAll("th, td").forEach(cell => {
            cell.style.border = "1px solid black";
            cell.style.padding = "4px";
            cell.innerHTML = cell.innerHTML.replace(/\n/g, '<br>');
          });
        });

        // ✅ Insert Lampiran header at top of first page
        const firstPage = container.querySelector(".page");
        if (firstPage) {
          firstPage.insertAdjacentHTML("afterbegin", fixedLampiran);
        }

        // Word-safe CSS
        const style = `
      <style>
        body { font-family: Arial, sans-serif; font-size: 12pt; position: relative; }
        h5 { font-weight: bold; margin-top: 16px; }
        .fw-bold { font-weight: bold; }
        .text-center { text-align: center; }
        .text-end { text-align: right; }
        .text-start { text-align: left; }
        .page { page-break-after: always; margin-bottom: 20px; position: relative; }
        table { border-collapse: collapse; width: 100%; margin-top: 6px; }
        td, th { padding: 4px; vertical-align: top; }
        ul, li { margin: 0; padding-left: 16px; }
        img { display:block; margin:auto; width:200px; height:250px !important; }
      </style>`;

        const content = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8">${style}</head>
        <body>${container.outerHTML}</body>
      </html>`;

        const converted = htmlDocx.asBlob(content);
        saveAs(converted, fileName);

        // buttons.forEach(btn => btn.classList.remove("hide-export"));
      }).finally(() => {
        this.showGearButton = true;
      });
    },
    downloadPDF() {
      this.closeAllEditors();
      this.showGearButton = false;
      this.$nextTick(() => {
        const element = this.$refs.pdfContent;
        const noKp = this.resume.personal.noKp || "";
        const nama = this.resume.personal.nama || "";
        const last4NoKp = noKp.slice(-4);
        const formattedNama = nama.toUpperCase().replace(/\s+/g, "_");
        const fileName = `${last4NoKp}_${formattedNama}.pdf`;

        const opt = {
          margin: [10, 10, 20, 10],
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        };

        html2pdf()
          .set(opt)
          .from(element)
          .toPdf()
          .get("pdf")
          .then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              pdf.setTextColor(90);
              pdf.setFontSize(12);

              // Page number
              pdf.setFont(undefined, "normal");
              pdf.text(`Halaman ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });

              // RAHSIA
              pdf.setFont(undefined, "bold");
              pdf.text("RAHSIA", pageWidth - 10, pageHeight - 10, { align: "right" });
              pdf.text("RAHSIA", 10, 15, { align: "left" });
            }
          })
          .save();
      }).finally(() => {
        this.showGearButton = true;
      });
    },

    saveAnugerahMode() {
      this.editingAnugerahLabel = false;
      if (!this.anugerahLabelMode.trim()) this.anugerahLabelMode = "Singkatan";
      localStorage.setItem(`resume_anugerahMode_${this.userId}`, this.anugerahLabelMode);
    },

  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  background-color: white;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 6px;
  border: 0.5px solid black;
}

td,
th {
  padding: 4px;
  vertical-align: top;
  border: 0.5px solid black;
}

.row-info {
  display: grid;
  grid-template-columns: 200px 10px 1fr;
  gap: 0.5rem;
  line-height: 1.6;
}

.row-info-kelulusan {
  display: grid;
  grid-template-columns: 200px 10px 1fr;
  gap: 0.5rem;
  line-height: 1.6;
}

.label {
  text-align: left;
  padding-right: 0.5rem;
}

.value {
  white-space: pre-wrap;
}

.page-break {
  page-break-before: always;
  padding-top: 20px;
  /* Adjust as needed */
}

.pdf-content {
  font-size: 12.5pt;
}

.row-info,
.row-info-kelulusan,
.label,
.value,
.table,
.table th,
.table td,
ul,
li {
  font-size: inherit;
}

.pdf-content h6 {
  font-size: 12px;
  font-weight: bold;
}
</style>