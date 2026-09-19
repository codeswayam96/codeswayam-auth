export interface Notification {
  id: string | number;
  type: string;
  title: string;
  body?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}
