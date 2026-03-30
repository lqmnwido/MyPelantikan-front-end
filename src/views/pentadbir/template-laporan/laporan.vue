<template>
    <Layout>
        <PageHeader title="Laporan" pageTitle="Pelantikan" />
        <ExportPDF @export="exportToPDF" @print="printReport" @word="exportToWord" />

        <div class="card p-4 shadow-sm" ref="pdfContent">
            <Loader :loading="loading" class="loading-overlay" />

            <!-- Global Edit Button -->
            <div class="d-flex justify-content-end mb-3">
                <button class="btn btn-sm btn-primary" style="width: 100px;" @click="toggleEdit">
                    {{ editing ? "Simpan" : "Kemaskini" }}
                </button>
            </div>

            <TemplateRenderer ref="templateRenderer" :template="template" :data="tableData" :editing="editing"
                :notaEditing="notaEditing" :catatanTemplate="catatanTemplate" @update-catatan-template="saveCatatan"
                @enable-nota="enableNotaEditor" @save-nota="saveNota" @cancel-nota="cancelNota" />
        </div>
    </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import TemplateRenderer from "@/components/ReportTemplate/TemplateRenderer.vue";
import ExportPDF from "@/components/ReportTemplate/ExportPDF.vue";
import Loader from "@/components/widgets/loader";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
// import html2canvas from "html2canvas";
import * as docx from "docx";


import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
// import { pelantikanService } from "@/services/pelantikan.service.js";
import { templateService } from "@/services/template.service.js";

