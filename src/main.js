import { createApp } from 'vue'

import App from './App.vue'
import router from "./router";
import VueApexCharts from "vue3-apexcharts";
import vClickOutside from "click-outside-vue3";
import { registerScrollSpy } from 'vue3-scroll-spy';

// import Vue3FormWizard from 'vue3-form-wizard';
// import 'vue3-form-wizard/dist/style.css';

import { vMaska } from "maska"
import i18n from "./i18n"
import { initFirebaseBackend } from './authUtils'
import { configureFakeBackend } from './helpers/fake-backend';

import BootstrapVueNext from 'bootstrap-vue-next'
import 'ion-rangeslider/css/ion.rangeSlider.min.css';

import '@toast-ui/editor/dist/toastui-editor.css';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import "@/assets/scss/app.scss";
import "@vueform/multiselect/themes/default.css"
import 'vue3-select/dist/vue3-select.css';

import $ from "jquery";
window.$ = $;
window.jQuery = $;

import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css';
import "@vueup/vue-quill/dist/vue-quill.snow.css";


// PINIA
import pinia from '@/state/pinia'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_APIKEY,
  authDomain: process.env.VUE_APP_AUTHDOMAIN,
  databaseURL: process.env.VUE_APP_VUE_APP_DATABASEURL,
  projectId: process.env.VUE_APP_PROJECTId,
  storageBucket: process.env.VUE_APP_STORAGEBUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGINGSENDERID,
  appId: process.env.VUE_APP_APPId,
  measurementId: process.env.VUE_APP_MEASUREMENTID
};

if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
  initFirebaseBackend(firebaseConfig);
} else {
  configureFakeBackend();
}

createApp(App)
  .use(pinia)
  .use(router)
  .use(require('vue-chartist'))
  .use(BootstrapVueNext)
  .use(VueApexCharts)
  .use(vClickOutside)
  .use(i18n)
  .use(registerScrollSpy)
  .directive("maska", vMaska)
  .mount('#app')
  