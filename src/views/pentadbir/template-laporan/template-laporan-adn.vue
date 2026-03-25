<!-- File: layouts/laporan_adn.vue -->
<template>
    <Layout>

        <PageHeader title="Laporan" pageTitle="Pelantikan" />

        <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-sm btn-primary" @click="toggleCatatanEdit">
                {{ isCatatanEditing ? "Simpan" : "Kemaskini Catatan" }}
            </button>
        </div>

        <ExportPDF :leftFields="leftFields" :selectedKategori="selectedKategori" @export="exportToPDF"
            @update:selectedKategori="selectedKategori = $event" @print="printReport" @word="exportToWord" />

        <div class="card p-4 shadow-sm" ref="pdfContent">
            <ReportTemplate :title="reportTitleDUN" />
            <!-- DUN -->
            <ReportTemplate v-if="selectedKategori === '1' || selectedKategori === '3'" :subTitle="reportSubtitleDUN"
                :note="reportNoteDUN" :headers="tableHeaders" :fields="tableFields" :wakil="wakil" :rows="getRowsDUN"
                :isEditing="isCatatanEditing" :columnWidths="columnWidths" :catatanData="catatanData" tableId="DUN"
                @update-catatan="handleUpdateCatatan" enable-catatan />

            <!-- Agong -->
            <template v-if="selectedKategori === '1' || selectedKategori === '2'">
                <!-- 4 org -->
                <ReportTemplate :subTitle="reportSubtitleAgong" :note="reportNoteAgong" />

                <ReportTemplate ref="reportTemplate" :subTitle="reportSubtitleKL" :headers="tableHeaders"
                    :fields="tableFields" :rows="getRowsKL" :isEditing="isCatatanEditing" :columnWidths="columnWidths"
                    :catatanData="catatanData" tableId="KL" @update-catatan="handleUpdateCatatan" enable-catatan />

                <ReportTemplate ref="reportTemplate" :subTitle="reportSubtitleLabuan" :headers="tableHeaders"
                    :fields="tableFields" :rows="getRowsLabuan" :isEditing="isCatatanEditing"
                    :columnWidths="columnWidths" :catatanData="catatanData" tableId="Labuan"
                    @update-catatan="handleUpdateCatatan" enable-catatan />

                <ReportTemplate ref="reportTemplate" :subTitle="reportSubtitlePutrajaya" :headers="tableHeaders"
                    :fields="tableFields" :rows="getRowsPutrajaya" :isEditing="isCatatanEditing"
                    :columnWidths="columnWidths" :catatanData="catatanData" tableId="Putrajaya"
                    @update-catatan="handleUpdateCatatan" enable-catatan />

                <!-- 40org -->
                <ReportTemplate ref="reportTemplate" :subTitle="reportSubtitleAgong2" :note="reportNoteAgong2"
                    :headers="tableHeaders" :fields="tableFields" :rows="getRowsAgong" :isEditing="isCatatanEditing"
                    :columnWidths="columnWidths" :catatanData="catatanData" tableId="Agong"
                    @update-catatan="handleUpdateCatatan" enable-catatan />
            </template>
            <!-- Separate Nota Editor Component -->
            <NotaEditor :notaContent="notaContent" :isEditing="isEditing" @update:notaContent="notaContent = $event"
                @start-editing="startEditing" @save="saveChanges" />

            <p>Bahagian Kabinet, Perlembagaan dan<br />
                Perhubungan Antara Kerajaan,<br />
                Jabatan Perdana Menteri.
            </p>

            <p>{{ currentMonthYear }}</p>
        </div>
    </Layout>
</template>

<script>
import Layout from '@/layouts/main.vue'
import PageHeader from '@/components/page-header.vue'
import ReportTemplate from '@/components/ReportTemplate/TemplateLaporan.vue'
import NotaEditor from '@/components/ReportTemplate/NotaEditor.vue'
import ExportPDF from '@/components/ReportTemplate/ExportPDF.vue'
import html2pdf from 'html2pdf.js'
import { saveAs } from "file-saver";
import * as docx from "docx";

