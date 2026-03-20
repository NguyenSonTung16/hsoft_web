import React from 'react';
import './PatientInfoCard.css';
import type { PatientInfo } from '../types/sample-collection.types';

interface Props {
  patient: PatientInfo | null;
}

const PatientInfoCard: React.FC<Props> = ({ patient }) => {
  if (!patient) return null;
  return (
    <div className="patient-info-card">
      <div><b>Mã BN:</b> {patient.maBn}</div>
      <div><b>Họ tên:</b> {patient.hoTen}</div>
      <div><b>Ngày sinh:</b> {patient.ngaySinh}</div>
      <div><b>Giới tính:</b> {patient.gioiTinh}</div>
      <div><b>Địa chỉ:</b> {patient.diaChi}</div>
      <div><b>Số thẻ BHYT:</b> {patient.soTheBHYT}</div>
      <div><b>Loại BN:</b> {patient.loaiBn}</div>
      <div><b>Đối tượng:</b> {patient.doiTuong}</div>
    </div>
  );
};

export default PatientInfoCard;
