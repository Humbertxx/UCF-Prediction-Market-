export interface CategoryPnl {
  category: string;
  pnlCredits: number;
}

export interface UserProfileStats {
  totalVolumeCredits: number;
  totalPnlCredits: number;
  categoryPnl: CategoryPnl[];
}

export interface CurrentUserProfile {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  username: string;
  stats: UserProfileStats;
}
