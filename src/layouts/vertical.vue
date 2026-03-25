<script>
import router from "@/router";

import NavBar from "@/components/nav-bar";
import SideBar from "@/components/side-bar";
import RightBar from "@/components/right-bar";
import Footer from "@/components/footer";

import { useLayoutStore, useAuthStore } from "@/state/pinia";
const layoutStore = useLayoutStore();

/**
 * Vertical layout
 */
export default {
  components: { NavBar, SideBar, RightBar, Footer },
  data() {
    return {
      type: layoutStore.leftSidebarType,
      isMenuCondensed: false,
      isFooterVisible: false,
    };
  },
  computed: {
    auth() {
      return useAuthStore()
    },
    forcePasswordChange() {
      return this.auth.currentUser && this.auth.currentUser.force_password_change;
    },
    layoutWidth() {
      return layoutStore.layoutWidth;
    },
    leftSidebarType() {
      return layoutStore.leftSidebarType;
    },
    loader() {
      return layoutStore.loader;
    },
    mode() {
      return layoutStore.mode
    }
  },
  watch: {
    forcePasswordChange: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          document.body.setAttribute("data-topbar", "dark");
        }
      }
    }
  },
  created() {
    document.body.removeAttribute("data-layout", "horizontal");
    document.body.removeAttribute("data-layout-size", "boxed");
    document.body.classList.remove("auth-body-bg");
  },
  methods: {
    checkScrollable() {
      const mainContent = this.$el.querySelector('.main-content');
      if (mainContent && mainContent.scrollHeight > mainContent.clientHeight) {
        this.isFooterVisible = true;
      } else {
        this.isFooterVisible = false;
      }
    },
    toggleMenu() {
      document.body.classList.toggle("sidebar-enable");

      if (window.screen.width >= 992) {
        // eslint-disable-next-line no-unused-vars
        router.afterEach((routeTo, routeFrom) => {
          document.body.classList.remove("sidebar-enable");
          document.body.classList.remove("vertical-collpsed");
        });
        document.body.classList.toggle("vertical-collpsed");
      } else {
        // eslint-disable-next-line no-unused-vars
        router.afterEach((routeTo, routeFrom) => {
          document.body.classList.remove("sidebar-enable");
        });
        document.body.classList.remove("vertical-collpsed");
      }
      this.isMenuCondensed = !this.isMenuCondensed;
    },
    toggleRightSidebar() {
      document.body.classList.toggle("right-bar-enabled");
    },
    hideRightSidebar() {
      document.body.classList.remove("right-bar-enabled");
    }
  },
  mounted() {
    this.checkScrollable();
    window.addEventListener('resize', this.checkScrollable);
    if (this.loader === true) {
      document.getElementById("preloader").style.display = "block";
      document.getElementById("status").style.display = "block";

      setTimeout(function () {
        document.getElementById("preloader").style.display = "none";
        document.getElementById("status").style.display = "none";
      }, 2500);
    } else {
      document.getElementById("preloader").style.display = "none";
      document.getElementById("status").style.display = "none";
    }
  },
};
</script>

<template>
  <div>
    <div id="preloader">
      <div id="status">
        <div class="spinner-chase">
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
        </div>
      </div>
    </div>
    <div id="layout-wrapper" :class="{ 'force-center': forcePasswordChange, 'layout-fluid': layoutWidth === 'fluid' }">
      <NavBar />
      <SideBar v-if="!forcePasswordChange" :is-condensed="isMenuCondensed" :type="leftSidebarType" :width="layoutWidth"
        :mode="mode" />
      <!-- ============================================================== -->
      <!-- Start Page Content here -->
      <!-- ============================================================== -->

      <div class="main-content d-flex flex-column">
        <div class="page-content flex-grow-1">
          <!-- Start Content-->
          <BContainer fluid>
            <slot />
          </BContainer>
        </div>
        <Footer v-if="isFooterVisible" :layout-width="layoutWidth"/>
      </div>
      <RightBar />
    </div>
  </div>
</template>

<style scoped>
.force-center .main-content {
  margin-left: 0;
}

.force-center .footer {
  left: 0;
}

.force-center .page-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
