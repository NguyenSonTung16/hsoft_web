import React from 'react';
import './SampleHistoryTable.css';
import type { SampleHistory } from '../types/sample-collection.types';

interface Props {
  history: SampleHistory[];
}

const SampleHistoryTable: React.FC<Props> = ({ history }) => {
  if (!history.length) return <div>Chưa có lịch sử lấy mẫu</div>;
  return (
    <table className="sample-history-table">
      <thead>
        <tr>
          <th>Ngày giờ</th>
          <th>Loại mẫu</th>
          <th>Kỹ thuật viên</th>
          <th>Tình trạng</th>
          <th>Ghi chú</th>
        </tr>
      </thead>
      <tbody>
        {history.map((item, idx) => (
          <tr key={idx}>
            <td>{item.ngayGio}</td>
            <td>{item.loaiMau}</td>
            <td>{item.kyThuatVien}</td>
            <td>{item.tinhTrang}</td>
            <td>{item.ghiChu || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SampleHistoryTable;
