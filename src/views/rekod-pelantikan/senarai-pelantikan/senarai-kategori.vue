<template>
    <Layout>
        <PageHeader title="Senarai Pelantikan" pageTitle="Rekod Pelantikan" />

        <DataTable :headers="headers" :fields="fields" :items="tableData" :columnAlignments="columnAlignments"
            :topicLabel="topicLabel" :filterShow="false" :buttonTambah="false" :fieldTextTransform="fieldTextTransform"
            :pageLength="pageLength" :searching="searching" :paging="paging" :columnWidths="columnWidths"
            :carian="false" :menuLength="false" :pagination="false" :loading="loading">
            <template #actions="{ item }">
                <button v-if="item.exists" class="icon-btn btn-sm text-primary" @click="goToList(item)" title="Papar">
                    <i class="mdi mdi-eye"></i>
                </button>
                <span v-else class="text-muted icon-btn">-</span>
            </template>
        </DataTable>
    </Layout>
</template>


<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DataTable from "@/components/DataTable.vue";
import { lookupService } from "@/services/lookup.service";
import { templateSenaraiService } from "@/services/templateSenarai.service.js";
// import { Pagination } from "vue3-carousel";
// import CarianForm from "@/components/CarianForm.vue";

export default {
    components: {
        Layout,
        PageHeader,
        DataTable,
        // CarianForm,
    },
    data() {
        return {
            loading: false,
            topicLabel: "Kategori Pelantikan",
            pageLength: 20,
            searching: false,
            paging: false,
            headers: ["No.", "Kategori", "Tindakan"],
            fields: ["index", "jenisPelantikan", "actions"],
            fieldTextTransform: { parti: "uppercase" },
            columnAlignments: ["center", "left", "center"],
            columnWidths: ["5%", "85%", "10%"],
            // rawData is now initialized as empty and will be populated from the API.
            rawData: [],
        };
    },
    async mounted() {
        // Load data from API when the component is mounted.
        await this.loadFromApi();
    },
    methods: {
        async loadFromApi() {
            this.loading = true;
            try {
                // 1. Fetch categories, appointment types, and templates in parallel.
                const [kategoriList, jenisPelantikanList, templateList] = await Promise.all([
                    lookupService.getSenaraiKategoriPelantikan(),
                    lookupService.getSenaraiPelantikan(),
                    templateSenaraiService.getTemplates()
                ]);

                // 2. Build quick lookup for template names
                const templateNames = new Set(templateList.map(t => t.name));

                // 3. Map categories for easy lookup
                const kategoriMap = new Map(kategoriList.map(k => [k.id, k.nama.toUpperCase()]));

                // 4. Group appointment types by category
                const grouped = jenisPelantikanList.reduce((acc, item) => {
                    // if(Number(item.id) === 1) return false;
                    const groupName = kategoriMap.get(item.id_lkp_kategori_pelantikan) || null;

                    if (!groupName) return acc;

                    if (!acc[groupName]) {
                        acc[groupName] = [];
                    }


                    acc[groupName].push({
                        jenisPelantikan: item.nama,
                        exists: item.id === 1 ? true : templateNames.has(item.nama) // ✅ Mark as existing if template name matches
                    });
                    // console.log(item.nama);


                    return acc;
                }, {});

                // 5. Construct final array with group headers
                const newRawData = [];
                for (const groupName in grouped) {
                    newRawData.push({ groupby: { label: groupName } });
                    newRawData.push(...grouped[groupName]);
                }

                this.rawData = newRawData;
            } catch (error) {
                console.error("Error loading or processing API data:", error);
            } finally {
                this.loading = false;
            }
        },

        goToList(item) {
            const routes = {
                "Ahli Dewan Negara": { path: "/rekod-pelantikan/senarai-pelantikan/kategori/ahli-dewan-negara" },
                "Hakim Mahkamah Rayuan": {
                    path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman",
                    query: { senarai: "hakim-mahkamah-rayuan" }
                },
                "Hakim Mahkamah Tinggi": {
                    path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman",
                    query: { senarai: "hakim-mahkamah-tinggi" }
                },
                "Hakim Mahkamah Persekutuan": {
                    path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman",
                    query: { senarai: "hakim-mahkamah-persekutuan" }
                },
                // "Keanggotaan Suruhanjaya Perkhidmatan Awam": {
                //     path: "/rekod-pelantikan/senarai-pelantikan/kategori/suruhanjaya",
                //     query: { senarai: "keanggotaan-suruhanjaya-perkhidmatan-awam" }
                // },
                // "Suruhanjaya Pilihan Raya": {
                //     path: "/rekod-pelantikan/senarai-pelantikan/kategori/suruhanjaya",
                //     query: { senarai: "suruhanjaya-pilihan-raya" }
                // },
                // "Keanggotaan Suruhanjaya Perkhidmatan Kehakiman Dan Perundangan": {
                //     path: "/rekod-pelantikan/senarai-pelantikan/kategori/suruhanjaya",
                //     query: { senarai: "keanggotaan-suruhanjaya-perkhidmatan-kehakiman-dan-perundangan" }
                // },
                // "Keanggotaan Lembaga Penasihat, Jabatan Perdana Menteri": {
                //     path: "/rekod-pelantikan/senarai-pelantikan/kategori/lembaga-penasihat",
                //     query: { senarai: "keanggotaan-lembaga-penasihat,-jabatan-perdana-menteri" }
                // },
                // "Lembaga Pengampunan Bagi Wilayah Persekutuan Kuala Lumpur, Labuan Dan Putrajaya": {
                //     path: "/rekod-pelantikan/senarai-pelantikan/kategori/lembaga-pengampunan",
                //     query: { senarai: "lembaga-pengampunan-bagi-wilayah-persekutuan-kuala-lumpur,-labuan-dan-putrajaya" }

                // },
                // "Tuan Yang Terutama Yang Di-Pertua Negeri": {
                //     path: "/rekod-pelantikan/senarai-pelantikan/kategori/tuan-yang-terutama",
                //     query: { senarai: "tuan-yang-terutama-yang-di%pertua-negeri" }
                // },
                // "Keanggotaan Lembaga Penasihat, Pusat Pencegahan Jenayah Kewangan Nasional (NFCC)": {
                //     path: "/rekod-pelantikan/senarai-pelantikan/kategori/nfcc",
                //     query: { senarai: "keanggotaan-lembaga-penasihat,-pusat-pencegahan-jenayah-kewangan-nasional-(NFCC)" }
                // },


            };

            const route = routes[item.jenisPelantikan];

            if (route) {
                this.$router.push(route);
            } else {
                this.$router.push({ path: "/rekod-pelantikan/senarai-pelantikan/kategori/papar", query: { pelantikan: item.jenisPelantikan } });
            }
        },
        handleDelete(item) {
            alert("Delete " + item.nama);
        },
        goToResume(item, mode) {
            const query = mode === 'view' ? { view: 'readonly' } : '';
            this.$router.push({ path: '/pelantikan/maklumat-resume', query });
        },
    },
    computed: {
        // tableData is now a computed property.
        // It will automatically update whenever rawData changes.
        tableData() {
            const sortedData = [...this.rawData];

            // Find the index of the "LAIN-LAIN PELANTIKAN" group header.
            const lainLainGroupIndex = sortedData.findIndex(
                item => item.groupby && item.groupby.label === "LAIN-LAIN PELANTIKAN"
            );

            if (lainLainGroupIndex !== -1) {
                // Find the end of the group's items.
                let endIndex = lainLainGroupIndex + 1;
                while (endIndex < sortedData.length && !sortedData[endIndex].groupby) {
                    endIndex++;
                }

                // Remove the group and its items from the array.
                const lainLainGroup = sortedData.splice(lainLainGroupIndex, endIndex - lainLainGroupIndex);

                // Add the group and its items to the end of the array.
                sortedData.push(...lainLainGroup);
            }

            let counter = 1;
            // Process the sorted data to add index numbers for display.
            const indexedData = sortedData.map(item => {
                if (item.jenisPelantikan) {
                    return { ...item, index: counter++ };
                }
                return item; // leave group headers as-is
            });
            return indexedData;
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

/* Ensure all rows in DataTable have the same height */
/* :deep(.table tbody tr) {
    height: 10px;
    vertical-align: middle;
    padding-top: -200px !important;
    padding-bottom: 400px !important;
} */
</style>