<template>
    <Layout>
        <PageHeader title="Komposisi Pelantikan Ahli Dewan Negara" pageTitle="Dashboards" />
        <div class="p-6">
            <div class="mb-4">
                <label for="kategori-select" class="form-label">Pilih Kategori:</label>
                <select id="kategori-select" class="form-select" v-model="selectedKategori">
                    <option value="">Keseluruhan</option>
                    <option value="DUN">Dipilih oleh Dewan Undangan Negeri (DUN)</option>
                    <option value="AGONG">Dilantik Yang Di-Pertuan Agong</option>
                </select>
            </div>
            <PartiChart :chartData="chartData" :parties="partiDetails" :total="totalAhli" :kategori="selectedKategori" />
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