import { adnService } from '@/services/adn.service.js';

export default {
    components: { Layout, PageHeader, ReportTemplate, NotaEditor, ExportPDF },
    data() {
        return {
            isCatatanEditing: false,
            catatanData: {},
            initialCatatanData: {},
            selectedFilter: 'All',
            tableHeaders: [
                { label: 'Bil.', align: 'text-center', bold: true },
                { label: 'Nama', align: 'text-left', bold: true },
                { label: 'Tarikh Lantik', align: 'text-center', bold: true },
                { label: 'Tarikh Tamat', align: 'text-center', bold: true },
                { label: 'Penggal', align: 'text-center', bold: true },
                { label: 'Wakil', align: 'text-center', bold: true }
            ],
            tableFields: [
                { key: 'bil', align: 'text-center', bold: false },
                { key: 'nama', align: 'text-left', bold: false },
                { key: 'tarikhLantik', align: 'text-center', bold: false },
                { key: 'tarikhTamat', align: 'text-center', bold: false },
                { key: 'penggal', align: 'text-center', bold: false },
                { key: 'wakil', align: 'text-center', bold: false }
            ],

            columnWidths: ['5%', '55%', '10%', '10%', '10%', '10%'],
            isEditing: false,
            editorInstance: null,
            DUN: [],
            // wakil: ['Sarawak', 'Johor', 'Pulau Pinang', 'Terengganu', 'Kedah', 'Perak', 'Kelantan', 'Melaka', 'Sabah', 'Perlis', 'Selangor', 'Pahang', 'N.Sembilan'],
            totalRowsDUN: 26,
            kategoriDUN: 'DUN',
            notaContent: '',
            reportTitleDUN: '<strong>SENARAI AHLI DEWAN NEGARA</strong>',
            reportSubtitleDUN: 'PERKARA 45(1)(a) PERLEMBAGAAN PERSEKUTUAN',
            reportNoteDUN: '(2 Orang Ahli dipilih oleh setiap DUN)',


            //Agong
            kategoriAgong: 'Agong',
            // reportTitleAgong: '<strong>SENARAI AHLI DEWAN NEGARA</strong>',
            reportSubtitleAgong: 'PERKARA 45(1)(aa) PERLEMBAGAAN PERSEKUTUAN',
            reportNoteAgong: '(4 Orang Ahli dilantik oleh YDPA)',

            reportSubtitleKL: 'WILAYAH PERSEKUTUAN KUALA LUMPUR',
            KL: [],
            totalRowsKL: 2,

            reportSubtitleLabuan: 'WILAYAH PERSEKUTUAN LABUAN',
            Labuan: [],
            totalRowsLabuan: 1,

            reportSubtitlePutrajaya: 'WILAYAH PERSEKUTUAN PUTRAJAYA',
            Putrajaya: [],
            totalRowsPutrajaya: 1,

            reportSubtitleAgong2: 'PERKARA 45(1)(b) PERLEMBAGAAN PERSEKUTUAN',
            reportNoteAgong2: '(40 orang Ahli dilantik oleh YDPA)',
            Agong: [],

            totalRowsAgong: 40,


            //filter
            selectedKategori: '1',
            leftFields: [
                { label: 'Jenis Lantikan:', model: 'selectedKategori', type: 'select', placeholder: '- SILA PILIH -', default: '1', options: [{ label: 'Keseluruhan', value: '1' }, { label: 'Dilantik Yang Di-Pertuan Agong', value: '2' }, { label: 'Dipilih oleh Dewan Undangan Negeri', value: '3' }] },
            ],

        }
    },
            async mounted() {
                await this.loadLaporan();
            },
            computed: {
        wakil() {
            const order = [
                'Sarawak', 'Johor', 'Pulau Pinang', 'Terengganu', 'Kedah',
                'Perak', 'Kelantan', 'Melaka', 'Sabah', 'Perlis',
                'Selangor', 'Pahang', 'N.Sembilan'
            ];

            // Extract states that have data
            const statesWithData = [...new Set(this.DUN.map(item => item.wakil).filter(Boolean))];

            // Build final order: data states first (sorted), then empty ones
            const sortedWithData = order.filter(state => statesWithData.includes(state));
            const sortedWithoutData = order.filter(state => !statesWithData.includes(state));

            return [...sortedWithData, ...sortedWithoutData];
        },

        getRowsDUN() {
            const rows = [];

            const parseDate = (d) => {
                if (!d) return new Date(0);
                const [day, month, year] = d.split('.').map(Number);
                return new Date(year, month - 1, day);
            };

            // Step 1: Group DUN members by wakil
            const groupedByWakil = {};
            this.DUN.forEach(item => {
                if (!item.wakil) return;

                const tamatVal = Array.isArray(item.tarikhTamat)
                    ? item.tarikhTamat[item.tarikhTamat.length - 1]
                    : item.tarikhTamat;

                if (!groupedByWakil[item.wakil]) groupedByWakil[item.wakil] = [];

                groupedByWakil[item.wakil].push({ ...item, latestTamat: tamatVal });
            });

            // Step 2: Sort each wakil group by tarikhTamat (latest first)
            Object.keys(groupedByWakil).forEach(w => {
                groupedByWakil[w].sort((a, b) => parseDate(b.latestTamat) - parseDate(a.latestTamat));
            });

            // Step 3a: Push all members first
            const kosongRows = [];
            this.wakil.forEach(w => {
                const members = groupedByWakil[w] || [];

                members.forEach(member => {
                    let nama = member.nama;
                    if (member.jawatan && member.jawatan.length) {
                        nama += `<br/><b>\n[${member.jawatan.join(', ')}]</b>`;
                    }

                    rows.push({
                        ...member,
                        nama: nama, // Override nama with the constructed one
                        bil: rows.length + 1,
                        wakil: w,
                        id: member.id // Ensure id is passed
                    });
                });

                // Count how many kosong we need (to fill exactly 2 rows per wakil)
                const needed = 2 - members.length;
                for (let i = 0; i < needed; i++) {
                    kosongRows.push({
                        tarikhLantik: '',
                        tarikhTamat: '',
                        penggal: '',
                        parti: '',
                        bil: 0, // we will fix later
                        wakil: w,
                        highlight: false,
                        latestTamat: ''
                    });
                }
            });

            // Step 3b: Add kosong rows after all real members
            rows.push(...kosongRows);

            // Step 4: Reassign bil
            rows.forEach((r, idx) => {
                r.bil = idx + 1;
            });

            return rows;
        },

        getRowsKL() {
            const rows = this.KL.map((item, index) => {
                let nama = item.nama;
                if (item.jawatan && item.jawatan.length) {
                    nama += `<br/><b>\n[${item.jawatan.join(', ')}]</b>`;
                }

                return {
                    bil: index + 1,
                    nama,
                    tarikhLantik: item.tarikhLantik,
                    tarikhTamat: item.tarikhTamat,
                    penggal: item.penggal,
                    parti: item.parti,
                    id: item.id
                };
            });
            const missing = this.totalRowsKL - rows.length;
            for (let i = 0; i < missing; i++) {
                rows.push({
                    bil: rows.length + 1,
                    nama: '',
                    tarikhLantik: '',
                    tarikhTamat: '',
                    penggal: '',
                    parti: ''
                });
            }
            return rows;
        },
        getRowsLabuan() {
            const rows = this.Labuan.map((item, index) => {
                let nama = item.nama;
                if (item.jawatan && item.jawatan.length) {
                    nama += `<br/><b>\n[${item.jawatan.join(', ')}]</b>`;
                }

                return {
                    bil: index + 1,
                    nama,
                    tarikhLantik: item.tarikhLantik,
                    tarikhTamat: item.tarikhTamat,
                    penggal: item.penggal,
                    parti: item.parti,
                    id: item.id
                };
            });
            const missing = this.totalRowsLabuan - rows.length;
            for (let i = 0; i < missing; i++) {
                rows.push({
                    bil: rows.length + 1,
                    nama: '',
                    tarikhLantik: '',
                    tarikhTamat: '',
                    penggal: '',
                    parti: ''
                });
            }
            return rows;
        },
        getRowsPutrajaya() {
            const rows = this.Putrajaya.map((item, index) => {
                let nama = item.nama;
                if (item.jawatan && item.jawatan.length) {
                    nama += `<br/><b>\n[${item.jawatan.join(', ')}]</b>`;
                }

                return {
                    bil: index + 1,
                    nama,
                    tarikhLantik: item.tarikhLantik,
                    tarikhTamat: item.tarikhTamat,
                    penggal: item.penggal,
                    parti: item.parti,
                    id: item.id
                };
            });
            const missing = this.totalRowsPutrajaya - rows.length;
            for (let i = 0; i < missing; i++) {
                rows.push({
                    bil: rows.length + 1,
                    nama: '',
                    tarikhLantik: '',
                    tarikhTamat: '',
                    penggal: '',
                    parti: ''
                });
            }
            return rows;
        },
        getRowsAgong() {
            const rows = this.Agong.map((item, index) => {
                let nama = item.nama;
                if (item.jawatan && item.jawatan.length) {
                    nama += `<br/><b>\n[${item.jawatan.join(', ')}]</b>`;
                }

                return {
                    bil: index + 1,
                    nama,
                    tarikhLantik: item.tarikhLantik,
                    tarikhTamat: item.tarikhTamat,
                    penggal: item.penggal,
                    parti: item.parti,
                    id: item.id
                };
            });
            const missing = this.totalRowsAgong - rows.length;
            for (let i = 0; i < missing; i++) {
                rows.push({
                    bil: rows.length + 1,
                    nama: '',
                    tarikhLantik: '',
                    tarikhTamat: '',
                    penggal: '',
                    parti: ''
                });
            }
            return rows;
        },
        currentMonthYear() {
            const months = [
                'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
            ]
            const now = new Date()
            const month = months[now.getMonth()]
            const year = now.getFullYear()
            return `${month} ${year}`
        }

    },
    watch: {
        selectedKategori: {
            immediate: true, // update on initial load
            handler(newVal) {
                const a = `<li><strong>Perkara 45(1)(a):</strong><br/>26 orang ahli yang dipilih oleh Dewan Undangan Negeri (2 orang wakil setiap DUN).</li>`;
                const aa = `<li><strong>Perkara 45(1)(aa):</strong><br/>4 orang ahli yang dilantik SPB Yang di-Pertuan Agong bagi mewakili Wilayah Persekutuan Kuala Lumpur, Labuan dan Putrajaya.</li>`;
                const b = `<li><strong>Perkara 45(1)(b):</strong><br/>40 orang ahli yang dilantik oleh SPB Yang di-Pertuan Agong.</li>`;

                let list = [];

                if (newVal === '1') list = [a, aa, b];
                else if (newVal === '2') list = [aa, b];
                else if (newVal === '3') list = [a];

                this.notaContent = `<ol>${list.join('')}</ol>`;
            }
        }
    },
    methods: {
        async toggleCatatanEdit() {
            if (this.isCatatanEditing) { // User clicks "Simpan"
                try {
                    const promises = Object.entries(this.catatanData)
                        .filter(([id, catatan]) => this.initialCatatanData[id] !== catatan)
                        .map(([id, catatan]) => {
                            const payload = {
                                id: id,           // This is pelantikan.id
                                catatan: catatan, // This is pelantikan.catatan
                            };
                            // console.log('Payload: ', payload);
                            return adnService.updateCatatan(payload);
                        });

                    if (promises.length > 0) {
                        await Promise.all(promises);
                        alert('Catatan berjaya disimpan!');
                        this.initialCatatanData = { ...this.catatanData }; // Update baseline
                    } else {
                        alert('Tiada perubahan untuk disimpan.');
                    }
                } catch (error) {
                    console.error('Error saving catatan:', error);
                    alert('Gagal menyimpan catatan. Sila cuba lagi.');
                }
                this.isCatatanEditing = false;
            } else { // User clicks "Kemaskini Catatan"
                this.isCatatanEditing = true;
            }
        },
        handleUpdateCatatan({ rowId, value }) {
            this.catatanData = { ...this.catatanData, [rowId]: value };
        },
        exportToPDF() {
            const element = this.$refs.pdfContent

            const opt = {
                margin: [10, 10, 20, 10],
                filename: 'senarai-ahli-dewan-negara.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 3 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'] }
            }
            html2pdf().set(opt).from(element).toPdf().get('pdf').then(pdf => {
                const totalPages = pdf.internal.getNumberOfPages()
                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i)
                    pdf.setFontSize(10)
                    pdf.text(`Halaman ${i} / ${totalPages}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' })
                }
                pdf.save('senarai-ahli-dewan-negara.pdf')
            })
        },
        startEditing() {
            this.isEditing = true
        },
        saveChanges() {
            // this.notaContent = this.editorInstance.getHTML()
            this.isEditing = false
        },

        async loadLaporan() {
            try {
                const response = await adnService.senaraiLaporan();
                const data = response.data;

                // Populate catatanData from fetched data
                const initialCatatanData = {};
                data.forEach(item => {
                    if (item.id) { // Store all items with id
                        initialCatatanData[item.id] = item.catatan || '';
                    }
                });
                this.catatanData = { ...initialCatatanData };
                this.initialCatatanData = initialCatatanData;


                this.DUN = data.filter(item => item.kategori === "DUN");

                this.Agong = data.filter(item => item.kategori === "AGONG").filter((item => item.wakil === null));
                this.KL = data.filter(item => item.kategori === "AGONG").filter((item => item.wakil === "W.P Kuala Lumpur"));
                this.Putrajaya = data.filter(item => item.kategori === "AGONG").filter((item => item.wakil === "W.P Putrajaya"));
                this.Labuan = data.filter(item => item.kategori === "AGONG").filter((item => item.wakil === "W.P Labuan"));

            } catch (err) {
                console.log('Error: ' + err);
            }
        },

        printReport() {
            const el = this.$refs.pdfContent;

            // Clone to avoid modifying the DOM
            const clone = el.cloneNode(true);

            // ✅ Highlight rows containing "Kosong"
            clone.querySelectorAll("tr").forEach((tr) => {
                const text = tr.innerText.toLowerCase();
                if (text.includes("kosong")) {
                    tr.style.backgroundColor = "#f8d7da"; // light red
                    // tr.style.color = "#6C757D"; // ensure text visible
                }
            });

            // Add class to h2 containing "Nota"
            clone.querySelectorAll("h2").forEach((h2) => {
                if (h2.innerText.toLowerCase().includes("nota")) {
                    h2.classList.add("nota-heading");
                }
            });


            // ✅ Apply column width and alignment from data()
            const columnWidths = ['5%', '55%', '10%', '10%', '10%', '10%'];
            const headerAlignments = ['text-left', 'text-left', 'text-center', 'text-center', 'text-center', 'text-center'];
            const bodyAlignments = ['text-left', 'text-left', 'text-center', 'text-center', 'text-center', 'text-center'];

            // Set column widths
            clone.querySelectorAll("table").forEach((table) => {
                const headerRows = table.querySelectorAll("thead tr th");
                headerRows.forEach((th, i) => {
                    th.style.width = columnWidths[i] || "auto";
                    th.style.textAlign = headerAlignments[i]?.replace("text-", "") || "left";
                    th.style.fontWeight = "bold";
                });

                const bodyRows = table.querySelectorAll("tbody tr td");
                bodyRows.forEach((td, i) => {
                    const colIndex = i % columnWidths.length;
                    td.style.width = columnWidths[colIndex] || "auto";
                    td.style.textAlign = bodyAlignments[colIndex]?.replace("text-", "") || "left";
                });
            });

            // ✅ Create new printable window
            const printContents = clone.innerHTML;
            const newWindow = window.open("", "_blank", "width=900,height=1000");

            newWindow.document.write(`
                <html>
                <head>
                    <title>Laporan Ahli Dewan Negara</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            font-size: 12pt;
                            color: #000;
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
                        h1, h3, h2 {
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        .nota-heading {
                            text-align: left;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 10px;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 6px 8px;
                            vertical-align: top;
                        }
                        tr[style*="background-color"] td {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        p {
                            margin: 8px 0;
                            line-height: 1.5;
                        }
                        th {
                            font-weight: bold;
                        }
                        .text-left { text-align: left !important; }
                        .text-center { text-align: center !important; }
                        .text-right { text-align: right !important; }
                        @media print {
                            .no-print, .btn, button { display: none !important; }
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
            newWindow.onload = () => newWindow.print();
        },

        // 📝 FIXED EXPORT TO WORD FUNCTION
        async exportToWord() {
            try {
                const el = this.$refs.pdfContent;
                const docChildren = [];

                // ===== HELPERS =====
                const parseColor = (color) => {
                    if (!color || color === "transparent" || color.includes("rgba(0, 0, 0, 0)")) return "FFFFFF";
                    try {
                        const ctx = document.createElement("canvas").getContext("2d");
                        ctx.fillStyle = color;
                        const hex = ctx.fillStyle.replace("#", "").toUpperCase().padEnd(6, "F");
                        return hex.length === 6 ? hex : "FFFFFF";
                    } catch { return "FFFFFF"; }
                };

                const htmlToRuns = (node, inherited = {}) => {
                    const runs = [];
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.nodeValue || "";
                        const parts = text.split('\n');
                        parts.forEach((part, index) => {
                            if (part) {
                                runs.push(new docx.TextRun({ text: part, ...inherited }));
                            }
                            if (index < parts.length - 1) {
                                runs.push(new docx.TextRun({ text: "", break: 1 }));
                            }
                        });
                        return runs;
                    }

                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const style = window.getComputedStyle(node);
                        const newInherited = { ...inherited };
                        const tagName = node.tagName.toLowerCase();

                        if (tagName === 'b' || tagName === 'strong' || parseInt(style.fontWeight) >= 600) newInherited.bold = true;
                        if (tagName === 'i' || tagName === 'em' || style.fontStyle === 'italic') newInherited.italics = true;
                        if (tagName === 'u' || style.textDecoration === 'underline') newInherited.underline = {};

                        if (node.classList.contains('text-muted')) {
                            newInherited.color = '888888';
                            newInherited.italics = true;
                        }

                        if (tagName === 'br') {
                            runs.push(new docx.TextRun({ text: "", break: 1 }));
                            return runs;
                        }

                        // Add a break before block elements if they are not the first child
                        if (['p', 'div'].includes(tagName) && node.previousSibling) {
                            runs.push(new docx.TextRun({ text: "", break: 1 }));
                        }

                        node.childNodes.forEach(child => {
                            runs.push(...htmlToRuns(child, newInherited));
                        });

                        return runs;
                    }
                    return runs;
                };

                // ✅ Parse DOM
                el.querySelectorAll("p, li, h1, h2, h3, table, ol").forEach((node) => {
                    const style = window.getComputedStyle(node);

                    // 📘 TABLE HANDLING
                    if (node.tagName === "TABLE") {
                        const rows = [];
                        node.querySelectorAll("tr").forEach((tr) => {
                            const cells = [];
                            const isHeaderRow = !!tr.querySelector("th");

                            tr.querySelectorAll("th, td").forEach((td, colIndex) => {
                                const tdStyle = window.getComputedStyle(td);
                                const bgColor = parseColor(tdStyle.backgroundColor);
                                const tableHeaders = this.tableHeaders;
                                const tableFields = this.tableFields;
                                const columnWidths = this.columnWidths;

                                const alignClass = isHeaderRow ? tableHeaders[colIndex]?.align || "text-left" : tableFields[colIndex]?.align || "text-left";
                                let align = docx.AlignmentType.LEFT;
                                if (alignClass.includes("center")) align = docx.AlignmentType.CENTER;
                                else if (alignClass.includes("right")) align = docx.AlignmentType.RIGHT;

                                const rowHasKosong = tr.innerText.toLowerCase().includes("kosong") && bgColor === "FFFFFF";
                                const cellFill = rowHasKosong ? "F8D7DA" : bgColor;

                                const paragraphChildren = htmlToRuns(td, { font: "Arial", size: 22, bold: isHeaderRow });

                                cells.push(
                                    new docx.TableCell({
                                        shading: cellFill && cellFill !== "FFFFFF" ? { fill: cellFill } : undefined,
                                        children: [new docx.Paragraph({ children: paragraphChildren, alignment: align })],
                                        width: { size: parseFloat(columnWidths[colIndex]) || 10, type: docx.WidthType.PERCENTAGE },
                                        borders: { top: { style: "single", size: 1, color: "000000" }, bottom: { style: "single", size: 1, color: "000000" }, left: { style: "single", size: 1, color: "000000" }, right: { style: "single", size: 1, color: "000000" } },
                                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                                        verticalAlign: docx.VerticalAlign.CENTER,
                                    })
                                );
                            });
                            rows.push(new docx.TableRow({ children: cells }));
                        });
                        docChildren.push(new docx.Table({ rows, width: { size: 100, type: docx.WidthType.PERCENTAGE }, alignment: docx.AlignmentType.CENTER }));
                        docChildren.push(new docx.Paragraph({ spacing: { after: 200 } }));
                        return;
                    }

                    // Numbered List Handling for OL
                    if (node.tagName === "OL") {
                        const listItems = node.querySelectorAll('li');
                        listItems.forEach((li) => {
                            docChildren.push(new docx.Paragraph({ children: htmlToRuns(li, { font: "Arial", size: 24 }), numbering: { reference: "my-numbering-style", level: 0 }, spacing: { after: 150 } }));
                        });
                        return;
                    }

                    if (["P", "LI"].includes(node.tagName) && !node.closest('ol')) {
                        docChildren.push(new docx.Paragraph({ children: htmlToRuns(node, { font: "Arial", size: 24 }), alignment: docx.AlignmentType[style.textAlign?.toUpperCase() || 'LEFT'], spacing: { after: 150 } }));
                        return;
                    }

                    if (["H1", "H2", "H3"].includes(node.tagName)) {
                        const text = node.innerText.trim();
                        if (!text) return;
                        const sizeMap = { H1: 32, H2: 28, H3: 26 };
                        let alignment = docx.AlignmentType[style.textAlign?.toUpperCase() || 'LEFT'];
                        if (text.toLowerCase().startsWith("nota")) alignment = docx.AlignmentType.LEFT;
                        docChildren.push(new docx.Paragraph({ children: [new docx.TextRun({ text, bold: true, size: sizeMap[node.tagName], font: "Arial" })], alignment, spacing: { after: 300 } }));
                    }
                });

                // 🧾 Create Word document
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

                // 💾 Export file
                const blob = await docx.Packer.toBlob(doc);
                const filename = `laporan-ahli-dewan-negara_${new Date()
                    .toISOString()
                    .slice(0, 10)}.docx`;
                saveAs(blob, filename);
            } catch (err) {
                console.error("Export to Word failed:", err);
            }
        }
    }
}
</script>

<style scoped>
p {
    padding-top: 20px;
    padding-left: 40px;
    font-family: Arial, sans-serif;
    font-size: 12pt;
    line-height: 1.3;

}
</style>
