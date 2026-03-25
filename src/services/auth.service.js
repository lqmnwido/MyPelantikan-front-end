import axios from 'axios';

const api = process.env.VUE_APP_APIKEY;

const axiosClient = axios.create({
  baseURL: api,
  withCredentials: true,
  withXSRFToken: true,
});

// ✅ Attach token for every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Add interceptors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

export const login = async (nombor_ic, password) => {
  const response = await axiosClient.post('/login', {
    nombor_ic,
    password,
  });
  return response.data; // return only data
};

export const verifyOtp = async (nombor_ic, otp) => {
  const response = await axiosClient.post('/verify-otp', {
    nombor_ic,
    otp,
  });
  return response.data;
};

export const sendOtp = async (nombor_ic) => {
  return axiosClient.post("/send-otp", { nombor_ic });
};


export const forgotPassword = async (emel) => {
  const response = await axiosClient.post('/forgot-password', {
    emel,
  });
  return response.data; // return only data
};

export const resetPassword = async ({ emel, token, password, password_confirmation }) => {
  const response = await axiosClient.post('/reset-password', {
    emel,
    token,
    password,
    password_confirmation,
  });
  return response.data;
};

export const changePassword = async ({ id, currentPassword, password, password_confirmation }) => {
  const response = await axiosClient.put('/change-password', {
    id,
    currentPassword,
    password,
    password_confirmation,
  });
  return response.data;
};

export const changePasswordManual = async ({ id, password, password_confirmation }) => {
  const response = await axiosClient.put(`/penyelenggaraan-pengguna/change-password-manual/${id}`, {
    password,
    password_confirmation,
  });
  return response.data;
};


export const penggunaService = {
  senaraiPengguna,
  menjanaKataLaluan,
  hapusPengguna,
  paparPengguna,
  simpanKebenaran,
  kebenaran
};

function paparPengguna(id) {
  return axiosClient.get(`/penyelenggaraan-pengguna/pengguna/${id}`, {
    params: { id }
  });
}

function senaraiPengguna({ page = 1, perPage = 5, search = '', jenis_peranan = '' } = {}) {
  return axiosClient
    .get('/penyelenggaraan-pengguna/senarai-pengguna', {
      params: {
        page,
        per_page: perPage,
        search,
        jenis_peranan,
      },
    })
    .then(r => r.data)
    .catch(e => {
      console.error('Error fetching profiles:', e);
      return { data: [], total: 0, current_page: 1, per_page: perPage };
    });
}

function menjanaKataLaluan(id) {
  return axiosClient.put(`/penyelenggaraan-pengguna/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function hapusPengguna(id) {
  return axiosClient.delete(`/penyelenggaraan-pengguna/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function simpanKebenaran(data) {
  return axiosClient
    .post('/penyelenggaraan-pengguna/kebenaran', data) // send array
    .then(r => r.data)
    .catch(e => {
      console.error('Error simpanKebenaran:', e);
      throw e;
    });
}

function kebenaran(tabIds = []) {
  return axiosClient
    .get('/penyelenggaraan-pengguna/senarai-kebenaran', {
      params: { tab_ids: tabIds }  // send array as query param
    })
    .then(r => r.data)
    .catch(e => {
      console.error('Error loadKebenaran:', e);
      throw e;
    });
}






