<template>
    <div class="container-fluid mt-4">
        <div class="card p-4 shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">{{ TableLabel }}</h5>
                <div>
                    <button class="btn btn-warning btn-sm me-2" style="width: 100px;"
                        @click="$emit('recover-data')">Pulih
                        Data</button>
                    <button class="btn btn-success btn-sm" style="width: 100px;"
                        @click="$emit('add-row')">Tambah</button>
                </div>
            </div>

            <!-- Always show table -->
            <table ref="editableDataTable" class="table">
                <thead>
                    <tr style="background-color: gray;">
                        <th v-for="(header, index) in computedHeaders" :key="index"
                            :style="{ width: header.width + '%' }" :class="getAlignClass(header.align)">
                            {{ header.name }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Render empty message if no data -->
                    <tr v-if="!localData.length">
                        <td :colspan="computedHeaders.length" class="text-center text-muted">
                            Tiada data untuk dipaparkan
                        </td>
                    </tr>

                    <!-- Render rows -->
                    <tr v-for="(row, rowIndex) in localData" :key="rowIndex">
                        <template v-for="(field, colIndex) in normalizeFields(row.fields)" :key="colIndex">
                            <td v-if="!isMergedCell(rowIndex, colIndex)" :rowspan="getRowSpan(rowIndex, colIndex)"
                                :colspan="field.colspan || 1"
                                :class="[getAlignClass(computedHeaders[colIndex]?.align), field.bold ? 'fw-bold' : '']">

                                <template v-if="computedHeaders[colIndex]?.gambar && editIndex !== rowIndex">
                                    <img :src="field.value" alt="Gambar" class="img-thumbnail"
                                        style="width: 65px; height: 40px;" />
                                </template>

                                <template v-else-if="field.type === 'color' && editIndex !== rowIndex">
                                    <input type="color" v-model="field.value"
                                        class="form-control form-control-color w-100" disabled />
                                </template>

                                <span v-else-if="editIndex !== rowIndex">{{ field.value }}</span>
                                <template v-else>
                                    <template v-if="computedHeaders[colIndex]?.editable === false">
                                        {{ field.value }}
                                    </template>
                                    <template v-else>
                                        <template v-if="computedHeaders[colIndex]?.gambar">
                                            <div class="image-edit-wrapper d-flex align-items-center">
                                                <img :src="field.value" alt="Gambar" class="img-thumbnail"
                                                    style="width: 65px; height: 40px; cursor: pointer;"
                                                    @click="triggerFileInput(rowIndex, colIndex)" />
                                                <input type="file" accept="image/*"
                                                    @change="onImageChange(rowIndex, colIndex, $event)"
                                                    style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;"
                                                    :id="`image-edit-${rowIndex}-${colIndex}`" />
                                            </div>
                                        </template>
                                        <!-- ✅ Color Picker -->
                                        <template v-else-if="field.type === 'color' && editIndex === rowIndex">
                                            <input type="color" v-model="field.value"
                                                class="form-control form-control-color w-100"
                                                @input="onFieldChange(rowIndex, colIndex, field.value)" />
                                        </template>
                                        <template v-else-if="field.type === 'select' && field.options">
                                            <select v-model="field.value" class="form-control"
                                                @change="onFieldChange(rowIndex, colIndex, field.value)">
                                                <option v-for="option in field.options" :key="option.value"
                                                    :value="option.value">
                                                    {{ option.label }}
                                                </option>
                                            </select>
                                        </template>
                                        <template v-else-if="computedHeaders[colIndex]?.editable === 'split'">
                                            <div class="input-group split-edit-group">
                                                <span class="input-group-text">{{ getLetterPart(field.value) }}</span>
                                                <input type="number" class="form-control"
                                                    :value="getNumberPart(field.value)"
                                                    @input="updateSplitValue(rowIndex, colIndex, $event.target.value)" />
                                            </div>
                                        </template>
                                        <template v-else>
                                            <input v-model="field.value" class="form-control"
                                                :type="isNumber(field.value) ? 'number' : 'text'" />
                                        </template>

                                    </template>
                                </template>
                            </td>
                        </template>
                        <td class="text-center">
                            <button v-if="editIndex === rowIndex" class="btn btn-lg me-1" @click="saveEdit(rowIndex)">
                                <i class="bx bxs-save"></i>
                            </button>
                            <button v-else class="btn btn-lg text-warning" @click="startEdit(rowIndex)">
                                <i class="mdi mdi-pencil"></i>
                            </button>
                            <button class="btn btn-lg text-danger" @click="handleDelete(rowIndex)">
                                <i class="mdi mdi-delete"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
import 'datatables.net-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
// import { integer } from '@vuelidate/validators/index.js';

export default {
    name: 'EditableTable',
    props: {
        TableLabel: String,
        headers: Array,
        data: Array,
        fields: Array,
        mergeConfig: {
            type: Object,
            default: () => ({
                rowSpan: {},
                colSpan: {}
            })
        }
    },
    data() {
        return {
            localData: [],
            editIndex: null,
            editCache: {},
            originalRow: null
        };
    },
    watch: {
        data: {
            handler(newData) {
                const $table = $(this.$refs.editableDataTable);
                let currentPage = 0; // Default to first page

                if ($.fn.DataTable.isDataTable($table)) {
                    const dt = $table.DataTable();
                    const pageInfo = dt.page.info();
                    currentPage = pageInfo.page;
                    dt.destroy();
                }

                this.localData = JSON.parse(JSON.stringify(newData));

                this.$nextTick(() => {
                    if (this.localData.length) {
                        this.initDataTable({ startingPage: currentPage });
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    computed: {
        computedHeaders() {
            return [...this.headers, { name: 'Kemaskini', align: 'center', width: 20 }];
        }
    },
    mounted() {
        if (this.localData.length) {
            this.$nextTick(() => {
                this.initDataTable();
            });
        }
    },
    methods: {
        normalizeFields(fields) {
            const normalized = [];
            let totalSpan = 0;
            for (const field of fields) {
                const colspan = field.colspan || 1;
                totalSpan += colspan;
                normalized.push(field);
            }
            const requiredCols = this.computedHeaders.length - 1;
            while (totalSpan < requiredCols) {
                normalized.push({ value: '', colspan: 1 });
                totalSpan++;
            }
            return normalized;
        },
        handleDelete(rowIndex) {
            const row = this.localData[rowIndex];
            const rowField = row.fields[0].value;

            let id = 0;
            if (Number.isInteger(rowField)) {
                id = rowField
            }

            if (!Number.isInteger(rowField)) {
                id = row.id;
            }

            // Destroy DataTable before removing row
            const $table = $(this.$refs.editableDataTable);
            if ($.fn.DataTable.isDataTable($table)) {
                $table.DataTable().destroy();
            }

            this.$emit("delete-row", { id, index: rowIndex });
        },
        startEdit(index) {
            this.editIndex = index;
            this.originalRow = JSON.parse(JSON.stringify(this.localData[index]));

            const $table = $(this.$refs.editableDataTable);
            if ($.fn.DataTable.isDataTable($table)) {
                const dt = $table.DataTable();
                const pageInfo = dt.page.info();
                const currentPage = pageInfo.page;

                dt.destroy();

                this.$nextTick(() => {
                    this.initDataTable({ startingPage: currentPage });
                });
            }
        },

        saveEdit(index) {
            this.editIndex = null;

            this.$emit('row-updated', {
                index,
                row: this.localData[index],
                originalRow: this.originalRow
            });

            this.$emit('update:data', this.localData);
        },
        getAlignClass(align) {
            if (align === 'center') return 'text-center';
            if (align === 'right') return 'text-end';
            return 'text-start';
        },
        isNumber(value) {
            return typeof value === 'number';
        },
        getRowSpan(rowIndex, colIndex) {
            return this.mergeConfig.rowSpan?.[rowIndex]?.includes(colIndex) ? 2 : 1;
        },
        isMergedCell(rowIndex, colIndex) {
            for (const [rIndex, indexes] of Object.entries(this.mergeConfig.rowSpan || {})) {
                if (parseInt(rIndex) < rowIndex && indexes.includes(colIndex)) return true;
            }
            return false;
        },
        initDataTable(options = {}) {
            const $table = $(this.$refs.editableDataTable);

            // ⛔ Prevent initializing on empty table or if ref is not available
            if (!$table || $table.length === 0 || !this.localData.length) return;

            const pageLength = 5; // Default page length

            $table.DataTable({
                destroy: true,
                columns: this.computedHeaders.map((_, index) => ({
                    data: index,
                    defaultContent: ''
                })),
                lengthChange: true,
                searching: true,
                lengthMenu: [5, 10, 25, 50, 100],
                pageLength: pageLength,
                displayStart: (options.startingPage || 0) * pageLength,
                ordering: false,
                autoWidth: false,
                responsive: false,
                language: {
                    lengthMenu: 'Papar _MENU_ rekod setiap halaman',
                    search: 'Carian:'
                }
            });
        },
        onKekanananChange(currentIndex, newValue) {
            const newVal = parseInt(newValue);
            this.$emit('kekananan-changed', {
                index: currentIndex,
                newValue: newVal
            });
        },
        onFieldChange(rowIndex, fieldIndex, newValue) {
            this.localData[rowIndex].fields[fieldIndex].value = newValue;

            if (this.computedHeaders[fieldIndex]?.name === 'Kekananan') {
                this.$emit('kekananan-changed', {
                    index: rowIndex,
                    newValue: parseInt(newValue),
                });
            }
        },
        getLetterPart(value) {
            const match = value.match(/^[A-Za-z]+/);
            return match ? match[0] : '';
        },
        getNumberPart(value) {
            const match = value.match(/\d+$/);
            return match ? match[0] : '';
        },
        updateSplitValue(rowIndex, colIndex, newNumber) {
            const letterPart = this.getLetterPart(this.localData[rowIndex].fields[colIndex].value);
            this.localData[rowIndex].fields[colIndex].value = letterPart + newNumber;
        },

        onImageChange(rowIndex, colIndex, event) {
            const file = event.target.files[0];
            if (!file) return;

            // Store the file object on the field for the parent component to use.
            this.localData[rowIndex].fields[colIndex].file = file;

            // Create a temporary URL for previewing the new image.
            this.localData[rowIndex].fields[colIndex].value = URL.createObjectURL(file);
        },

        triggerFileInput(rowIndex, colIndex) {
            const inputId = `image-edit-${rowIndex}-${colIndex}`;
            const fileInput = document.getElementById(inputId);
            if (fileInput) {
                fileInput.click();
            } else {
                console.error(`Could not find file input with id: ${inputId}`);
            }
        },


    }
};
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type=number] {
    -moz-appearance: textfield;
}

.split-edit-group {
    display: flex;
    flex-wrap: nowrap;
}

.split-edit-group .input-group-text {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

.split-edit-group .form-control {
    padding: 0.25rem;
    font-size: 0.875rem;
    width: 50px;
}

.container {
    max-width: 900px;
}

.table td,
.table th {
    white-space: wrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dataTables_filter input {
    width: 20px !important;
    /* change as needed */
    display: inline-block;
    height: 2px !important;
    /* optional: adjust height */
    padding: 4px 8px;
    /* optional: padding */
}
</style>
