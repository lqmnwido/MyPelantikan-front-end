<template>
    <Layout>
        <PageHeader title="Komposisi Pelantikan Ahli Dewan Negara" pageTitle="Dashboards" />
        <div class="p-6">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="flex-grow-1 me-3">
                    <label for="kategori-select" class="form-label">Pilih Kategori:</label>
                    <select id="kategori-select" class="form-select" v-model="selectedKategori">
                        <option value="">Keseluruhan</option>
                        <option value="DUN">Dipilih oleh Dewan Undangan Negeri (DUN)</option>
                        <option value="AGONG">Dilantik Yang Di-Pertuan Agong</option>
                    </select>
                </div>
                <button class="btn btn-primary mt-4" @click="printStatistik" :disabled="isPrinting">
                    <i v-if="isPrinting" class="bx bx-loader bx-spin me-1"></i>
                    <i v-else class="bx bx-printer me-1"></i>
                    {{ isPrinting ? 'Menjana PDF...' : 'Cetak Statistik' }}
                </button>
            </div>
            <div ref="statistikContent">
                <PartiChart ref="chartComponent" :chartData="chartData" :parties="partiDetails" :total="totalAhli"
                    :kategori="selectedKategori" />
            </div>
        </div>

        <SweetAlert :show="alert.error" type="error" title="Ralat" :text="alert.errorMessage"
            @closed="alert.error = false" />
    </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import PartiChart from '@/components/PartiChart.vue';
import { dashboardService } from '@/services/dashboard.service';
import SweetAlert from "@/components/SweetAlert.vue";
import html2pdf from "html2pdf.js";

