<template>
    <div>
        <div
            v-for="(entry, index) in localValues"
            :key="index"
            class="row align-items-center mb-3"
        >
            <!-- Label -->
            <div class="col-md-2 text-start">
                <label class="fw-semibold">{{ inputGroupLabel }} {{ index + 1 }}:</label>
            </div>

            <!-- Year Picker -->
            <div class="col-2">
                <input
                    type="text"
                    class="form-control"
                    :ref="'year' + index"
                    :value="entry.year"
                    placeholder="Select Year"
                    @change="onYearChange($event, index)"
                />
            </div>

            <!-- Jawatan -->
            <div class="col-3">
                <input
                    type="text"
                    class="form-control"
                    v-model="entry.jawatan"
                    placeholder="Jawatan"
                />
            </div>

            <!-- Place -->
            <div class="col-4">
                <input
                    type="text"
                    class="form-control"
                    v-model="entry.place"
                    placeholder="Tempat"
                />
            </div>

            <!-- Remove Button -->
            <div class="col-1">
                <button
                    type="button"
                    class="btn btn-sm button-remove"
                    @click="removeEntry(index)"
                    v-if="localValues.length > 1"
                >
                    ❌
                </button>
            </div>
        </div>

        <!-- Add Button -->
        <div class="row">
            <div class="col-2 offset-md-2">
                <button type="button" class="btn btn-outline-primary btn-sm" @click="addEntry">
                    [+] Tambah Lagi
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { nextTick } from "vue";

/* global $ */

export default {
    name: "DynamicJobHistory",
    props: {
        modelValue: {
            type: Array,
            default: () => [{ year: "", jawatan: "", place: "" }],
        },
        inputGroupLabel: {
            type: String,
            default: "",
        },
    },
    emits: ["update:modelValue"],
    data() {
        return {
            localValues: [...this.modelValue],
        };
    },
    watch: {
        modelValue(newVal) {
            if (JSON.stringify(newVal) !== JSON.stringify(this.localValues)) {
                this.localValues = [...newVal];
                this.$nextTick(() => this.initYearPickers());
            }
        },
        localValues: {
            deep: true,
            handler() {
                this.$emit("update:modelValue", [...this.localValues]);
            },
        },
    },
    methods: {
        addEntry() {
            this.localValues.push({ year: "", jawatan: "", place: "" });
            nextTick(() => this.initYearPickers());
        },
        removeEntry(index) {
            this.localValues.splice(index, 1);
            nextTick(() => this.initYearPickers());
        },
        onYearChange(event, index) {
            const year = event.target.value;
            this.localValues[index].year = year;
        },
        initYearPickers() {
            this.localValues.forEach((_, index) => {
                const el = this.$refs['year' + index];
                if (el && $(el).data('datepicker') == null) {
                    $(el).datepicker({
                        format: "yyyy",
                        viewMode: "years",
                        minViewMode: "years",
                        autoclose: true,
                    }).on('changeDate', (e) => {
                        this.localValues[index].year = e.format(0, 'yyyy');
                    });
                }
            });
        },
    },
    mounted() {
        this.initYearPickers();
    },
};
</script>

<style scoped>
.button-remove {
    color: #fff !important;
    text-decoration: none;
}
.button-remove:hover {
    color: #fff !important;
    text-decoration: none;
}
</style>