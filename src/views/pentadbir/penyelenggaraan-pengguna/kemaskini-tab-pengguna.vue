<template>
  <Layout>
    <PageHeader title="Kemaskini Tab Pengguna" pageTitle="Pentadbir" />
    <CheckBoxTable
      topicLabel="Senarai Akses"
      :headers="headers"
      :fields="fields"
      :items="filteredData"
      :checkBox="checkBox"
      :columnAlignments="columnAlignments"
      :columnWidths="columnWidths"
      :total="totalFiltered"
      :page="page"
      :perPage="perPage"
      @update:perPage="setPerPage"
      @checkbox-change="handleCheckboxChange"
      @change-page="handlePageChange"
      @search="handleSearch"
    />
  </Layout>
</template>

<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import CheckBoxTable from "@/components/penyelenggaraan/CheckBoxTable.vue";
import { menuItems } from "@/components/menu";
import { penggunaService } from "@/services/auth.service";

export default {
  name: "Kemaskini Tab Pengguna",
  components: { Layout, PageHeader, CheckBoxTable },
  data() {
    return {
      headers: ["No", "Tab", "Admin", "Pengguna", "Pentadbir Sistem"],
      fields: ["index", "tab", "admin", "pengguna", "pentadbirSistem"],
      columnAlignments: ["center", "start", "center", "center", "center"],
      columnWidths: ["5%", "59%", "12%", "12%", "12%"],
      checkBox: ["admin", "pengguna", "pentadbirSistem"],
      page: 1,
      perPage: 10,
      searchQuery: "",
      tableData: [],
      roleMap: {
        admin: "admin",
        pengguna: "pengguna",
        pentadbirSistem: "pentadbir sistem", // DB enum
      },
    };
  },
  created() {
    const getAllTabs = (items = menuItems) => {
      const result = [];
      const traverse = (nodes, level = 0, parentId = null) => {
        nodes.forEach((node) => {
          if (!node.isTitle && !node.roles) {
            result.push({
              id: node.id,
              tab: this.$t ? this.$t(node.label) : node.label,
              link: node.link || null,
              level,
              parentId,
              isParent: level === 0,
              admin: false,
              pengguna: false,
              pentadbirSistem: false,
            });
          }
          if (node.subItems) traverse(node.subItems, level + 1, node.id);
        });
      };
      traverse(items);
      return result;
    };

    this.tableData = getAllTabs();
    this.loadKebenaran();
  },
  computed: {
    filteredData() {
      const data = this.tableData.filter((item) =>
        (item.tab || "").toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      const start = (this.page - 1) * this.perPage;
      return data.slice(start, start + this.perPage);
    },
    totalFiltered() {
      return this.tableData.filter((item) =>
        (item.tab || "").toLowerCase().includes(this.searchQuery.toLowerCase())
      ).length;
    },
  },
  methods: {
    async handleCheckboxChange({ rowIndex, field, checked }) {
      const absoluteIndex = (this.page - 1) * this.perPage + rowIndex;
      const item = this.tableData[absoluteIndex];
      item[field] = checked;

      // Update children
      const updateChildren = (parentId) => {
        this.tableData.forEach((child) => {
          if (child.parentId === parentId) {
            child[field] = checked;
            updateChildren(child.id);
          }
        });
      };
      updateChildren(item.id);

      // Update parents
      const updateParents = (child) => {
        if (!child.parentId) return;
        const siblings = this.tableData.filter((i) => i.parentId === child.parentId);
        const parent = this.tableData.find((i) => i.id === child.parentId);
        if (!parent) return;

        this.checkBox.forEach((role) => {
          parent[role] = siblings.some((s) => s[role]);
        });

        updateParents(parent);
      };
      updateParents(item);

      await this.handleSave();
    },
    setPerPage(rows) {
      this.perPage = rows;
      this.page = 1;
      this.loadKebenaran();
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.loadKebenaran();
    },
    handleSearch(query) {
      this.searchQuery = query;
      this.page = 1;
      this.loadKebenaran();
    },
    async handleSave() {
      const payload = this.tableData.flatMap((item) =>
        this.checkBox.map((role) => ({
          id: item.id,
          peranan: this.roleMap[role], // DB enum
          kebenaran: !!item[role],
        }))
      );

      try {
        await penggunaService.simpanKebenaran(payload);
      } catch (err) {
        console.error(err);
      }
    },
    async loadKebenaran() {
      try {
        const tabIds = this.tableData.map((i) => i.id);
        const permissions = await penggunaService.kebenaran(tabIds);

        this.tableData = this.tableData.map((item) => {
          const tabPerms = permissions.filter((p) => p.tab_id === item.id);
          return {
            ...item,
            admin: tabPerms.some((p) => p.peranan === "admin" && p.kebenaran),
            pengguna: tabPerms.some((p) => p.peranan === "pengguna" && p.kebenaran),
            pentadbirSistem: tabPerms.some(
              (p) => p.peranan === "pentadbir sistem" && p.kebenaran
            ),
          };
        });

        const updateParents = (child) => {
          if (!child.parentId) return;
          const siblings = this.tableData.filter((i) => i.parentId === child.parentId);
          const parent = this.tableData.find((i) => i.id === child.parentId);
          if (!parent) return;

          this.checkBox.forEach((role) => {
            parent[role] = siblings.some((s) => s[role]);
          });

          updateParents(parent);
        };

        this.tableData.forEach((i) => {
          if (!i.isParent) updateParents(i);
        });
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
