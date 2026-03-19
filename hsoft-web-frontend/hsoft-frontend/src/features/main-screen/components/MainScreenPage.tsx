import { useEffect, useMemo, useState } from "react";

import { useMainScreenPayload } from "../hooks/useMainScreenPayload";
import { routeDispatchMap } from "../utils/routeDispatchMap";
import { MainQueueBoard } from "./MainQueueBoard";
import { MainScreenHeader } from "./MainScreenHeader";
import { RoleAwareMenu } from "./RoleAwareMenu";
import { WorkflowTimelinePanel } from "./WorkflowTimelinePanel";

interface MainScreenPageProps {
  sessionToken?: string;
  onRequireRelogin: (reason: string) => void;
  onLogout: () => void;
}

export function MainScreenPage({ sessionToken, onRequireRelogin, onLogout }: MainScreenPageProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const {
    payload,
    loading,
    errorMessage,
    invalidContextReason,
    selectedItem,
    selectedTimeline,
    staleSelectionNotice,
    setSelectedItem,
    refresh,
    evaluateAction,
  } = useMainScreenPayload(sessionToken);

  const summaries = useMemo(() => payload?.summaries ?? [], [payload]);
  const queue = useMemo(() => payload?.queue ?? [], [payload]);
  const context = payload?.context;

  const totalOverdue = useMemo(
    () => summaries.reduce((acc, item) => acc + item.overdueCount, 0),
    [summaries]
  );

  useEffect(() => {
    if (invalidContextReason) {
      onRequireRelogin(invalidContextReason);
    }
  }, [invalidContextReason, onRequireRelogin]);

  if (invalidContextReason) {
    return null;
  }

  if (loading && !payload) {
    return <p className="main-screen-loading">Dang tai dashboard...</p>;
  }

  if (!context) {
    return <p className="main-screen-error">{errorMessage || "Khong co du lieu dashboard"}</p>;
  }

  return (
    <div className="main-screen-layout">
      <MainScreenHeader
        context={context}
        onRefresh={() => {
          refresh().catch(() => undefined);
        }}
        onLogoutForContextChange={() => {
          onLogout();
        }}
      />

      <div className="main-screen-kpi-row">
        <button
          type="button"
          className={`main-screen-burger ${isNavOpen ? "is-open" : ""}`.trim()}
          aria-label="Mở menu điều hướng"
          aria-expanded={isNavOpen}
          onClick={() => setIsNavOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <section className="main-screen-kpi">
          <div>Tổng bước: {summaries.length}</div>
          <div>Quá hạn: {totalOverdue}</div>
          <div>Hàng chờ hiện tại: {queue.length}</div>
        </section>
      </div>

      <div className={`main-screen-body ${isNavOpen ? "is-nav-open" : ""}`.trim()}>
        <aside className="main-screen-drawer">
          <RoleAwareMenu roleCode={context.roleCode} />
        </aside>

        <div className="main-screen-workspace">
          <div className="main-screen-content">
            <MainQueueBoard
              queue={queue}
              selectedItemId={selectedItem?.itemId}
              staleSelectionNotice={staleSelectionNotice}
              onSelectItem={setSelectedItem}
              onRunAction={(item, actionKey) => {
                evaluateAction(item.itemId, actionKey)
                  .then((decision) => {
                    if (!decision.allowed) {
                      window.alert(decision.reason || "Action bi tu choi");
                      return;
                    }

                    const route = routeDispatchMap(actionKey, item.routeTarget);
                    window.alert(`Chuyen toi man hinh: ${route}`);
                  })
                  .catch(() => window.alert("Khong the xac thuc hanh dong"));
              }}
            />

            <WorkflowTimelinePanel selectedItem={selectedItem} timeline={selectedTimeline} />
          </div>
        </div>
      </div>

      {errorMessage ? <p className="main-screen-error">{errorMessage}</p> : null}
    </div>
  );
}
