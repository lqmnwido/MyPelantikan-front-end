<template>
  <div class="card" :style="{ height: height + 'px' }">
    <h3 class="card-title">{{ title }}</h3>

    <div class="summary">
      <div v-for="(item, index) in summaries" :key="index" class="summary-item">
        <div class="summary-value">{{ item.value }}</div>
        <div class="summary-label">{{ item.label }}</div>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, watch } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Legend,
  Tooltip
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Filler, Legend, Tooltip);

export default {
  name: 'ChartCard',
  props: {
    title: String,
    summaries: Array, // [{ label: 'Activated', value: 86541 }]
    datasets: Array,  // multiple datasets
    labels: Array,
    height: {
      type: Number,
      default: 300,
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const renderChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: {
          labels: props.labels,
          datasets: props.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                usePointStyle: true,
                pointStyle: 'line'
              }
            }
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              grid: { drawBorder: false },
              ticks: { display: true }
            }
          }
        }
      });
    };

    onMounted(renderChart);
    watch(() => [props.datasets, props.labels], renderChart, { deep: true });

    return { chartCanvas };
  }
};
</script>


<style scoped>
.card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.card-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.summary-item {
  text-align: center;
  flex: 1;
  min-width: 100px;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #3b82f6;
}

.summary-label {
  font-size: 0.85rem;
  color: #6b7280;
}

.chart-container {
  position: relative;
  width: 100%;
  height: calc(100% - 100px);
}
</style>
