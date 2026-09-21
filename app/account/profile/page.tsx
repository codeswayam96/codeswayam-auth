"use client";

/**
 * Account Profile Page — orchestrator.
 * Owns user context; delegates all UI to _components/.
 */

import { useAccount } from "../layout";
import {
  AccountStatusCard, DangerZone, ProfileInfoCard, SubscriptionSummary, NotificationPreferences,
} from "./_components";

export default function ProfilePage() {
  const { user, setUser } = useAccount();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <ProfileInfoCard user={user} onUserUpdate={setUser} />
      <SubscriptionSummary />
      <NotificationPreferences />
      <AccountStatusCard status={user.status ?? "active"} />
      <DangerZone />
    </div>
  );
}
