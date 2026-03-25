<template>
    <!-- Stat Cards Row -->
    <div class="row mb-4">
        <div class="col-md-4" v-for="card in statCards" :key="card.title">
            <div class="card shadow-sm border-0 p-3 d-flex justify-content-between align-items-center flex-row">
                <div>
                    <div class="text-muted">{{ card.title }}</div>
                    <div class="h5">{{ card.value }}</div>
                </div>
                <div class="icon-circle">
                    <i :class="card.iconClass"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="card p-3 shadow-sm">
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
                    <label class="form-label">No Kad Pengenalan</label>
                    <input type="number" class="form-control" maxlength="12" :disabled="isViewOnly"
                        placeholder="Contoh: 001122060643" v-model="form.ic" />

                    <label class="form-label mt-3">Tarikh Lahir</label>
                    <Datepicker :format="'dd/MM/yyyy'" input-class="form-control uniform-input" :disabled="isViewOnly"
                        :model-value="form.birthDate" />

                    <label class="form-label mt-3" style="padding-top: 4px;">Agama</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Isikan Nama..."
                        v-model="form.religion" />

                    <label class="form-label mt-3">Bangsa</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Isikan Nama..."
                        v-model="form.race" />
                    <!-- 
                    <label class="form-label mt-3">Parti</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Isikan Nama..."
                        v-model="form.parti" /> -->

                    <label class="form-label mt-3">No Telefon Bimbit</label>
                    <input type="text" class="form-control" maxlength="12" :disabled="isViewOnly"
                        placeholder="Contoh: 0123456789" v-model="form.phoneBimbit" />

                    <label class="form-label mt-3">No Telefon Rumah</label>
                    <input type="text" class="form-control" maxlength="12" :disabled="isViewOnly"
                        placeholder="Contoh: 0123456789" v-model="form.phoneRumah" />

                    <!-- <label class="form-label mt-3">Gred Jawatan Terakhir</label>
                    <input type="text" class="form-control" maxlength="2" :disabled="isViewOnly" placeholder="Contoh: 6"
                        v-model="form.gredJawatan" /> -->

                    <label class="form-label mt-3">Emel</label>
                    <input type="email" class="form-control" :disabled="isViewOnly" placeholder="contoh@email.com"
                        v-model="form.email" />

                    <label class="form-label mt-3">Status Perkahwinan</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Contoh: 0123456789"
                        v-model="form.statusKahwin" />

                    <label class="form-label mt-3">Tempat Lahir</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Isikan tempat lahir..."
                        v-model="form.birthPlace" />

                    <label class="form-label mt-3 mb-3 d-block">Jantina</label>
                    <div class="d-flex gap-4" style="padding-top:2px">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" id="jantina-lelaki" value="L"
                                v-model="form.jantina" :disabled="isViewOnly" />
                            <label class="form-check-label" for="jantina-lelaki">
                                Lelaki
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" id="jantina-perempuan" value="P"
                                v-model="form.jantina" :disabled="isViewOnly" />
                            <label class="form-check-label" for="jantina-perempuan">
                                Perempuan
                            </label>
                        </div>
                    </div>

                    <label class="form-label mt-3">Tarikh Bersara</label>
                    <Datepicker :format="'dd/MM/yyyy'" input-class="form-control uniform-input" :disabled="isViewOnly"
                        :model-value="form.tarikhBersara" />

                </div>

                <!-- RIGHT COLUMN -->
                <div class="col-md-6">
                    <label class="form-label">Alamat Rumah</label>
                    <textarea class="form-control" rows="3" :disabled="isViewOnly" placeholder="Isikan alamat penuh..."
                        v-model="form.alamatRumah.alamat"></textarea>

                    <label class="form-label mt-3">Poskod</label>
                    <input type="text" class="form-control" maxlength="5" :disabled="isViewOnly"
                        placeholder="Isikan poskod..." v-model="form.alamatRumah.poskod" />

                    <label class="form-label mt-3">Bandar</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Bandar"
                        v-model="form.alamatRumah.bandar" />

                    <label class="form-label mt-3">Negeri</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Negeri"
                        v-model="form.alamatRumah.negeri" />

                    <label class="form-label mt-3">Alamat Surat-menyurat</label>
                    <textarea class="form-control" rows="3" :disabled="isViewOnly" placeholder="Isikan alamat penuh..."
                        v-model="form.alamatSurat.alamat"></textarea>

                    <label class="form-label mt-3">Poskod</label>
                    <input type="text" class="form-control" maxlength="5" :disabled="isViewOnly"
                        placeholder="Isikan poskod..." v-model="form.alamatSurat.poskod" />

                    <label class="form-label mt-3">Bandar</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Bandar"
                        v-model="form.alamatSurat.bandar" />

                    <label class="form-label mt-3">Negeri</label>
                    <input type="text" class="form-control" :disabled="isViewOnly" placeholder="Negeri"
                        v-model="form.alamatSurat.negeri" />
                </div>
            </div>



            <!-- Submit Button -->
            <div v-if="!isViewOnly" class="text-end mt-4">
                <button class="btn btn-primary">Simpan</button>
            </div>
        </div>


        <div v-if="currentTab === 'Kelulusan Akademik'">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th style="width: 50px">Bil.</th>
                        <th style="width: 100px">Tahun</th>
                        <th>Akademik</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in akademikList" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.tahun }}</td>
                        <td>{{ item.program }}</td>
                    </tr>
                    <tr v-if="akademikList.length === 0">
                        <td colspan="4" class="text-center text-muted">Tiada rekod</td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!isViewOnly" class="text-end">
                <button class="btn btn-primary">
                    <i class="bx bx-plus-circle me-1"></i> Tambah Kelulusan Akademik
                </button>
            </div>
        </div>

        <div v-if="currentTab === 'Anugerah / Pingat'">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th style="width: 50px">Bil.</th>
                        <th>Anugerah / Pingat</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in anugerahList" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.anugerah }}</td>
                    </tr>
                    <tr v-if="anugerahList.length === 0">
                        <td colspan="4" class="text-center text-muted">Tiada rekod</td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!isViewOnly" class="text-end">
                <button class="btn btn-primary">
                    <i class="bx bx-plus-circle me-1"></i> Tambah Kelulusan Akademik
                </button>
            </div>
        </div>

        <div v-if="currentTab === 'Ringkasan Perkhidmatan'">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th style="width: 50px">Bil.</th>
                        <th style="width: 100px">Tahun</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in perkhidmatanList" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.tahun }}</td>
                        <td><span v-html="item.catatan"></span></td>
                    </tr>
                    <tr v-if="perkhidmatanList.length === 0">
                        <td colspan="4" class="text-center text-muted">Tiada rekod</td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!isViewOnly" class="text-end">
                <button class="btn btn-primary">
                    <i class="bx bx-plus-circle me-1"></i> Tambah Kelulusan Akademik
                </button>
            </div>
        </div>

        <div v-if="currentTab === 'Dokumen'">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th style="width: 50px">Bil.</th>
                        <th style="width: 30%">Tajuk</th>
                        <th style="width: 50%">Keterangan</th>
                        <th style="width: 20%">Dokumen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in dokumenList" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.tajuk }}</td>
                        <td v-html="item.keterangan"></td>
                        <td>
                            <a href="#" @click.prevent="openModal(item)">
                                {{ item.dokumen }}
                            </a>
                        </td>

                    </tr>
                    <tr v-if="dokumenList.length === 0">
                        <td colspan="4" class="text-center text-muted">Tiada rekod</td>
                    </tr>
                </tbody>
            </table>

            <!-- Modal -->
            <b-modal v-model="showModal" title="Paparan Dokumen" size="lg">
                <iframe v-if="selectedDokumen" :src="selectedDokumen.file" width="100%" height="500px"
                    frameborder="0"></iframe>
            </b-modal>

            <div v-if="!isViewOnly" class="text-end">
                <button class="btn btn-primary">
                    <i class="bx bx-plus-circle me-1"></i> Tambah Kelulusan Akademik
                </button>
            </div>
        </div>
        <!-- Placeholder for other tabs -->
        <div v-else>
            <p class="mt-3">Tab: {{ currentTab }}</p>
        </div>
    </div>
