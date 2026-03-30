<template>
  <Layout>
    <PageHeader title="Log Audit" pageTitle="Pentadbir" />
    <DataTable
      :headers="headers"
      :fields="fields"
      :items="auditLogs"
      topicLabel="Senarai Log Audit"
      :serverSide="true"
      :total="totalRows"
      :page="currentPage"
      :perPage="perPage"
      :loading="loading"
      @change-page="handlePageChange"
      @change-per-page="handlePerPageChange"
      @search="handleSearch"
    >
      <!-- Custom slots if needed -->
      <template v-slot:actions="{ item }">
        <button class="btn btn-sm btn-info" @click="viewDetails(item)">
          <i class="mdi mdi-eye"></i>
        </button>
      </template>
    </DataTable>

    <!-- Details Modal -->
    <BModal v-model="showDetailsModal" title="Butiran Log Audit" hide-footer size="lg" centered>
      <div v-if="selectedLog">
        <table class="table table-bordered">
          <tr>
            <th width="30%">Pengguna</th>
            <td>{{ selectedLog.user?.nama || 'Sistem/Tetamu' }}</td>
          </tr>
          <tr>
            <th>Peristiwa</th>
            <td>{{ selectedLog.peristiwa }}</td>
          </tr>
          <tr>
            <th>URL</th>
            <td>{{ selectedLog.url }}</td>
          </tr>
          <tr>
            <th>Tarikh & Masa</th>
            <td>{{ selectedLog.tarikh }} ({{ selectedLog.masa_lalu }})</td>
          </tr>
          <tr v-if="selectedLog.maklumat_lama">
            <th>Maklumat Lama</th>
            <td>
              <pre class="bg-light p-2">{{ formatJSON(selectedLog.maklumat_lama) }}</pre>
            </td>
          </tr>
          <tr v-if="selectedLog.maklumat_baru">
            <th>Maklumat Baru</th>
            <td>
              <pre class="bg-light p-2">{{ formatJSON(selectedLog.maklumat_baru) }}</pre>
            </td>
          </tr>
        </table>
      </div>
      <div class="text-end">
        <button class="btn btn-secondary" @click="showDetailsModal = false">Tutup</button>
      </div>
    </BModal>
  </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import DataTable from "@/components/DataTable.vue";
import { auditService } from "@/services/audit.service";

export default {
  components: {
    Layout,
    PageHeader,
    DataTable,
  },
  data() {
    return {
      headers: ["Bil", "Pengguna", "Peristiwa", "Tarikh", "Tindakan"],
      fields: ["index", "userName", "peristiwa", "tarikh", "actions"],
      auditLogs: [],
      totalRows: 0,
      currentPage: 1,
      perPage: 10,
      search: "",
      loading: false,
      showDetailsModal: false,
      selectedLog: null,
    };
  },
  methods: {
    async fetchAuditLogs() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          per_page: this.perPage,
          search: this.search,
        };
        const response = await auditService.getAllLogs(params);
        
        // Transform data for table display
        this.auditLogs = response.data.map((log, i) => ({
          ...log,
          index: (this.currentPage - 1) * this.perPage + i + 1,
          userName: log.user?.nama || 'Sistem/Tetamu'
        }));
        
        this.totalRows = response.meta?.total || response.total || 0;
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchAuditLogs();
    },
    handlePerPageChange(perPage) {
      this.perPage = perPage;
      this.currentPage = 1;
      this.fetchAuditLogs();
    },
    handleSearch(search) {
      this.search = search;
      this.currentPage = 1;
      this.fetchAuditLogs();
    },
    viewDetails(log) {
      this.selectedLog = log;
      this.showDetailsModal = true;
    },
    formatJSON(data) {
      if (!data) return '';
      try {
        return JSON.stringify(data, null, 2);
      } catch (e) {
        return data;
      }
    }
  },
  mounted() {
    this.fetchAuditLogs();
  },
};
</script>

<style scoped>
pre {
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
