<template>
    <div class="container-fluid">
        <div class="card p-4 shadow-sm">
            <h5 class="mb-4">{{ topicLabel }}</h5>
            <hr style="margin-top: -10px;" />

            <!-- Top row: Filter (left) + Papar & Carian (right) -->
            <div class="d-flex flex-column justify-content-between flex-wrap gap-2 mb-3">
                <!-- Left side: Filter -->
                <div class="d-flex align-items-center gap-2">
                    <div v-if="filterOptions.length" class="d-flex align-items-center gap-2">
                        <label class="fw-semibold mb-0">{{ filterLabel }}:</label>
                        <select :value="selectedFilter" @change="$emit('update:selectedFilter', $event.target.value)"
                            class="form-select form-select-sm w-auto">
                            <option value="All">Keseluruhan</option>
                            <option v-for="opt in filterOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- Right side: Papar + Carian -->
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <!-- Papar -->
                    <div v-if="menuLength" class="d-flex align-items-center gap-2">
                        <label class="fw-semibold mb-0">Papar</label>
                        <select v-model.number="localPerPage" class="form-select form-select-sm w-auto"
                            @change="emitPerPage">
                            <option v-for="n in [5, 10, 25, 50, 100]" :key="n" :value="n">{{ n }}</option>
                        </select>
                        <span class="fw-semibold mb-0">rekod</span>
                    </div>

                    <!-- Carian -->
                    <div v-if="carian" class="d-flex align-items-center gap-2">
                        <label class="fw-semibold mb-0">Carian:</label>
                        <input v-model="localSearch" @keyup.enter="emitSearch" type="text"
                            class="form-control form-control-sm" placeholder="Taip dan tekan Enter"
                            style="width: 150px;" />
                        <button class="btn btn-sm btn-primary btn-cari" @click="emitSearch">Cari</button>
                        <button class="btn btn-sm btn-outline-secondary btn-cari" @click="resetSearch">Reset</button>
                    </div>
                </div>
            </div>


            <!-- Table -->
            <div class="table-responsive">
                <table class="table table-sm align-middle">
                    <thead>
                        <tr>
                            <th v-for="(header, i) in headers" :key="i"
                                :class="['align-middle', 'text-' + (columnAlignments[i] || 'start')]"
                                :style="{ width: columnWidths[i] || 'auto' }">
                                {{ header }}
                            </th>
                        </tr>
                    </thead>

                    <tbody v-if="!loading && items.length">
                        <tr v-for="(item, rowIndex) in items" :key="rowIndex"
                            :class="{ 'fw-bold bg-light': item.isParent }">
                            <td v-for="(field, colIndex) in fields" :key="colIndex"
                                :class="['align-middle', 'text-' + (columnAlignments[colIndex] || 'start')]"
                                :style="{ width: columnWidths[colIndex] || 'auto' }">
                                <!-- Checkbox columns -->
                                <template v-if="checkBox.includes(field)">
                                    <input style="margin-top:5px" type="checkbox"
                                        :checked="item[field] === true"
                                        @change="onCheckboxChange(rowIndex, field, $event.target.checked)" />
                                </template>

                                <!-- Normal fields -->
                                <template v-else-if="field === 'index'">
                                    {{ (page - 1) * perPage + rowIndex + 1 }}
                                </template>

                                <template v-else-if="field === 'tab'">
                                    <span :style="{ paddingLeft: (item.level * 25) + 'px' }">{{ item.tab }}</span>
                                </template>

                                <template v-else>
                                    {{ item[field] || '-' }}
                                </template>
                            </td>
                        </tr>
                    </tbody>

                    <tbody v-else-if="loading">
                        <tr>
                            <td :colspan="headers.length" class="text-center text-muted py-4">
                                Loading data...
                            </td>
                        </tr>
                    </tbody>

                    <tbody v-else>
                        <tr>
                            <td :colspan="headers.length" class="text-center text-muted py-4">
                                Tiada data untuk dipaparkan
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Bottom info + pagination -->
            <div v-if="pagination" class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
                <div class="text-muted small">
                    <template v-if="total > 0">
                        Memaparkan
                        <strong>{{ from }}</strong> – <strong>{{ to }}</strong>
                        daripada <strong>{{ total }}</strong> rekod
                    </template>
                </div>

                <ul class="pagination pagination-sm mb-0">
                    <li :class="['page-item', { disabled: page === 1 }]" @click="goTo(page - 1)">
                        <a class="page-link" href="javascript:void(0)">‹</a>
                    </li>

                    <li v-for="p in pages" :key="p" :class="['page-item', { active: p === page, disabled: p === '…' }]"
                        @click="p !== '…' && goTo(p)">
                        <a class="page-link" href="javascript:void(0)">{{ p }}</a>
                    </li>

                    <li :class="['page-item', { disabled: page === lastPage }]" @click="goTo(page + 1)">
                        <a class="page-link" href="javascript:void(0)">›</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "CheckBoxTable",
    props: {
        headers: Array,
        fields: Array,
        items: { type: Array, default: () => [] },
        topicLabel: { type: String, default: "Senarai" },

        // Checkbox-enabled columns
        checkBox: { type: Array, default: () => [] },

        // Pagination
        total: { type: Number, default: 0 },
        page: { type: Number, default: 1 },
        perPage: { type: Number, default: 5 },
        pagination: { type: Boolean, default: true },
        loading: { type: Boolean, default: false },

        // Top row options
        carian: { type: Boolean, default: true },
        menuLength: { type: Boolean, default: true },
        filterOptions: { type: Array, default: () => [] },
        filterLabel: { type: String, default: "Filter" },
        selectedFilter: { type: String, default: "All" },

        columnAlignments: { type: Array, default: () => [] },
        columnWidths: { type: Array, default: () => [] }
    },
    emits: ["checkbox-change", "change-page", "update:perPage", "search", "update:selectedFilter"],
    data() {
        return {
            localPerPage: this.perPage,
            localSearch: ""
        };
    },
    computed: {
        lastPage() {
            return Math.max(1, Math.ceil(this.total / this.perPage));
        },
        from() {
            if (!this.total) return 0;
            return (this.page - 1) * this.perPage + 1;
        },
        to() {
            return Math.min(this.total, this.page * this.perPage);
        },
        pages() {
            const total = this.lastPage;
            const current = this.page;
            const delta = 2;
            const pages = [];
            for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
                pages.push(i);
            }
            if (pages[0] > 1) {
                if (pages[0] > 2) pages.unshift("…");
                pages.unshift(1);
            }
            if (pages[pages.length - 1] < total) {
                if (pages[pages.length - 1] < total - 1) pages.push("…");
                pages.push(total);
            }
            return pages;
        }
    },
    methods: {
        goTo(p) {
            if (p < 1 || p > this.lastPage || p === this.page) return;
            this.$emit("change-page", p);
        },
        onCheckboxChange(rowIndex, field, checked) {
            this.$emit("checkbox-change", { rowIndex, field, checked });
        },
        emitPerPage() {
            this.$emit("update:perPage", this.localPerPage);
        },
        emitSearch() {
            this.$emit("search", this.localSearch);
        },
        resetSearch() {
            this.localSearch = "";
            this.$emit("search", "");
        }
    },
    watch: {
        perPage(newVal) {
            this.localPerPage = newVal;
        }
    }
};
</script>

<style scoped>
/* .table {
    min-height: 130px;
} */

.btn-cari {
    width: 60px;
}
</style>
