import { defineStore } from "pinia"
import axios from "axios"
import { penggunaService } from "@/services/auth.service";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        currentUser: JSON.parse(localStorage.getItem("user")) || null,
        tabPermissions: JSON.parse(localStorage.getItem("tabPermissions")) || [],
    }),

    getters: {
        loggedIn: (state) => !!state.currentUser,

        // helper to check if role has permission for a tab
        hasPermission: (state) => (tabId, role) => {
            const tab = state.tabPermissions.find(p => p.tab_id === tabId);
            return tab ? tab[role] === true : false;
        }
    },

    actions: {
        async logIn({ email, password }) {
            try {
                const { data } = await axios.post("/api/login", { email, password })
                const user = data.user
                const token = data.token

                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
                this.setUser({ ...user, token })

                console.log("✅ Login success, loading permissions...")
                await this.loadPermissions()

                return user
            } catch (error) {
                console.error("❌ Login failed:", error)
                throw error.response?.data?.message || "Login gagal"
            }
        },

        async validate() {
            // console.log('validated');
            const storedUser = JSON.parse(localStorage.getItem("user"))
            const token = localStorage.getItem("token")
            if (storedUser && token) {
                axios.defaults.headers.common["Authorization"] = `Bearer ${storedUser.token}`
                this.currentUser = storedUser

                // start with empty or cached permissions
                this.tabPermissions = []

                // fetch fresh ones in background
                await this.loadPermissions()
                return storedUser
            }
            return null
        },

        setUser(user) {
            this.currentUser = user
            localStorage.setItem("user", JSON.stringify(user))
        },
        setPermissions(permissions) {
            this.tabPermissions = permissions;
            // localStorage.setItem("tabPermissions", JSON.stringify(permissions)); // ✅ save
        },

        async register({ nama, email, password }) {
            try {
                const { data } = await axios.post("/api/register", {
                    nama, email, password
                })

                const user = data.user
                const token = data.token

                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
                this.setUser({ ...user, token })

                console.log("✅ Register success, loading permissions...")
                await this.loadPermissions()

                return user
            } catch (error) {
                console.error("❌ Register failed:", error)
                throw error.response?.data?.message || "Pendaftaran gagal"
            }
        },

        async resetPassword({ email }) {
            try {
                const { data } = await axios.post("/api/forgot-password", { email })
                return data.message
            } catch (error) {
                throw error.response?.data?.message || "Reset kata laluan gagal"
            }
        },

        logOut() {
            this.currentUser = null
            this.tabPermissions = []
            localStorage.clear()
            delete axios.defaults.headers.common["Authorization"]
            console.log("👋 Logged out, permissions cleared")
        },

        async loadPermissions() {
            try {
                // console.log("📡 Fetching /api/kebenaran ...")
                const data = await penggunaService.kebenaran();
                // console.log("📡 Response:", data)
                // Transform: group by tab_id and map roles to boolean
                const map = {}
                data.forEach(item => {
                    const tab_id = item.tab_id;
                    if (!map[tab_id]) map[tab_id] = { id: tab_id };
                    map[tab_id][item.peranan] = item.kebenaran;
                });

                this.tabPermissions = Object.values(map)
                // console.log("✅ Transformed permissions:", this.tabPermissions)
            } catch (error) {
                console.error("❌ Failed to load permissions:", error)
                this.tabPermissions = []
            }
        }
    },
})
