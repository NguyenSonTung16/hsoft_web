import type {
  WorkflowQueueItemDto,
  WorkflowTimelineDto,
} from "../services/mainScreenService";

interface WorkflowTimelinePanelProps {
  selectedItem?: WorkflowQueueItemDto;
  timeline?: WorkflowTimelineDto;
}

export function WorkflowTimelinePanel({ selectedItem, timeline }: WorkflowTimelinePanelProps) {
  if (!selectedItem) {
    return (
      <aside className="main-screen-panel timeline-panel">
        <h3>Chi tiết phiếu</h3>
        <p>Chọn một công việc để xem timeline.</p>
      </aside>
    );
  }

  return (
    <aside className="main-screen-panel timeline-panel">
      <h3>Chi tiết phiếu</h3>
      <p><strong>Mã phiếu:</strong> {selectedItem.orderId}</p>
      <p><strong>Bệnh nhân:</strong> {selectedItem.patientDisplayName || selectedItem.patientId}</p>
      <p><strong>Bước hiện tại:</strong> {selectedItem.currentStep}</p>

      <h4>Timeline workflow</h4>
      <ul className="timeline-list">
        {(timeline?.steps || []).map((step) => (
          <li key={step.stepCode} className={`timeline-${step.state}`}>
            <span>{step.stepCode}</span>
            <span>{step.state}</span>
          </li>
        ))}
      </ul>

      {timeline?.blockedReason ? (
        <p className="panel-warning">Blocked: {timeline.blockedReason}</p>
      ) : null}
    </aside>
  );
}
