<template>
    <div class="container-fluid">
        <div class="card p-4 shadow-sm">
            <h5 class="mb-4">{{ topicLabel }}</h5>
            <div>
                <!-- Wizard Navigation -->
                <div class="wizard-nav bg-light p-3 mb-4 d-flex" :class="wizardAlignmentClass">
                    <div v-for="(step, index) in steps" :key="index" class="wizard-step d-flex align-items-center"
                        :class="{ active: index === stepIndex }">
                        <div v-if="steps.length > 1">
                            <div class="step-circle">{{ index + 1 }}.</div>
                        </div>

                        <div class="step-title">{{ step.title }}</div>
                    </div>
                </div>

                <!-- Wizard Form Content -->
                <form @submit.prevent="handleSubmit">
                    <slot :stepIndex="stepIndex" />

                    <div class="d-flex justify-content-end mt-4 gap-2">
                        <button type="button" class="btn btn-light" @click="stepIndex === 0 ? goBack() : prevStep()">
                            {{ stepIndex === 0 ? 'Back' : 'Previous' }}
                        </button>

                        <button v-if="stepIndex < steps.length - 1" type="button" class="btn btn-primary"
                            @click="nextStep">
                            Next
                        </button>

                        <button v-else type="submit" class="btn btn-success">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        steps: Array,
        formData: Object,
        topicLabel: {
            type: String,
            default: "Biodata",
        },
    },
    data() {
        return {
            stepIndex: 0,
        };
    },
    computed: {
        wizardAlignmentClass() {
            if (this.steps.length === 1) return 'justify-content-center';
            if (this.steps.length === 2) return 'justify-content-around';
            return 'justify-content-between';
        },
    },
    methods: {
        nextStep() {
            if (this.stepIndex < this.steps.length - 1) this.stepIndex++;
        },
        prevStep() {
            if (this.stepIndex > 0) this.stepIndex--;
        },
        goBack() {
            const from = this.$route.query.from;
            if (from) {
                this.$router.push(from);
            } else {
                this.$router.back();
            }
        },
        handleSubmit() {
            this.$emit("submit", this.formData);
        },
    },
};
</script>

<style scoped>
.wizard-step {
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    padding: 10px 15px;
}

.step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: transparent;
    border: 2px solid #556ee6;
    color: #556ee6;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
}

.step-title {
    font-weight: 500;
    color: #495057;
}

.wizard-step.active .step-circle {
    background-color: #556ee6;
    color: white;
}

.wizard-step.active .step-title {
    font-weight: bold;
}
</style>
