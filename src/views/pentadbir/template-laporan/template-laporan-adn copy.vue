<!-- File: layouts/laporan_adn.vue -->
<template>
    <Layout>

        <PageHeader title="Laporan" pageTitle="Pelantikan" />

        <ExportPDF :leftFields="leftFields" :rightFields="rightFields" :selectedKategori="selectedKategori"
            @export="exportToPDF" @update:selectedKategori="selectedKategori = $event" />

        <div class="card p-4 shadow-sm" ref="pdfContent">
            <ReportTemplate :title="reportTitleDUN" />
            <!-- DUN -->
            <ReportTemplate v-if="selectedKategori === '1' || selectedKategori === '3'" :subTitle="reportSubtitleDUN"
                :note="reportNoteDUN" :headers="tableHeaders" :fields="tableFields" :wakil="wakil" :rows="getRowsDUN"
                :isEditing="isEditing" />

            <!-- Agong -->
            <template v-if="selectedKategori === '1' || selectedKategori === '2'">
                <!-- 4 org -->
                <ReportTemplate :title="reportTitleAgong" :subTitle="reportSubtitleAgong" :note="reportNoteAgong" />

                <ReportTemplate ref="reportTemplate" :subTitle="reportSubtitleKL" :headers="tableHeaders"
                    :fields="tableFields" :rows="getRowsKL" :isEditing="isEditing" />

                <ReportTemplate ref="reportTemplate" :subTitle="reportSubtitleLabuan" :headers="tableHeaders"
                    :fields="tableFields" :rows="getRowsLabuan" :isEditing="isEditing" />

                <ReportTemplate ref="reportTemplate" :subTitle="reportSubtitlePutrajaya" :headers="tableHeaders"
                    :fields="tableFields" :rows="getRowsPutrajaya" :isEditing="isEditing" />

                <!-- 40org -->
                <ReportTemplate ref="reportTemplate" :subTitle="reportSubtitleAgong2" :note="reportNoteAgong2"
                    :headers="tableHeaders" :fields="tableFields" :rows="getRowsAgong" :isEditing="isEditing" />
            </template>
            <!-- Separate Nota Editor Component -->
            <NotaEditor :notaContent="notaContent" :isEditing="isEditing" @update:notaContent="notaContent = $event"
                @start-editing="startEditing" @save="saveChanges" />

            <p>Bahagian Kabinet, Perlembagaan dan<br />
                Perhubungan Antara Kerajaan,<br />
                Jabatan Perdana Menteri.
            </p>

            <p>{{currentMonthYear}}</p>
        </div>
    </Layout>
</template>

<script>
import Layout from '@/layouts/main.vue'
import PageHeader from '@/components/page-header.vue'
import ReportTemplate from '@/components/ReportTemplate/TemplateLaporan.vue'
import NotaEditor from '@/components/ReportTemplate/NotaEditor.vue'
import ExportPDF from '@/components/ReportTemplate/ExportPDF.vue'
// import { nextTick } from 'vue'
import html2pdf from 'html2pdf.js'
// import Editor from '@toast-ui/editor'

