<template>
    <div class="mb-3 row align-items-center">
        <!-- Label Section -->
        <label class="col-sm-4 col-form-label fw-semibold d-flex justify-content-between align-items-center">
            <span>
                {{ label }}
                <span v-if="required" class="text-danger"> *</span>
                <small v-if="sublabel" class="text-muted d-block">{{ sublabel }}</small>
            </span>

            <span v-if="info" class="ms-2" style="cursor: pointer;" :title="info">
                <i class="mdi mdi-information-outline text-muted" style="font-size: 1rem;"></i>
            </span>
        </label>


        <!-- Input Section -->
        <div class="col-sm-8">
            <!-- Common input types -->
            <template
                v-if="['text', 'number', 'email', 'time', 'datetime-local', 'tel', 'url', 'password'].includes(type)">
                <input :type="resolvedInputType" :class="['form-control uniform-input', inputValidationClass]"
                    :placeholder="placeholder" :value="modelValue" :readonly="readonly" :disabled="disabled"
                    :min="type === 'number' ? min : undefined" :max="type === 'number' ? max : undefined"
                    :step="type === 'number' && allowDecimal ? 'any' : '1'"
                    :maxlength="type !== 'number' ? maxlength : null" @input="handleInput" />
            </template>

            <template v-else-if="type === 'date'">
                <Datepicker :model-value="modelValue" @update:model-value="updateValue" :format="'dd/MM/yyyy'"
                    :placeholder="placeholder || 'dd/mm/yyyy'" :disabled="disabled" :readonly="readonly" auto-apply
                    input-class="form-control uniform-input" teleport />
            </template>

            <!-- Image Profile Upload -->
            <template v-else-if="type === 'image-profile'">
                <div class="d-flex justify-content-center">
                    <div class="image-upload-wrapper">
                        <label for="image-upload" class="image-upload-label">
                            <img v-if="previewImage" :src="previewImage" class="profile-image-modern" />
                            <div v-else class="profile-placeholder-modern">+</div>
                        </label>
                        <input id="image-upload" type="file" accept="image/*" @change="openCropper" class="d-none"
                            :disabled="disabled" />
                        <button v-if="previewImage && !disabled" @click.prevent="removeImage" class="btn btn-sm btn-danger remove-image-btn">&times;</button>
                    </div>
                </div>

                <!-- 🔥 Cropper Modal -->
                <div v-if="showCropper" class="cropper-modal">
                    <div class="cropper-content">
                        <img ref="cropperImage" :src="tempImage" class="w-100" />
                        <div class="d-flex justify-content-end gap-2 mt-2">
                            <button type="button" class="btn btn-sm btn-secondary" @click="cancelCrop">Cancel</button>
                            <button type="button" class="btn btn-sm btn-primary" @click="applyCrop">Crop & Save</button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Select dropdown -->
            <template v-else-if="type === 'select'">
                <select :class="['form-select uniform-input', inputValidationClass]" :value="modelValue"
                    @change="$emit('update:modelValue', $event.target.value)" :disabled="disabled">
                    <option v-if="placeholder" value="">{{ placeholder }}</option>
                    <option v-for="(opt, i) in options" :key="i" :value="opt.value">
                        {{ opt.label }}
                    </option>
                </select>
            </template>

            <!-- Select search dropdown -->
            <template v-else-if="type === 'select-search'">
                <Multiselect v-model="internalValue" :options="options" :searchable="true" :close-on-select="true"
                    :placeholder="`Isikan ` + label + `...`" label="label" track-by="label" class="select-search"
                    :class="inputValidationClass" :disabled="disabled" />
            </template>

            <!-- Multi Select -->
            <template v-else-if="type === 'multi-select'">
                <Multiselect v-model="internalValue" :options="flatOptions" label="label" track-by="label"
                    :searchable="true" :close-on-select="false" :placeholder="`Isikan ` + label + `...`"
                    :multiple="true" mode="tags" class="multiselect select-search" :class="inputValidationClass"
                    :disabled="disabled" />

                <!-- <Multiselect v-model="internalValue" :options="options" :group-label="groupLabel"
                    :group-values="groupValues" label="label" track-by="value" :searchable="true"
                    :close-on-select="false" :placeholder="placeholder || 'Sila Pilih'" :multiple="true"
                    class="multiselect select-search" :class="inputValidationClass" /> -->
            </template>


            <!-- Radio buttons -->
            <template v-else-if="type === 'radio'">
                <div class="d-flex flex-wrap gap-3">
                    <div class="form-check" v-for="(opt, i) in options" :key="i">
                        <input class="form-check-input" type="radio" :id="`radio-${model}-${i}`" :name="model"
                            :value="opt.value" :checked="modelValue === opt.value"
                            @change="$emit('update:modelValue', opt.value)" :disabled="disabled" />
                        <label class="form-check-label" :for="`radio-${model}-${i}`">{{ opt.label }}</label>
                    </div>
                </div>
            </template>

            <!-- Checkbox -->
            <template v-else-if="type === 'checkbox'">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" :id="`checkbox-${model}`" :checked="modelValue"
                        @change="$emit('update:modelValue', $event.target.checked)" :disabled="disabled" />
                    <label class="form-check-label" :for="`checkbox-${model}`">{{ checkboxLabel || label }}</label>
                </div>
            </template>

            <!-- Suggestion Text (Autocomplete from DB) -->
            <template v-else-if="type === 'suggestion-text'">
                <div>
                    <input type="text" :class="['form-control uniform-input', inputValidationClass]"
                        :placeholder="placeholder || 'Taip untuk cadangan...'" v-model="internalQuery" @input="onInput"
                        @focus="showSuggestions = true" :maxlength="maxlength" @blur="hideSuggestions"
                        autocomplete="off" />

                    <ul v-if="showSuggestions && suggestions.length" class="list-group position-absolute w-100 z-3"
                        style="top: 100%; max-height: 200px; overflow-y: auto; max-width: 95%;">
                        <li class="list-group-item list-group-item-action" v-for="(item, index) in suggestions"
                            :key="index" @mousedown.prevent="selectSuggestion(item)">
                            {{ item.label || item }}
                        </li>
                    </ul>
                </div>
            </template>

            <!-- Textarea -->
            <template v-else-if="type === 'textarea'">
                <textarea :class="['form-control', inputValidationClass]" :placeholder="placeholder" :value="modelValue"
                    :readonly="readonly" :disabled="disabled" :maxlength="maxlength"
                    @input="$emit('update:modelValue', $event.target.value)" rows="3">
                </textarea>
            </template>

            <!-- Double (decimal number) input -->
            <template v-else-if="type === 'double'">
                <input type="number" :class="['form-control uniform-input', inputValidationClass]"
                    :placeholder="placeholder" :value="modelValue" :readonly="readonly" :disabled="disabled"
                    :step="decimalStep" @input="handleDecimalInput" @blur="formatDecimalInput" />
            </template>

            <!-- Fallback -->
            <template v-else>
                <input type="text" :class="['form-control uniform-input', inputValidationClass]"
                    :placeholder="placeholder" :value="modelValue" :readonly="readonly" :disabled="disabled"
                    :maxlength="maxlength" @input="$emit('update:modelValue', $event.target.value)" />
            </template>

            <!-- Validation Message -->
            <small v-if="isValid === false" class="text-danger d-block mt-1">
                {{ validationMessage }}
            </small>
        </div>
    </div>
