<template>
    <div>
        <!-- Perkhidmatan Sebelum Pelembagaan -->
        <div>
            <div class="d-flex align-items-center mb-2">
                <label class="fw-semibold me-2">Perkhidmatan Sebelum Pelembagaan:</label>
                <button type="button" class="btn btn-sm btn-outline-success" @click="addSemasaGroup"
                    style="margin-top: -10px;">
                    <span class="bx bx-plus-medical"> Perkhidmatan Semasa Pelembagaan</span>
                </button>
            </div>

            <div v-for="(entry, index) in sebelumValues" :key="'sebelum-' + index" class="row align-items-center mb-3"
                style="margin-left: 87px;">
                <div class="col-2">
                    <input type="date" class="form-control" v-model="entry.year" placeholder="Tahun"/>
                </div>
                <div class="col-2">
                    <input type="text" class="form-control" v-model="entry.jawatan" placeholder="Jawatan" />
                </div>
                <div class="col-3">
                    <input type="text" class="form-control" v-model="entry.place" placeholder="Tempat" />
                </div>
                <div class="col-4">
                    <input type="text" class="form-control" v-model="entry.catatan" placeholder="Catatan" />
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-sm button-remove" @click="removeEntry(sebelumValues, index)"
                        v-if="sebelumValues.length > 1">❌</button>
                </div>
            </div>

            <div class="row">
                <div class="col-2 offset-md-1">
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="addEntry(sebelumValues)">
                        [+] Tambah Lagi
                    </button>
                </div>
            </div>
        </div>

        <!-- Perkhidmatan Semasa Pelembagaan -->
        <div v-for="(group, groupIndex) in semasaGroups" :key="'group-' + groupIndex" class="mt-4">
            <div class="d-flex align-items-center mb-2">
                <label class="fw-semibold me-2">Perkhidmatan:</label>
                <select v-model="group.label" class="form-select form-select-sm w-auto me-2" style="margin-top: -10px;">
                    <option disabled value="">-- Sila Pilih --</option>
                    <option value="Kategori A">Kategori A</option>
                    <option value="Kategori B">Kategori B</option>
                </select>
            </div>

            <div v-for="(entry, index) in group.entries" :key="'sem-' + groupIndex + '-' + index"
                class="row align-items-center mb-3" style="margin-left: 87px;">
                <div class="col-2">
                    <input type="date" class="form-control" v-model="entry.date" />
                </div>
                <div class="col-2">
                    <input type="text" class="form-control" v-model="entry.jawatan" placeholder="Jawatan" />
                </div>
                <div class="col-3">
                    <input type="text" class="form-control" v-model="entry.place" placeholder="Tempat" />
                </div>
                <div class="col-4">
                    <input type="text" class="form-control" v-model="entry.catatan" placeholder="Catatan" />
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-sm button-remove" @click="removeEntry(group.entries, index)"
                        v-if="group.entries.length > 1">❌</button>
                </div>
            </div>
            <div class="row">
                <div class="col-2 offset-md-1">
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="addEntry(sebelumValues)">
                        [+] Tambah Lagi
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "DynamicJobHistory",
    emits: ["update:modelValue"],
    data() {
        return {
            sebelumValues: [
                { year: "", jawatan: "", place: "", catatan: "" },
            ],
            semasaGroups: [],
        };
    },
    methods: {
        addEntry(array) {
            array.push({ date: "", year: "", jawatan: "", place: "", catatan: "" });
        },
        removeEntry(array, index) {
            array.splice(index, 1);
        },
        addSemasaGroup() {
            this.semasaGroups.push({
                label: "",
                entries: [
                    { date: "", jawatan: "", place: "", catatan: "" },
                ],
            });
        },
    },
};
</script>

<style scoped>
.button-remove {
    color: #fff !important;
}

.button-remove:hover {
    color: #fff !important;
}
</style>
