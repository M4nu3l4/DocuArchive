import axiosInstance from "./axiosInstance";

const DOCUMENTS_URL = "/Documents";
const CATEGORIES_URL = "/Categories";
const CLIENTS_URL = "/Clients";

export const getDocuments = async (filters = {}) => {
  const response = await axiosInstance.get(DOCUMENTS_URL, {
    params: filters,
  });

  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await axiosInstance.get(`${DOCUMENTS_URL}/${id}`);
  return response.data;
};

export const uploadDocument = async (formData) => {
  const response = await axiosInstance.post(`${DOCUMENTS_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateDocument = async (id, documentData) => {
  await axiosInstance.put(`${DOCUMENTS_URL}/${id}`, documentData);
};

export const updateDocumentWithFile = async (id, formData) => {
  await axiosInstance.put(`${DOCUMENTS_URL}/${id}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const assignDocument = async (documentId, assignedToUserId) => {
  await axiosInstance.put(`${DOCUMENTS_URL}/${documentId}/assign`, {
    assignedToUserId,
  });
};

export const downloadDocument = async (id) => {
  const response = await axiosInstance.get(`${DOCUMENTS_URL}/${id}/download`, {
    responseType: "blob",
  });

  return response;
};

export const deleteDocument = async (id) => {
  await axiosInstance.delete(`${DOCUMENTS_URL}/${id}`);
};

export const getClients = async (filters = {}) => {
  const response = await axiosInstance.get(CLIENTS_URL, {
    params: filters,
  });

  return response.data;
};

export const createClient = async (clientData) => {
  const response = await axiosInstance.post(CLIENTS_URL, clientData);
  return response.data;
};

export const updateClient = async (id, clientData) => {
  await axiosInstance.put(`${CLIENTS_URL}/${id}`, clientData);
};

export const deleteClient = async (id) => {
  await axiosInstance.delete(`${CLIENTS_URL}/${id}`);
};

export const getCategories = async () => {
  const response = await axiosInstance.get(CATEGORIES_URL);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post(CATEGORIES_URL, categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  await axiosInstance.put(`${CATEGORIES_URL}/${id}`, categoryData);
};

export const deleteCategory = async (id) => {
  await axiosInstance.delete(`${CATEGORIES_URL}/${id}`);
};

export const getMyDocumentLogs = async () => {
  const response = await axiosInstance.get(`${DOCUMENTS_URL}/logs/my`);
  return response.data;
};

export const getAllDocumentLogs = async () => {
  const response = await axiosInstance.get(`${DOCUMENTS_URL}/logs/all`);
  return response.data;
};

export const getDocumentLogs = async (documentId) => {
  const response = await axiosInstance.get(`${DOCUMENTS_URL}/${documentId}/logs`);
  return response.data;
};

export const takeDocument = async (documentId) => {
  await axiosInstance.put(`${DOCUMENTS_URL}/${documentId}/take`);
};

export const releaseDocument = async (documentId) => {
  await axiosInstance.put(`${DOCUMENTS_URL}/${documentId}/release`);
};