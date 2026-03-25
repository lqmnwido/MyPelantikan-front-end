// src/services/lookup.service.js
import axiosClient from "./apiClient";

export const profilService = {
  createProfil,
  formDataToJson,
  getProfils,
  viewProfils,
  updateProfil,
  hapusProfil
};

// Convert FormData to a plain object (for debugging)
function formDataToJson(formData) {
  const obj = {};
  for (let [key, value] of formData.entries()) {
    obj[key] = value instanceof File ? value.name : value;
  }
  return obj;
}

function createProfil(formData) {

  return axiosClient.post('/profil/tambah', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
}

function getProfils({ page = 1, perPage = 5, search = '' } = {}) {
  return axiosClient
    .get('/profil', {
      // headers: {
      //   Authorization: `Bearer ${localStorage.getItem('token')}`
      // },
      params: {
        page,
        per_page: perPage,
        search,
      },
    })
    .then(r => r.data)
    .catch(e => {
      console.error('Error fetching profiles:', e);
      return { data: [], total: 0, current_page: 1, per_page: perPage };
    });
}


export function viewProfils(id) {
  return axiosClient.get(`/profil/papar`, {
    params: { id }
  });
}

function updateProfil(id, formData) {
  formData.append('_method', 'PUT'); // Spoof the PUT request

  return axiosClient.post(`/profil/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

function hapusProfil(id) {
  return axiosClient.delete(`/profil/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}


// return Promise.resolve([

//           {
//               gambar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
//               // nama: "YAB DATO' John Doe",
//               jawatan: "Perdana Menteri",
//               partiFlag: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Parti_Keadilan_Rakyat_logo.svg",
//               parti: "PKR",
//               tarikh_lahir: "02/02/1998",

//           },
//           {
//               gambar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
//               nama: "Siti Aisyah",
//               jawatan: "Pegawai Teknologi Maklumat",
//               partiFlag: "https://umno.org.my/wp-content/uploads/2019/06/map-min.png",
//               parti: "UMNO",
//               jenisPelantikan: "Ahli Dewan Negara",
//               tarikh_lahir: "02/02/1998",
//           },
//       // Add more dummy objects as needed
// ]);
// }