</template>

<script>
import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

export default {
    components: { Multiselect, Datepicker },
    props: {
        info: {
            type: String,
            default: null
        },
        label: String,
        sublabel: String,
        placeholder: String,
        type: { type: String, default: 'text' },
        options: { type: Array, default: () => [] },
        model: String,
        modelValue: {
            type: [String, Number, Boolean, File, Array, Date, Object], // ✅ Add Array here
            default: () => [],
        },
        groupLabel: { type: String, default: null },
        groupValues: { type: String, default: null },
        checkboxLabel: String,
        readonly: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        dateMode: { type: String, default: 'date' },
        maxlength: { type: Number, default: null },
        min: Number,
        max: Number,
        allowDecimal: { type: Boolean, default: true },
        decimalPlaces: { type: Number, default: 2 },
        isValid: { type: Boolean, default: null },
        validationMessage: { type: String, default: '' },
        validationRules: {
            type: Object,
            default: () => ({})
        },
        required: {
            type: Boolean,
            default: false
        },
        fetchSuggestions: {
            type: Function,
            default: null
        }
    },
    computed: {
        internalValue: {
            get() { return this.modelValue; },
            set(value) { this.$emit('update:modelValue', value); }
        },
        resolvedInputType() {
            if (this.type === 'date') {
                if (this.dateMode === 'year') return 'number';
                if (this.dateMode === 'month') return 'month';
                if (this.dateMode === 'datetime') return 'datetime-local';
                return 'date';
            }
            return this.type;
        },
        inputValidationClass() {
            if (this.isValid === true) return 'is-valid';
            if (this.isValid === false) return 'is-invalid';
            return '';
        },
        flatOptions() {
            if (!Array.isArray(this.options)) return [];

            // Check if it's grouped (has group & list)
            const isGrouped = this.options.some(opt => opt.group && Array.isArray(opt.list));

            if (isGrouped) {
                return this.options.flatMap(group =>
                    group.list.map(item => ({
                        ...item,
                        group: group.group
                    }))
                );
            }

            // Already flat
            return this.options;
        }


    },
    data() {
        return {
            previewImage: null,
            cropper: null,
            showCropper: false,
            tempImage: null,
            internalQuery: this.modelValue || '',
            suggestions: [],
            showSuggestions: false,
            debouncedFetchSuggestions: null,
        };
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(newVal) {
                if (this.type === 'suggestion-text') {
                    this.internalQuery = newVal;
                } else {
                    if (typeof newVal === 'string') {
                        this.previewImage = newVal; // backend image URL
                    } else if (newVal instanceof File) {
                        this.readImageFile(newVal); // uploaded file
                    }
                }
            },
        },
    },
    created() {
        if (this.type === 'suggestion-text' && typeof this.fetchSuggestions === 'function') {
            this.debouncedFetchSuggestions = this.debounce(this.fetchSuggestionsWrapper, 300);
        }
    },
    methods: {
        // ================== 🔥 ENHANCED IMAGE CROP & COMPRESS ==================
        openCropper(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.tempImage = e.target.result;
                this.showCropper = true;

                this.$nextTick(() => {
                    if (this.cropper) this.cropper.destroy();
                    this.cropper = new Cropper(this.$refs.cropperImage, {
                        aspectRatio: 1,
                        viewMode: 1,
                        autoCropArea: 1,
                        responsive: true,
                        background: false, // ✅ removes grey mask
                        modal: false       // ✅ removes the faded overlay effect

                    });
                });
            };
            reader.readAsDataURL(file);
        },

        cancelCrop() {
            this.showCropper = false;
            this.tempImage = null;
            if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
            }
        },

        async applyCrop() {
            if (!this.cropper) return;

            const canvas = this.cropper.getCroppedCanvas({
                width: 300,
                height: 300,
            });

            // 🔥 Compress image
            canvas.toBlob(
                (blob) => {
                    const compressedFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

                    this.previewImage = URL.createObjectURL(compressedFile);
                    this.$emit('update:modelValue', compressedFile);

                    this.cancelCrop();
                },
                'image/jpeg',
                0.7 // compression quality (0-1)
            );
        },

        removeImage() {
            this.previewImage = null;
            this.$emit('update:modelValue', null);

            // Reset the file input to allow re-selecting the same file
            const fileInput = document.getElementById('image-upload');
            if (fileInput) {
                fileInput.value = null;
            }
        },
        // ====================================================================

        // handleImageUpload(event) {
        //     const file = event.target.files[0];
        //     if (file) {
        //         this.readImageFile(file);
        //         this.$emit('update:modelValue', file);
        //     }
        // },
        readImageFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewImage = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        handleInput(event) {
            let value = event.target.value;
            if (this.maxlength && value.length > this.maxlength) {
                value = value.slice(0, this.maxlength);
                event.target.value = value;
            }
            this.$emit('update:modelValue', value);
        },
        handleDecimalInput(event) {
            let value = event.target.value;
            if (isNaN(value)) return;
            const parts = value.split('.');
            if (parts.length === 2 && this.decimalPlaces != null) {
                parts[1] = parts[1].slice(0, this.decimalPlaces);
                value = parts[0] + '.' + parts[1];
            }
            this.$emit('update:modelValue', value);
        },
        decimalStep() {
            return this.allowDecimal && this.decimalPlaces
                ? Number((1 / Math.pow(10, this.decimalPlaces)).toFixed(this.decimalPlaces))
                : '1';
        },
        formatDecimalInput(event) {
            let value = parseFloat(event.target.value);
            if (!isNaN(value)) {
                value = value.toFixed(this.decimalPlaces);
                event.target.value = value;
                this.$emit('update:modelValue', value);
            }
        },
        updateValue(value) {
            this.$emit('update:modelValue', value);
        },
        async loadSuggestions() {
            if (!this.internalQuery || this.internalQuery.length < 2) {
                this.suggestions = [];
                return;
            }

            try {
                const response = await fetch(`/api/suggestions?q=${this.internalQuery}`);
                const data = await response.json();
                this.suggestions = data;
            } catch (err) {
                console.error('Failed to fetch suggestions', err);
            }
        },

        async onInput() {
            this.$emit('update:modelValue', this.internalQuery);

            if (this.type !== 'suggestion-text' || typeof this.fetchSuggestions !== 'function') return;

            this.debouncedFetchSuggestions(this.internalQuery);
        },

        async fetchSuggestionsWrapper(query) {
            const data = await this.fetchSuggestions(query);
            this.suggestions = data || [];
            this.showSuggestions = true;
        },

        selectSuggestion(item) {
            this.internalQuery = item.label || item;
            this.$emit('update:modelValue', item.value || item);
            this.showSuggestions = false;
        },

        hideSuggestions() {
            setTimeout(() => {
                this.showSuggestions = false;
            }, 200);
        },

        debounce(func, wait) {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

    }
};
</script>

