import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Bell } from "lucide-react";
import Button from "@/ui/Button";
import ThemeToggle from "@/ui/themeToggle";
import { toggleTheme } from "@/Redux/Slices/themeSlice";
import avatar from "@/assets/avt.webp";

export default function TutorHeader({ isOpen, setIsOpen, handleLogoutClick }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const tutor = useSelector((state) => state.tutor.tutorData);
  const [notificationCount, setNotificationCount] = useState(0);
  const eventSourceRef = useRef(null);

  const setupNotifications = useCallback(() => {
    if (!tutor) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `https://edusphere-backend.rimshan.in/tutor/notifications/stream`,
      {
        withCredentials: true,
      }
    );

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NOTIFICATION_UPDATE") {
          setNotificationCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Error parsing notification data:", error);
      }
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NOTIFICATION_UPDATE") {
          setNotificationCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Error parsing message data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
      setTimeout(() => setupNotifications(), 5000);
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
    };
  }, [tutor]);

  useEffect(() => {
    if (tutor) {
      return setupNotifications();
    }
  }, [tutor, setupNotifications]);

  return (
    <header className="border-b dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        {/* Left Section: Menu and Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:inline-block md:inline-block"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <a
            className="flex items-center gap-2 font-bold text-xl md:text-2xl text-green-500"
            href="#"
          >
            EduSphere
          </a>
        </div>

        {/* Right Section: Notifications, Profile, and Theme */}
        <div className="flex items-center gap-4">
          <Link to="/tutor/tutornotification">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {notificationCount}
                </span>
              )}
            </Button>
          </Link>
          
          <img
            src={tutor.profile_image || tutor.profileImage || avatar}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
          <ThemeToggle theme={theme} onToggle={() => dispatch(toggleTheme())} />
        </div>
      </div>
    </header>
  );
}