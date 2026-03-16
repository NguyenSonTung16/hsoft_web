export interface FacilityOptionContract {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface LabAreaOptionContract {
  id: string
  facilityId: string
  code: string
  name: string
  isActive: boolean
}

export interface LoginRequestContract {
  username: string
  password: string
  facilityId: string
  labAreaId: string
  workDate: string
}

export interface SessionBootstrapContract {
  sessionToken?: string
  expiresAt?: string
  reauthRequired: boolean
}

export interface LoginErrorContract {
  code: string
  message: string
}

export interface LoginResponseContract {
  success: boolean
  session?: SessionBootstrapContract
  errors: LoginErrorContract[]
}

export interface LoginServiceContract {
  loadFacilities(): Promise<FacilityOptionContract[]>
  loadLabAreas(facilityId: string): Promise<LabAreaOptionContract[]>
  submitLogin(payload: LoginRequestContract): Promise<LoginResponseContract>
}
