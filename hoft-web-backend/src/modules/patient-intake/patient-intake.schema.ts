export const patientIntakeSchema = `#graphql
  input CreatePatientInput {
    maBn: String
    hoTen: String!
    ngaySinh: String!
    gioiTinh: String!
    diaChi: String
    soDienThoai: String
    soTheBHYT: String
    loaiBenhNhan: String!
    doiTuong: String!
  }

  type CreatePatientResult {
    patientId: ID!
    maBn: String!
    createdAt: String!
  }

  extend type Mutation {
    createPatient(input: CreatePatientInput!): CreatePatientResult!
  }
`;