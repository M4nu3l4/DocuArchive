import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
      toast.error("Errore caricamento notifiche");
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString(
      localStorage.getItem("docuarchive-language") === "en" ? "en-GB" : "it-IT",
      {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      await markNotificationAsRead(notification.id);
      await loadNotifications();
    } catch (error) {
      console.error(error);
      toast.error("Errore aggiornamento notifica");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error(error);
      toast.error("Errore aggiornamento notifiche");
    }
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-light position-relative"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        onClick={loadNotifications}
      >
        <i className="bi bi-bell"></i>

        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      <div
        className="dropdown-menu dropdown-menu-end shadow border-0 p-0"
        style={{ width: "360px", maxHeight: "420px", overflowY: "auto" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <strong>Notifiche</strong>

          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none"
              onClick={handleMarkAllAsRead}
            >
              Segna tutte
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-3 text-center text-muted">Caricamento...</div>
        ) : notifications.length === 0 ? (
          <div className="p-3 text-center text-muted">
            Nessuna notifica presente.
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={`dropdown-item text-start py-3 border-bottom ${
                !notification.isRead ? "bg-light" : ""
              }`}
              onClick={() => handleMarkAsRead(notification)}
            >
              <div className="d-flex justify-content-between gap-2">
                <strong>{notification.title}</strong>

                {!notification.isRead && (
                  <span className="badge bg-danger">Nuova</span>
                )}
              </div>

              <div className="small text-muted mt-1">
                {notification.message}
              </div>

              <div className="small text-muted mt-2">
                {formatDate(notification.createdAt)}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationBell;