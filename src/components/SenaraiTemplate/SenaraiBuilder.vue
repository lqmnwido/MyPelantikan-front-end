<template>
    <div>
        <Loader :loading="loading" class="loading-overlay" />
        <!-- ==================== Jenis Pelantikan ==================== -->
        <div class="mb-3">
            <label class="form-label fw-bold">Jenis Pelantikan:</label>
            <select v-model="localJenisPelantikan" class="form-select"
                @change="$emit('update:jenisPelantikan', localJenisPelantikan)">
                <option disabled value="">-- Pilih Jenis Pelantikan --</option>
                <option v-for="opt in jenisPelantikanOptions" :key="opt.value.id" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>
        </div>


        <!-- ==================== Headers Table ==================== -->
        <div class="mb-3">
            <label class="form-label fw-bold">Headers (tajuk kolum):</label>

            <table class="table table-bordered align-middle">
                <thead class="table-light">
                    <tr>
                        <th style="width: 5%">#</th>
                        <th style="width: 15%">Header</th>
                        <th style="width: 45%">Variable</th>
                        <th style="width: 10%">Align</th>
                        <th style="width: 10%">Width</th>
                        <th style="width: 5%">Tindakan</th>
                    </tr>
                </thead>
                <draggable v-model="draggedHeaders" item-key="id" tag="tbody" handle=".drag-handle"
                    @change="onDragChange">
                    <template #item="{ element: h, index: i }">
                        <tr :class="{ 'table-info': i === 0 }">
                            <td>
                                <div class="d-flex align-items-center">
                                    <i v-if="i !== 0" class="bx bx-move-vertical drag-handle me-2" style="cursor: grab;"></i>
                                    {{ i + 1 }}
                                </div>
                            </td>
                            <td>
                                <input type="text" v-model="h.label" class="form-control" placeholder="Contoh: Bil." />
                            </td>
                            <td>
                                <!-- First header = always index -->
                                <div v-if="i === 0" class="text-muted">index</div>

                                <!-- Other headers = dropdown -->
                                <div v-else class="input-group">
                                    <select v-model="h.variable" class="form-select" @change="checkCustomVariable(h)">
                                        <option disabled value="">-- Pilih Variable --</option>
                                        <option v-for="opt in variableOptions" :key="opt.value" :value="opt.value">
                                            {{ opt.label }}
                                        </option>
                                        <option value="custom">Custom</option>
                                    </select>
                                    <textarea v-if="h.variable === 'custom'" v-model="h.customVariable"
                                        class="form-control" placeholder="Contoh: {{nama}} </br> <b>{{jawatan}}</b>"
                                        rows="2"></textarea>
                                </div>
                            </td>
                            <td>
                                <select v-model="h.align" class="form-select">
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </td>
                            <td>
                                <input type="number" v-model.number="h.width" class="form-control" placeholder="%"
                                    min="5" max="100" />
                            </td>
                            <td class="text-center">
                                <template v-if="i === 0">
                                    <span class="text-muted">-</span>
                                </template>
                                <template v-else>
                                    <button class="btn btn-sm btn-danger" style="width: 70px;"
                                        @click="$emit('remove-header', i)">
                                        Buang
                                    </button>
                                </template>
                            </td>
                        </tr>
                    </template>
                </draggable>

                <tbody>
                    <!-- Add new header -->
                    <tr>
                        <td>#</td>
                        <td>
                            <input type="text" v-model="localHeader.label" class="form-control"
                                placeholder="Contoh: Nama" />
                        </td>
                        <td>
                            <div class="input-group">
                                <select v-model="localHeader.variable" class="form-select">
                                    <option disabled value="">-- Pilih Variable --</option>
                                    <option v-for="opt in variableOptions" :key="opt.value" :value="opt.value">
                                        {{ opt.label }}
                                    </option>
                                    <option value="custom">Custom</option>
                                </select>
                                <textarea v-if="localHeader.variable === 'custom'" v-model="localHeader.customVariable"
                                    class="form-control" placeholder="Contoh: {{nama}} </br> <b>{{jawatan}}</b>"
                                    rows="2"></textarea>
                            </div>
                        </td>
                        <td>
                            <select v-model="localHeader.align" class="form-select">
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </td>
                        <td>
                            <input type="number" v-model.number="localHeader.width" class="form-control" placeholder="%"
                                min="5" max="100" />
                        </td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-primary" style="width: 70px;" @click="emitAddHeader">
                                Tambah
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ==================== Save Button ==================== -->
        <div class="text-end">
            <button class="btn btn-secondary btn-sm me-2 btn-action" @click="handleBack">
                Kembali
            </button>
            <button class="btn btn-success btn-sm btn-action" @click="saveTemplate">
                Simpan Template
            </button>
        </div>
    </div>
</template>

<script>
import Loader from "@/components/widgets/loader";
import draggable from "vuedraggable";

export default {
    components: { Loader, draggable },
    name: "SenaraiBuilder",
    props: {
        jenisPelantikan: {
            type: Object,
            default: () => null,
        },
        headers: Array,
        jenisPelantikanOptions: Array,
        variableOptions: Array,
        loading: Boolean,
    },
    data() {
        return {
            localJenisPelantikan: this.jenisPelantikan ?? "",
            localHeader: {
                label: "",
                variable: "",
                customVariable: "",
                align: "left",
            },
            selectedActions: [],
        };
    },
    computed: {
        draggedHeaders: {
            get() {
                return this.headers;
            },
            set(value) {
                this.$emit('update:headers', value);
            }
        }
    },
    watch: {
        jenisPelantikan: {
            immediate: true,
            handler(newVal) {
                this.localJenisPelantikan = newVal ?? "";
            }
        }
    },
    mounted() {
        // Ensure first header is always "index"
        if (!this.headers.length) {
            this.$emit("add-header", {
                // label: "Index",
                id: `header-${Date.now()}`,
                variable: "index",
                customVariable: "",
                align: "center",
                width: 5,
            });
        }
    },
    methods: {
        checkCustomVariable(header) {
            if (header.variable !== "custom") {
                header.customVariable = "";
            }
        },
        emitAddHeader() {
            if (this.localHeader.label.trim() !== "") {
                this.$emit("add-header", {
                    id: `header-${Date.now()}`,
                    label: this.localHeader.label,
                    variable: this.localHeader.variable,
                    customVariable: this.localHeader.customVariable,
                    align: this.localHeader.align,
                    width: this.localHeader.width,
                });

                this.localHeader = {
                    label: "",
                    variable: "",
                    customVariable: "",
                    align: "left",
                };
            }
        },
        saveTemplate() {
            this.$emit("save-template", {
                actions: this.selectedActions,
            });
        },

        handleBack() {
            this.$router.back();
        },
        onDragChange() {
            // Force re-evaluation or handle specific logic if needed
        }
    },
};
</script>

<style scoped>
.btn-action {
    width: 150px;
}

textarea {
    resize: vertical;
}


.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    width: 100%;
    background: rgba(255, 255, 255, 0.6);
}
</style>