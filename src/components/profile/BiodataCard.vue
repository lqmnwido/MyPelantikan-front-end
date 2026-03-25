<template>
    <div class="card p-3 shadow-sm" style="height: 300px;">
        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs mb-3">
            <li class="nav-item" v-for="tab in tabs" :key="tab">
                <button class="nav-link" :class="{ active: currentTab === tab }" @click="currentTab = tab">
                    {{ tab }}
                </button>
            </li>
        </ul>

        <!-- Biodata Tab Content -->
        <div v-if="currentTab === 'Biodata'">
            <div class="row g-3">
                <!-- LEFT COLUMN -->
                <div class="col-md-6">
                    <label class="form-label">Nama</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Contoh: Ali bin Abu"
                        v-model="form.nama" />

                    <label class="form-label mt-3">No Kad Pengenalan</label>
                    <input type="number" class="form-control" maxlength="12" disabled
                        placeholder="Contoh: 001122060643" v-model="form.ic" />
                </div>

                <!-- RIGHT COLUMN -->
                <div class="col-md-6">
                    <label class="form-label">Emel</label>
                    <input type="email" class="form-control" :disabled="isViewOnly" placeholder="contoh@email.com"
                        v-model="form.email" />
                </div>
            </div>

            <!-- Submit Button -->
            <div v-if="!isViewOnly" class="text-end mt-4">
                <button class="btn btn-primary">Simpan</button>
            </div>
        </div>

        <div v-else>
            <p class="mt-3">Tab: {{ currentTab }}</p>
        </div>
    </div>
</template>

<script>
import 'vue-multiselect/dist/vue-multiselect.min.css'
// import Datepicker from '@vuepic/vue-datepicker';
// import '@vuepic/vue-datepicker/dist/main.css';

export default {
    name: "BiodataCard",
    // components: { Datepicker },
    props: {
        initialData: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            currentTab: 'Biodata',
            tabs: [
                'Biodata',
            ],
            form: {
                nama: '',
                ic: '',
                email: '',
            },
            showModal: false,
            selectedDokumen: null,
        };
    },
    methods: {
        editItem(index) {
            alert(`Edit item #${index + 1}`);
            // Implement edit modal here
        },
    },
    computed: {
        isViewOnly() {
            return window.location.href.includes('?view');
        }
    },
    watch: {
        initialData: {
            immediate: true,
            handler(data) {
                if (data && Object.keys(data).length > 0) {
                    this.form.nama = data.nama || '-';
                    this.form.ic = data.nombor_ic || '-';
                    this.form.email = data.emel || '-';
                }
            }
        }
    }


};
</script>

<style scoped>
.icon-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #4b6ef5;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

input {
    height: 42px !important;
}

select.form-select {
    height: 42px !important;
}

textarea.form-control {
    height: 127px !important;
}

/* Make vue-multiselect look like Bootstrap select */
.multiselect {
    width: 100% !important;
    height: 35px !important;
    /* Match Bootstrap select height */
    padding: 0;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    font-size: 1rem;
    line-height: 1.2;
    background-color: #fff;
}

.multiselect__tags {
    padding: 0.375rem 0.75rem;
    min-height: 38px;
}

.multiselect__placeholder {
    margin-bottom: 0;
    line-height: 1.5;
}

.multiselect__input {
    margin: 0;
    padding: 0;
    height: auto;
    font-size: 1rem;
}

.multiselect__single {
    padding: 0;
    margin: 0;
    line-height: 1.5;
}

.multiselect__select {
    height: 38px;
}

.multiselect__content-wrapper {
    z-index: 1000;
}

.form-check-input {
    width: 10px !important;
    height: 10px !important;
}

.form-check-label {
    font-weight: 500;
    color: #212529;
}

.form-check-input:disabled+.form-check-label {
    color: #6c757d;
}
</style>