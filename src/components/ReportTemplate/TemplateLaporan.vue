<template>
    <div class="container" ref="pdfContent" :style="{ marginBottom: title ? '-40px' : '0' }">
        <!-- <button @click="$emit('export')" class="export-btn">Export to PDF</button> -->


        <h1 v-if="title" class="title" v-html="title"></h1>
        <hr v-if="title" class="divider" />

        <h2 v-if="subTitle" class="sub-title" v-html="subTitle"></h2>
        <p class="note text-center" v-if="note">{{ note }}</p>

        <table v-if="Array.isArray(headers)" class="member-list" id="table-to-export"
            :style="{ marginTop: (title) ? '0px' : '20px' }">
            <thead>
                <tr>
                    <th v-for="(header, i) in headers" :key="i" :class="header.align" :style="{
                        fontWeight: header.bold ? 'bold' : 'normal',
                        width: columnWidths?.[i] || 'auto'
                    }">
                        {{ header.label }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in rows" :key="rowIndex"
                    :style="{ backgroundColor: row.highlight === false || !row.nama ? '#f8d7da' : '' }">
                    <td v-for="(field, colIndex) in fields" :key="colIndex" :class="field.align" :style="{
                        fontWeight: field.bold ? 'bold' : 'normal',
                        width: columnWidths?.[colIndex] || 'auto'
                    }">
                        <span v-html="resolveField(row, field.key, rowIndex)"></span>
                        <!-- <span style="font-size: 9px; color: blue; margin-left: 5px;">[ID:{{ row.id }}]</span> -->
                        <div v-if="enableCatatan && field.key === 'nama' && row.id">
                            <input v-if="isEditing" type="text" class="form-control form-control-sm mt-1" placeholder="Catatan..." :value="catatanData[row.id]" @input="updateCatatan(row.id, $event.target.value)">
                            <div v-else-if="catatanData[row.id]" v-html="catatanData[row.id]" class="text-muted mt-1">
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

    </div>
</template>

<script>
export default {
    props: {
        title: String,
        subTitle: String,
        note: String,
        headers: Array, // [{ label: 'Name', align: 'text-left', bold: true }]
        fields: Array, // [{ key: 'name', align: 'text-left', bold: true }]
        rows: Array,
        wakil: Array,
        notaContent: String,
        isEditing: Boolean,
        columnWidths: Array,
        enableCatatan: { type: Boolean, default: false },
        catatanData: { type: Object, default: () => ({}) },
        tableId: { type: String, default: '' }
    },
    computed: {
        hasHeaderContent() {
            return this.title || this.subTitle || this.note
        }
    },
    emits: ['export', 'start-editing', 'save', 'update-catatan'],
    methods: {
        catatanKey(rowIndex) {
            return `${this.tableId}-${rowIndex}`;
        },
        updateCatatan(rowId, value) {
            this.$emit('update-catatan', { rowId, value });
        },
        resolveField(row, key) {
            const value = row[key]

            if (Array.isArray(value)) return value.join('<br/>')

            if (!value && key === 'nama') return '<b><i class="text-muted">KOSONG</i></b>'

            if (key === 'wakil') {
                const parti = Array.isArray(row.parti)
                    ? row.parti.join('<br/>')
                    : (row.parti ? row.parti : '')

                // Use row.wakil instead of props.wakil[index]
                const wakilValue = row.wakil || ''
                return [parti, wakilValue].filter(Boolean).join('<br/>')
            }


            return value || ''
        }
    }
}
</script>

<style scoped>
.container {
    padding: 20px;
    font-family: Arial, sans-serif;
}

h1.title {
    text-align: center;
    font-weight: bold;
    font-size: 13pt;
    margin-bottom: 10px;
    text-transform: uppercase;
}

hr.divider {
    margin: 20px 0;
    border: 1px solid #000;
}

h2.sub-title {
    font-size: 13pt;
    text-align: center;
    text-decoration: underline;
    margin-top: 10px;
    font-weight: bold;
}

/* Styling for Nota Section */
.note {
    font-size: 12pt;
    margin-bottom: 20px;
    text-align: left;
    /* Align text to the left */
    line-height: 2.5;
    /* Ensure there is consistent line spacing */
}

.note h2 {
    font-weight: bold;
    text-decoration: underline;
    font-size: 14pt;
    /* Make the heading slightly larger */
    margin-bottom: 10px;
}

.note p {
    font-size: 12pt;
    margin: 10px 0;
    /* Add space between paragraphs */
    line-height: 1.6;
    /* Ensure proper spacing between lines */
}

/* Add margin and padding to ensure proper alignment */
.note div {
    margin-left: 20px;
    /* Indent the content a bit for readability */
}


table {
    width: 100%;
    border-collapse: collapse;
    /* margin-top: 20px; */
    page-break-inside: always;
}

th,
td {
    padding: 8px;
    border: 1px solid #ccc;
    text-align: left;
    height: 40px;
}

th {
    background-color: #f4f4f4;
}

.export-btn {
    display: inline-block;
    padding: 10px 20px;
    margin-top: 20px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 14px;
    border-radius: 5px;
}

.export-btn:hover {
    background-color: #0056b3;
}

.bg-warning {
    background-color: #f8d7da;
    /* Light red color */
}


thead {
    display: table-header-group;
    /* Keep the header on every page */
}

tbody {
    display: table-row-group;
}

/* Force page breaks within the table */
tr {
    page-break-inside: avoid;
    /* Prevent rows from splitting */
}

.member-list {
    page-break-inside: auto;
}

.member-list tr {
    page-break-inside: avoid;
    page-break-after: auto;
}
</style>
