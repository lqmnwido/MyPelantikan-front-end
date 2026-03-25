<template>
    <div class="row">
        <!-- Left Column: Kelulusan Akademik -->
        <div class="col-md-6 mb-4">
            <h5 class="fw-bold mb-3">A. Kelulusan Akademik</h5>
            <draggable v-model="kelulusanList" item-key="id" handle=".drag-handle" @end="updateKelulusanOrder">
                <template #item="{ element, index }">
                    <div class="row align-items-center g-2 mb-2">
                        <div class="col-1 text-end drag-handle" style="cursor: grab;">
                            <label class="fw-semibold mt-2">{{ index + 1 }}.</label>
                        </div>
                        <div class="col-2">
                            <input type="text" class="form-control form-control-sm year-input text-center"
                                :ref="'kelulusanYear' + index" :value="element.tahun" placeholder="Tahun"
                                @change="onKelulusanYearChange($event, index)" />
                        </div>
                        <div class="col-4">
                            <input type="text" class="form-control text-input" v-model="element.program"
                                placeholder="Nama Program" />
                        </div>
                        <div class="col-4">
                            <input type="text" class="form-control text-input" v-model="element.institusi"
                                placeholder="Nama Institut" />
                        </div>
                        <div class="col-1 text-start">
                            <button v-if="kelulusanList.length > 1" type="button"
                                class="btn btn-sm px-2 py-1 button-remove" @click="removeKelulusan(index)">❌</button>
                        </div>
                    </div>
                </template>
            </draggable>
            <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addKelulusan">
                [+] Tambah
            </button>
        </div>

        <!-- Right Column: Anugerah / Pingat -->
        <div class="col-md-6 mb-4">
            <h5 class="fw-bold mb-3">B. Anugerah / Pingat</h5>
            <draggable v-model="anugerahList" item-key="id" handle=".drag-handle" @end="updateAnugerahOrder">
                <template #item="{ element, index }">
                    <div class="row align-items-center g-2 mb-2">
                        <div class="col-1 text-end drag-handle" style="cursor: grab;">
                            <label class="fw-semibold mt-2">{{ index + 1 }}.</label>
                        </div>
                        <div class="col-5">
                            <input type="text" class="form-control text-input" v-model="element.nama"
                                placeholder="Nama Anugerah" />
                        </div>
                        <div class="col-5">
                            <input type="text" class="form-control text-input" v-model="element.singkatan"
                                placeholder="Singkatan" />
                        </div>
                        <div class="col-1 text-start">
                            <button v-if="anugerahList.length > 1" type="button"
                                class="btn btn-sm px-2 py-1 button-remove" @click="removeAnugerah(index)">❌</button>
                        </div>
                    </div>
                </template>
            </draggable>

            <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addAnugerah">
                [+] Tambah
            </button>
        </div>
    </div>

</template>

<script>
import { nextTick } from 'vue'
// import Multiselect from '@vueform/multiselect'
import 'vue3-select/dist/vue3-select.css'
import draggable from 'vuedraggable'



