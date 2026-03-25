<template>
    <div>
        <!-- Lain Lain Pelantikan -->
        <div class="alert alert-warning p-3 mb-4 rounded shadow-sm">
            <div class="d-flex align-items-start">
                <i class="mdi mdi-information-outline fs-2 text-warning me-3"></i>
                <div class="flex-grow-1">
                    <p class="mb-2">
                        Klik butang <span class="fw-bold bx bx-plus-medical"> Tambah Maklumat</span> jika
                        mempunyai lain-lain maklumat.
                    </p>

                    <p class="mb-0 text-muted">
                        Abaikan bahagian ini sekiranya tidak mempunyai lain-lain maklumat.
                    </p>

                </div>
            </div>
        </div>
        <button type="button" class="btn btn-sm btn-success col-12" @click="addLainLainGroup">
            <span class="bx bx-plus-medical"> Tambah Maklumat</span>
        </button>

        <div v-for="(group, groupIndex) in lainLainGroups" :key="'group-' + groupIndex" class="mt-4">
            <div class="d-flex align-items-center mb-3">
                <input type="text" class="fw-semibold me-2 text-center form-control w-auto"
                    v-model="group.kategori_nama" placeholder="Kategori Maklumat..." style="margin-top: 0px" />
                <button type="button" class="btn btn-sm button-remove" @click="removeEntry(lainLainGroups, groupIndex)"
                    v-if="lainLainGroups.length > 0">
                    ❌
                </button>
            </div>

            <div v-for="(entry, index) in group.entries" :key="'lain-' + groupIndex + '-' + index"
                class="row align-items-center mb-3" style="margin-left: 20px">
                <div class="col-2 row">
                    <div class="col-2" style="margin-top: 20px;">{{ index + 1 }}.</div>
                    <div class="col-9">
                        <input type="text" class="form-control text-center same-height-input" v-model="entry.tahun"
                        placeholder="Tahun" />
                    </div>
                </div>
                <div class="col-9">
                    <textarea class="form-control same-height-input" v-model="entry.catatan" placeholder="Catatan"
                        rows="2"></textarea>
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-sm button-remove" @click="removeEntry(group.entries, index)"
                        v-if="group.entries.length > 1">
                        ❌
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col-2" style="margin-left: 60px;">
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="addEntry(group.entries)">
                        [+] Tambah Lagi
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// import { nextTick } from "vue";
// import $ from "jquery";

export default {
    name: "LainLainMaklumatGroup",
    props: {
        modelValue: {
            type: Object,
            default: () => ({
                lainLain: [],
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
            lainLainGroups: [...this.modelValue.lainLain],
        };
    },
    watch: {
        lainLainGroups: {
            deep: true,
            handler() {
                this.emitModel();
            },
        },

    },

    methods: {
        emitModel() {
            this.$emit("update:modelValue", {
                lainLain: [...this.lainLainGroups],
            });
        },
        addEntry(array) {
            array.push({ tahun: "", jawatan: "", agensi: "", catatan: "" });
        },
        removeEntry(array, index) {
            array.splice(index, 1);
        },
        addLainLainGroup() {
            this.lainLainGroups.push({
                kategori_nama: "", // 👈 store id here, not nama
                entries: [{ tahun: "", jawatan: "", agensi: "", catatan: "" }],
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
