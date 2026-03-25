<template>
    <div>
        <!-- Perkhidmatan Sebelum Pelembagaan -->
        <div>
            <div class="d-flex align-items-center mb-2">
                <button type="button" class="btn btn-sm btn-outline-success" @click="addSemasaGroup"
                    style="margin-top: -10px">
                    <span class="bx bx-plus-medical">Tambah Lain-Lain Maklumat</span>
                </button>
            </div>
        </div>

        <!-- Perkhidmatan Semasa Pelembagaan -->
        <div v-for="(group, groupIndex) in semasaGroups" :key="'group-' + groupIndex" class="mt-4">
            <div class="d-flex align-items-center mb-2">
                <label class="fw-semibold me-2">Perkhidmatan:</label>
                <select v-model="group.kategori_nama" class="form-select form-select-sm w-auto me-2"
                    style="margin-top: -10px" disabled>
                    <option disabled value="">-- Sila Pilih --</option>
                    <option v-for="opt in kategoriOptions" :key="opt.id" :value="opt.id">
                        {{ opt.nama }}
                    </option>
                </select>
            </div>

            <div v-for="(entry, index) in group.entries" :key="'sem-' + groupIndex + '-' + index"
                class="row align-items-center mb-3" style="margin-left: 87px">
                <div class="col-2">
                    <input type="text" class="form-control text-center" v-model="entry.tahun" placeholder="Tahun"/>
                </div>
                <div class="col-2">
                    <input type="text" class="form-control" v-model="entry.jawatan" placeholder="Jawatan"/>
                </div>
                <div class="col-7">
                    <input type="text" class="form-control" v-model="entry.catatan" placeholder="Catatan"/>
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-sm button-remove" @click="removeEntry(group.entries, index)"
                        v-if="group.entries.length > 0">
                        ❌
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col-2 offset-md-1">
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="addEntry(group.entries)" disabled>
                        [+] Tambah Lagi
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { nextTick } from "vue";
import $ from "jquery";

export default {
    name: "DynamicJobHistory",
    props: {
        modelValue: {
            type: Object,
            default: () => ({
                sebelum: [{ tahun: "", jawatan: "", agensi: "", catatan: "" }],
                semasa: [],
            }),
        },
        kategoriOptions: {
            type: Array,
            default: () => [],
        },

    },
    emits: ["update:modelValue"],
    data() {
        return {
            sebelumValues: [...this.modelValue.sebelum],
            semasaGroups: [...this.modelValue.semasa],
        };
    },
    watch: {
        sebelumValues: {
        deep: true,
        handler(newVal) {
            newVal.forEach(entry => {
                const year = entry.tahun;
                
                // Only validate if the field is not empty
                if (year) {
                    this.validateYear(year, entry);
                }
            });
 
            this.emitModel(); 
            }
        },
        semasaGroups: {
            deep: true,
            handler() {
                this.emitModel();
            },
        },
        
    },
    mounted() {
        this.initYearPickers();
    },
    methods: {
        emitModel() {
            this.$emit("update:modelValue", {
                sebelum: [...this.sebelumValues],
                semasa: [...this.semasaGroups],
            });
        },
        addEntry(array) {
            array.push({ tahun: "", jawatan: "", agensi: "", catatan: "" });
            nextTick(() => this.initYearPickers());
        },
        removeEntry(array, index) {
            array.splice(index, 1);
            nextTick(() => this.initYearPickers());
        },
        addSemasaGroup() {
            this.semasaGroups.push({
                kategori_nama: "", // 👈 store id here, not nama
                entries: [{ tahun: "", jawatan: "", agensi: "", catatan: "" }],
            });
        },
        validateYear(year, entry) {
        // eslint-disable-next-line no-unused-vars
        let currentYear = new Date().getFullYear();
        const yearInt = parseInt(year, 10);
        
        // Define your validation rules
        const isValid = year.length === 4 && 
                        !isNaN(yearInt) && 
                        yearInt >= 1900;

            if (!isValid) {
                entry.validationError = 'Sila masukkan tahun 4 digit yang sah (cth: 2023).';
            } else {
                entry.validationError = null;
            }
        },
        initYearPickers() {
            this.sebelumValues.forEach((_, index) => {
                const el = this.$refs['tahun' + index];
                if (el && $(el).datepicker && $(el).data('datepicker') == null) {
                    $(el).datepicker({
                        format: "yyyy",
                        viewMode: "years",
                        minViewMode: "years",
                        autoclose: true,
                        startDate: '1900',
                        endDate: '+0d',
                    }).on('changeDate', (e) => {
                        this.sebelumValues[index].tahun = e.format(0, 'yyyy');
                    });
                }
            });
        },
    },
};
</script>

<style scoped>
.same-height-input {
    min-height: calc(2 * 1.5em + 0.75rem + 2px);
    height: 100%;
}

.button-remove {
    color: #fff !important;
}

.button-remove:hover {
    color: #fff !important;
}
</style>
