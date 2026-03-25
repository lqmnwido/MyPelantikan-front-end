<script>
// import axios from "axios";
// import simplebar from "simplebar-vue";
import { avatar3, avatar4, avatar1 } from "@/assets/images/users/data"
import { useAuthStore } from '@/state/pinia'
// const auth = useAuthStore()

import i18n from "../i18n";
// const API_URL = process.env.VUE_APP_APIKEY;
/**
 * Nav-bar Component
 */
export default {
  data() {
    return {
      lang: "en",
      lan: i18n.locale,
      text: null,
      flag: null,
      value: null,
      avatar3, avatar4, avatar1,
      languages: [
        {
          flag: require("@/assets/images/flags/us.jpg"),
          language: "en",
          title: "English",
        },
        {
          flag: require("@/assets/images/flags/french.jpg"),
          language: "fr",
          title: "French",
        },
        {
          flag: require("@/assets/images/flags/spain.jpg"),
          language: "es",
          title: "Spanish",
        },
        {
          flag: require("@/assets/images/flags/chaina.png"),
          language: "zh",
          title: "Chinese",
        },
        {
          flag: require("@/assets/images/flags/arabic.png"),
          language: "ar",
          title: "Arabic",
        },
      ],
      locales: ["fr", "en", "ar"]
    };
  },
  components: {},
  mounted() {
    if (process.env.VUE_APP_I18N_LOCALE) {
      this.flag = this.$i18n.locale || process.env.VUE_APP_I18N_LOCALE;
      this.languages.forEach((item) => {
        if (item.language == this.flag) {
          document.getElementById("header-lang-img")?.setAttribute("src", item.flag);
        }
      });
    }
  },
  computed: {
    auth() {
      return useAuthStore()
    },
    forcePasswordChange() {
      return this.auth.currentUser && this.auth.currentUser.force_password_change;
    },
    currentUser() {
      const auth = useAuthStore()
      // console.log("currentUser from store:", auth.currentUser.peranan)
      return auth.currentUser;
    }
  },
  methods: {
    toggleMenu() {
      this.$parent.toggleMenu();
    },
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
    },
    initFullScreen() {
      document.body.classList.toggle("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        /* alternative standard method */ !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },

    setLanguage(locale, country, flag) {
      this.lan = locale;
      this.text = country;
      this.flag = flag;
      document.getElementById("header-lang-img").setAttribute("src", flag);
      this.$i18n.locale = locale
    },

    logout() {
      const auth = useAuthStore();
      auth.logOut();
      this.$router.push("/login");
    },
  },
};
</script>

<template>
  <header id="page-topbar">
    <div class="navbar-header">
      <div class="d-flex">
        <!-- LOGO -->
        <div class="navbar-brand-box">
          <router-link to="/" class="logo logo-dark">
            <span class="logo-sm">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg" alt="MyPelantikan Logo"
                style="height: 20px; width: auto;" />
            </span>
            <span class="logo-lg">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg" alt="MyPelantikan Logo"
                style="height: 40px; width: auto;" />
              <span>MyPelantikan</span>
            </span>
          </router-link>

          <router-link to="/" class="logo logo-light">
            <span class="logo-sm">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg" alt="MyPelantikan Logo"
                style="height: 20px; width: auto;" />
            </span>
            <span class="logo-lg">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg" alt="MyPelantikan Logo"
                style="height: 40px; width: auto;" />
              <span
                style="color: white; font-size: 20px; font-family: Arial, Helvetica, serif; padding:10px;">MyPelantikan</span>
            </span>
          </router-link>
        </div>

        <BButton variant="white" v-if="!forcePasswordChange" id="vertical-menu-btn" type="button" class="btn btn-sm px-3 font-size-16 header-item"
          @click="toggleMenu">
          <i class="fa fa-fw fa-bars"></i>
        </BButton>
      </div>

      <div class="d-flex">
        <BDropdown class="d-inline-block d-lg-none ms-2 job-list-dropdown" variant="black"
          menu-class="dropdown-menu-lg p-0" toggle-class="header-item noti-icon" right>
          <template v-slot:button-content>
            <i class="mdi mdi-magnify"></i>
          </template>

          <BForm class="p-3">
            <div class="form-group m-0">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Search ..." aria-label="Recipient's username" />
                <div class="input-group-append">
                  <BButton variant="primary" type="submit">
                    <i class="mdi mdi-magnify"></i>
                  </BButton>
                </div>
              </div>
            </div>
          </BForm>
        </BDropdown>



        <BDropdown right variant="black" toggle-class="header-item" menu-class="dropdown-menu-end">
          <template v-slot:button-content>
            <img class="rounded-circle header-profile-user" :src="avatar1" alt="Header Avatar" />
            <span class="d-none d-xl-inline-block ms-1">
              <div v-if="currentUser" class="text-uppercase">
                {{ currentUser.nama }} - {{ currentUser.peranan }}
              </div>
              <div v-else>Admin</div>
            </span>
            <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
          </template>
          <BDropdownItem>
            <router-link to="/profile/biodata?view" v-slot="{ navigate }">
              <span @click="navigate" @keypress.enter="navigate" tabindex="0" class="text-body" role="link">
                <i class="bx bx-user font-size-16 align-middle me-1"></i>
                {{ $t("navbar.dropdown.henry.list.profile") }}
              </span>
            </router-link>
          </BDropdownItem>
          <BDropdownItem>
            <router-link to="/profile/kemaskini-kata-laluan" v-slot="{ navigate }">
              <span @click="navigate" @keypress.enter="navigate" tabindex="0" class="text-body" role="link">
                <i class="bx bx-lock-open font-size-16 align-middle me-1"></i>
                {{ $t("navbar.dropdown.henry.list.changePassword") }}
              </span>
            </router-link>
          </BDropdownItem>
          <BDropdownDivider></BDropdownDivider>
          <BDropdownItem @click="logout" class="dropdown-item text-danger">
            <i class="bx bx-power-off font-size-16 align-middle me-1 text-danger"></i>
            {{ $t("navbar.dropdown.henry.list.logout") }}
          </BDropdownItem>
        </BDropdown>
      </div>
    </div>
  </header>
</template>
