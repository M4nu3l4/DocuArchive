import axiosInstance from "./axiosInstance";

const API_URL = "/WorkflowStatuses";

export const getWorkflowStatuses = async (search = "") => {
  const response = await axiosInstance.get(API_URL, {
    params: { search },
  });

  return response.data;
};

export const createWorkflowStatus = async (statusData) => {
  const response = await axiosInstance.post(API_URL, statusData);
  return response.data;
};

export const updateWorkflowStatus = async (id, statusData) => {
  await axiosInstance.put(`${API_URL}/${id}`, statusData);
};

export const deleteWorkflowStatus = async (id) => {
  await axiosInstance.delete(`${API_URL}/${id}`);
};