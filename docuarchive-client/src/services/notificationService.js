import axiosInstance from "./axiosInstance";

const NOTIFICATIONS_URL = "/Notifications";

export const getMyNotifications = async () => {
  const response = await axiosInstance.get(`${NOTIFICATIONS_URL}/my`);
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  await axiosInstance.put(`${NOTIFICATIONS_URL}/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await axiosInstance.put(`${NOTIFICATIONS_URL}/read-all`);
};