export default {
    components: { Layout, PageHeader, ReportTemplate, NotaEditor, ExportPDF },
    data() {
        return {
            tableHeaders: [
                { label: 'Bil.', align: 'text-left', bold: true },
                { label: 'Nama', align: 'text-left', bold: true },
                { label: 'Tarikh Lantik', align: 'text-center', bold: true },
                { label: 'Tarikh Tamat', align: 'text-center', bold: true },
                { label: 'Penggal', align: 'text-center', bold: true },
                { label: 'Wakil', align: 'text-center', bold: true }
            ],
            tableFields: [
                { key: 'bil', align: 'text-left', bold: false },
                { key: 'nama', align: 'text-left', bold: false },
                { key: 'tarikhLantik', align: 'text-center', bold: false },
                { key: 'tarikhTamat', align: 'text-center', bold: false },
                { key: 'penggal', align: 'text-center', bold: false },
                { key: 'wakil', align: 'text-center', bold: false }
            ],
            isEditing: false,
            editorInstance: null,
            DUN: [
                { nama: 'YB Senator Dato’ Ahmad bin Dato’ Sri Hj Ibrahim', tarikhLantik: '22.07.2022', tarikhTamat: '21.07.2025', penggal: 'Pertama', parti: 'PBB' },
                { nama: 'YB Senator Datuk Lim Pay Hen', tarikhLantik: ['04.12.2017', '26.06.2022'], tarikhTamat: ['03.12.2020', '25.06.2025'], penggal: ['Pertama', 'Kedua'], parti: 'MCA' },
                { nama: 'YB Senator Dato’ Dr. Ahmad Azam bin Hamzah', tarikhLantik: ['09.05.2019', '15.08.2022'], tarikhTamat: ['08.05.2022', '14.08.2025'], penggal: ['Pertama', 'Kedua'], parti: 'PKR' },
                { nama: 'YB Senator Tuan Amir bin Ghazali', tarikhLantik: ['07.03.2023'], tarikhTamat: ['06.03.2026'], penggal: ['Pertama'], parti: 'PKR' },
                { nama: 'YB Senator Dr. Lingeshwaran a/l Dato’ Seri R. Arunasalam', tarikhLantik: ['07.03.2023'], tarikhTamat: ['06.03.2026'], penggal: ['Pertama'], parti: 'DAP' },
                { nama: 'YB Senator Tuan Haji Hussin bin Ismail', tarikhLantik: ['15.03.2023'], tarikhTamat: ['14.03.2026'], penggal: ['Pertama'], parti: 'PAS' },
                { nama: 'YB Senator Tuan Haji Abdul Nasir bin Haji Idris', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: 'PAS' },
                { nama: 'YB Senator Tuan Musoddak bin Ahmad', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: 'PAS' },
                { nama: 'YB Senator Datuk Seri Mujahid bin Yusof', tarikhLantik: ['25.05.2023'], tarikhTamat: ['24.05.2026'], penggal: ['Pertama'], parti: 'AMANAH' },
                { nama: 'YB Senator Tuan Nik Mohamad Abduh bin Nik Abdul Aziz', tarikhLantik: ['08.07.2023'], tarikhTamat: ['07.07.2026'], penggal: ['Pertama'], parti: 'PAS' },
                { nama: 'YB Senator Datuk Haji Mustafa bin Musa', tarikhLantik: ['31.07.2023'], tarikhTamat: ['30.07.2026'], penggal: ['Pertama'], parti: 'UMNO' },
                { nama: 'YB Senator Dato’ Haji Abdul Halim bin Haji Suleiman', tarikhLantik: ['23.11.2023'], tarikhTamat: ['22.11.2026'], penggal: ['Pertama'], parti: 'UMNO' },
                { nama: 'YB Senator Tuan Michael Mujah Lihan', tarikhLantik: ['11.12.2023'], tarikhTamat: ['10.12.2026'], penggal: ['Pertama'], parti: 'PBB' },
                { nama: 'YB Senator Datuk Bobbey Ah Fang bin Suan', tarikhLantik: ['05.01.2021', '05.01.2024'], tarikhTamat: ['04.01.2024', '04.01.2027'], penggal: ['Pertama', 'Kedua'], parti: 'GRS' },
                { nama: 'YB Senator Datuk Wira Koh Nai Kwong', tarikhLantik: ['10.12.2020', '06.03.2024'], tarikhTamat: ['09.12.2023', '05.03.2027'], penggal: ['Pertama', 'Kedua'], parti: 'MCA' },
                { nama: 'YB Senator Dr. Hajah Wan Martina binti Wan Yusoff', tarikhLantik: ['10.12.2020', '06.03.2024'], tarikhTamat: ['09.12.2023', '05.03.2027'], penggal: ['Pertama', 'Kedua'], parti: 'MCA' },

            ],
            wakil: ['Sarawak', 'Johor', 'N.Sembilan', 'P.Pinang', 'P.Pinang', 'Terengganu', 'Kedah', 'Kedah', 'Perak', 'Kelantan', 'Melaka', 'Johor', 'Sarawak', 'Sabah', 'Melaka', 'Kelantan', 'Perlis', 'Perlis', 'Sabah', 'Perak', 'Selangor', 'Selangor', 'Pahang', 'Pahang', 'N.Sembilan'],
            totalRowsDUN: 25,
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
            KL: [
                { nama: 'YB Senator Tuan Isaiah a/l D Jacob', tarikhLantik: '20.03.2023', tarikhTamat: '19.03.2026', penggal: 'Pertama', parti: 'PKR' },
            ],
            totalRowsKL: 2,

            reportSubtitleLabuan: 'WILAYAH PERSEKUTUAN LABUAN',
            Labuan: [
                { nama: 'YB Senator Dato’ Sri Anifah bin Aman @ Haniff Amman', tarikhLantik: '20.03.2023', tarikhTamat: '19.03.2026', penggal: 'Pertama', parti: 'PCS' },
            ],
            totalRowsLabuan: 1,

            reportSubtitlePutrajaya: 'WILAYAH PERSEKUTUAN PUTRAJAYA',
            Putrajaya: [
            ],
            totalRowsPutrajaya: 1,

            reportSubtitleAgong2: 'PERKARA 45(1)(b) PERLEMBAGAAN PERSEKUTUAN',
            reportNoteAgong2: '(40 orang Ahli dilantik oleh YDPA)',
            Agong: [
                { nama: 'YB Senator Datuk Dr. Azhar bin Ahmad', tarikhLantik: '21.03.2022', tarikhTamat: '20.03.2025', penggal: 'Pertama', parti: ['UMNO'] },
                { nama: 'YB Senator Tan Sri Hj. Mohamad Fatmi bin Hj. Che Salleh', tarikhLantik: '25.04.2022', tarikhTamat: '24.04.2025', penggal: 'Pertama', parti: ['UMNO'] },
                { nama: 'YB Senator Prof. Tan Sri Datuk Dr. Haji Mohamed Haniffa bin Abdullah', tarikhLantik: '26.09.2022', tarikhTamat: '25.09.2025', penggal: 'Pertama', parti: ['MIC'] },
                { nama: 'YB Senator Datin Hajah Ros Suryati binti Alang', tarikhLantik: '26.09.2022', tarikhTamat: '25.09.2025', penggal: 'Pertama', parti: ['UMNO'] },
                { nama: 'YB Senator Tengku Datuk Seri Utama Zafrul bin Tengku Abdul Aziz', jawatan: ['Menteri Pelaburan', 'Perdagangan dan Industri'], tarikhLantik: ['09.03.2020', '03.12.2022'], tarikhTamat: ['04.11.2022', '02.12.2025'], penggal: ['Pertama', 'Kedua'], parti: ['UMNO'] },
                { nama: 'YB Senator Datuk Seri Saifuddin Nasution bin Ismail', jawatan: ['Menteri Dalam Negeri'], tarikhLantik: ['03.12.2022'], tarikhTamat: ['02.12.2025'], penggal: ['Pertama'], parti: ['PKR'] },
                { nama: 'YB Senator Datuk Seri Diraja Dr. Zambry bin Abdul Kadir', jawatan: ['Menteri Luar Negeri'], tarikhLantik: ['03.12.2022'], tarikhTamat: ['02.12.2025'], penggal: ['Pertama'], parti: ['UMNO'] },
                { nama: 'YB Senator Dato’ Setia Dr. Mohd Na’im bin Haji Mokhtar', jawatan: ['Menteri di JPM (Hal Ehwal Agama)'], tarikhLantik: ['03.12.2022'], tarikhTamat: ['02.12.2025'], penggal: ['Pertama'], parti: ['Profesional'] },
                { nama: 'YB Senator Puan Hajah Fuziah binti Salleh', jawatan: ['Timbalan Menteri Perdagangan Dalam Negeri dan Kos Sara Hidup'], tarikhLantik: ['10.12.2022'], tarikhTamat: ['09.12.2025'], penggal: ['Pertama'], parti: ['PKR'] },
                { nama: 'YB Senator Puan Saraswathy a/p Kandasami', jawatan: ['Timbalan Menteri Pembangunan Usahawan dan Koperasi'], tarikhLantik: ['10.12.2022'], tarikhTamat: ['09.12.2025'], penggal: ['Pertama'], parti: ['PKR'] },
                { nama: 'YB Senator Tuan Manolan bin Mohamad', tarikhLantik: ['27.08.2018', '26.08.2021'], tarikhTamat: ['20.03.2023', '19.03.2026'], penggal: ['Pertama', 'Kedua'], parti: ['PKR'] },
                { nama: 'YB Senator Tan Sri Dato’ Low Kian Chuan', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: ['Profesional'] },
                { nama: 'YB Senator Prof. Datuk Seri Dr. Awang bin Sariyan', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: ['Profesional'] },
                { nama: 'YB Senator Dato’ Sivaraj a/l Chandran', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: ['BEBAS'] },
                { nama: 'YB Senator Datuk Wira Dr. Mohd Hatta bin Md Ramli', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: ['AMANAH'] },
                { nama: 'YB Senator Tuan Abun Sui Anyit', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: ['PKR'] },
                { nama: 'YB Senator Tuan Mohd Hasbie bin Muda', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: ['AMANAH'] },
                { nama: 'YB Senator Tuan Roderick Wong Siew Lead', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: ['DAP'] },
                { nama: 'YB Senator Puan Noorita binti Sual', tarikhLantik: ['20.03.2023'], tarikhTamat: ['19.03.2026'], penggal: ['Pertama'], parti: ['DAP'] },
                { nama: 'YB Senator Datuk Nur Jazlan bin Tan Sri Mohamed', jawatan: ['Timbalan Yang di-Pertua Dewan Negara mulai: 19.06.2023 – 14.06.2026 (Pertama)'], tarikhLantik: ['15.06.2023'], tarikhTamat: ['14.06.2026'], penggal: ['Pertama'], parti: ['UMNO'] },
                { nama: 'YB Senator Puan Susan Chemerai Anding', tarikhLantik: ['22.06.2020', '21.06.2023'], tarikhTamat: ['21.08.2023', '20.08.2026'], penggal: ['Pertama', 'Kedua'], parti: ['GPS (PBB)'] },
                { nama: 'YB Senator Dato’ Sri Vell Paari a/l Samy Vellu', tarikhLantik: ['02.09.2020', '01.09.2023'], tarikhTamat: ['02.09.2023', '01.09.2026'], penggal: ['Pertama', 'Kedua'], parti: ['MIC'] },
                { nama: 'YB Senator Puan Rita Sarimah anak Patrick Insol', tarikhLantik: ['22.06.2020', '21.06.2023'], tarikhTamat: ['20.11.2023', '19.11.2026'], penggal: ['Pertama', 'Kedua'], parti: ['GPS (PRS)'] },
                { nama: 'YB Senator Datuk Seri Amir Hamzah bin Azizan', jawatan: ['Menteri Kewangan II'], tarikhLantik: ['12.12.2023'], tarikhTamat: ['11.12.2026'], penggal: ['Pertama'], parti: ['Profesional'] },
                { nama: 'YB Senator Dr. Zulkifli bin Hasan', jawatan: ['Timbalan Menteri di JPM (Hal Ehwal Agama)'], tarikhLantik: ['12.12.2023'], tarikhTamat: ['11.12.2026'], penggal: ['Pertama'], parti: ['Profesional'] },
                { nama: 'YB Senator Puan Anna Bell @ Suzieana binti Perian', tarikhLantik: ['05.03.2024'], tarikhTamat: ['04.03.2027'], penggal: ['Pertama'], parti: ['GRS'] },
                { nama: 'YB Senator Tuan Pele Peter Tinggom', tarikhLantik: ['05.03.2024'], tarikhTamat: ['04.03.2027'], penggal: ['Pertama'], parti: ['GPS (PDP)'] },
                { nama: 'YB Senator Tuan Robert Lau Hui Yew', tarikhLantik: ['22.06.2020', '21.06.2023'], tarikhTamat: ['16.05.2024', '15.05.2027'], penggal: ['Pertama', 'Kedua'], parti: ['GPS (SUPP)'] },
                { nama: 'YB Senator Datuk Nelson W. Angang', tarikhLantik: ['16.05.2024'], tarikhTamat: ['15.05.2027'], penggal: ['Pertama'], parti: ['UPKO'] },
                { nama: 'YB Senator Dato Awang Bemee bin Awang Ali Basah', jawatan: ['Yang di-Pertua Dewan Negara mulai: 22.07.2024 – 14.07.2027 (Pertama)'], tarikhLantik: ['15.07.2024'], tarikhTamat: ['14.07.2027'], penggal: ['Pertama'], parti: ['GPS (PBB)'] },
                { nama: 'YB Senator Dato’ Setia Salehuddin bin Saidin', tarikhLantik: ['22.07.2024'], tarikhTamat: ['21.07.2027'], penggal: ['Pertama'], parti: ['Profesional'] },
                { nama: 'YB Senator Datuk Rosni binti Sohar', tarikhLantik: ['09.01.2025'], tarikhTamat: ['08.01.2028'], penggal: ['Pertama'], parti: ['UMNO'] }
            ],

            totalRowsAgong: 40,


            //filter
            selectedKategori: '1',
            leftFields: [
                { label: 'Jenis Lantikan:', model: 'selectedKategori', type: 'select', placeholder: '- SILA PILIH -', default: '1', options: [{ label: 'Keseluruhan', value: '1' }, { label: 'Dilantik Yang Di-Pertuan Agong', value: '2' }, { label: 'Dipilih oleh Dewan Undangan Negeri', value: '3' }] },
            ],

        }
    },
    computed: {
        getRowsDUN() {
            const rows = this.DUN.map((item, index) => ({
                ...item, bil: index + 1
            }))
            const missing = this.totalRowsDUN - rows.length
            for (let i = 0; i < missing; i++) rows.push({ nama: '', tarikhLantik: '', tarikhTamat: '', penggal: '', parti: '', bil: rows.length + 1, highlight: false })
            return rows
        },
        getRowsKL() {
            const rows = this.KL.map((item, index) => ({ ...item, bil: index + 1 }))
            const missing = this.totalRowsKL - rows.length
            for (let i = 0; i < missing; i++) rows.push({ nama: '', tarikhLantik: '', tarikhTamat: '', penggal: '', parti: '', bil: rows.length + 1, highlight: false })
            return rows
        },
        getRowsLabuan() {
            const rows = this.Labuan.map((item, index) => {
                let nama = item.nama
                if (item.jawatan && item.jawatan.length) {
                    nama += `<br/><b>\n[${item.jawatan.join(',')}]<b/>`
                }
                return { ...item, bil: index + 1, nama }
            })
            const missing = this.totalRowsLabuan - rows.length
            for (let i = 0; i < missing; i++) {
                rows.push({ nama: '', tarikhLantik: '', tarikhTamat: '', penggal: '', parti: '', bil: rows.length + 1, highlight: false })
            }
            return rows
        },
        getRowsPutrajaya() {
            const rows = this.Putrajaya.map((item, index) => {
                let nama = item.nama
                if (item.jawatan && item.jawatan.length) {
                    nama += `<br/><b>\n[${item.jawatan.join(',')}]<b/>`
                }
                return { ...item, bil: index + 1, nama }
            })
            const missing = this.totalRowsPutrajaya - rows.length
            for (let i = 0; i < missing; i++) {
                rows.push({ nama: '', tarikhLantik: '', tarikhTamat: '', penggal: '', parti: '', bil: rows.length + 1, highlight: false })
            }
            return rows
        },
        getRowsAgong() {
            const rows = this.Agong.map((item, index) => {
                let nama = item.nama
                if (item.jawatan && item.jawatan.length) {
                    nama += `<br/><b>\n[${item.jawatan.join(',')}]<b/>`
                }
                return { ...item, bil: index + 1, nama }
            })
            const missing = this.totalRowsAgong - rows.length
            for (let i = 0; i < missing; i++) {
                rows.push({ nama: '', tarikhLantik: '', tarikhTamat: '', penggal: '', parti: '', bil: rows.length + 1, highlight: false })
            }
            return rows
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
        }
    }
}
</script>

<style scoped>
p{
    padding-top:20px;
    padding-left: 40px;
    font-family: Arial, sans-serif;
    font-size: 12pt;
    line-height: 1.3;

}
</style>
