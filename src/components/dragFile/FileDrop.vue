<template>
  <!-- IMAGE UPLOAD -->
  <div v-if="$route.path === '/pentadbir/aduan/tambah-aduan'" class="dropzone" :class="{ dragging: isDragging }"
    @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop('image', $event)" @click="selectFile">
    <i class="mdi mdi-upload upload-icon"></i>
    <p class="upload-text">
      Tarik dan lepaskan <b>Tangkapan Skrin</b> ke sini atau klik untuk memuat naik.<br />
      <small class="text-danger">(Had saiz maksimum: {{ this.FileSize }}MB)</small>
    </p>

    <input ref="fileInput" type="file" accept="image/*" hidden @change="handleFileSelect('image', $event)" />
    <div v-if="modelValue" class="mt-2 text-muted">
      <strong>Gambar yang telah dipilih:</strong> {{ modelValue.name }}
    </div>
  </div>

  <!-- PDF UPLOAD -->
  <!-- PDF + Office UPLOAD -->
  <div v-else class="dropzone" :class="{ dragging: isDragging }" @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop('document', $event)" @click="selectFile">
    <i class="mdi mdi-upload upload-icon"></i>
    <p class="upload-text">
      Tarik dan lepaskan <b>Fail PDF atau Microsoft Office</b> ke sini atau klik untuk memuat naik.<br />
      <small class="text-danger">(Had saiz maksimum: {{ this.FileSize }}MB)</small>
    </p>
    <input ref="fileInput" type="file"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
      hidden @change="handleFileSelect('document', $event)" />
    <div v-if="modelValue || fileName" class="mt-2 text-muted">
      <strong>Fail yang telah dipilih:</strong>
      {{ modelValue?.name || fileName }}
    </div>

  </div>


  <SweetAlert :show="alert.warning" type="warning" title="Maaf" :text="alert.warningMessage"
    @closed="alert.warning = false" />
</template>

<script>
import SweetAlert from "@/components/SweetAlert";
import { systemConfigService } from "@/services/systemConfig.service";

export default {
  components: { SweetAlert },
  name: "FileDrop",
  props: {
    modelValue: File,
    fileName: String
  },
  emits: ["update:modelValue"],
  data() {
    return {
      isDragging: false,
      FileSize: 5,
      // maxFileSize: FileSize * 1024 * 1024, // 5MB
      alert: {
        warning: false,
        warningMessage: ""
      }
    };
  },
  async mounted() {
    await this.getFileSize();
  },
  computed: {
    maxFileSize() {
      return this.FileSize * 1024 * 1024; // 5MB
    }
  },
  methods: {
    async getFileSize() {
      try {
        const response = await systemConfigService.getFileSize();
        // console.log(response);
        this.FileSize = response.size; // adjust based on API response
      } catch (error) {
        console.error("Gagal mendapatkan saiz fail:", error);
        this.alert.error = true;
        this.alert.errorMessage =
          error?.response?.data?.message || "Gagal memuatkan tetapan saiz fail.";
      }
    },
    validateFile(type, file) {
      if (!file) return false;

      if (type === "document") {
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ];
        if (!allowedTypes.includes(file.type)) {
          this.alert.warningMessage = "Sila muat naik fail PDF atau Microsoft Office sahaja.";
          this.alert.warning = true;
          return false;
        }
      }

      if (type === "image" && !file.type.startsWith("image/")) {
        this.alert.warningMessage = "Sila muat naik fail imej sahaja.";
        this.alert.warning = true;
        return false;
      }

      // Size check
      if (file.size > this.maxFileSize) {
        this.alert.warningMessage = `Saiz fail tidak boleh melebihi ${this.FileSize}MB.`;
        this.alert.warning = true;
        return false;
      }

      return true;
    },


    handleDrop(type, event) {
      this.isDragging = false;
      const file = event.dataTransfer.files[0];
      if (!this.validateFile(type, file)) return;

      this.$emit("update:modelValue", file);
    },

    handleFileSelect(type, event) {
      const file = event.target.files[0];
      if (!this.validateFile(type, file)) return;

      this.$emit("update:modelValue", file);
    },

    selectFile() {
      this.$refs.fileInput.click();
    }
  }
};
</script>



<style scoped>
.dropzone {
  border: 2px dashed #bababa !important;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease;
  max-width: 100%;
  width: 100%;
}

.dropzone.dragging {
  border-color: #3b82f6;
  background-color: #f0f9ff;
  transform: scale(1.03);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.upload-icon {
  font-size: 32px;
  color: #6b7280;
  transition: transform 0.3s ease, color 0.3s ease;
}

.dropzone.dragging .upload-icon {
  transform: rotate(10deg) scale(1.1);
  color: #3b82f6;
}

.upload-text {
  margin-top: 8px;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.3s ease;
}

.dropzone.dragging .upload-text {
  color: #2563eb;
}
</style>
