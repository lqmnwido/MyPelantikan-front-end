// src/services/lookup.service.js
import axiosClient from "./apiClient";

export const lookupService = {
  allLookup,
  //Jantina
  getJantina,
  tambahJantina,
  kemaskiniJantina,
  hapusJantina,
  getDeletedJantina,
  pulihJantina,
  //Agama
  getAgama,
  tambahAgama,
  kemaskiniAgama,
  hapusAgama,
  getDeletedAgama,
  pulihAgama,
  hapusKekalAgama,
  //Bangsa
  getBangsa,
  tambahBangsa,
  kemaskiniBangsa,
  hapusBangsa,
  getDeletedBangsa,
  pulihBangsa,
  hapusKekalBangsa,
  //Gelaran
  getGelaran,
  tambahGelaran,
  kemaskiniGelaran,
  hapusGelaran,
  getDeletedGelaran,
  pulihGelaran,
  susunSemulaGelaran,
  hapusKekalGelaran,
  //Negeri
  getNegeri,
  tambahNegeri,
  kemaskiniNegeri,
  hapusNegeri,
  getDeletedNegeri,
  pulihNegeri,
  getNegeriDUN,
  getWilayahAgong,
  getNegeriHMT,
  hapusKekalNegeri,
  //Bandar
  getBandar,
  tambahBandar,
  kemaskiniBandar,
  hapusBandar,
  getDeletedBandar,
  pulihBandar,
  suggestBandar,
  getLokasiHMT,
  hapusKekalBandar,
  //Poskod
  getPoskod,
  tambahPoskod,
  kemaskiniPoskod,
  hapusPoskod,
  getDeletedPoskod,
  pulihPoskod,
  suggestPoskod,
  hapusKekalPoskod,
  //Gabungan Parti
  getPartiGabungan,
  tambahPartiGabungan,
  kemaskiniPartiGabungan,
  hapusPartiGabungan,
  getDeletedPartiGabungan,
  pulihPartiGabungan,
  hapusKekalPartiGabungan,
  //Parti
  getParti,
  tambahParti,
  kemaskiniParti,
  hapusParti,
  getDeletedParti,
  pulihParti,
  hapusKekalParti,
  //Kategori Pelantikan
  getKategoriPelantikan,
  getSenaraiKategoriPelantikan,
  tambahKategoriPelantikan,
  kemaskiniKategoriPelantikan,
  hapusKategoriPelantikan,
  getDeletedKategoriPelantikan,
  pulihKategoriPelantikan,
  hapusKekalKategoriPelantikan,
  //JenisPelantikan
  getJenisPelantikan,
  getSenaraiPelantikan,
  tambahJenisPelantikan,
  kemaskiniJenisPelantikan,
  hapusJenisPelantikan,
  getDeletedJenisPelantikan,
  pulihJenisPelantikan,
  getSenaraiJenisPelantikan,
  profilParti,
  hapusKekalJenisPelantikan,
  //Alamat
  getAlamat,
  tambahAlamat,
  kemaskiniAlamat,
  hapusAlamat,
  getDeletedAlamat,
  pulihAlamat,
  //Telefon
  getTelefon,
  tambahTelefon,
  kemaskiniTelefon,
  hapusTelefon,
  getDeletedTelefon,
  pulihTelefon,
  //Status Kahwin
  getStatusKahwin,
  tambahStatusKahwin,
  kemaskiniStatusKahwin,
  hapusStatusKahwin,
  getDeletedStatusKahwin,
  pulihStatusKahwin,
  hapusKekalStatusKahwin,
  //Jawatan
  getJawatan,
  tambahJawatan,
  kemaskiniJawatan,
  hapusJawatan,
  getDeletedJawatan,
  pulihJawatan,
  hapusKekalJawatan,
};

function allLookup() {
  return axiosClient.get('/lookup/all')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}
///////////////// JANTINA ///////////////////////

// Tambah Jantina
function tambahJantina(formData) {
  return axiosClient.post('/lookup/jantina/tambah', formData);
}

