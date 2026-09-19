import React from "react";

export interface ActivityEvent {
  id: string | number;
  type: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string;
  createdAt: string;
  lastActive?: string;
}
