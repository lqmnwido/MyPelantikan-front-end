<template>
    <Layout>
        <PageHeader title="Laporan" pageTitle="Pelantikan" />

        <ExportPDF :leftFields="leftFields" :rightFields="rightFields" @export="exportToPDF" />


        <div class="card p-4 shadow-sm" ref="pdfContent">
            <TemplateRenderer :template="template" :data="tableData" />
        </div>
    </Layout>
</template>

<script>
import Layout from '@/layouts/main.vue';
import PageHeader from '@/components/page-header.vue';
import TemplateRenderer from "@/components/ReportTemplate/TemplateRenderer.vue";
import ExportPDF from '@/components/ReportTemplate/ExportPDF.vue'
import html2pdf from 'html2pdf.js'

export default {
    name: "LaporanPage",
    components: { Layout, PageHeader, ExportPDF, TemplateRenderer },
    data() {
        return {
            // Template from your database
            template: {
               
                blocks: [
                    {
                        id: 1756868840328.9783,
                        type: "text",
                        content: `<h2 class="ql-align-center"><strong class="ql-size-small">SENARAI AHLI DEWAN NEGARA</strong></h2>
<hr style="border:none; border-top:2px solid #000; margin:0;">
<p class="ql-align-center"><br></p>`,
                    },
                    {
                        id: 1756868861181.067,
                        type: "table",
                        headers: [
                            {
                                text: "Nama",
                                field: "nama",
                                format: null,
                                align: "left",
                                width: 90,
                            },
                        ],
                        filterJenis: "A1",
                        filterSaringan: null,
                        indexHeader: "Bil.",
                        startRow: 2,
                        rowCount: 59,
                    },
                ],
                name: "Laporan ADN",
            },

            // Data from your database
            tableData: [
                { nama: "Ahmad", jenis: "A1" },
                { nama: "Abu", jenis: "A1" },
            ],
        };
    },
    computed: {

    },
    methods: {
        async loadTemplate() {
            // const response =
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
    }
};
</script>
