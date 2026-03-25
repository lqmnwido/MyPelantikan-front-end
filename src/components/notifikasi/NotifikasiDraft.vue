<template>
    <div class="card p-4 shadow-sm">

        <div class="mb-3 row">
            <label class="col-sm-2 col-form-label fw-bold">Notifikasi Kepada</label>
            <div class="col-sm-10 pt-2">: {{ form.emailRecipient }}</div>
        </div>

        <div class="mb-3 row">
            <label class="col-sm-2 col-form-label fw-bold">Tarikh & Masa</label>
            <div class="col-sm-10 pt-2">: {{ currentDateTime }}</div>
        </div>

        <div class="mb-3">
            <label class="form-label fw-bold">Tajuk</label>
            <input type="text" :disabled="isViewOnly" class="form-control" :value="form.title"
                @input="$emit('update:form', { ...form, title: $event.target.value })" />
        </div>

        <div class="mb-3">
            <label class="form-label fw-bold">Kandungan</label>
            <textarea :disabled="isViewOnly" class="form-control" rows="6" :value="form.emailContent"
                @input="$emit('update:form', { ...form, emailContent: $event.target.value })"></textarea>
        </div>

        <div class="d-flex justify-content-end mt-3">
            <button v-if="!isViewOnly" class="btn btn-secondary me-2" @click="goBack()">Tutup</button>
            <button v-if="isViewOnly" class="btn btn-secondary me-2" @click="goBack()">Kembali</button>
            <button class="btn btn-primary" @click="$emit('submit')">Hantar</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'NotifikasiDraft',
    props: {
        form: Object
    },
    computed: {
        currentDateTime() {
            const now = new Date();

            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();

            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');

            let period;
            if (hours >= 0 && hours < 12) {
                period = 'PAGI';
            } else if (hours >= 12 && hours < 18) {
                period = 'PETANG';
            } else {
                period = 'MALAM';
            }

            // Convert to 12-hour format if desired (optional)
            // hours = hours % 12 || 12;

            return `${day}/${month}/${year} ${hours}:${minutes} ${period}`;
        },
        isViewOnly() {
            return window.location.href.includes('?view');
        },

    },
    methods: {
        goBack() {
            const from = this.$route.query.from;
            if (from) {
                this.$router.push(from);
            } else {
                this.$router.back();
            }
        },
    }

};
</script>

<style scoped>
textarea {
    white-space: pre-line;
}
</style>