/* global $ */
export default {
    name: 'MaklumatAkademik',
    components: {
        // Multiselect,
        draggable,
    },
    props: {
        modelValue: Object,
    },
    emits: ['update:modelValue'],
    data() {
        return {
            kelulusanList: [{ id: Date.now(), tahun: '', program: '', institusi: '', kekananan: 1 }],
            anugerahList: [{ id: Date.now(), nama: '', singkatan: '', kekananan: 1 }],
        }
    },
    watch: {
        kelulusanList: {
            deep: true,
            handler() {
                this.emitUpdate();
            }
        },
        anugerahList: {
            deep: true,
            handler() {
                this.emitUpdate();
            }
        }
    },
    methods: {
        updateKelulusanOrder() {
            this.kelulusanList.forEach((item, index) => {
                item.kekananan = index + 1;
            });
            this.emitUpdate();
        },
        updateAnugerahOrder() {
            this.anugerahList.forEach((item, index) => {
                item.kekananan = index + 1;
            });
            this.emitUpdate();
        },
        emitUpdate() {
            this.kelulusanList.forEach((item, index) => {
                item.kekananan = index + 1;
            });
            this.anugerahList.forEach((item, index) => {
                item.kekananan = index + 1;
            });

            this.$emit("update:modelValue", {
                kelulusan: this.kelulusanList,
                anugerah: this.anugerahList,
            });
        },
        addKelulusan() {
            this.kelulusanList.push({
                id: Date.now(),
                tahun: '',
                program: '',
                institusi: '',
                kekananan: this.kelulusanList.length + 1
            });
            this.emitUpdate();
            nextTick(() => this.initPickers('kelulusanYear'));
        },
        removeKelulusan(index) {
            this.kelulusanList.splice(index, 1);
            this.updateKelulusanOrder(); // Re-calculate order
        },
        addAnugerah() {
            this.anugerahList.push({
                id: Date.now(),
                nama: '',
                singkatan: '',
                kekananan: this.anugerahList.length + 1,
            });
            this.emitUpdate();
        },
        removeAnugerah(index) {
            this.anugerahList.splice(index, 1);
            this.updateAnugerahOrder(); // Re-calculate order
        },
        onKelulusanYearChange(e, index) {
            this.kelulusanList[index].tahun = e.target.value;
            this.emitUpdate();
        },
        onAnugerahYearChange(e, index) {
            this.anugerahList[index].tahun = e.target.value;
            this.emitUpdate();
        },

        initPickers(prefix) {
            const list = prefix === 'kelulusanYear' ? this.kelulusanList : this.anugerahList
            list.forEach((_, index) => {
                const el = this.$refs[`${prefix}${index}`]
                if (el && $(el).data('datepicker') == null) {
                    $(el)
                        .datepicker({
                            format: 'yyyy',
                            viewMode: 'years',
                            minViewMode: 'years',
                            autoclose: true,
                            startDate: '1900',
                            endDate: '+0d',
                        })
                        .on('changeDate', (e) => {
                            const tahun = e.format(0, 'yyyy')
                            if (prefix === 'kelulusanYear') {
                                this.kelulusanList[index].tahun = tahun
                            } else {
                                this.anugerahList[index].tahun = tahun
                            }
                        })
                }
            })
        },
        updateField(key, value) {
            const updated = { ...this.modelValue, [key]: value }
            this.$emit('update:modelValue', updated)
        },
    },
    mounted() {
        if (this.modelValue?.kelulusan?.length) {
            this.kelulusanList = this.modelValue.kelulusan
                .map((item, index) => ({ ...item, id: item.id || Date.now() + index, kekananan: item.kekananan || index + 1 }))
                .sort((a, b) => a.kekananan - b.kekananan);
        } else {
            this.kelulusanList = [{ id: Date.now(), tahun: '', program: '', institusi: '', kekananan: 1 }];
        }

        if (this.modelValue?.anugerah?.length) {
            this.anugerahList = this.modelValue.anugerah
                .map((item, index) => ({ ...item, id: item.id || Date.now() + index, kekananan: item.kekananan || index + 1 }))
                .sort((a, b) => a.kekananan - b.kekananan);
        } else {
            this.anugerahList = [{ id: Date.now(), nama: '', singkatan: '', kekananan: 1 }];
        }

        this.initPickers('kelulusanYear');
        this.initPickers('anugerahYear');
    }

}
</script>

<style scoped>
.multiselect-sm {
    width: 100% !important;
    font-size: small;
    padding: 0 !important;
}

.year-input {
    height: 40px;
    font-size: small;
}

.text-input {
    width: 101% !important;
    height: 40px;
    font-size: small;
}

.button-remove {
    color: #fff !important;
    text-decoration: none;
}

.button-remove:hover {
    color: #fff !important;
    text-decoration: none;
}

.anugerahRemove {
    padding-left: 20px;
}
</style>
