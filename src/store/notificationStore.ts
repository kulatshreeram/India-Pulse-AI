import { create } from 'zustand';

export type NotificationType = 'breaking' | 'alert' | 'update' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  articleId?: string;
  state?: string;
  category?: string;
  imageUrl?: string;
  timestamp: number;
  read: boolean;
}

export interface NotificationPreferences {
  breaking: boolean;
  alerts: boolean;
  updates: boolean;
  browserPush: boolean;
  sound: boolean;
}

interface NotificationStore {
  notifications: AppNotification[];
  preferences: NotificationPreferences;
  isOpen: boolean;
  seenArticleIds: Set<string>;

  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  setOpen: (open: boolean) => void;
  setPreferences: (prefs: Partial<NotificationPreferences>) => void;
  addSeenArticleId: (id: string) => void;
  loadFromStorage: () => void;
  unreadCount: () => number;
}

const DEFAULT_PREFS: NotificationPreferences = {
  breaking: true,
  alerts: true,
  updates: true,
  browserPush: false,
  sound: true,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  preferences: DEFAULT_PREFS,
  isOpen: false,
  seenArticleIds: new Set(),

  addNotification: (n) => {
    const notification: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      read: false,
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    }));

    // Browser push notification
    const prefs = get().preferences;
    if (prefs.browserPush && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`🔴 ${notification.title}`, {
          body: notification.body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
        });
      }
    }
  },

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),

  setOpen: (open) => set({ isOpen: open }),

  setPreferences: (prefs) =>
    set((state) => {
      const updated = { ...state.preferences, ...prefs };
      if (typeof window !== 'undefined') {
        localStorage.setItem('notification_prefs', JSON.stringify(updated));
      }
      return { preferences: updated };
    }),

  addSeenArticleId: (id) =>
    set((state) => {
      const next = new Set(state.seenArticleIds);
      next.add(id);
      return { seenArticleIds: next };
    }),

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('notification_prefs');
        if (stored) {
          set({ preferences: { ...DEFAULT_PREFS, ...JSON.parse(stored) } });
        }
      } catch {
        // ignore
      }
    }
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
