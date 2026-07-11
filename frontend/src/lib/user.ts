import { apiRequest, type ApiResponse } from "./api";
import { authHeaders } from "./auth";
import type {
  CategoryPnl,
  CurrentUserProfile,
  UserProfileStats,
} from "../types/user";

interface BackendCategoryPnl {
  category: string;
  pnl_credits: number;
}

interface BackendProfileStatsData {
  id: string;
  email?: string | null;
  name: string | null;
  profile_picture: string | null;
  username: string;
  total_volume_credits: number;
  total_pnl_credits: number;
  category_pnl: BackendCategoryPnl[];
}

interface BackendProfileStatsEnvelope {
  success: boolean;
  data: BackendProfileStatsData | null;
  error: string | null;
}

function mapCategoryPnl(row: BackendCategoryPnl): CategoryPnl {
  return {
    category: row.category,
    pnlCredits: row.pnl_credits,
  };
}

function mapProfileStatsData(data: BackendProfileStatsData): CurrentUserProfile {
  const stats: UserProfileStats = {
    totalVolumeCredits: data.total_volume_credits,
    totalPnlCredits: data.total_pnl_credits,
    categoryPnl: (data.category_pnl ?? []).map(mapCategoryPnl),
  };

  return {
    id: data.id,
    email: data.email ?? "",
    name: data.name,
    profilePicture: data.profile_picture,
    username: data.username,
    stats,
  };
}

async function fetchProfileStatsEnvelope(
  path: string,
  accessToken?: string,
): Promise<ApiResponse<CurrentUserProfile>> {
  const response = await apiRequest<BackendProfileStatsEnvelope>(path, {
    headers: accessToken ? authHeaders(accessToken) : undefined,
  });

  if (!response.success || !response.data) {
    return { success: false, data: null, error: response.error };
  }

  const envelope = response.data;
  if (!envelope.success || !envelope.data) {
    return {
      success: false,
      data: null,
      error: envelope.error ?? "Failed to fetch profile stats.",
    };
  }

  return {
    success: true,
    data: mapProfileStatsData(envelope.data),
    error: null,
  };
}

export function getMyProfileStats(
  accessToken?: string,
): Promise<ApiResponse<CurrentUserProfile>> {
  return fetchProfileStatsEnvelope("/users/me/profile-stats", accessToken);
}

export function getUserProfileStats(
  userId: string,
): Promise<ApiResponse<CurrentUserProfile>> {
  return fetchProfileStatsEnvelope(
    `/users/${encodeURIComponent(userId)}/profile-stats`,
  );
}

/** @deprecated Use getMyProfileStats — kept for auth bootstrap call sites. */
export function getCurrentUserProfile(
  accessToken: string,
): Promise<ApiResponse<CurrentUserProfile>> {
  return getMyProfileStats(accessToken);
}
