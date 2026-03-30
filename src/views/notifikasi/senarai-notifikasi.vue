<template>
    <Layout>
        <PageHeader title="Senarai Notifikasi" pageTitle="Notifikasi" />

        <ExportPDF :showBack="false" @print="exportToPDF"
            @word="exportToWord" />

        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :buttonTambah="false" :columnWidths="columnWidths" :total="total" :page="page"
            :perPage="perPage" :loading="loading" serverSide @change-page="onChangePage"
            @change-per-page="onChangePerPage" @search="onSearch">
            <template #actions="{ item }">
                <button class="icon-btn text-danger" @click="hapus(item)" title="Padam">
                    <i class="mdi mdi-delete"></i>
                </button>
            </template>
        </DataTable>

        <!-- Hidden Report Template -->
        <div style="display: none;">
            <div ref="pdfContent" style="padding: 20px; background: white; color: black;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="font-family: Arial, sans-serif; font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">
                        Senarai Ahli Hampir Tamat Tempoh
                    </h3>
                    <div style="border-top: 2px solid #000; width: 100%; margin: 10px 0;"></div>
                </div>

                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt;" border="1">
                    <thead style="background-color: #f2f2f2;">
                        <tr>
                            <th style="padding: 8px; text-align: center; width: 5%;">BIL.</th>
                            <th style="padding: 8px; text-align: left; width: 70%;">NAMA (JAWATAN)</th>
                            <th style="padding: 8px; text-align: center; width: 25%;">TARIKH TAMAT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableData" :key="index">
                            <td style="padding: 8px; text-align: center; vertical-align: top;">
                                {{ (page - 1) * perPage + (index + 1) }}
                            </td>
                            <td style="padding: 8px; vertical-align: top;">
                                <div style="font-weight: bold;">{{ item.gelaran ? item.gelaran + ' ' + item.nama : item.nama }}</div>
                                <div style="font-size: 9pt; color: #444;">{{ item.jawatan }}</div>
                            </td>
                            <td style="padding: 8px; text-align: center; vertical-align: top;">
                                {{ item.tarikh_tamat }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-top: 30px; font-family: Arial, sans-serif; font-size: 9pt; text-align: right;">
                    <p>Tarikh Dijana: {{ new Date().toLocaleDateString('ms-MY') }}</p>
                </div>
            </div>
        </div>

        <SweetAlert :show="alert.showConfirmDelete" type="warning" title="Anda pasti?"
            :html="`Tindakan ini akan hapuskan notifikasi: <b>${deleteTarget}</b>`" :showCancelButton="true"
            confirmButtonText="Ya, hapus" cancelButtonText="Batal" @confirmed="confirmDelete"
            @cancelled="alert.showConfirmDelete = false" @closed="alert.showConfirmDelete = false" />

        <SweetAlert :show="alert.showSuccess" type="success" title="Berjaya!" text="Notifikasi telah dihapuskan."
            :autoClose="1500" @closed="alert.showSuccess = false" />

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { notifikasiService } from "@/services/notifikasi.service";
import SweetAlert from "@/components/SweetAlert.vue";
import ExportPDF from "@/components/ReportTemplate/ExportPDF.vue";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
import htmlDocx from "html-docx-js/dist/html-docx";

export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        SweetAlert,
        ExportPDF,
    },
    data() {
        return {
            topicLabel: "Senarai Ahli Hampir Tamat Tempoh",
            headers: ["No", "Gambar", "Nama (Jawatan)", "Tarikh Tamat", "Tindakan"],
            fields: ["index", "gambar", "nama_display", "tarikh_tamat", "actions"],
            columnAlignments: ["center", "center", "left", "center", "center",],
            columnWidths: ["5%", "10%", "55%", "20%", "10%"],
            tableData: [],
            page: 1,
            perPage: 5,
            total: 0,
            search: "",
            loading: false,
            alert: {
                showConfirmDelete: false,
                showSuccess: false,
                error: false,
            },
            deleteTarget: "",
            targetID: null,
        };
    },
    async mounted() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            try {
                const res = await notifikasiService.senaraiNotifikasi({
                    page: this.page,
                    perPage: this.perPage,
                    search: this.search,
                });

                const { data, total, current_page, per_page } = res;

                this.total = total ?? 0;
                this.page = current_page ?? this.page;
                this.perPage = per_page ?? this.perPage;

                this.tableData = (data || []).map((row, i) => ({
                    ...row,
                    index: (this.page - 1) * this.perPage + (i + 1),
                    nama_display: row.gelaran ?
                        `${row.gelaran} ${row.nama} <br> <span class="badge rounded-pill bg-primary text-white me-1">${row.jawatan}</span>` :
                        `${row.nama} <br> <span class="badge rounded-pill bg-primary text-white me-1">${row.jawatan}</span>`,
                }));

            } catch (err) {
                this.alert.errorMessage = JSON.stringify(err?.response?.data?.error) || err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
                this.alert.error = true;
            } finally {
                this.loading = false
            }
        },
        onChangePage(p) {
            this.page = p;
            this.loadData();
        },
        onChangePerPage(pp) {
            this.perPage = pp;
            this.page = 1;
            this.loadData();
        },
        onSearch(keyword) {
            this.search = keyword;
            this.page = 1;
            this.loadData();
        },
        hapus(item) {
            this.deleteTarget = item.nama;
            this.targetID = item.id;
            this.alert.showConfirmDelete = true;
        },
        async confirmDelete() {
            try {
                await notifikasiService.hapusNotifikasi(this.targetID);
                // console.log('Delete:', this.targetID)
                this.alert.showConfirmDelete = false
                this.alert.showSuccess = true
                await this.loadData();
            } catch (err) {
                this.alert.showConfirmDelete = false
                this.alert.error = true
                this.alert.errorMessage = err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
            }
        },

        // Export Methods
        exportToPDF() {
            const el = this.$refs.pdfContent;
            const opt = {
                margin: [15, 15, 15, 15],
                filename: `senarai_notifikasi_${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Temporarily show the element for capturing
            const originalStyle = el.parentElement.style.display;
            el.parentElement.style.display = 'block';

            html2pdf().set(opt).from(el).save().then(() => {
                el.parentElement.style.display = originalStyle;
            });
        },
        exportToWord() {
            const el = this.$refs.pdfContent;
            
            // Temporarily show the element for capturing
            const originalStyle = el.parentElement.style.display;
            el.parentElement.style.display = 'block';

            const header = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'></head><body>`;
            const footer = "</body></html>";
            const sourceHTML = header + el.innerHTML + footer;
            
            const converted = htmlDocx.asBlob(sourceHTML);
            saveAs(converted, `senarai_notifikasi_${new Date().toISOString().slice(0, 10)}.docx`);

            el.parentElement.style.display = originalStyle;
        }
    },
};
</script>

<style scoped>
.icon-btn {
    background: transparent;
    border: none;
    padding: 4px;
    font-size: 1.1rem;
    cursor: pointer;
}

.icon-btn:hover {
    opacity: 0.7;
}
</style>