export default {
    name: "LaporanPage",
    components: { Layout, PageHeader, TemplateRenderer, ExportPDF, Loader },
    data() {
        return {
            loading: false,
            template: {},
            tableData: [],
            editing: false,
            notaEditing: {},
            editors: {},
            filterJenis: [],
            filter: [],
            catatanTemplate: {},
        };
    },
    mounted() {
        this.loadTemplate();
        // this.loadData();
    },
    methods: {
        toggleEdit() {
            if (this.editing) {
                this.$refs.templateRenderer.saveAllCatatan();
            } else {
                this.editing = true;
            }
        },

        async loadTemplate() {
            this.loading = true;
            try {
                const name = this.$route.query.pelantikan;
                const res = await templateService.getTemplateReportByName(name);

                if (res.template?.length) {
                    // this.template = res.template[0];
                    this.template = res.template[0];

                    // console.log("Template loaded:", this.template.blocks);
                    // safely get the table block
                    const tableBlock = this.template.blocks.find(b => b.type === "table");
                    this.startRow = tableBlock?.startRow || 1; // fallback to 1 if not found

                    // console.log("Start row:", this.startRow);

                    const blocksWithFilter = this.template.blocks.filter(b => 'filterJenis' in b);
                    if (blocksWithFilter.length > 0) {
                        this.filterJenis = blocksWithFilter.map(b => b.filterJenis);

                        // Get all results in parallel
                        const results = await Promise.all(
                            this.filterJenis.map(jenis => this.loadData(jenis))
                        );

                        // Merge all results into one array
                        this.tableData = results.flat().filter(Boolean);
                    }
                } else {
                    this.template = {};
                    this.tableData = [];
                }
            } finally {
                this.loading = false;
            }
        },
        async loadData(id) {
            try {
                const res = await templateService.getSenaraiPelantikanLaporan(id);
                return res || [];
            } catch (err) {
                console.error("loadData error:", err);
                return [];
            }
        },

        // ========== CATATAN ==========
        async saveCatatan(block) {
            if (!block.blockId) return;

            try {
                this.loading = true;
                // console.log('Saving catatan for block:', block.blockId, block.content);
                await templateService.onUpdateCatatanTemplate(this.template.id, block.blockId, block.content);

                // console.log('Catatan saved successfully');
                this.editing = false;
            } catch (err) {
                console.error('Save catatan failed:', err);
            } finally {
                this.loadTemplate();
                this.loading = false;
            }
        },

        // ========== NOTA ==========
        enableNotaEditor(block) {
            this.notaEditing[block.id] = true; // ✅ Vue 3 reactive
            this.$nextTick(() => {
                const el = document.getElementById(`toast-editor-${block.id}`);
                if (!el) return;
                this.editors[block.id] = new Editor({
                    el,
                    height: "300px",
                    initialEditType: "wysiwyg",
                    previewStyle: "vertical",
                    initialValue: block.content || "",
                    toolbarItems: [
                        ["bold", "italic", "strike"],
                        ["ul", "ol", "task"],
                        ["link"],
                        ["code", "codeblock"],
                    ],
                });
            });
        },
        async saveNota(block) {
            const editor = this.editors[block.id];
            if (editor) block.content = editor.getHTML();
            try {
                await templateService.updateNota(this.template.id, block.id, block.content);
            } catch (err) {
                console.error("Save nota failed:", err);
            }
            this.notaEditing[block.id] = false; // ✅ close editor
        },
        cancelNota(block) {
            this.notaEditing[block.id] = false; // ✅ close editor
        },

        // ========== PDF ==========
        exportToPDF() {
            const el = this.$refs.pdfContent;
            const d = new Date();
            const formatted = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
                d.getDate()
            ).padStart(2, "0")}`;
            const opt = {
                margin: [10, 10, 20, 10],
                filename:
                    (this.template.name || "laporan").replace(/\s+/g, "-").toLowerCase() +
                    "_" +
                    formatted +
                    ".pdf",
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, logging: false, letterRendering: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["css", "legacy"] },
            };
            html2pdf()
                .set(opt)
                .from(el)
                .toPdf()
                .get("pdf")
                .then((pdf) => {
                    const total = pdf.internal.getNumberOfPages();
                    for (let i = 1; i <= total; i++) {
                        pdf.setPage(i);
                        pdf.setFontSize(10);
                        pdf.text(
                            `Halaman ${i} / ${total}`,
                            pdf.internal.pageSize.getWidth() / 2,
                            pdf.internal.pageSize.getHeight() - 10,
                            { align: "center" }
                        );
                    }
                    pdf.save(opt.filename);
                });
        },
        printReport() {
            const el = this.$refs.pdfContent;

            // Clone to avoid modifying the live DOM
            const clone = el.cloneNode(true);

            // ✅ Highlight rows with "Kosong"
            clone.querySelectorAll("tr").forEach((tr) => {
                const text = tr.innerText.toLowerCase();
                if (text.includes("kosong")) {
                    tr.style.backgroundColor = "#f8d7da"; // light yellow
                }
            });

            clone.querySelectorAll("*").forEach((el) => {
                if (el.innerText && el.innerText.trim().startsWith("Nota")) {
                    el.style.textAlign = "left";
                    // el.style.fontWeight = "bold"; // optional styling
                }
            });

            const printContents = clone.innerHTML;
            const newWindow = window.open("", "_blank", "width=1047,height=1200");

            newWindow.document.write(`
            <html>
            <head>
                <title>${this.template.name || "Laporan"}</title>
                <style>
                body {
                            font-family: Arial, sans-serif;
                            padding: 10px;
                            color: #000;
                            background: #fff;
                            font-size: 8pt;
                        }

                        .ql-align-center {
                            text-align: center;
                        }
                        .ql-align-right {
                            text-align: right;
                        }
                        .ql-align-justify {
                            text-align: justify;
                        }

                        h1, h2, h3, .ql-size-large {
                            font-weight: bold;
                            margin-bottom: 0.5em;
                            text-align: center;
                        }

                        p {
                            margin: 0.5em 0;
                            line-height: 1.4;
                        }

                        @page {
                            margin: 30px 50px;
                        }

                        .header {
                            position: fixed;
                            top: 0;
                            left: 20px;
                            font-weight: bold;
                        }
                        .footer {
                            position: fixed;
                            bottom: 0;
                            right: 20px;
                            font-weight: bold;
                            text-align: right;
                        }

                    table { 
                        border-collapse: collapse; 
                        width: 100%; 
                    }

                    th, td { 
                        border: 1px solid #000; 
                        padding: 8px; 
                    }

                    .page-break { page-break-after: always; }

                    @media print {
                        .no-print, .btn, button {
                            display: none !important;
                        }
                    }

                    /* ✅ highlight background for "Kosong" rows */
                    tr[style*="background-color"] td {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Remove borders ONLY from layout table */
                        .layout-table,
                        .layout-table th,
                        .layout-table td {
                            border: none !important;
                        }

                        /* Force borders back on the real content tables */
                        .contents table,
                        .contents th,
                        .contents td {
                            border: 0.5px solid #000 !important;
                        }
                </style>
            </head>
             <body>

                <table class="layout-table" style="width:100%; border-collapse: collapse; border: none;">
                    <thead style="border: none !important;">
                        <tr>
                            <td style="height:50px; position:relative;">
                                <div style="
                                    position:fixed;
                                    top:0;
                                    left:20px;
                                    font-weight:bold;
                                ">
                                    Rahsia
                                </div>
                            </td>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td style="padding-bottom:70px;">
                                <div class="contents">
                                    ${printContents}
                                </div>
                            </td>
                        </tr>
                    </tbody>

                    <tfoot>
                        <tr>
                            <td style="height:50px; position:relative;">
                                <div style="
                                    position:fixed;
                                    bottom:0;
                                    right:20px;
                                    font-weight:bold;
                                    text-align:right;
                                ">
                                    Rahsia
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>

                </body>
            </html>
        `);

            newWindow.document.close();
            newWindow.focus();

            newWindow.onload = () => {
                newWindow.print();
            };
        },

        // 📝 WORD EXPORT
        async exportToWord() {
            try {
                const el = this.$refs.pdfContent;
                const docChildren = [];

                // ===== CONFIG =====
                const tableBlock = this.template?.blocks?.find(b => b.type === "table");
                const startRow = tableBlock?.startRow || 1; // dynamic from backend
                let rowCounter = 1;
                let globalRowIndex = 0;

                // ===== HELPERS =====
                const parseColor = (color) => {
                    if (!color) return "FFFFFF";
                    const ctx = document.createElement("canvas").getContext("2d");
                    try {
                        ctx.fillStyle = color;
                        return ctx.fillStyle.replace("#", "").toUpperCase();
                    } catch {
                        return "FFFFFF";
                    }
                };

                const getParagraphAlignment = (align) => {
                    if (!align) return docx.AlignmentType.LEFT;
                    align = align.toLowerCase();
                    if (align.includes("center")) return docx.AlignmentType.CENTER;
                    if (align.includes("right")) return docx.AlignmentType.RIGHT;
                    if (align.includes("justify")) return docx.AlignmentType.JUSTIFIED;
                    return docx.AlignmentType.LEFT;
                };

                const getCellShading = (style) => {
                    const bg = style.backgroundColor || style.background || "";
                    const parsed = parseColor(bg);
                    return parsed === "000000" ? "FFFFFF" : parsed;
                };

                const htmlToRuns = (node, inherited = {}) => {
                    const runs = [];

                    if (node.nodeType === Node.TEXT_NODE) {
                        const txt = node.nodeValue || "";
                        const parts = txt.split(/\r?\n/);
                        parts.forEach((part, idx) => {
                            if (part.length > 0) {
                                const tr = new docx.TextRun({
                                    text: part,
                                    bold: inherited.bold || false,
                                    italics: inherited.italic || false,
                                    underline: inherited.underline ? {} : undefined,
                                    font: "Arial",
                                    size: inherited.size || 22,
                                });
                                runs.push(tr);
                            }
                            if (idx < parts.length - 1)
                                runs.push(new docx.TextRun({ text: "", break: 1 }));
                        });
                        return runs;
                    }

                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tag = node.tagName.toLowerCase();
                        const style = window.getComputedStyle(node) || {};
                        const newInherited = { ...inherited };

                        if (tag === "b" || tag === "strong") newInherited.bold = true;
                        if (tag === "i" || tag === "em") newInherited.italic = true;
                        if (tag === "u") newInherited.underline = true;

                        const fw = style.fontWeight;
                        if (fw === "bold" || parseInt(fw) >= 600) newInherited.bold = true;
                        if ((style.fontStyle || "").toLowerCase() === "italic")
                            newInherited.italic = true;
                        if ((style.textDecorationLine || "").toLowerCase().includes("underline"))
                            newInherited.underline = true;

                        if (style.fontSize) {
                            const px = parseFloat(style.fontSize);
                            if (!isNaN(px)) {
                                const pts = px / 1.3333333;
                                newInherited.size = Math.round(pts * 2);
                            }
                        }

                        newInherited.font = "Arial";

                        if (tag === "br") {
                            runs.push(new docx.TextRun({ text: "", break: 1 }));
                            return runs;
                        }

                        node.childNodes.forEach((child) => {
                            runs.push(...htmlToRuns(child, newInherited));
                        });

                        if (["p", "div", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) && !node.closest('li')) {
                            runs.push(new docx.TextRun({ text: "", break: 1 }));
                        }

                        return runs;
                    }

                    return runs;
                };

                // ===== MAIN CONTENT =====
                const tablesProcessed = [];
                const listsProcessed = [];

                el.querySelectorAll("*, ol").forEach((node) => {
                    // Numbered List Handling for OL
                    if (node.tagName === "OL" && !listsProcessed.includes(node)) {
                        listsProcessed.push(node);
                        const listItems = node.querySelectorAll('li');
                        listItems.forEach((li) => {
                            docChildren.push(
                                new docx.Paragraph({
                                    children: htmlToRuns(li),
                                    numbering: {
                                        reference: "my-numbering-style",
                                        level: 0,
                                    },
                                    spacing: { after: 150 },
                                })
                            );
                        });
                        return;
                    }

                    // ===== TABLES =====
                    if (node.tagName === "TABLE" && !tablesProcessed.includes(node)) {
                        tablesProcessed.push(node);
                        const rows = [];

                        let headerWidths = null;
                        let tableHeadersFromTemplate = null;
                        let indexHeaderText = "Bil.";

                        try {
                            const tableBlock = (this.template?.blocks || []).find(
                                (b) => b.type === "table"
                            );
                            if (tableBlock && Array.isArray(tableBlock.headers)) {
                                tableHeadersFromTemplate = tableBlock.headers;
                                headerWidths = tableBlock.headers.map((h) =>
                                    h.width ? Number(h.width) : null
                                );
                            }
                            if (tableBlock && tableBlock.indexHeader)
                                indexHeaderText = tableBlock.indexHeader;
                        } catch {
                            headerWidths = null;
                            tableHeadersFromTemplate = null;
                        }

                        const indexColDefault = 5;
                        let headerWidthsFinal = null;
                        if (headerWidths && headerWidths.length > 0) {
                            headerWidthsFinal = [indexColDefault, ...headerWidths];
                        }

                        node.querySelectorAll("tr").forEach((tr) => {
                            const thOrTdList = tr.querySelectorAll("th, td");
                            const visibleTexts = Array.from(thOrTdList)
                                .map((td) => td.innerText.trim())
                                .filter((t) => t !== "");

                            const isHeaderRow =
                                Array.from(tr.querySelectorAll("th")).length > 0 ||
                                (visibleTexts.length >= 6 &&
                                    String(visibleTexts[0]).toLowerCase().includes("bil"));

                            // ===== HEADER ROW =====
                            if (isHeaderRow) {
                                const headers =
                                    tableHeadersFromTemplate ||
                                    Array.from(tr.querySelectorAll("th, td")).map((c) => ({
                                        text: c.innerText,
                                    }));

                                const allHeaders = [
                                    { text: indexHeaderText, width: indexColDefault },
                                    ...headers,
                                ];

                                const headerCells = allHeaders.map((h, i) => {
                                    const headerText = h.text || "";
                                    const widthPercent = headerWidthsFinal?.[i] ?? (h.width ?? null);

                                    return new docx.TableCell({
                                        children: [
                                            new docx.Paragraph({
                                                children: [
                                                    new docx.TextRun({
                                                        text: headerText,
                                                        bold: true,
                                                        font: "Arial",
                                                        size: 22,
                                                    }),
                                                ],
                                                alignment: docx.AlignmentType.CENTER,
                                            }),
                                        ],
                                        shading: { fill: "E5E5E5" },
                                        borders: {
                                            top: { style: "single", size: 1, color: "000000" },
                                            bottom: { style: "single", size: 1, color: "000000" },
                                            left: { style: "single", size: 1, color: "000000" },
                                            right: { style: "single", size: 1, color: "000000" },
                                        },
                                        width:
                                            typeof widthPercent === "number"
                                                ? { size: widthPercent, type: docx.WidthType.PERCENTAGE }
                                                : undefined,
                                    });
                                });

                                rows.push(new docx.TableRow({ children: headerCells }));
                                return;
                            }

                            // ===== NORMAL ROWS =====
                            if (thOrTdList.length > 0) {
                                globalRowIndex++;

                                const cells = [];
                                const columnCount =
                                    headerWidthsFinal?.length ?? Math.max(1 + thOrTdList.length, 7);

                                for (let i = 0; i < columnCount; i++) {
                                    const td = i === 0 ? null : thOrTdList[i];
                                    const paragraphChildren = [];

                                    if (i === 0) {
                                        const bilText =
                                            globalRowIndex >= startRow ? String(rowCounter) : "";
                                        paragraphChildren.push(
                                            new docx.TextRun({
                                                text: bilText,
                                                font: "Arial",
                                                size: 16,
                                            })
                                        );
                                    } else if (td) {
                                        td.childNodes.forEach((cn) => {
                                            paragraphChildren.push(...htmlToRuns(cn, { font: "Arial", size: 22 }));
                                        });
                                    }

                                    const alignment =
                                        td && td.style && td.style.textAlign
                                            ? getParagraphAlignment(td.style.textAlign)
                                            : i === 0
                                                ? docx.AlignmentType.CENTER
                                                : docx.AlignmentType.LEFT;

                                    // ✅ FIX: Make Bil. follow same row color
                                    let shadingFill = "FDE9D9";
                                    if (td) {
                                        shadingFill = getCellShading(window.getComputedStyle(td));
                                    } else if (thOrTdList.length > 0) {
                                        shadingFill = getCellShading(window.getComputedStyle(thOrTdList[0]));
                                    }

                                    cells.push(
                                        new docx.TableCell({
                                            children: [
                                                new docx.Paragraph({
                                                    children: paragraphChildren,
                                                    alignment,
                                                }),
                                            ],
                                            shading: { fill: shadingFill },
                                            borders: {
                                                top: { style: "single", size: 1, color: "000000" },
                                                bottom: { style: "single", size: 1, color: "000000" },
                                                left: { style: "single", size: 1, color: "000000" },
                                                right: { style: "single", size: 1, color: "000000" },
                                            },
                                        })
                                    );
                                }

                                rows.push(new docx.TableRow({ children: cells }));
                                if (globalRowIndex >= startRow) rowCounter++;
                            }
                        });

                        docChildren.push(
                            new docx.Table({
                                rows,
                                width: { size: 100, type: docx.WidthType.PERCENTAGE },
                                alignment: docx.AlignmentType.CENTER,
                            })
                        );

                        // ✅ Add 10px padding between blocks
                        docChildren.push(new docx.Paragraph({ text: "", spacing: { after: 200 } }));
                    }

                    // ===== PARAGRAPHS =====
                    if (
                        (node.tagName === "P" ||
                            node.tagName === "LI" ||
                            node.tagName.match(/^H[1-6]$/i)) &&
                        !node.closest('ol')
                    ) {
                        const text = node.innerText.trim();
                        if (!text) return;

                        const style = window.getComputedStyle(node);
                        const paragraphRuns = [];
                        node.childNodes.forEach((cn) => {
                            paragraphRuns.push(...htmlToRuns(cn, { font: "Arial", size: 22 }));
                        });

                        if (paragraphRuns.length === 0) {
                            paragraphRuns.push(new docx.TextRun({ text, font: "Arial", size: 22 }));
                        }

                        const isBold =
                            style.fontWeight === "bold" || parseInt(style.fontWeight || "0") >= 600;
                        if (isBold) paragraphRuns.forEach((r) => (r.bold = true));

                        const alignment = getParagraphAlignment(style.textAlign);

                        docChildren.push(
                            new docx.Paragraph({
                                children: paragraphRuns,
                                alignment,
                                spacing: { after: 150 },
                            })
                        );
                    }
                });

                // ===== CREATE DOCUMENT =====
                const doc = new docx.Document({
                    numbering: {
                        config: [
                            {
                                reference: "my-numbering-style",
                                levels: [
                                    {
                                        level: 0,
                                        format: "decimal",
                                        text: "%1.",
                                        alignment: docx.AlignmentType.START,
                                        style: {
                                            paragraph: {
                                                indent: { left: 720, hanging: 360 },
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    sections: [
                        {
                            properties: {
                                page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
                            },
                            children: docChildren,
                        },
                    ],
                });

                // ===== SAVE FILE =====
                const blob = await docx.Packer.toBlob(doc);
                const d = new Date();
                const filename = `${(this.template.name || "senarai-hakim-mahkamah-rayuan")
                    .replace(/\s+/g, "-")
                    .toLowerCase()}_${d.getFullYear()}${String(d.getMonth() + 1).padStart(
                        2,
                        "0"
                    )}${String(d.getDate()).padStart(2, "0")}.docx`;

                saveAs(blob, filename);
            } catch (err) {
                console.error("Export to Word failed:", err);
            }
        }

    },
};
</script>

<style scoped>
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
</style>
