import React from 'react';
import './BarcodePrintDialog.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  maBn: string;
  soLuong: number;
}

const BarcodePrintDialog: React.FC<Props> = ({ open, onClose, onPrint, maBn, soLuong }) => {
  if (!open) return null;
  return (
    <div className="barcode-print-dialog-overlay">
      <div className="barcode-print-dialog">
        <h3>In mã vạch</h3>
        <div>Mã BN: <b>{maBn}</b></div>
        <div>Số lượng ống mẫu: <b>{soLuong}</b></div>
        <div className="dialog-actions">
          <button onClick={onPrint}>In</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrintDialog;
