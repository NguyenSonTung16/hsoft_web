import React from 'react';
import type { SampleHistory } from '../types/sample-collection.types';

interface Props {
  history: SampleHistory[];
}

const SampleHistoryPanel: React.FC<Props> = ({ history }) => {
  return (
    <div style={{background:'#fff',borderRadius:8,padding:16,boxShadow:'0 1px 4px #0001'}}>
      <b>Lịch sử lấy mẫu</b>
      <table style={{width:'100%',marginTop:8,fontSize:15}}>
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
    </div>
  );
};

export default SampleHistoryPanel;
