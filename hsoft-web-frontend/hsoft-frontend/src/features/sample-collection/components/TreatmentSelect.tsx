import React from 'react';
interface Treatment {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Props {
  treatments: Treatment[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const TreatmentSelect: React.FC<Props> = ({ treatments, selectedId, onSelect }) => {
  return (
    <div>
      <h3 className="sample-section-title">Chọn lần điều trị</h3>
      <select
        value={selectedId}
        onChange={e => onSelect(e.target.value)}
        style={{
          width: '100%',
          padding: '7px 12px',
          marginTop: 3,
          borderRadius: 6,
          border: '1px solid #d1d5db',
          fontSize: 15,
          background: '#f8fafc',
          color: '#222',
          transition: 'border 0.2s',
          fontWeight: 400
        }}
      >
        {treatments.map(t => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.startDate} - {t.endDate})
          </option>
        ))}
      </select>
    </div>
  );
};

export default TreatmentSelect;