<style>
.select-search {
    width: 100% !important;
    font-size: small;
    padding: 0 !important;
}

input[type="text"],
[type="number"] {
    font-size: small;
}

.image-upload-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    margin-top: -8px;
}

.remove-image-btn {
    position: absolute;
    top: 0px;
    right: 0px;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
}

.image-upload-label {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.2s ease-in-out;
}

.image-upload-label:hover {
    box-shadow: 0 0 0 3px #ddd;
}

.profile-image-modern {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.profile-placeholder-modern {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #f0f0f0;
    font-size: 2rem;
    color: #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cropper-content .d-flex {
    position: relative;
    z-index: 9999 !important;
}

.cropper-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: 0.99 !important;
    background: #a0a0a01f;
}

.cropper-content {
    background: #ffffff;
    padding: 1rem;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
}

.cropper-content img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
}

.cropper-content .d-flex {
    position: relative;
    z-index: 10;
}

.uniform-input {
    height: 40px !important;
    font-size: 14px;
    padding: 6px 12px;
    box-sizing: border-box;
}

/* Optional if you want to mimic Bootstrap validation colors */
.is-invalid {
    border-color: #dc3545 !important;
}

.is-valid {
    border-color: #198754 !important;
}

:deep(.row.align-items-center) {
    display: flex;
    flex-wrap: wrap;
}

/* Target only select-search type fields */
:deep(.row.align-items-center:has(.select-search)) {
    flex-direction: column;
    align-items: flex-start;
}

:deep(.row.align-items-center:has(.select-search) > .col-sm-4) {
    width: 100%;
    margin-bottom: 0.25rem;
}

:deep(.row.align-items-center:has(.select-search) > .col-sm-8) {
    width: 100%;
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

.list-group-item:hover {
    background-color: #f8f9fa;
    cursor: pointer;
}
</style>
