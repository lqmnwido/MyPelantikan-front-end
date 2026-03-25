<template>
    <div class="space-y-8">
        <!-- Donut Chart -->
        <div class="flex justify-center mb-3">
            <canvas ref="donutChart" class="max-w-[400px] w-full h-[300px]"></canvas>
        </div>
        <!-- Parties Cards using BCard -->
        <div class="row justify-content-start">
            <div v-for="(parti, index) in parties" :key="index" class="col-12 col-md-4 col-lg-3 mb-4">
                <div class="card" :style="{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }">
                    <!-- Card Header -->
                    <div class="card-header d-flex justify-content-between align-items-center text-white" :style="{ backgroundColor: parti.color }">
                        <div>
                            <h6 class="mb-0" style="font-weight: bold;">{{ parti.singkatan }}</h6>
                            <small class="text-white">{{ parti.nama }}</small>
                        </div>
                        <div class="badge bg-light text-dark px-3 py-1 rounded-3" style="font-weight: bold;">{{ parti.jumlah }}</div>
                    </div>

                    <!-- Card Body: Subparties List -->
                    <div class="card-body p-0" :style="{ minHeight: '100px' }">
                        <div v-for="(sub, i) in parti.subparties" :key="i" class="d-flex justify-content-between align-items-center border-bottom py-2 px-3">
                            <div class="d-flex align-items-center">
                                <img v-if="sub.logo" :src="sub.logo" alt="" class="me-2" style="height: 20px; width: 30px;" />
                                <span style="font-size: 0.875rem;">{{ sub.nama }} - <strong>{{ sub.jumlah }}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

export default {
    name: 'PartiChart',
    props: {
        chartData: Object,
        parties: Array,
        total: Number,
        kategori: String // Accept the new kategori prop
    },
    setup(props) {
        const donutChart = ref(null)
        let chartInstance = null

        const centerTextPlugin = {
            id: 'centerText',
            afterDraw: (chart) => {
                if (chart.config.type !== 'doughnut' || !props.total) {
                    return;
                }
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                const centerX = (chartArea.left + chartArea.right) / 2;
                const centerY = (chartArea.top + chartArea.bottom) / 2;

                let labelText = 'Jumlah Ahli';
                if (props.kategori === 'DUN') {
                    labelText = 'Jumlah Ahli Dipilih oleh Dewan Undangan Negeri';
                } else if (props.kategori === 'AGONG') {
                    labelText = 'Jumlah Ahli Dilantik Yang Di-Pertuan Agong';
                }

                // Total number
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#333';
                ctx.fillText(props.total, centerX, centerY - 10);

                // Label (split into multiple lines if too long)
                const words = labelText.split(' ');
                const lineHeight = 16;
                const maxWidth = chart.width * 0.3; // Max width for the text, adjust as needed

                let line = '';
                const lines = [];

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                ctx.font = '14px Arial';
                ctx.fillStyle = '#666';
                let y = centerY + 12;
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i].trim(), centerX, y + (i * lineHeight));
                }
            }
        };

        const renderChart = () => {
            if (chartInstance) chartInstance.destroy()

            chartInstance = new Chart(donutChart.value, {
                type: 'doughnut',
                data: props.chartData,
                plugins: [centerTextPlugin],
                options: {
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    },
                    cutout: '60%',
                    responsive: true,
                    maintainAspectRatio: false
                }
            })
        }

        onMounted(renderChart)
        watch(() => props.chartData, renderChart, { deep: true })
        watch(() => props.kategori, renderChart) // Watch for kategori changes to re-render chart

        return { donutChart }
    }
}
</script>

<style scoped>
canvas {
    max-width: 100%;
    height: 300px;
}

img {
    height: 20px;
    width: 30px;
}

.card-body {
    max-height: 500px; /* Set a maximum height for the body */
    overflow-y: auto;  /* Add scroll if content overflows */
}

.card-header {
    font-weight: bold;
}
</style>
