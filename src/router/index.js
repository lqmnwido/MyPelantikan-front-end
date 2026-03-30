import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "@/state/pinia";
import { menuItems } from "@/components/menu";
import routes from "./routes";
import appConfig from "../app.config.json";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});

// Before each route evaluates...
router.beforeEach((routeTo, routeFrom, next) => {
  const auth = useAuthStore();

  if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
    // Check if auth is required on this route
    // (including nested routes).
    const authRequired = routeTo.matched.some(
      (route) => route.meta.authRequired
    );

    // If auth isn't required for the route, just continue.
    if (!authRequired) return next();

    // If auth is required and the user is logged in...
    if (auth.loggedIn) {
      // Validate the local user token...
      // return store.dispatch('auth/validate').then((validUser) => {
      return auth.validate().then((validUser) => {
        // Then continue if the token still represents a valid user,
        // otherwise redirect to login.
        validUser ? next() : redirectToLogin();
      });
    }

    // If auth is required and the user is NOT currently logged in,
    // redirect to login.
    redirectToLogin();

    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line no-inner-declarations
    function redirectToLogin() {
      // Pass the original route to the login component
      next({ name: "login", query: { redirectFrom: routeTo.fullPath } });
    }
  } else {
    const publicPages = ["/login", "/register", "/forgot-password", "/reset-password"];
    const authpage = !publicPages.includes(routeTo.path);
    const loggeduser = localStorage.getItem("user");

    if (authpage && !loggeduser) {
      return next("/login");
    }

    if (loggeduser) {
      const user = JSON.parse(loggeduser);
      if (user && user.force_password_change === true && routeTo.path !== '/profile/kemaskini-kata-laluan') {
        return next('/profile/kemaskini-kata-laluan');
      }

      // Role & Permission checking
      const role = (user.peranan || "guest").trim().toLowerCase();
      const tabPermissions = JSON.parse(localStorage.getItem("tabPermissions")) || [];

      // Find the menu item matching this route
      const findMenuItem = (items, path) => {
        for (const item of items) {
          if (item.link === path) return item;
          if (item.subItems) {
            const found = findMenuItem(item.subItems, path);
            if (found) return found;
          }
        }
        return null;
      };

      const menuItem = findMenuItem(menuItems, routeTo.path);

      if (menuItem) {
        // 1. Check hardcoded roles in menu.js
        if (menuItem.roles && !menuItem.roles.includes(role)) {
          return next({ name: "Error-403" }); // Redirect to 403 if no role access
        }

        // 2. Check dynamic DB permissions (tabPermissions)
        const perm = tabPermissions.find((p) => p.id === menuItem.id);
        if (perm) {
          const hasAccess = !!(perm[role.replace(" ", "")] || perm[role]);
          if (!hasAccess) {
            console.warn(`Access denied for ${role} on ${routeTo.path} (tabId: ${menuItem.id})`);
            return next({ name: "Error-403" }); // Redirect to 403 if no permission access
          }
        }
      }
    }

    next();
  }
});

router.beforeResolve(async (routeTo, routeFrom, next) => {

  try {
    // For each matched route...
    for (const route of routeTo.matched) {
      await new Promise((resolve, reject) => {

        if (route.meta && route.meta.beforeResolve) {
          route.meta.beforeResolve(routeTo, routeFrom, (...args) => {
            // If the user chose to redirect...
            if (args.length) {
              // If redirecting to the same route we're coming from...
              // Complete the redirect.
              next(...args);
              reject(new Error("Redirected"));
            } else {
              resolve();
            }
          });
        } else {
          // Otherwise, continue resolving the route.
          resolve();
        }
      });
    }
    // If a `beforeResolve` hook chose to redirect, just return.
  } catch (error) {
    return;
  }

  document.title = routeTo.meta.title + " | " + appConfig.title;
  // If we reach this point, continue resolving the route.
  next();
});

export default router;
