// src/services/profile.service.js
import axios from 'axios';
const API_URL = 'http://127.0.0.1:8000/api/v1/';

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);


export const profileService = {
    getProfiles,
};

function getProfiles(page = 1, perPage = 100) {
  return axios
    .get(`${API_URL}test-data`, {
      params: {
        page,
        per_page: perPage,
      },
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching profiles:', error);
      throw error;
    });
}

// function getProfiles() {

//     // return axios.get(`${API_URL}test-data`)
//     //     .then(response => response.data)
//     //     .catch(error => {
//     //         console.error('Error fetching profiles:', error);
//     //         throw error;
//     //     });


//     // Simulate API call using dummy data
//     // return Promise.resolve({
//     //     data: [
//     //         {
//     //             gambar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
//     //             nama_penuh: "YAB DATO' John Doe",
//     //             jawatan: "Perdana Menteri",
//     //             partiFlag: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Parti_Keadilan_Rakyat_logo.svg",
//     //             parti: "PKR",
//     //             tarikh_lahir: "02/02/1998",

//     //         },
//     //         {
//     //             gambar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
//     //             nama_penuh: "Siti Aisyah",
//     //             jawatan: "Pegawai Teknologi Maklumat",
//     //             partiFlag: "https://umno.org.my/wp-content/uploads/2019/06/map-min.png",
//     //             parti: "UMNO",
//     //             jenisPelantikan: "Ahli Dewan Negara",
//     //             tarikh_lahir: "02/02/1998",
//     //         },
//     //     ],
//     //     // Add more dummy objects as needed
//     // });
// }
