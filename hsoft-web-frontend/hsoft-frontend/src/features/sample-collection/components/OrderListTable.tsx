import React from 'react';
import './OrderListTable.css';
import type { OrderItem } from '../types/sample-collection.types';

interface Props {
  orders: OrderItem[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
}

const OrderListTable: React.FC<Props> = ({ orders, selectedIds, onSelect }) => {
  return (
    <table className="order-list-table">
      <thead>
        <tr>
          <th></th>
          <th>Tên xét nghiệm</th>
          <th>Số lượng</th>
          <th>Đơn giá</th>
          <th>Đã lấy mẫu</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                disabled={item.daLayMau}
                onChange={e => onSelect(item.id, e.target.checked)}
              />
            </td>
            <td>{item.tenXetNghiem}</td>
            <td>{item.soLuong}</td>
            <td>{item.donGia.toLocaleString()}</td>
            <td>{item.daLayMau ? '✓' : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderListTable;
