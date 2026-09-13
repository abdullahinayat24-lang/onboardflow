'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, CheckCircle2, Clock, AlertTriangle, Layers, UserCheck } from 'lucide-react';
import { Notification } from '@/types';

export function NotificationsPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
        if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
      })
      .catch((e) => console.error('Error fetching notifications', e));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.is_read) {
      fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id }),
      }).catch(console.error);
      setNotifications(notifications.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    setIsOpen(false);
    if (notif.link) router.push(notif.link);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-200 hover:text-white transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 text-zinc-900 animate-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    notif.is_read
                      ? 'bg-white border-transparent hover:bg-zinc-50 text-zinc-600'
                      : 'bg-emerald-50/50 border-emerald-200/60 hover:bg-emerald-50 text-zinc-900 font-medium'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'task_assigned' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      {notif.type === 'task_overdue' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {notif.type === 'onboarding_completed' && <UserCheck className="w-4 h-4 text-emerald-600" />}
                      {notif.type === 'workflow_advanced' && <Layers className="w-4 h-4 text-indigo-600" />}
                      {(!notif.type || notif.type === 'info') && <Clock className="w-4 h-4 text-zinc-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-xs truncate">{notif.title}</p>
                        {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-zinc-400">No notifications yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