</template>

<script>
import 'vue-multiselect/dist/vue-multiselect.min.css'
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
    name: "BiodataCard",
    components: { Datepicker },
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
                'Kelulusan Akademik',
                'Anugerah / Pingat',
                'Ringkasan Perkhidmatan',
                'Dokumen',
            ],
            statCards: [
                { title: "Kelulusan Akademik", iconClass: "fas fa-book-reader" },
                { title: "Anugerah / Pingat:", iconClass: "fas fa-medal" },
                { title: "Ringkasan Perkhidmatan", iconClass: "fas fa-scroll" }
            ],
            akademikList: [],
            anugerahList: [],
            perkhidmatanList: [],
            dokumenList: [],
            form: {
                nama: '',
                ic: '',
                birthDate: '',
                tarikhBersara: '',
                religion: '',
                race: '',
                parti: '',
                phoneBimbit: '',
                phoneRumah: '',
                // gredJawatan: '',
                statusKahwin: '',
                birthPlace: '',
                email: '',
                alamatRumah: {
                    alamat: '',
                    poskod: '',
                    bandar: '',
                    negeri: '',
                },
                alamatSurat: {
                    alamat: '',
                    poskod: '',
                    bandar: '',
                    negeri: '',
                },
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
        deleteItem(index) {
            if (confirm("Anda pasti ingin memadamkan rekod ini?")) {
                this.akademikList.splice(index, 1);
            }
        },
        openModal(item) {
            if (!item.file) return;

            // Get file extension
            const extension = item.file.split('.').pop().toLowerCase();

            if (extension === 'pdf') {
                // Open PDF in modal
                this.selectedDokumen = item;
                this.showModal = true;
            } else {
                // For other file types, download
                const link = document.createElement('a');
                link.href = item.file;
                link.download = item.dokumen || 'file';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
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
                    this.form.jantina = data.jantina || '';
                    this.form.birthDate = data.tarikh_lahir || '';
                    this.form.tarikhBersara = data.tarikh_bersara || '';
                    this.form.race = data.bangsa || '-';
                    this.form.religion = data.agama || '-';
                    this.form.parti = data.parti || '-';
                    // this.form.gredJawatan = data.gredJawatan || '-';
                    this.form.statusKahwin = data.status_perkahwinan || '-';
                    this.form.phoneBimbit = data.telefons?.find(t => t.jenis === 'Telefon Bimbit')?.no || '-';
                    this.form.phoneRumah = data.telefons?.find(t => t.jenis === 'Telefon Rumah')?.no || '-';
                    this.form.birthPlace = data.alamats?.find(a => a.jenis?.toLowerCase().trim() === 'tempat lahir')?.alamat || '-',
                        this.form.alamatRumah = {
                            alamat: data.alamats?.find(a => a.jenis?.toLowerCase().trim() === 'alamat rumah')?.alamat || '-',
                            poskod: data.alamats?.find(a => a.jenis === 'Alamat Rumah')?.poskod || '-',
                            bandar: data.alamats?.find(a => a.jenis === 'Alamat Rumah')?.bandar || '-',
                            negeri: data.alamats?.find(a => a.jenis === 'Alamat Rumah')?.negeri || '-'
                        };
                    this.form.alamatSurat = {
                        alamat: data.alamats?.find(a => a.jenis === 'Alamat Surat Menyurat')?.alamat || '-',
                        poskod: data.alamats?.find(a => a.jenis === 'Alamat Surat Menyurat')?.poskod || '-',
                        bandar: data.alamats?.find(a => a.jenis === 'Alamat Surat Menyurat')?.bandar || '-',
                        negeri: data.alamats?.find(a => a.jenis === 'Alamat Surat Menyurat')?.negeri || '-'
                    };

                    if (data.akademiks && Array.isArray(data.akademiks)) {
                        this.akademikList = data.akademiks
                            .sort((a, b) => a.kekananan - b.kekananan)
                            .map(item => ({
                                tahun: item.tahun || '-',
                                program: `${item.program || ''}, ${item.institusi || ''}`.trim(),
                            }));
                    }

                    if (data.anugerahs && Array.isArray(data.anugerahs)) {
                        this.anugerahList = data.anugerahs
                            .sort((a, b) => a.kekananan - b.kekananan)
                            .map(item => ({
                                anugerah: `${item.nama || ''} (${item.singkatan || ''})`.trim(),
                            }));
                    }

                    if (data.perkhidmatans && Array.isArray(data.perkhidmatans)) {
                        this.perkhidmatanList = data.perkhidmatans.map(item => {
                            const jawatan = item.jawatan ?? '';
                            const agensi = item.agensi ?? '';
                            const catatan = item.catatan ?? '';

                            let catatanText = '';
                            if (catatan) {
                                catatanText = `<i>(${catatan})</i>`;
                            }

                            const combined = [jawatan, agensi, catatanText]
                                .filter(part => part.trim() !== '')
                                .join('<br/>');

                            return {
                                tahun: item.tahun || '-',
                                catatan: combined,
                            };
                        });
                    }

                    if (data.dokumens && Array.isArray(data.dokumens)) {
                        this.dokumenList = data.dokumens.map(item => ({
                            tajuk: item.tajuk || '-',
                            keterangan: item.keterangan || '-',
                            dokumen: item.nama_file || '-',
                            file: item.file || '-',
                        }));
                    }

                    // console.log("anu:", this.perkhidmatanList);

                    this.statCards[0].value = this.akademikList.length;
                    this.statCards[1].value = this.anugerahList.length;
                    this.statCards[2].value = this.perkhidmatanList.length;
                    if (this.statCards[3]) {
                        this.statCards[3].value = this.dokumenList.length;
                    }

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