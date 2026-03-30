import { useAuthStore, } from "@/state/pinia";
import NotFound from '@/views/utility/404.vue';
export default [

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },

  // Dashboard
  {
    path: "/",
    name: "default",
    meta: { title: "Dashboard", authRequired: true },
    component: () => import("../views/dashboards/default"),
  },
  //statistik Parti
  {
    path: "/statistik-parti",
    name: "statistik",
    meta: { title: "Statistik", authRequired: true },
    component: () => import("../views/dashboards/statistik-parti"),
  },

  // Pelantikan Routes
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori",
    name: "senarai-pelantikan/kategori",
    meta: { title: "Senarai Pelantikan", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/senarai-kategori"),
  },

  {
    path: "/rekod-pelantikan/maklumat-resume",
    name: "maklumat-resume",
    meta: { title: "Resume", authRequired: true },
    component: () => import("../views/rekod-pelantikan/resume/maklumat-resume"),
  },
  //MRR - SCP Routes
  {
    path: "/rekod-pelantikan/pengurusan-dokumen-pelantikan",
    name: "pengurusan-dokumen-pelantikan",
    meta: { title: "Pengerusan Dokumen lantikan", authRequired: true },
    component: () => import("../views/rekod-pelantikan/pengurusan-dokumen-pelantikan/pengurusan-dokumen-pelantikan"),
  },

  // Carian Routes
  {
    path: "/carian/carian-lanjutan",
    name: "carian-lanjutan",
    meta: { title: "Carian Lanjutan", authRequired: true },
    component: () => import("@/views/carian/carian-lanjutan"),
  },

  //Dasar Lantikan Routes
  {
    path: "/dasar-lantikan/senarai-lantikan",
    name: "senarai-lantikan",
    meta: { title: "Senarai Dasar Lantikan", authRequired: true },
    component: () => import("../views/dasar-lantikan/senarai-lantikan"),
  },
  {
    path: "/dasar-lantikan/senarai-lantikan/tambah-dokumen",
    name: "tambah-dokumen-lantikan",
    meta: { title: "Tambah Dokumen Lantikan", authRequired: true },
    component: () => import("../views/dasar-lantikan/tambah-lantikan.vue"),
  },

  // Rekod pelantikan Routes
  //ADN
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/ahli-dewan-negara",
    name: "ahli-dewan-negara/ahli-dewan-negara",
    meta: { title: "Senarai Ahli Dewan Negara", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/adn/senarai-adn.vue"),
  },
  //tambah ahli ADN
  {
    path: "/rekod-pelantikan/ahli-dewan-negara/tambah-ahli",
    name: "ahli-dewan-negara/tambah-ahli",
    meta: { title: "Tambah Ahli Dewan Negara", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/adn/lantik-ahli-adn.vue"),
  },

  //KEHAKIMAN
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/kehakiman",
    name: "senarai-kehakiman",
    meta: { title: "Senarai Kehakiman", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/kehakiman/senarai-kehakiman.vue"),
  },

  //tambah ahli HMR
  {
    path: "/rekod-pelantikan/kehakiman/tambah-ahli/hmr",
    name: "kehakiman/tambah-ahli/HMR",
    meta: { title: "Tambah Ahli Kehakiman Rayuan", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/kehakiman/lantik-ahli-hmr.vue"),
  },
  {
    path: "/rekod-pelantikan/kehakiman/tambah-ahli/hmt",
    name: "kehakiman/tambah-ahli/HMT",
    meta: { title: "Tambah Ahli Kehakiman Tinggi", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/kehakiman/lantik-ahli-hmt.vue"),
  },
  {
    path: "/rekod-pelantikan/kehakiman/tambah-ahli/hmp",
    name: "kehakiman/tambah-ahli/HMP",
    meta: { title: "Tambah Ahli Kehakiman Persekutuan", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/kehakiman/lantik-ahli-hmp.vue"),
  },

  //SURUHANJAYA
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/suruhanjaya",
    name: "senarai-suruhanjaya",
    meta: { title: "Senarai Suruhanjaya", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/suruhanjaya/senarai-suruhanjaya.vue"),
  },

  {
    path: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spa",
    name: "suruhanjaya/tambah-ahli/spa",
    meta: { title: "Tambah Ahli Suruhanjaya Perkhidmatan Awam", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/suruhanjaya/lantik-ahli-spa.vue"),
  },
  {
    path: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spr",
    name: "suruhanjaya/tambah-ahli/spr",
    meta: { title: "Tambah Ahli Suruhanjaya Pilihan Raya", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/suruhanjaya/lantik-ahli-spr.vue"),
  },
  {
    path: "/rekod-pelantikan/suruhanjaya/tambah-ahli/spkp",
    name: "suruhanjaya/tambah-ahli/spkp",
    meta: { title: "Tambah Ahli Suruhanjaya Perkhidmatan Kehakiman dan Perundangan", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/suruhanjaya/lantik-ahli-spkp.vue"),
  },
  //Lembaga

  // Lembaga Penasihat
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/lembaga-penasihat",
    name: "senarai-lembaga-penasihat",
    meta: { title: "Senarai Lembaga Penasihat", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/lembaga/senarai-lembaga-penasihat"),
  },
  {
    path: "/rekod-pelantikan/lembaga/tambah-ahli/lpjpm",
    name: "lembaga/tambah-ahli/lpjpm",
    meta: { title: "Tambah Ahli Lembaga Penasihat Jabatan Perdana Menteri", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/lembaga/lantik-ahli-lpjpm.vue"),
  },
  // Lembaga Pengampunan
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/lembaga-pengampunan",
    name: "senarai-lembaga-pengampunan",
    meta: { title: "Senarai Lembaga Pengampunan", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/lembaga/senarai-lembaga-pengampunan"),
  },
  {
    path: "/rekod-pelantikan/lembaga/tambah-ahli/lpwp",
    name: "lembaga/tambah-ahli/lpwp",
    meta: { title: "Tambah Ahli Lembaga Pengampunan Wilayah Persekutuan", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/lembaga/lantik-ahli-lpwp.vue"),
  },

  // Tuan Yang Terumata
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/tuan-yang-terutama",
    name: "senarai-tuan-yang-terutama",
    meta: { title: "Senarai Tuan Yang Terutama", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/tuan-yang-terutama/senarai-tuan-yang-terutama.vue"),
  },
  {
    path: "/rekod-pelantikan/tuan-yang-terutama/tambah-ahli",
    name: "tuan-yang-terutama/tambah-ahli",
    meta: { title: "Tambah Ahli Lembaga Pengampunan Wilayah Persekutuan", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/tuan-yang-terutama/lantik-ahli-tyt.vue"),
  },

  // Akta-akta
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/nfcc",
    name: "senarai-nfcc",
    meta: { title: "Senarai NFCC", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/akta-akta/senarai-nfcc.vue"),
  },
  {
    path: "/rekod-pelantikan/akta-akta/tambah-ahli/nfcc",
    name: "akta-akta/tambah-ahli/nfcc",
    meta: { title: "Tambah Ahli NFCC", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-pelantikan/akta-akta/lantik-ahli-nfcc.vue"),
  },

  // CV - Profile Routes
  {
    path: "/rekod-pelantikan/senarai-profil",
    name: "senarai-profil",
    meta: { title: "Senarai Profil", authRequired: true },
    component: () => import("../views/rekod-pelantikan/profil/senarai-profil.vue"),
  },

  {
    path: "/rekod-pelantikan/senarai-profil/calon",
    name: "profil/tambah-calon",
    meta: { title: "Tambah Ahli", authRequired: true },
    component: () => import("../views/rekod-pelantikan/profil/tambah-ahli"),
  },

  //Profile
  {
    path: "/profile/biodata",
    name: "profile/biodata",
    meta: { title: "Profil Biodata", authRequired: true },
    component: () => import("../views/account/profile"),
  },

  //Profile
  {
    path: "/profile/kemaskini-kata-laluan",
    name: "profile/kemaskini-kata-laluan",
    meta: { title: "Kemaskini Kata Laluan", authRequired: true },
    component: () => import("../views/account/kemaskini-kata-laluan"),
  },


  //Profile
  {
    path: "/profile",
    name: "profile",
    meta: { title: "Profil", authRequired: true },
    component: () => import("../views/rekod-pelantikan/profil/papar-profil.vue"),
  },
  // Tamat Tempoh Routes
  {
    path: "/rekod-pelantikan/senarai-tamat-tempoh",
    name: "senarai-tamat-tempoh",
    meta: { title: "Senarai Tamat Tempoh", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-tamat-tempoh/senarai-tamat-tempoh.vue"),
  },
  {
    path: "/rekod-pelantikan/senarai-tamat-tempoh/tambah-rekod",
    name: "tambah-rekod-tamat-tempoh",
    meta: { title: "Tambah Rekod Tamat Tempoh", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-tamat-tempoh/tambah-rekod.vue"),
  },
  {
    path: "/rekod-pelantikan/senarai-tamat-tempoh/kemaskini-tamat-tempoh",
    name: "kemaskini-tamat-tempoh",
    meta: { title: "Kemaskini Tamat Tempoh", authRequired: true },
    component: () => import("../views/rekod-pelantikan/senarai-tamat-tempoh/kemaskini-tamat-tempoh.vue"),
  },
  //Notifikasi Routes
  {
    path: "/notifikasi/senarai-notifikasi",
    name: "senarai-notifikasi",
    meta: { title: "Senarai Notifikasi", authRequired: true },
    component: () => import("../views/notifikasi/senarai-notifikasi"),
  },

  // Pentadbir Routes
  {
    path: "/pentadbir/penyelenggaraan/gabungan-parti",
    name: "senarai-gabungan-parti",
    meta: { title: "Senarai Gabungan Parti", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-kod/lkp-gabungan-parti"),
  },

  {
    path: "/pentadbir/konfigurasi/saiz-fail",
    name: "konfigurasi-saiz-fail",
    meta: { title: "Konfigurasi Saiz Fail", authRequired: true },
    component: () => import("@/views/pentadbir/konfigurasi-saiz-fail/konfigurasi-saiz-fail"),
  },

  {
    path: "/pentadbir/penyelenggaraan/parti",
    name: "senarai-parti",
    meta: { title: "Senarai Parti", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-kod/lkp-parti"),
  },

  {
    path: "/pentadbir/penyelenggaraan/kategori-pelantikan",
    name: "senarai-kod-kategori-pelantikan",
    meta: { title: "Senarai Kod Kategori Pelantikan", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-kod/lkp-kategori-pelantikan"),
  },

  {
    path: "/pentadbir/penyelenggaraan/pelantikan",
    name: "senarai-kod-pelantikan",
    meta: { title: "Senarai Kod Pelantikan", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-kod/lkp-jenis-pelantikan"),
  },

  {
    path: "/pentadbir/penyelenggaraan/jawatan",
    name: "senarai-jawatan",
    meta: { title: "Senarai Jawatan", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-kod/lkp-jawatan"),
  },

  //lookup
  {
    path: "/pentadbir/penyelenggaraan/agama",
    name: "senarai-agama",
    meta: { title: "Senarai Kod Agama", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-agama"),
  },
  {
    path: "/pentadbir/penyelenggaraan/bangsa",
    name: "senarai-bangsa",
    meta: { title: "Senarai Kod Bangsa", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-bangsa"),
  },
  {
    path: "/pentadbir/penyelenggaraan/gelaran",
    name: "senarai-gelaran",
    meta: { title: "Senarai Kod Gelaran", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-gelaran"),
  },
  {
    path: "/pentadbir/penyelenggaraan/negeri",
    name: "senarai-negeri",
    meta: { title: "Senarai Kod Negeri", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-negeri"),
  },
  {
    path: "/pentadbir/penyelenggaraan/bandar",
    name: "senarai-bandar",
    meta: { title: "Senarai Kod Bandar", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-bandar"),
  },
  {
    path: "/pentadbir/penyelenggaraan/poskod",
    name: "senarai-poskod",
    meta: { title: "Senarai Poskod", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-poskod"),
  },
  {
    path: "/pentadbir/penyelenggaraan/alamat",
    name: "senarai-alamat",
    meta: { title: "Senarai Alamat", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-alamat"),
  },
  {
    path: "/pentadbir/penyelenggaraan/telefon",
    name: "senarai-telefon",
    meta: { title: "Senarai Telefon", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-telefon"),
  },
  {
    path: "/pentadbir/penyelenggaraan/status-kahwin",
    name: "senarai-status-kahwin",
    meta: { title: "Senarai Status Kahwin", authRequired: true },
    component: () => import("../views/pentadbir/lookup/lkp-status-kahwin"),
  },

  // Template Laporan Routes
  {
    path: "/pentadbir/template-laporan-adn",
    name: "template-laporan-adn",
    meta: { title: "Template Laporan ADN", authRequired: true },
    component: () => import("../views/pentadbir/template-laporan/template-laporan-adn"),
  },

  // Template Laporan HMR Routes
  {
    path: "/pentadbir/template-laporan-hmr",
    name: "template-laporan-hmr",
    meta: { title: "Template Laporan HMR", authRequired: true },
    component: () => import("../views/pentadbir/template-laporan/template-laporan-hmr"),
  },

  // Template Laporan 
  {
    path: "/pentadbir/senarai-laporan/template-laporan",
    name: "template-laporan",
    meta: { title: "Template Laporan", authRequired: true },
    component: () => import("../views/pentadbir/template-laporan/template-laporan"),
  },

  // Laporan Render 
  {
    path: "/pentadbir/laporan",
    name: "laporan",
    meta: { title: "Laporan", authRequired: true },
    component: () => import("../views/pentadbir/template-laporan/laporan"),
  },

  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/laporan",
    name: "senarai-pelantikan/laporan",
    meta: { title: "Laporan", authRequired: true },
    component: () => import("../views/pentadbir/template-laporan/laporan"),
  },


  // Laporan Render 
  {
    path: "/pentadbir/senarai-laporan",
    name: "senarai-laporan",
    meta: { title: "Senarai Laporan", authRequired: true },
    component: () => import("../views/pentadbir/template-laporan/senarai-laporan"),
  },



  // Template Senarai
  {
    path: "/pentadbir/template-senarai/template",
    name: "template-senarai",
    meta: { title: "Templat Senarai", authRequired: true },
    component: () => import("../views/pentadbir/template-senarai/template-senarai"),
  },

  // Template Lantik Ahli
  {
    path: "/pentadbir/template-senarai/lantik-ahli",
    name: "lantik-ahli",
    meta: { title: "Lantik Ahli", authRequired: true },
    component: () => import("../views/pentadbir/template-senarai/lantik-ahli"),
  },

  // Template Lantik Ahli
  {
    path: "/pentadbir/template-senarai/lantik-ahli",
    name: "lantik-ahli",
    meta: { title: "Lantik Ahli", authRequired: true },
    component: () => import("../views/pentadbir/template-senarai/lantik-ahli"),
  },

  // Template Lantik Ahli
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/lantik-ahli",
    name: "senarai-pelantikan-lantik-ahli",
    meta: { title: "Senarai Pelantikan Lantik Ahli", authRequired: true },
    component: () => import("../views/pentadbir/template-senarai/lantik-ahli"),
  },

  // Template Senarai Papar
  {
    path: "/rekod-pelantikan/senarai-pelantikan/kategori/papar",
    name: "kategori-senarai",
    meta: { title: "Kategori Senarai", authRequired: true },
    component: () => import("../views/pentadbir/template-senarai/papar-senarai.vue"),
  },
  // Template Senarai Papar
  {
    path: "/pentadbir/template-senarai/papar",
    name: "template-senarai/papar",
    meta: { title: "Papar Templat Senarai", authRequired: true },
    component: () => import("../views/pentadbir/template-senarai/papar-senarai.vue"),
  },


  // Template Senarai Rekod Pelantikan
  {
    path: "/pentadbir/template-senarai",
    name: "template-senarai/rekod-pelantikan",
    meta: { title: "Senarai Rekod Pelantikan", authRequired: true },
    component: () => import("../views/pentadbir/template-senarai/senarai-templat.vue"),
  },


  //Penyelenggaraan Pengguna

  {
    path: "/pentadbir/penyelenggaraan-pengguna/daftar-pengguna",
    name: "daftar-pengguna",
    meta: { title: "Daftar Pengguna", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-pengguna/daftar-pengguna"),
  },

  {
    path: "/pentadbir/penyelenggaraan-pengguna/senarai-pengguna",
    name: "senarai-pengguna",
    meta: { title: "Senarai Pengguna", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-pengguna/senarai-pengguna"),
  },

  {
    path: "/pentadbir/penyelenggaraan-pengguna/senarai-pengguna/kemaskini-kata-laluan",
    name: "kemaskini-kata-laluan",
    meta: { title: "Kemaskini Kata Laluan", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-pengguna/kemaskini-kata-laluan"),
  },

  {
    path: "/pentadbir/penyelenggaraan-pengguna/kemaskini-tab-pengguna",
    name: "kemaskini-tab-pengguna",
    meta: { title: "Kemaskini Tab Pengguna", authRequired: true },
    component: () => import("../views/pentadbir/penyelenggaraan-pengguna/kemaskini-tab-pengguna"),
  },

  {
    path: "/pentadbir/aduan/log-aduan",
    name: "log-aduan",
    meta: { title: "Log Aduan", authRequired: true },
    component: () => import("../views/pentadbir/aduan/log-aduan"),
  },

  {
    path: "/pentadbir/audit-log",
    name: "audit-log",
    meta: { title: "Log Audit", authRequired: true },
    component: () => import("../views/pentadbir/audit-log"),
  },

  {
    path: "/pentadbir/aduan/tambah-aduan",
    name: "tambah-aduan",
    meta: { title: "Tambah Aduan", authRequired: true },
    component: () => import("@/views/pentadbir/aduan/tambah-aduan"),
  },

  {
    path: "/login",
    name: "login",
    component: () => import("../views/account/login"),
    meta: {
      title: "Login",
      beforeResolve(routeTo, routeFrom, next) {
        const auth = useAuthStore();
        // If the user is already logged in
        // if (store.getters["auth/loggedIn"]) {
        if (auth.loggedIn) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  // {
  //   path: "/register",
  //   name: "Register",
  //   component: () => import("../views/account/register"),
  //   meta: {
  //     title: "Register",
  //     beforeResolve(routeTo, routeFrom, next) {
  //       const auth = useAuthStore();
  //       // If the user is already logged in
  //       // if (store.getters["auth/loggedIn"]) {
  //       if (auth.loggedIn) {
  //         // Redirect to the home page instead
  //         next({ name: "default" });
  //       } else {
  //         // Continue to the login page
  //         next();
  //       }
  //     },
  //   },
  // },
  {
    path: "/forgot-password",
    name: "Forgot password",
    component: () => import("../views/account/forgot-password"),
    meta: {
      title: "Forgot password",
      beforeResolve(routeTo, routeFrom, next) {
        const auth = useAuthStore();
        // If the user is already logged in
        // if (store.getters["auth/loggedIn"]) {
        if (auth.loggedIn) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/reset-password",
    name: "Reset password",
    component: () => import("../views/account/reset-password"),
    meta: {
      title: "Reset password",
      beforeResolve(routeTo, routeFrom, next) {
        const auth = useAuthStore();
        // If the user is already logged in
        // if (store.getters["auth/loggedIn"]) {
        if (auth.loggedIn) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },

  {
    path: "/logout",
    name: "logout",
    component: () => import("../views/account/logout"),
    meta: {
      title: "Logout",
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        const auth = useAuthStore();
        // const authFake = useAuthFakeStore();

        if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
          auth.logOut();
        } else {
          auth.logOut();
        }
        const authRequiredOnPreviousRoute = routeFrom.matched.some((route) =>
          route.push("/login")
        );
        // Navigate back to previous page, or home as a fallback
        next(
          authRequiredOnPreviousRoute ? { name: "default" } : { ...routeFrom }
        );
      },
    },
  },
  // Redirect any unmatched routes to the 404 page. This may
  // require some server configuration to work in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  // {
  //   path: "*",
  //   redirect: "404",
  // },

  {
    path: "/pages/starter",
    name: "Starter",
    meta: { title: "Starter Page", authRequired: true },
    component: () => import("../views/utility/starter"),
  },
  {
    path: "/pages/maintenance",
    name: "Maintenance",
    meta: { title: "Maintenance Page", authRequired: true },
    component: () => import("../views/utility/maintenance"),
  },
  {
    path: "/pages/coming-soon",
    name: "coming-soon",
    meta: { title: "Coming Soon", authRequired: true },
    component: () => import("../views/utility/coming-soon"),
  },
  {
    path: "/pages/timeline",
    name: "Timeline",
    meta: { title: "Timeline", authRequired: true },
    component: () => import("../views/utility/timeline"),
  },
  {
    path: "/pages/faqs",
    name: "FAQs",
    meta: { title: "FAQs", authRequired: true },
    component: () => import("../views/utility/faqs"),
  },
  {
    path: "/pages/pricing",
    name: "Pricing",
    meta: { title: "Pricing", authRequired: true },
    component: () => import("../views/utility/pricing"),
  },
  {
    path: "/pages/404",
    name: "Error-404",
    meta: { title: "404 Error Page", authRequired: true },
    component: () => import("../views/utility/404"),
  },
  {
    path: "/pages/403",
    name: "Error-403",
    meta: { title: "403 Error Page", authRequired: true },
    component: () => import("../views/utility/403"),
  },
  {
    path: "/pages/500",
    name: "Error-500",
    meta: { title: "500 Error Page", authRequired: true },
    component: () => import("../views/utility/500"),
  },
  {
    path: "/auth/login-1",
    name: "Login sample",
    meta: { title: "Login", authRequired: true },
    component: () => import("../views/sample-pages/login-sample"),
  },
  {
    path: "/auth/login-2",
    name: "Login-2-sample",
    meta: { title: "Login 2", authRequired: true },
    component: () => import("../views/sample-pages/login-2"),
  },
  {
    path: "/auth/register-1",
    name: "Register sample",
    meta: { title: "Register", authRequired: true },
    component: () => import("../views/sample-pages/register-sample"),
  },
  {
    path: "/auth/register-2",
    name: "Register-2",
    meta: { title: "Register 2", authRequired: true },
    component: () => import("../views/sample-pages/register-2"),
  },
  {
    path: "/auth/recoverpwd",
    name: "Recover pwd",
    meta: { title: "Recover Password", authRequired: true },
    component: () => import("../views/sample-pages/recoverpw-sample"),
  },
  {
    path: "/auth/recoverpwd-2",
    name: "Recover pwd-2",
    meta: { title: "Recover Password 2", authRequired: true },
    component: () => import("../views/sample-pages/recoverpwd-2"),
  },
  {
    path: "/auth/lock-screen",
    name: "Lock screen",
    meta: { title: "Lock Screen", authRequired: true },
    component: () => import("../views/sample-pages/lockscreen"),
  },
  {
    path: "/auth/lock-screen-2",
    name: "Lock screen-2",
    meta: { title: "Lock Screen 2", authRequired: true },
    component: () => import("../views/sample-pages/lockscreen-2"),
  },
  {
    path: "/auth/confirm-mail",
    name: "confirm-mail",
    meta: { title: "Confirm Email", authRequired: true },
    component: () => import("../views/sample-pages/confirm-mail"),
  },
  {
    path: "/auth/confirm-mail-2",
    name: "confirm-mail-2",
    meta: { title: "Confirm Email 2", authRequired: true },
    component: () => import("../views/sample-pages/confirm-mail-2"),
  },
  {
    path: "/auth/email-verification",
    name: "email-verification",
    meta: { title: "Email Verification", authRequired: true },
    component: () => import("../views/sample-pages/email-verification"),
  },
  {
    path: "/auth/email-verification-2",
    name: "email-verification-2",
    meta: { title: "Email Verification 2", authRequired: true },
    component: () => import("../views/sample-pages/email-verification-2"),
  },
  {
    path: "/auth/two-step-verification",
    name: "two-step-verification",
    meta: { title: "Two Step Verification", authRequired: true },
    component: () => import("../views/sample-pages/two-step-verification"),
  },
  {
    path: "/auth/two-step-verification-2",
    name: "two-step-verification-2",
    meta: { title: "Two Step Verification 2", authRequired: true },
    component: () => import("../views/sample-pages/two-step-verification-2"),
  },
];
