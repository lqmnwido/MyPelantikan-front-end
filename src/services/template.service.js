// src/services/template.service.js
import axiosClient from "./apiClient";

export const templateService = {
  simpanTemplateReport,
  getTemplateReport,
  getSenaraiLaporan,
  kemaskiniTemplateReport,
  hapusTemplate,
  getSenaraiPelantikan,
  getSenaraiPelantikanLaporan,
  updateNota,
  onUpdateCatatanTemplate,
  getAllReportTemplates,
  getTemplateReportByName,
};

// 📑 Get All List of Templates (non-paginated)
async function getAllReportTemplates() {
  try {
    const { data } = await axiosClient.get('/templates/allSenarai');
    return data.Data; // Corrected to access 'Data' (capital D)
  } catch (e) {
    handleError('Error fetching all laporan', e);
    return [];
  }
}

// 📝 Create Template
async function simpanTemplateReport(formData) {
  try {
    const { data } = await axiosClient.post('/templates', {
      name: formData.name,
      blocks: formData.blocks,
    });
    return data;
  } catch (e) {
    handleError('Error saving template', e);
  }
}

// 📄 Get Template by ID
async function getTemplateReport(id) {
  try {
    const { data } = await axiosClient.get('/templates', { params: { id } });
    return data;
  } catch (e) {
    handleError('Error fetching template', e);
  }
}

function getTemplateReportByName(name) {
  return axiosClient
    .get(`/templates/laporan/${name}`)
    .then((res) => res.data);
}

// 📑 Get List of Templates (paginated)
async function getSenaraiLaporan({ page = 1, perPage = 5, search = '' } = {}) {
  try {
    const { data } = await axiosClient.get('/templates/senarai', {
      params: { page, per_page: perPage, search },
    });
    return data;
  } catch (e) {
    handleError('Error fetching laporan', e);
    return { data: [], total: 0, current_page: 1, per_page: perPage };
  }
}

// 🧑 Get List of Pelantikan
async function getSenaraiPelantikan() {
  try {
    const { data } = await axiosClient.get('/pelantikan/senarai');
    return data;
  } catch (e) {
    handleError('Error fetching pelantikan', e);
    return [];
  }
}

// 🧑 Get List of Pelantikan
async function getSenaraiPelantikanLaporan(id) {
  try {
    const { data } = await axiosClient.get(`/pelantikan/senarai-laporan/${id}`);
    return data;
  } catch (e) {
    handleError('Error fetching pelantikan', e);
    return [];
  }
}

// ✏️ Update Template
async function kemaskiniTemplateReport(id, formData) {
  try {
    const { data } = await axiosClient.put(`/templates/${id}`, formData);
    return data;
  } catch (e) {
    handleError('Error updating template', e);
  }
}

// ❌ Delete Template
async function hapusTemplate(id) {
  try {
    const { data } = await axiosClient.delete(`/templates/${id}`);
    return data;
  } catch (e) {
    handleError('Error deleting template', e);
  }
}

// 📝 Update single Nota (block content)
async function updateNota(templateId, blockId, content) {
  try {
    const { data } = await axiosClient.put(`/templates/${templateId}/nota/${blockId}`, {
      content,
    });
    return data;
  } catch (e) {
    handleError('Error updating nota', e);
  }
}

async function onUpdateCatatanTemplate(templateId, blockId, payload) {
  try {
    const { data } = await axiosClient.put(`/templates/${templateId}/catatan/${blockId}`, payload);
    return data;
  } catch (error) {
    handleError('Error updating catatan', error);
    throw error;
  }
}


// ⚙️ Helper: Centralized error logger
function handleError(message, error) {
  console.error(message, error.response?.data || error.message);
  throw error; // rethrow for component-level handling
}
