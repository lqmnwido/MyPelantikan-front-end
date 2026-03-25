// src/services/templateSenarai.service.js
import axiosClient from "./apiClient";

export const templateSenaraiService = {
  getTemplates,
  getTemplateByName,
  getTemplateByID,
  saveTemplate,
  deleteTemplate,
  getSenaraiTemplate,
  kemaskiniTemplate,
  SenaraiTemplate,
  lantikAhli,
  maklumatAhli,
  kemaskiniAhli,
  hapusAhli,
  hapusRekod,
};

// Fetch all templates
function getTemplates() {
  return axiosClient
    .get('/templates-senarai')
    .then((res) => res.data);
}

// Fetch single template by Name
function getTemplateByName(name) {
  return axiosClient
    .get(`/templates-senarai/papar/${name}`)
    .then((res) => res.data);
}

// Fetch single template by Name
function getTemplateByID(id) {
  return axiosClient
    .get(`/templates-senarai/${id}`)
    .then((res) => res.data);
}

// Save template (new)
function saveTemplate(payload) {
  return axiosClient
    .post('/templates-senarai', payload)
    .then((res) => res.data);
}

function kemaskiniTemplate(id, payload) {
  return axiosClient
    .put(`/templates-senarai/${id}`, payload)
    .then((res) => res.data);
}

// Fetch single template by ID
function SenaraiTemplate({ page = 1, perPage = 5, search = '' } = {}, id) {
  return axiosClient
    .get(`/pelantikan/senarai-template/${id}`, {
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

// Delete template
function deleteTemplate(id) {
  return axiosClient
    .delete(`/templates-senarai/${id}`)
    .then((res) => res.data);
}

// Fetch single template by ID
function getSenaraiTemplate({ page = 1, perPage = 5, search = '' } = {}) {
  return axiosClient
    .get('/templates-senarai/senarai', {
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

function lantikAhli(formData) {
  return axiosClient.post('pelantikan/lantik-ahli', formData);
}

function maklumatAhli(id) {
  return axiosClient.get(`pelantikan/papar-ahli`, {
    params: { id }
  });
}

function kemaskiniAhli(id, formData) {
  formData.append('_method', 'PUT'); // Spoof the PUT request

  return axiosClient.post(`pelantikan/${id}`, formData);
}

function hapusAhli(id) {
  return axiosClient.put(`pelantikan/nyah-aktif/${id}`);
}

async function hapusRekod(id) {
    try {
        const { data } = await axiosClient.delete(`/pelantikan/${id}`);
        return data;
    } catch (e) {
        console.error('Error deleting template', e);
    }
}