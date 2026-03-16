export interface FacilityOption {
  id: string;
  code: string;
  name: string;
}

export interface LabAreaOption {
  id: string;
  code: string;
  name: string;
}

export interface LoginServiceInput {
  username: string;
  password: string;
  facilityId: string;
  labAreaId: string;
  workDate: string;
}

export interface SessionState {
  sessionToken: string;
  reauthRequired: boolean;
  issuedAt: string;
  expiresAt: string;
  facilityId: string;
  labAreaId: string;
  workDate: string;
}

export interface LoginServiceResult {
  status: "success" | "error";
  message: string;
  session: SessionState | null;
}

export interface UserAccountRow {
  id: string;
  passwordHash: string;
  isActive: string;
  failedAttempts: number;
}
