<script>
import { MetisMenu } from "metismenujs";
import { menuItems } from "./menu";
import { useAuthStore } from "@/state/pinia";

export default {
  data() {
    return {
      originalMenuItems: menuItems,
      auth: useAuthStore(),
      metis: null,
    };
  },

  watch: {
    // Re-run when permissions update
    "auth.tabPermissions": {
      deep: true,
      immediate: true,
      handler() {
        this.$nextTick(() => {
          if (this.metis) {
            this.metis.dispose?.(); // cleanup previous instance
          }
          if (document.getElementById("side-menu")) {
            this.metis = new MetisMenu("#side-menu");
          }
          this.setActiveMenu();
        });
      },
    },
  },

  computed: {
    currentUser() {
      return this.auth.currentUser || {};
    },

    menuItemsByPermission() {
      const role = (this.currentUser.peranan || "guest").trim().toLowerCase();
      const permissions = this.auth.tabPermissions || [];

      // console.log("role:", role, " permissions:", permissions);

      const checkPermission = (item) => {
        // First check hardcoded roles in menu.js
        if (item.roles && !item.roles.includes(role)) {
          return false;
        }

        // Then check DB permissions
        const perm = permissions.find((p) => p.id === item.id);
        return perm ? perm[role.replace(" ", "")] === true || perm[role] === true : false;
      };

      const filterMenu = (items) => {
        return items
          .filter((item) => item.isTitle || checkPermission(item))
          .map((item) => ({
            ...item,
            subItems: item.subItems ? filterMenu(item.subItems) : [],
          }))
          .filter(
            (item) =>
              item.isTitle ||
              (item.subItems && item.subItems.length > 0) ||
              item.link
          );
      };

      return filterMenu(this.originalMenuItems);
    },
  },

  mounted() {
    if (document.getElementById("side-menu")) {
      this.metis = new MetisMenu("#side-menu");
    }
    this.setActiveMenu();
  },

  methods: {
    hasItems(item) {
      return item.subItems && item.subItems.length > 0;
    },

    toggleMenu(event) {
      event.currentTarget.nextElementSibling.classList.toggle("mm-show");
    },

    setActiveMenu() {
      const links = document.getElementsByClassName("side-nav-link-ref");
      let matchingMenuItem = null;
      const paths = Array.from(links).map((l) => l.pathname);

      let itemIndex = paths.indexOf(window.location.pathname);
      if (itemIndex === -1) {
        const strIndex = window.location.pathname.lastIndexOf("/");
        const item = window.location.pathname.substr(0, strIndex);
        matchingMenuItem = links[paths.indexOf(item)];
      } else {
        matchingMenuItem = links[itemIndex];
      }

      if (matchingMenuItem) {
        matchingMenuItem.classList.add("active");
        let parent = matchingMenuItem.parentElement;

        while (parent && parent.id !== "side-menu") {
          parent.classList.add("mm-active");
          const ul = parent.closest("ul");
          if (ul && ul.id !== "side-menu") {
            ul.classList.add("mm-show");
          }
          parent = parent.parentElement;
        }
      }
    },
  },
};
</script>

<template>
  <div id="sidebar-menu">
    <ul id="side-menu" class="metismenu list-unstyled">
      <template v-for="item in menuItemsByPermission" :key="item.id">
        <li class="menu-title" v-if="item.isTitle">
          {{ $t(item.label) }}
        </li>

        <li v-else>
          <BLink v-if="hasItems(item)" href="javascript:void(0);" class="is-parent"
            :class="{ 'has-arrow': !item.badge, 'has-dropdown': item.badge }">
            <i v-if="item.icon" :class="`bx ${item.icon}`"></i>
            <span>{{ $t(item.label) }}</span>
            <span v-if="item.badge" :class="`badge rounded-pill bg-${item.badge.variant} float-end`">
              {{ $t(item.badge.text) }}
            </span>
          </BLink>

          <router-link v-else :to="item.link" class="side-nav-link-ref">
            <i v-if="item.icon" :class="`bx ${item.icon}`"></i>
            <span>{{ $t(item.label) }}</span>
            <span v-if="item.badge" :class="`badge rounded-pill bg-${item.badge.variant} float-end`">
              {{ $t(item.badge.text) }}
            </span>
          </router-link>

          <ul v-if="hasItems(item)" class="sub-menu" aria-expanded="false">
            <li v-for="(subitem, index) in item.subItems" :key="index">
              <router-link v-if="!hasItems(subitem)" :to="subitem.link" class="side-nav-link-ref">
                <span>{{ $t(subitem.label) }}</span>
                <span v-if="subitem.badge" :class="`badge rounded-pill bg-${subitem.badge.variant} float-end`">
                  {{ $t(subitem.badge.text) }}
                </span>
              </router-link>

              <BLink v-else class="side-nav-link-a-ref has-arrow" href="javascript:void(0);">
                {{ $t(subitem.label) }}
              </BLink>

              <ul v-if="hasItems(subitem)" class="sub-menu mm-collapse" aria-expanded="false">
                <li v-for="(subSubitem, idx) in subitem.subItems" :key="idx">
                  <router-link :to="subSubitem.link" class="side-nav-link-ref">
                    {{ $t(subSubitem.label) }}
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>
