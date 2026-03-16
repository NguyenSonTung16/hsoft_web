import type { WorkflowQueueItemDto } from "../services/mainScreenService";

interface MainQueueBoardProps {
  queue: WorkflowQueueItemDto[];
  selectedItemId?: string;
  staleSelectionNotice?: string;
  onSelectItem: (item: WorkflowQueueItemDto) => void;
  onRunAction: (item: WorkflowQueueItemDto, actionKey: string) => void;
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function MainQueueBoard({
  queue,
  selectedItemId,
  staleSelectionNotice,
  onSelectItem,
  onRunAction,
}: MainQueueBoardProps) {
  return (
    <section className="main-screen-panel queue-panel">
      <header className="panel-header">
        <h3>Hàng chờ</h3>
        <span className="panel-count">{queue.length} công việc</span>
      </header>

      {staleSelectionNotice ? <p className="panel-notice">{staleSelectionNotice}</p> : null}

      <div className="queue-table-wrap">
        <table className="queue-table">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Bước</th>
              <th>BN</th>
              <th>Vào bước</th>
              <th>SLA</th>
              <th>Mức độ</th>
              <th className="queue-action-col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => {
              const selected = item.itemId === selectedItemId;
              return (
                <tr
                  key={item.itemId}
                  className={`${selected ? "is-selected" : ""} sla-${item.slaState}`.trim()}
                  onClick={() => onSelectItem(item)}
                >
                  <td>{item.orderId}</td>
                  <td>{item.currentStep}</td>
                  <td>{item.patientDisplayName || item.patientId}</td>
                  <td>{formatDate(item.enteredStepAt)}</td>
                  <td>{item.slaState}</td>
                  <td>{item.priorityLevel}</td>
                  <td className="queue-action-col">
                    <button
                      className="queue-open-btn"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRunAction(item, item.nextAllowedActions[0] || "open_work_item");
                      }}
                    >
                      Mở
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