export default {
    name: 'Parti Statistik',
    components: {
        Layout,
        PageHeader,
        PartiChart,
        SweetAlert,
    },
    data() {
        return {
            partiDetails: [],
            chartData: {},
            selectedKategori: '', // Default value
            isPrinting: false,
            alert: {
                error: false,
                errorMessage: '',
            }
        };
    },
    watch: {
        selectedKategori(newKategori) {
            this.loadParti(newKategori);
        }
    },
    async mounted() {
        await this.loadParti(this.selectedKategori);
    },
    computed: {
        totalAhli() {
            return this.partiDetails.reduce((sum, parti) => sum + parti.jumlah, 0);
        }
    },
    methods: {
        async printStatistik() {
            this.isPrinting = true;

            // Wait for 1 second to ensure the chart and any animations are finished
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 1. Capture the chart as a high-quality image
            const chartCanvas = document.querySelector('canvas');
            if (!chartCanvas) {
                this.isPrinting = false;
                return;
            }
            const chartImage = chartCanvas.toDataURL("image/png", 1.0);

            const kategoriText = this.selectedKategori === 'DUN' ? 'Dipilih oleh Dewan Undangan Negeri (DUN)' :
                this.selectedKategori === 'AGONG' ? 'Dilantik Yang Di-Pertuan Agong' : 'Keseluruhan';

            // 2. Build Modern Table Rows with Page Break Protection
            const tableRows = this.partiDetails.map((p, idx) => {
                const subRows = p.subparties.map((s, sIdx) => {
                    const isLastSub = sIdx === p.subparties.length - 1;
                    const subBorderStyle = isLastSub ? '' : 'border-bottom: 1px solid #eee;';
                    
                    return `
                        <div style="display:flex; justify-content:space-between; padding: 6px 0; ${subBorderStyle}">
                            <span style="font-size: 11px; color: #444;">${s.nama}</span>
                            <span style="font-weight:bold; font-size: 11px; color: #2c3e50; margin-left: 20px;">${s.jumlah}</span>
                        </div>
                    `;
                }).join('');

                const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';

                return `
                    <tr style="background-color: ${bgColor}; page-break-inside: avoid;">
                        <td style="padding:15px; border:1px solid #d1d9e0; vertical-align:top; width: 35%;">
                            <div style="display:flex; align-items:center; margin-bottom: 5px;">
                                <div style="width:16px; height:16px; background-color:${p.color}; margin-right:12px; border-radius:4px; border: 1px solid rgba(0,0,0,0.1);"></div>
                                <strong style="font-size: 14px; color: #2c3e50;">${p.singkatan}</strong>
                            </div>
                            <div style="font-size: 11px; color:#666; margin-left:28px;">${p.nama}</div>
                        </td>
                        <td style="padding:15px; border:1px solid #d1d9e0; text-align:center; font-weight:bold; vertical-align:middle; background-color:rgba(0,0,0,0.01); font-size: 16px; color: #2c3e50; width: 15%;">
                            ${p.jumlah}
                        </td>
                        <td style="padding:15px; border:1px solid #d1d9e0; vertical-align:top; width: 50%;">
                            ${subRows || '<span style="color:#bbb; font-style:italic; font-size: 11px;">Tiada pecahan sub-parti</span>'}
                        </td>
                    </tr>
                `;
            }).join('');

            // 3. Construct the Refined Multi-Page HTML Template
            const pdfHtml = `
                <div style="font-family: Arial, sans-serif; color: #333; background: white; width: 100%;">
                    <!-- PAGE 1: Large Visual Summary -->
                    <div style="page-break-after: always; text-align: center; padding: 20px 0;">
                        <div style="margin-bottom: 40px;">
                            <h1 style="margin: 0; color: #2c3e50; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Laporan Statistik Parti</h1>
                            <h2 style="margin: 10px 0; color: #34495e; font-size: 20px; font-weight: normal;">Komposisi Pelantikan Ahli Dewan Negara</h2>
                            <div style="display: inline-block; padding: 8px 25px; background: #ebf0f5; border-radius: 25px; color: #2c3e50; font-size: 14px; margin-top: 15px; border: 1px solid #cfd9e1; font-weight: bold;">
                                Kategori: ${kategoriText}
                            </div>
                        </div>
                        
                        <div style="margin: 0 auto; width: 85%; max-width: 1000px; padding: 30px; border-radius: 20px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
                            <img src="${chartImage}" style="width: 100%; height: auto; max-height: 450px; object-fit: contain;">
                        </div>
                        
                        <div style="margin-top: 50px; color: #7f8c8d; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; display: inline-block; width: 80%;">
                            Laporan dijana pada: <strong>${new Date().toLocaleString('ms-MY')}</strong><br>
                            Aplikasi MyPelantikan
                        </div>
                    </div>

                    <!-- PAGE 2+: Detailed Modern Table -->
                    <div style="padding: 0;">
                        <div style="width: 100%; border-bottom: 3px solid #2c3e50; padding-bottom: 12px; margin-bottom: 25px;">
                            <table style="width: 100%; border-collapse: collapse; border: none;">
                                <tr>
                                    <td style="padding: 0; border: none; vertical-align: bottom;">
                                        <h3 style="margin: 0; color: #2c3e50; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">Data Terperinci Pecahan Sub-Parti</h3>
                                    </td>
                                    <td style="padding: 0; border: none; vertical-align: bottom; text-align: right;">
                                        <div style="font-size: 13px; color: #7f8c8d;">Jumlah Rekod: ${this.partiDetails.length} Parti</div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; background: white;">
                            <thead>
                                <tr style="background-color: #2c3e50; color: white;">
                                    <th style="padding:18px; border:1px solid #1a252f; font-size: 13px; text-align: left; text-transform: uppercase;">Parti / Gabungan Utama</th>
                                    <th style="padding:18px; border:1px solid #1a252f; text-align:center; font-size: 13px; text-transform: uppercase;">Jumlah Ahli</th>
                                    <th style="padding:18px; border:1px solid #1a252f; font-size: 13px; text-align: left; text-transform: uppercase;">Pecahan Sub-Parti</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                            <tfoot>
                                <tr style="background-color: #f8f9fa; border-top: 3px solid #2c3e50;">
                                    <td style="padding:20px; border:1px solid #d1d9e0; text-align:right; font-weight:bold; font-size: 14px; color: #2c3e50;">JUMLAH KESELURUHAN</td>
                                    <td style="padding:20px; border:1px solid #d1d9e0; text-align:center; font-weight:bold; color: #e74c3c; font-size: 22px;">${this.totalAhli}</td>
                                    <td style="padding:20px; border:1px solid #d1d9e0;"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;

            // 4. Set PDF Generation Options with Professional Margins
            const opt = {
                margin: [15, 15, 15, 15], // [top, left, bottom, right] in mm
                filename: `Statistik_Parti_${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: {
                    scale: 3, // Higher scale for even sharper text/images
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };

            // 5. Generate PDF with Headers and Footers
            html2pdf()
                .set(opt)
                .from(pdfHtml)
                .toPdf()
                .get("pdf")
                .then((pdf) => {
                    const totalPages = pdf.internal.getNumberOfPages();
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    const headerMargin = 10; // distance from top
                    const footerMargin = 10; // distance from bottom

                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);

                        // --- HEADER ---
                        pdf.setFont(undefined, "bold");
                        pdf.setFontSize(12);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text("RAHSIA", 15, headerMargin, { align: "left" });

                        // --- FOOTER ---
                        pdf.text("RAHSIA", pageWidth - 15, pageHeight - footerMargin, { align: "right" });

                        // Optional: Add page numbering while we are at it
                        pdf.setFont(undefined, "normal");
                        pdf.setFontSize(10);
                        pdf.setTextColor(100);
                        pdf.text(`Halaman ${i} daripada ${totalPages}`, pageWidth / 2, pageHeight - footerMargin, { align: "center" });
                    }
                })
                .save()
                .then(() => {
                    this.isPrinting = false;
                })
                .catch((err) => {
                    console.error("PDF generation failed:", err);
                    this.isPrinting = false;
                });
        },
        async loadParti(kategori) {
            try {
                const response = await dashboardService.statistikParti({ kategori });
                this.partiDetails = response.data.data || [];

                // Rebuild chartData whenever data is loaded
                this.chartData = {
                    labels: this.partiDetails.map(p => p.nama),
                    datasets: [
                        {
                            data: this.partiDetails.map(p => p.jumlah),
                            backgroundColor: this.partiDetails.map(p => p.color),
                            borderWidth: 1
                        }
                    ]
                };
            } catch (err) {
                console.log(err);
                this.alert.errorMessage = JSON.stringify(err?.response?.data?.error) || err?.response?.data?.message || err.message || 'Ralat tidak diketahui';
                this.alert.error = true;
            }
        }
    }
}
</script>
