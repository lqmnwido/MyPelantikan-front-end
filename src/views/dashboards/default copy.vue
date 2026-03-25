<template>
  <Layout>
    <PageHeader title="Laman Utama" pageTitle="Dashboards" />
    <div class="container-fluid">

      <BRow>
        <BCol md="3" v-for="stat of statData" :key="stat.icon">
          <Stat :number="stat.number" :title="stat.title" :value="stat.value" :current="stat.current"
            :total="stat.total" :footerLink="stat.footerLink" />
        </BCol>
      </BRow>

      <BModal v-model="showModal" hide-footer centered size="lg" hide-header class="bg-danger-subtle">
        <div class="p-4 bg-danger-subtle border rounded">
          <h4 class="mb-3"><strong>Perhatian!</strong></h4>
          <p>Berikut adalah lantikan yang akan tamat tempoh:</p>

          <table class="table table-borderless table-hover">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Lantikan</th>
                <th class="text-danger text-center">Tarikh Tamat</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in appointments" :key="index">
                <td>{{ record.nama }}</td>
                <td>{{ record.lantikan }}</td>
                <td class="text-danger text-center">{{ record.tarikhTamat }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BModal>
    </div>
  </Layout>
</template>

<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Stat from "@/components/widgets/stat";
// import ChartCard from '@/components/ChartCard.vue';

/**
 * Dashboard Component
 */
export default {
  components: {
    Layout,
    PageHeader,
    Stat,
    // ChartCard
  },
  data() {
    return {
      statData: [
        {
          group: "Ahli Dewan Negara",
          items: [
            {
              title: "Senarai",
              value: "Ahli Dewan Negara",
              current: 80,
              total: 100,
              footerLink: "/rekod-pelantikan/senarai-ahli-dewan-negara",
            },
            {
              title: "Senarai",
              value: "DUN",
              current: 30,
              total: 50,
              footerLink: "",
            },
            {
              title: "Senarai",
              value: "Agong",
              current: 1,
              total: 1,
              footerLink: "",
            },
          ],
        },
        {
          group: "Hakim",
          items: [
            {
              title: "Senarai",
              value: "Hakim Mahkamah Rayuan",
              current: 80,
              total: 100,
              footerLink: "",
            },
            {
              title: "Senarai",
              value: "Hakim Mahkamah Tinggi / Pesuruhjaya Kehakiman",
              current: 80,
              total: 100,
              footerLink: "",
            },
            {
              title: "Senarai",
              value: "Hakim Mahkamah Persekutuan",
              current: 80,
              total: 100,
              footerLink: "",
            },
          ],
        },
        {
          title: "Senarai",
          value: "Ahli Lembaga Pengampunan Bagi Wilayah Persekutuan Kuala Lumpur, Labuan & Putrajaya",
          current: 80,
          total: 100,
          footerLink: ""
        },
        {
          title: "Senarai",
          value: "Keanggotaan Lembaga Penasihat, Jabatan Perdana Menteri",
          current: 80,
          total: 100,
          footerLink: ""
        },
        {
          title: "Senarai",
          value: "Keanggotaan Lembaga Penasihat, Pusat Pencegahan Jenayah Kewangan Nasional (NFCC)",
          current: 80,
          total: 100,
          footerLink: ""
        },
        {
          title: "Senarai",
          value: "Keanggotaan Suruhanjaya Perkhidmatan Awam",
          current: 80,
          total: 100,
          footerLink: ""
        },
        {
          title: "Senarai",
          value: "Kedudukan Keanggotaan Suruhanjaya Perkhidmatan Kehakiman & Perundangan",
          current: 80,
          total: 100,
          footerLink: ""
        },
        {
          title: "Senarai",
          value: "Suruhanjaya Pilihan Raya",
          current: 80,
          total: 100,
          footerLink: ""
        },
        {
          title: "Senarai",
          value: "Tuan Yang Terutama",
          current: 80,
          total: 100,
          footerLink: ""
        },
        {
          title: "Senarai",
          value: "Lain-lain Pelantikan",
          current: 80,
          total: 100,
          footerLink: ""
        },
      ],
      appointments: [
        { nama: "Ahmad bin Ali", lantikan: "Menteri", tarikhTamat: "30/06/2025" },
        { nama: "Siti binti Aishah", lantikan: "Timbalan Menteri", tarikhTamat: "28/06/2025" },
        { nama: "Atan bin Ali", lantikan: "Pengarah", tarikhTamat: "20/06/2025" },
        { nama: "Maria binti Hassan", lantikan: "Pengarah", tarikhTamat: "30/06/2025" },
        { nama: "Zainal bin Ibrahim", lantikan: "Ketua Pegawai", tarikhTamat: "10/07/2025" },
        { nama: "Fatimah binti Omar", lantikan: "Ketua Pegawai", tarikhTamat: "21/06/2025" },
        { nama: "Kamal bin Ahmad", lantikan: "Pengurus", tarikhTamat: "17/06/2025" },
        { nama: "Lina binti Ismail", lantikan: "Pengurus", tarikhTamat: "21/06/2025" },
      ],
      showModal: false,
      isLoading: false,
      fullPage: true,
      canCancel: false,
      useSlot: false,
      loader: "spinner",
      color: "#007bff",
      bgColor: "#ffffff",
      height: 128,
      width: 128,
      timeout: 3000, //ms
      fetchingStats: true,
      earningStatus: true,
    };
  },
  mounted() {
    setTimeout(() => {
      this.showModal = true;
    }, 1500);
  },
}
</script>