// Dapatkan Senarai Jantina
function getJantina() {
  return axiosClient.get('/lookup/jantina')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Jantina
function kemaskiniJantina(id, formData) {
  return axiosClient.put(`/lookup/jantina/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Jantina
function hapusJantina(id) {
  return axiosClient.delete(`/lookup/jantina/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedJantina() {
  return axiosClient.get('lookup/jantina/deleted').then(res => res.data);
}

function pulihJantina(payload) {
  return axiosClient.put('/lookup/jantina/pulih', payload);
}

///////////////// AGAMA ///////////////////////

// Tambah Agama
function tambahAgama(formData) {
  return axiosClient.post('/lookup/agama/tambah', formData);
}

// Dapatkan Senarai Agama
function getAgama() {
  return axiosClient.get('/lookup/agama')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Agama
function kemaskiniAgama(id, formData) {
  return axiosClient.put(`/lookup/agama/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Agama
function hapusAgama(id) {
  return axiosClient.delete(`/lookup/agama/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedAgama() {
  return axiosClient.get('lookup/agama/deleted').then(res => res.data);
}

function pulihAgama(payload) {
  return axiosClient.put('/lookup/agama/pulih', payload);
}

function hapusKekalAgama(payload) {
  return axiosClient.delete('/lookup/agama/force-delete', { data: payload });
}


///////////////// BANGSA ///////////////////////

// Tambah Bangsa
function tambahBangsa(formData) {
  return axiosClient.post('/lookup/bangsa/tambah', formData);
}

// Dapatkan Senarai Bangsa
function getBangsa() {
  return axiosClient.get('/lookup/bangsa')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Bangsa
function kemaskiniBangsa(id, formData) {
  return axiosClient.put(`/lookup/bangsa/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Bangsa
function hapusBangsa(id) {
  return axiosClient.delete(`/lookup/bangsa/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedBangsa() {
  return axiosClient.get('lookup/bangsa/deleted').then(res => res.data);
}

function pulihBangsa(payload) {
  return axiosClient.put('/lookup/bangsa/pulih', payload);
}

function hapusKekalBangsa(payload) {
  return axiosClient.delete('/lookup/bangsa/force-delete', { data: payload });
}


///////////////// GELARAN ///////////////////////

// Tambah Gelaran
function tambahGelaran(formData) {
  return axiosClient.post('/lookup/gelaran/tambah', formData);
}

// Dapatkan Senarai Gelarana
function getGelaran() {
  return axiosClient.get('/lookup/gelaran')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Gelaran
function kemaskiniGelaran(id, formData) {
  return axiosClient.put(`/lookup/gelaran/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Gelaran
function hapusGelaran(id) {
  return axiosClient.delete(`/lookup/gelaran/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedGelaran() {
  return axiosClient.get('lookup/gelaran/deleted').then(res => res.data);
}

function pulihGelaran(payload) {
  return axiosClient.put('/lookup/gelaran/pulih', payload);
}

function susunSemulaGelaran(payload) {
  try {
    return axiosClient.post('/lookup/gelaran/susun-semula', { payload });
    // Optionally refresh data here
  } catch (error) {
    console.error("Reorder failed:", error);
  }
}

function hapusKekalGelaran(payload) {
  return axiosClient.delete('/lookup/gelaran/force-delete', { data: payload });
}

///////////////// NEGERI ///////////////////////

// Tambah Negeri
function tambahNegeri(formData) {
  return axiosClient.post('/lookup/negeri/tambah', formData);
}

// Dapatkan Senarai semua Negeri
function getNegeri() {
  return axiosClient.get('/lookup/negeri')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Negeri
function kemaskiniNegeri(id, formData) {
  return axiosClient.put(`/lookup/negeri/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Negeri
function hapusNegeri(id) {
  return axiosClient.delete(`/lookup/negeri/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedNegeri() {
  return axiosClient.get('lookup/negeri/deleted').then(res => res.data);
}

function pulihNegeri(payload) {
  return axiosClient.put('/lookup/negeri/pulih', payload);
}

function hapusKekalNegeri(payload) {
  return axiosClient.delete('/lookup/negeri/force-delete', { data: payload });
}


function getNegeriDUN() {
  return axiosClient.get('/lookup/negeri/dun')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

function getWilayahAgong() {
  return axiosClient.get('/lookup/negeri/agong')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

function getNegeriHMT() {
  return axiosClient.get('lookup/negeri/negeriHMT')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

///////////////// BANDAR ///////////////////////

// Tambah Bandar
function tambahBandar(formData) {
  return axiosClient.post('/lookup/bandar/tambah', formData);
}

// Dapatkan Senarai Bandar
function getBandar() {
  return axiosClient.get('/lookup/bandar')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

function getLokasiHMT(id) {
  return axiosClient.get(`/lookup/bandar/lokasi/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Bandar
function kemaskiniBandar(id, formData) {
  return axiosClient.put(`/lookup/bandar/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Bandar
function hapusBandar(id) {
  return axiosClient.delete(`/lookup/bandar/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedBandar() {
  return axiosClient.get('lookup/bandar/deleted').then(res => res.data);
}

function pulihBandar(payload) {
  return axiosClient.put('/lookup/bandar/pulih', payload);
}

function suggestBandar(query) {
  return axiosClient.get(`/lookup/bandar/suggestion?q=${query}`) // <== query string
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

function hapusKekalBandar(payload) {
  return axiosClient.delete('/lookup/bandar/force-delete', { data: payload });
}

///////////////// POSKOD ///////////////////////

// Tambah Poskod
function tambahPoskod(formData) {
  return axiosClient.post('/lookup/poskod/tambah', formData);
}

// Dapatkan Senarai Poskod
function getPoskod() {
  return axiosClient.get('/lookup/poskod')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Poskod
function kemaskiniPoskod(id, formData) {
  return axiosClient.put(`/lookup/poskod/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Poskod
function hapusPoskod(id) {
  return axiosClient.delete(`/lookup/poskod/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedPoskod() {
  return axiosClient.get('lookup/poskod/deleted').then(res => res.data);
}

function pulihPoskod(payload) {
  return axiosClient.put('/lookup/poskod/pulih', payload);
}

function suggestPoskod(query) {
  return axiosClient.get(`/lookup/poskod/suggestion?q=${query}`) // <== query string
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

function hapusKekalPoskod(payload) {
  return axiosClient.delete('/lookup/poskod/force-delete', { data: payload });
}



///////////////// GABUNGAN PARTI ///////////////////////

// Tambah Gabungan Parti
function tambahPartiGabungan(formData) {
  return axiosClient.post('/penyelenggaraan-kod/parti-gabungan/tambah', formData);
}

// Dapatkan Senarai Gabungan Parti
function getPartiGabungan() {
  return axiosClient.get('/penyelenggaraan-kod/parti-gabungan')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Gabungan Parti
function kemaskiniPartiGabungan(id, formData) {
  return axiosClient.put(`/penyelenggaraan-kod/parti-gabungan/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Gabungan Parti
function hapusPartiGabungan(id) {
  return axiosClient.delete(`/penyelenggaraan-kod/parti-gabungan/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedPartiGabungan() {
  return axiosClient.get('penyelenggaraan-kod/parti-gabungan/deleted').then(res => res.data);
}

function pulihPartiGabungan(payload) {
  return axiosClient.put('/penyelenggaraan-kod/parti-gabungan/pulih', payload);
}

function hapusKekalPartiGabungan(payload) {
  return axiosClient.delete('/penyelenggaraan-kod/parti-gabungan/force-delete', { data: payload });
}


///////////////// PARTI ///////////////////////

// Tambah Parti
function tambahParti(formData) {
  return axiosClient.post('/penyelenggaraan-kod/parti/tambah', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
}

// Dapatkan Senarai Parti
function getParti() {
  return axiosClient.get('/penyelenggaraan-kod/parti')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Parti
function kemaskiniParti(id, formData) {
  return axiosClient.post(`/penyelenggaraan-kod/parti/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Parti
function hapusParti(id) {
  return axiosClient.delete(`/penyelenggaraan-kod/parti/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedParti() {
  return axiosClient.get('penyelenggaraan-kod/parti/deleted').then(res => res.data);
}

function pulihParti(payload) {
  return axiosClient.put('/penyelenggaraan-kod/parti/pulih', payload);
}

function hapusKekalParti(payload) {
  return axiosClient.delete('/penyelenggaraan-kod/parti/force-delete', { data: payload });
}

///////////////// KATEGORI PELANTIKAN ///////////////////////

// Tambah Kategori Pelantikan
function tambahKategoriPelantikan(formData) {
  return axiosClient.post('/penyelenggaraan-kod/kategori-pelantikan/tambah', formData);
}

// Dapatkan Senarai Kategori Pelantikan
function getKategoriPelantikan() {
  return axiosClient.get('/penyelenggaraan-kod/kategori-pelantikan')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

function getSenaraiKategoriPelantikan() {
  return axiosClient.get('/penyelenggaraan-kod/kategori-pelantikan/senarai')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Kategori Pelantikan
function kemaskiniKategoriPelantikan(id, formData) {
  return axiosClient.put(`/penyelenggaraan-kod/kategori-pelantikan/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Kategori Pelantikan
function hapusKategoriPelantikan(id) {
  return axiosClient.delete(`/penyelenggaraan-kod/kategori-pelantikan/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedKategoriPelantikan() {
  return axiosClient.get('penyelenggaraan-kod/kategori-pelantikan/deleted').then(res => res.data);
}

function pulihKategoriPelantikan(payload) {
  return axiosClient.put('/penyelenggaraan-kod/kategori-pelantikan/pulih', payload);
}

function hapusKekalKategoriPelantikan(payload) {
  return axiosClient.delete('/penyelenggaraan-kod/kategori-pelantikan/force-delete', { data: payload });
}


///////////////// PELANTIKAN ///////////////////////

// Tambah JenisPelantikan
function tambahJenisPelantikan(formData) {
  return axiosClient.post('/penyelenggaraan-kod/pelantikan/tambah', formData);
}

// Dapatkan Senarai JenisPelantikan
function getJenisPelantikan() {
  return axiosClient.get('/penyelenggaraan-kod/pelantikan')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

function getSenaraiPelantikan() {
  return axiosClient.get('/penyelenggaraan-kod/pelantikan/senarai-kategori')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

export function profilParti(id) {
  return axiosClient.get(`/profil/papar/parti`, {
    params: { id }
  });
}

function getSenaraiJenisPelantikan() {
  return axiosClient.get('/penyelenggaraan-kod/pelantikan/senarai')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini JenisPelantikan
function kemaskiniJenisPelantikan(id, formData) {
  return axiosClient.put(`/penyelenggaraan-kod/pelantikan/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Kategori JenisPelantikan
function hapusJenisPelantikan(id) {
  return axiosClient.delete(`/penyelenggaraan-kod/pelantikan/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedJenisPelantikan() {
  return axiosClient.get('penyelenggaraan-kod/pelantikan/deleted').then(res => res.data);
}

function pulihJenisPelantikan(payload) {
  return axiosClient.put('/penyelenggaraan-kod/pelantikan/pulih', payload);
}

function hapusKekalJenisPelantikan(payload) {
  return axiosClient.delete('/penyelenggaraan-kod/pelantikan/force-delete', { data: payload });
}

///////////////// ALAMAT ///////////////////////

// Tambah Alamat
function tambahAlamat(formData) {
  return axiosClient.post('/lookup/alamat/tambah', formData);
}

// Dapatkan Senarai Alamat
function getAlamat() {
  return axiosClient.get('/lookup/alamat')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Alamat
function kemaskiniAlamat(id, formData) {
  return axiosClient.put(`/lookup/alamat/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Kategori Alamat
function hapusAlamat(id) {
  return axiosClient.delete(`/lookup/alamat/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedAlamat() {
  return axiosClient.get('lookup/alamat/deleted').then(res => res.data);
}

function pulihAlamat(payload) {
  return axiosClient.put('/lookup/alamat/pulih', payload);
}

///////////////// TELEFON ///////////////////////

// Tambah Telefon
function tambahTelefon(formData) {
  return axiosClient.post('/lookup/telefon/tambah', formData);
}

// Dapatkan Senarai Telefon
function getTelefon() {
  return axiosClient.get('/lookup/telefon')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Alamat
function kemaskiniTelefon(id, formData) {
  return axiosClient.put(`/lookup/telefon/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Kategori Alamat
function hapusTelefon(id) {
  return axiosClient.delete(`/lookup/telefon/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedTelefon() {
  return axiosClient.get('lookup/telefon/deleted').then(res => res.data);
}

function pulihTelefon(payload) {
  return axiosClient.put('/lookup/telefon/pulih', payload);
}


///////////////// STATUS KAHWIN ///////////////////////

// Tambah Status Kahwin
function tambahStatusKahwin(formData) {
  return axiosClient.post('/lookup/status-kahwin/tambah', formData);
}

// Dapatkan Senarai Status Kahwin
function getStatusKahwin() {
  return axiosClient.get('/lookup/status-kahwin')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Status Kahwin
function kemaskiniStatusKahwin(id, formData) {
  return axiosClient.put(`/lookup/status-kahwin/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Kategori Alamat
function hapusStatusKahwin(id) {
  return axiosClient.delete(`/lookup/status-kahwin/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedStatusKahwin() {
  return axiosClient.get('lookup/status-kahwin/deleted').then(res => res.data);
}

function pulihStatusKahwin(payload) {
  return axiosClient.put('/lookup/status-kahwin/pulih', payload);
}

function hapusKekalStatusKahwin(payload) {
  return axiosClient.delete('/lookup/status-kahwin/force-delete', { data: payload });
}

///////////////// JAWATAN ///////////////////////

// Tambah Jawatan
function tambahJawatan(formData) {
  return axiosClient.post('/penyelenggaraan-kod/jawatan/tambah', formData);
}

// Dapatkan Senarai Jawatan
function getJawatan() {
  return axiosClient.get('/penyelenggaraan-kod/jawatan')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Kemaskini Jawatan
function kemaskiniJawatan(id, formData) {
  return axiosClient.put(`/penyelenggaraan-kod/jawatan/${id}`, formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating data:', error);
      throw error;
    });
}

// Hapus Jawatan
function hapusJawatan(id) {
  return axiosClient.delete(`/penyelenggaraan-kod/jawatan/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting data:', error);
      throw error;
    });
}

function getDeletedJawatan() {
  return axiosClient.get('/penyelenggaraan-kod/jawatan/deleted').then(res => res.data);
}

function pulihJawatan(payload) {
  return axiosClient.put('/penyelenggaraan-kod/jawatan/pulih', payload);
}

function hapusKekalJawatan(payload) {
  return axiosClient.delete('/penyelenggaraan-kod/jawatan/force-delete', { data: payload });
}