<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Laporan Carian</h4>
        </div>
        <div ref="reportContent">
            <p v-if="kumpulanJawatan">Kumpulan Jawatan: {{ kumpulanJawatan }}</p>
            <p>Tarikh Mula: {{ formatDisplayDate(tarikhMula) }} - Tarikh Akhir: {{ formatDisplayDate(tarikhAkhir) }}</p>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th style="width: 5%; text-align: center;">Bil</th>
                        <th style="width: 10%; text-align: center;">Gambar</th>
                        <th @click="sortBy('nama')" :class="['sortable', { 'active': sortKey === 'nama' }]">
                            Nama <span class="sort-arrow" v-if="sortKey === 'nama'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th @click="sortBy('jawatan')" :class="['sortable', { 'active': sortKey === 'jawatan' }]" style="text-align: center;">
                            Jawatan <span class="sort-arrow" v-if="sortKey === 'jawatan'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th @click="sortBy('tarikh_lantik')" :class="['sortable', { 'active': sortKey === 'tarikh_lantik' }]" style="text-align: center;">
                            Tarikh Pelantikan <span class="sort-arrow" v-if="sortKey === 'tarikh_lantik'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th @click="sortBy('tarikh_tamat')" :class="['sortable', { 'active': sortKey === 'tarikh_tamat' }]" style="text-align: center;">
                            Tarikh Tamat Jawatan <span class="sort-arrow" v-if="sortKey === 'tarikh_tamat'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in sortedItems" :key="index">
                        <td style="text-align: center;">{{ index + 1 }}</td>
                        <td style="text-align: center;"><img :src="item.gambar" alt="Gambar" width="50" /></td>
                        <td>{{ item.nama }}</td>
                        <td style="text-align: center;" v-html="item.jawatan"></td>
                        <td style="text-align: center;">{{ item.tarikh_lantik }}</td>
                        <td style="text-align: center;">{{ item.tarikh_tamat }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
}

.sortable:hover {
    background-color: #f5f5f5;
}

.sortable.active {
    background-color: #e9ecef;
}

.sort-arrow {
    margin-left: 5px;
    font-size: 0.8em;
}
</style>

<script>
export default {
    name: "LaporanCarian",
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        tarikhMula: {
            type: String,
            default: null,
        },
        tarikhAkhir: {
            type: String,
            default: null,
        },
        kumpulanJawatan: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            sortKey: '',
            sortOrder: 'asc',
        };
    },
    computed: {
        sortedItems() {
            if (!this.sortKey) {
                return this.items;
            }

            const parseDate = (dateString) => {
                if (!dateString || typeof dateString !== 'string') return null;
                const parts = dateString.split('/');
                if (parts.length !== 3) return null;
                // new Date(year, monthIndex, day)
                return new Date(parts[2], parts[1] - 1, parts[0]);
            };

            const isDateColumn = this.sortKey === 'tarikh_lantik' || this.sortKey === 'tarikh_tamat';

            return [...this.items].sort((a, b) => {
                let aValue = a[this.sortKey];
                let bValue = b[this.sortKey];

                if (isDateColumn) {
                    aValue = parseDate(aValue);
                    bValue = parseDate(bValue);
                }

                if (aValue < bValue) {
                    return this.sortOrder === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return this.sortOrder === 'asc' ? 1 : -1;
                }
                return 0;
            });
        },
    },
    methods: {
        sortBy(key) {
            if (this.sortKey === key) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = key;
                this.sortOrder = 'asc';
            }
        },
        formatDisplayDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('ms-MY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        },
        printReport() {
            const printContents = this.$refs.reportContent.innerHTML;
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow.document;
            const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map(el => el.outerHTML)
                .join('');

            doc.open();
            doc.write(`
                <html>
                <head>
                    <title>Print</title>
                    ${styles}
                </head>
                <body>
                    ${printContents}
                </body>
                </html>
            `);
            doc.close();

            setTimeout(() => {
                iframe.contentWindow.print();
                document.body.removeChild(iframe);
            }, 500); // 500ms delay to ensure content is loaded
        },
    },
};
</script>
