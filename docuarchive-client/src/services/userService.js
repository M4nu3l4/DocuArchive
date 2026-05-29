import axiosInstance from "./axiosInstance";

const API_URL = "/Users";

export const getUsers = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  await axiosInstance.put(`${API_URL}/${id}/role`, {
    role,
  });
};

export const updateUserActive = async (id, attivo) => {
  await axiosInstance.put(`${API_URL}/${id}/active`, {
    attivo,
  });
};