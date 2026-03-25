<!-- File: layouts/laporan_adn.vue -->
<template>
    <Layout>

        <PageHeader title="Laporan" pageTitle="Pelantikan" />

        <ExportPDF :leftFields="leftFields" :rightFields="rightFields" :selectedKategori="selectedKategori"
            @export="exportToPDF" @update:selectedKategori="selectedKategori = $event" />

        <div class="card p-4 shadow-sm" ref="pdfContent">
            <ReportTemplate :title="reportTitle" />

            <!-- DUN -->
            <ReportTemplate :subTitle="reportSubtitle" :note="reportNote" :headers="tableHeaders" :fields="tableFields"
                :wakil="wakil" :rows="getRows" :isEditing="isEditing" :columnWidths="columnWidths" />

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
                { label: 'Tarikh Lahir', align: 'text-center', bold: true },
                { label: 'Jawatan', align: 'text-center', bold: true },
                { label: 'Tarikh Lantik', align: 'text-center', bold: true },
                { label: 'Tarikh Tamat / Tarikh Mencapai Umur 66 Tahun', align: 'text-center', bold: true },
                { label: 'Tarikh Mencapai Umur 66 Tahun 6 Bulan', align: 'text-center', bold: true },

            ],
            tableFields: [
                { key: 'bil', align: 'text-left', bold: false },
                { key: 'nama', align: 'text-left', bold: false },
                { key: 'tarikh_lahir', align: 'text-center', bold: false },
                { key: 'jawatan', align: 'text-center', bold: false },
                { key: 'tarikhLantik', align: 'text-center', bold: false },
                { key: 'tarikhTamat', align: 'text-center', bold: false },
                { key: 'enamBulan', align: 'text-center', bold: false },

            ],
            columnWidths: ['5%','40%','10%','15%','10%','10%','10%'],
            isEditing: false,
            editorInstance: null,
            HMR: [
                { nama: 'YAA Tan Sri Datuk Amar Abang Iskandar bin Abang Hashim', tarikh_lahir: '03/07/1959', jawatan: ['PK', 'PK', 'HMT', 'HMR', 'HMP', 'HBSS', 'PMR'], tarikhLantik: ['01/03/2007', '01/03/2009', '14/10/2009', '30/09/2013', '26/11/2018', '20/02/2020', '17/01/2023',], tarikhTamat: ['28/02/2009', '13/10/2009', '29/09/2013', '25/11/2018', '19/02/2020', '16/01/2023', '03/07/2025'], },
                { nama: 'YA Datuk Hajjah Azizah binti Haji Nawawi', tarikh_lahir: '09/01/1962', jawatan: ['PK', 'HMT (M)', 'HMR'], tarikhLantik: ['01/11/2012', '12/09/2014', '08/08/2019'], tarikhTamat: ['11/09/2014', '07/08/2019', '09/01/2028'], },
                { nama: 'YA Datuk Ravinthran a/l Paramaguru', tarikh_lahir: '21/01/1962', jawatan: ['PK', 'PK', 'PK', 'HMT (SS)', 'HMR'], tarikhLantik: ['05/01/2009','05/01/2011', '05/01/2012', '08/01/2013', '08/08/2019'], tarikhTamat: ['04/01/2011','04/01/2012', '07/01/2013', '07/08/2019','21/01/2028'], },
                { nama: 'YA Datuk Nantha Balan a/l E.S. Moorthy', tarikh_lahir: '25/10/1959', jawatan: ['PK', 'PK', 'HMT (M)', 'HMR'], tarikhLantik: ['08/07/2013', '08/07/2015', '21/03/2016', '05/12/2019'], tarikhTamat: ['07/07/2015', '20/03/2016', '04/12/2019','25/10/2025'], },
                { nama: 'YA Datuk Supang Lian', tarikh_lahir: '25/08/1960', jawatan: ['PK', 'PK', 'HMT (SS)', 'HMR'], tarikhLantik: ['28/10/2009', '28/10/2011', '04/04/2012', '25/03/2020'], tarikhTamat: ['27/10/2011', '03/04/2012', '24/03/2020','25/08/2026'], },

            ],
            // wakil: ['Sarawak', 'Johor', 'N.Sembilan', 'P.Pinang', 'P.Pinang', 'Terengganu', 'Kedah', 'Kedah', 'Perak', 'Kelantan', 'Melaka', 'Johor', 'Sarawak', 'Sabah', 'Melaka', 'Kelantan', 'Perlis', 'Perlis', 'Sabah', 'Perak', 'Selangor', 'Selangor', 'Pahang', 'Pahang', 'N.Sembilan'],
            totalRows: 31,
            // kategoriDUN: 'DUN',
            notaContent: '<p><strong>Perkara 122A Perlembagaan Persekutuan</strong><br/>Keanggotaan Mahkamah Rayuan = 32 jawatan hakim [P.U.(A) 164 / 2009 berkuat kuasa mulai 1 Mei 2009]</p><p><u>Petunjuk</u>:</p><ul><li><strong>PMR</strong> – Presiden Mahkamah Rayuan</li><li><strong>HMR</strong> – Hakim Mahkamah Rayuan</li><li><strong>HMT (M/SS)</strong> – Hakim Mahkamah Tinggi (Malaya / Sabah Sarawak)</li><li><strong>PK</strong> – Pesuruhjaya Kehakiman Mahkamah Tinggi</li></ul>',
            reportTitle: '<strong><u>SENARAI HAKIM MAHKAMAH RAYUAN</u></strong>',
            // reportSubtitle: 'PERKARA 45(1)(a) PERLEMBAGAAN PERSEKUTUAN',
            // reportNote: '(2 Orang Ahli dipilih oleh setiap DUN)',
        }
    },
    computed: {
        getRows() {
            // Map through each item and insert formatted name for PMR
            const updated = this.HMR.map((item, index) => {
                const isPMR = item.jawatan.includes("PMR");

                return {
                    ...item,
                    bil: index + 1,
                    nama: isPMR
                        ? `<b><u>PRESIDEN MAHKAMAH RAYUAN</u></b><br/><br/>${item.nama}`
                        : item.nama,
                    // highlight: isPMR // optional: can use this in table if needed
                };
            });

            // Sort so PMR comes first
            const sorted = [...updated].sort((a, b) => {
                const aIsPMR = a.jawatan.includes("PMR") ? 0 : 1;
                const bIsPMR = b.jawatan.includes("PMR") ? 0 : 1;
                return aIsPMR - bIsPMR;
            });

            // Pad missing rows
            const missing = this.totalRows - sorted.length;
            for (let i = 0; i < missing; i++) {
                sorted.push({
                    nama: '',
                    tarikh_lahir: '',
                    jawatan: '',
                    tarikhLantik: '',
                    tarikhTamat: '',
                    enamBulan: '',
                    bil: sorted.length + 1,
                    highlight: false 
                });
            }

            return sorted;
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
        },

    },
    watch: {

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
p {
    padding-top: 20px;
    padding-left: 40px;
    font-family: Arial, sans-serif;
    font-size: 12pt;
    line-height: 2.5;

}
</style>
