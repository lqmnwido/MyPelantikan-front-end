// src/services/lookup.service.js
import axiosClient from "./apiClient";

export const systemConfigService = {
  async getFileSize() {
    const res = await axiosClient.get("/config/file-size");
    return res.data;
  },
  async saveFileSize(data) {
    const res = await axiosClient.post("/config/file-size", data);
    return res.data;
  },
};