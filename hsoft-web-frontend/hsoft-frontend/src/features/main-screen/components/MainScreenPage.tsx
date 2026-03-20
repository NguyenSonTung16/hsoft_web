import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isPhoneWidth, setIsPhoneWidth] = useState(false);
  const [isNarrowWidth, setIsNarrowWidth] = useState(false);
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

  useEffect(() => {
    const phoneQuery = window.matchMedia("(max-width: 768px)");
    const narrowQuery = window.matchMedia("(max-width: 1024px)");

    const applyPhoneMode = (matches: boolean) => {
      setIsPhoneWidth(matches);
      if (!matches) {
        setIsNavOpen(false);
      }
    };

    const applyNarrowMode = (matches: boolean) => {
      setIsNarrowWidth(matches);
    };

    applyPhoneMode(phoneQuery.matches);
    applyNarrowMode(narrowQuery.matches);

    const phoneListener = (event: MediaQueryListEvent) => {
      applyPhoneMode(event.matches);
    };

    const narrowListener = (event: MediaQueryListEvent) => {
      applyNarrowMode(event.matches);
    };

    phoneQuery.addEventListener("change", phoneListener);
    narrowQuery.addEventListener("change", narrowListener);

    return () => {
      phoneQuery.removeEventListener("change", phoneListener);
      narrowQuery.removeEventListener("change", narrowListener);
    };
  }, []);

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
        isNavOpen={isNavOpen}
        onToggleNav={() => setIsNavOpen((prev) => !prev)}
      />

      <div className="main-screen-kpi-row">
        <section className="main-screen-kpi">
          <div>Tổng bước: {summaries.length}</div>
          <div>Quá hạn: {totalOverdue}</div>
          <div>Hàng chờ hiện tại: {queue.length}</div>
        </section>
      </div>

      <div className={`main-screen-body ${isNavOpen ? "is-nav-open" : ""}`.trim()}>
        <aside className="main-screen-drawer">
          <RoleAwareMenu onClose={() => setIsNavOpen(false)} />
        </aside>

        {isPhoneWidth && isNavOpen ? (
          <button
            type="button"
            className="main-screen-overlay"
            aria-label="Đóng menu điều hướng"
            onClick={() => setIsNavOpen(false)}
          />
        ) : null}

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
                    if (actionKey === "open_ordering") {
                      const query = new URLSearchParams();
                      if (item.patientId) {
                        query.set("maBn", item.patientId);
                      }
                      navigate(`${route}?${query.toString()}`);
                      return;
                    }

                    navigate(route);
                  })
                  .catch(() => window.alert("Khong the xac thuc hanh dong"));
              }}
            />

            {!isNarrowWidth ? (
              <WorkflowTimelinePanel selectedItem={selectedItem} timeline={selectedTimeline} />
            ) : null}
          </div>
        </div>
      </div>

      {isNarrowWidth && selectedItem?.slaState === "on_time" ? (
        <div className="main-screen-mobile-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="main-screen-mobile-modal__backdrop"
            aria-label="Đóng chi tiết phiếu"
            onClick={() => setSelectedItem(undefined)}
          />

          <div className="main-screen-mobile-modal__panel">
            <div className="main-screen-mobile-modal__header">
              <h4>Chi tiết phiếu</h4>
              <button type="button" onClick={() => setSelectedItem(undefined)}>
                Đóng
              </button>
            </div>
            <WorkflowTimelinePanel selectedItem={selectedItem} timeline={selectedTimeline} />
          </div>
        </div>
      ) : null}

      {errorMessage ? <p className="main-screen-error">{errorMessage}</p> : null}
    </div>
  );
}
