import type { FacilityOption, LabAreaOption } from '../types/login.types'

const FACILITIES: FacilityOption[] = [
  { id: 'F001', code: 'BV-TW', name: 'Bệnh viện Trung ương', isActive: true },
  { id: 'F002', code: 'BV-DA', name: 'Bệnh viện Đa khoa tỉnh', isActive: true },
  { id: 'F003', code: 'PK-QT', name: 'Phòng khám Quốc tế', isActive: true },
]

const LAB_AREAS: LabAreaOption[] = [
  { id: 'A001', facilityId: 'F001', code: 'KHU-HS', name: 'Khu Huyết học - Sinh hóa', isActive: true },
  { id: 'A002', facilityId: 'F001', code: 'KHU-VK', name: 'Khu Vi sinh - Ký sinh trùng', isActive: true },
  { id: 'A003', facilityId: 'F001', code: 'KHU-GM', name: 'Khu Giải phẫu bệnh - Miễn dịch', isActive: true },
  { id: 'A004', facilityId: 'F002', code: 'KHU-XN1', name: 'Khu Xét nghiệm 1', isActive: true },
  { id: 'A005', facilityId: 'F002', code: 'KHU-XN2', name: 'Khu Xét nghiệm 2', isActive: true },
  { id: 'A006', facilityId: 'F003', code: 'KHU-QT', name: 'Khu Xét nghiệm Quốc tế', isActive: true },
  { id: 'A007', facilityId: 'F003', code: 'KHU-CC', name: 'Khu Cấp cứu', isActive: true },
]

export async function loadFacilities(): Promise<FacilityOption[]> {
  // Placeholder: replace with GraphQL facilityOptions query
  return FACILITIES.filter(f => f.isActive)
}

export async function loadLabAreas(facilityId: string): Promise<LabAreaOption[]> {
  // Placeholder: replace with GraphQL labAreaOptions(facilityId) query
  return LAB_AREAS.filter(a => a.facilityId === facilityId && a.isActive)
}
