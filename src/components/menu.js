export const menuItems = [
  {
    id: 1,
    label: "menuitems.menu.text",
    isTitle: true,
  },
  {
    id: 2,
    label: "menuitems.dashboards.text",
    icon: "bx-home-circle",
    // link: "/",
    subItems: [
      {
        id: 3,
        label: "menuitems.laman-utama.text",
        link: "/",
        // roles: ['pengguna'],
      },
      {
        id: 4,
        label: "menuitems.statistik-parti.text",
        link: "/statistik-parti",
      },
    ]
  },
  {
    id: 5,
    label: "menuitems.rekod-pelantikan.text",
    icon: "bx-briefcase-alt-2",
    // link: "/senarai-pelantikan",
    subItems: [
      {
        id: 6,
        label: "menuitems.senarai-profil.text",
        link: "/rekod-pelantikan/senarai-profil",
      },
      {
        id: 7,
        label: "menuitems.senarai-pelantikan.text",
        link: "/rekod-pelantikan/senarai-pelantikan/kategori",
      },
      {
        id: 8,
        label: "menuitems.senarai-tamat-tempoh.text",
        link: "/rekod-pelantikan/senarai-tamat-tempoh",
      },
      {
        id: 9,
        label: "menuitems.pengurusan-dokumen-pelantikan.text",
        link: "/rekod-pelantikan/pengurusan-dokumen-pelantikan",
      },
    ],

  },
  {
    id: 10,
    label: "menuitems.carian.text",
    icon: "bx-search",
    link: "/carian/carian-lanjutan",
  },
  {
    id: 11,
    label: "menuitems.dasar-lantikan.text",
    icon: "bx-book",
    link: "/dasar-lantikan/senarai-lantikan",
  },
  {
    id: 12,
    label: "menuitems.notifikasi.text",
    icon: "bx-bell",
    link: "/notifikasi/senarai-notifikasi",
  },
  {
    id: 13,
    label: "menuitems.pentadbir.text",
    isTitle: true,
  },
  {
    id: 14,
    label: "menuitems.pengurusan-sistem.text",
    icon: "bx-wrench",
    subItems: [
      {
        id: 15,
        label: "menuitems.penyelenggaraan-pengguna.text",
        roles: ["pentadbir sistem"],
        subItems: [
          {
            id: 16,
            label: "menuitems.senarai-pengguna.text",
            roles: ["pentadbir sistem"],
            link: "/pentadbir/penyelenggaraan-pengguna/senarai-pengguna",
          },
          {
            id: 17,
            label: "menuitems.daftar-pengguna.text",
            roles: ["pentadbir sistem"],
            link: "/pentadbir/penyelenggaraan-pengguna/daftar-pengguna",
          },
          {
            id: 18,
            label: "menuitems.kemaskini-tab-pengguna.text",
            roles: ["pentadbir sistem"],
            link: "/pentadbir/penyelenggaraan-pengguna/kemaskini-tab-pengguna",
          },
        ],
      },
      {
        id: 19,
        label: "menuitems.penyelenggaraan-kod.text",
        subItems: [
          {
            id: 20,
            label: "menuitems.kategori-pelantikan.text",
            link: "/pentadbir/penyelenggaraan/kategori-pelantikan",
          },
          {
            id: 21,
            label: "menuitems.pelantikan.text",
            link: "/pentadbir/penyelenggaraan/pelantikan",
          },
          {
            id: 24,
            label: "menuitems.keanggotaan.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/jawatan",
          },
          {
            id: 22,
            label: "menuitems.kod-gabungan-parti.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/gabungan-parti",
          },
          {
            id: 23,
            label: "menuitems.kod-parti.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/parti",
          },
        ],

      },
      {
        id: 25,
        label: "menuitems.penyelenggaraan-templat.text",
        subItems: [
          {
            id: 26,
            label: "menuitems.laporan.text",
            icon: "bx-wrench",
            link: "/pentadbir/senarai-laporan",
          },
          {
            id: 27,
            label: "menuitems.senarai.text",
            icon: "bx-wrench",
            link: "/pentadbir/template-senarai",
          },
        ]
      },
      {
        id: 28,
        label: "menuitems.penyelenggaraan-lookup.text",
        subItems: [
          {
            id: 29,
            label: "menuitems.kod-gelaran.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/gelaran",
          },
          {
            id: 30,
            label: "menuitems.kod-bangsa.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/bangsa",

          },
          {
            id: 31,
            label: "menuitems.kod-agama.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/agama",

          },
          {
            id: 32,
            label: "menuitems.kod-negeri.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/negeri",

          },
          {
            id: 33,
            label: "menuitems.kod-bandar.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/bandar",

          },
          {
            id: 34,
            label: "menuitems.kod-poskod.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/poskod",

          },
          // {
          //   id: 35,
          //   label: "menuitems.alamat.text",
          //   icon: "bx-wrench",
          //   link: "/pentadbir/penyelenggaraan/alamat",

          // },
          // {
          //   id: 36,
          //   label: "menuitems.telefon.text",
          //   icon: "bx-wrench",
          //   link: "/pentadbir/penyelenggaraan/telefon",

          // },
          {
            id: 35,
            label: "menuitems.kahwin.text",
            icon: "bx-wrench",
            link: "/pentadbir/penyelenggaraan/status-kahwin",

          },

        ]
      },
      {
        id: 36,
        label: "menuitems.size-file.text",
        icon: "bx-wrench",
        link: "/pentadbir/konfigurasi/saiz-fail",
      },
      // {
      //   id: 36,
      //   label: "menuitems.log-Integrasi.text",
      //   subItems: [
      //     {
      //       id: 37,
      //       label: "menuitems.parlimen-malaysia.text",
      //       icon: "bx-wrench",
      //       link: "/pentadbir/senarai-kod/",
      //     },
      //     {
      //       id: 38,
      //       label: "menuitems.MyPRU.text",
      //       icon: "bx-wrench",
      //       link: "/pentadbir/senarai-kod/",
      //     },
      //     {
      //       id: 39,
      //       label: "menuitems.myParlimen.text",
      //       icon: "bx-wrench",
      //       link: "/pentadbir/senarai-kod/",
      //     },
      //   ]
      // },
      {
        id: 40,
        label: "menuitems.aduan.text",
        icon: "bx-wrench",
        link: "/pentadbir/aduan/tambah-aduan",
      },
      {
        id: 41,
        label: "menuitems.log-aduan.text",
        icon: "bx-wrench",
        link: "/pentadbir/aduan/log-aduan",
      },
      {
        id: 42,
        label: "menuitems.audit-log.text",
        icon: "bx-wrench",
        link: "/pentadbir/audit-log",
      },

    ]
  }
];
