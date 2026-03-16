import { useCallback, useEffect, useMemo, useState } from "react";

import {
  mainScreenService,
} from "../services/mainScreenService";
import type {
  MainScreenPayloadDto,
  WorkflowQueueItemDto,
  WorkflowTimelineDto,
} from "../services/mainScreenService";

interface UseMainScreenPayloadResult {
  payload: MainScreenPayloadDto | null;
  loading: boolean;
  errorMessage?: string;
  invalidContextReason?: string;
  selectedItem?: WorkflowQueueItemDto;
  selectedTimeline?: WorkflowTimelineDto;
  staleSelectionNotice?: string;
  setSelectedItem: (item?: WorkflowQueueItemDto) => void;
  refresh: () => Promise<void>;
  evaluateAction: (itemId: string, actionKey: string) => Promise<{ allowed: boolean; reason?: string }>;
}

export function useMainScreenPayload(sessionToken?: string): UseMainScreenPayloadResult {
  const [payload, setPayload] = useState<MainScreenPayloadDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [invalidContextReason, setInvalidContextReason] = useState<string>();
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [selectedTimeline, setSelectedTimeline] = useState<WorkflowTimelineDto>();
  const [staleSelectionNotice, setStaleSelectionNotice] = useState<string>();

  const loadPayload = useCallback(async () => {
    if (!sessionToken) {
      setPayload(null);
      return;
    }

    setLoading(true);
    setErrorMessage(undefined);

    try {
      const nextPayload = await mainScreenService.getMainScreenPayload(sessionToken);
      setPayload(nextPayload);

      if (!nextPayload.context.isContextValid) {
        setInvalidContextReason(nextPayload.context.invalidReason || "Context is invalid");
        return;
      }

      setInvalidContextReason(undefined);

      if (selectedItemId) {
        const stillExists = nextPayload.queue.some((item) => item.itemId === selectedItemId);
        if (!stillExists) {
          setSelectedItemId(undefined);
          setSelectedTimeline(undefined);
          setStaleSelectionNotice("Work item changed during refresh. Please select another item.");
        } else {
          setStaleSelectionNotice(undefined);
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Load failed");
      if (error instanceof Error && /invalid context|login again|UNAUTHENTICATED/i.test(error.message)) {
        setInvalidContextReason(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [sessionToken, selectedItemId]);

  useEffect(() => {
    loadPayload().catch(() => undefined);
  }, [loadPayload]);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    const timer = window.setInterval(() => {
      loadPayload().catch(() => undefined);
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [loadPayload, sessionToken]);

  const selectedItem = useMemo(
    () => payload?.queue.find((item) => item.itemId === selectedItemId),
    [payload, selectedItemId]
  );

  const setSelectedItem = useCallback((item?: WorkflowQueueItemDto) => {
    setSelectedItemId(item?.itemId);
    setStaleSelectionNotice(undefined);
  }, []);

  useEffect(() => {
    if (!sessionToken || !selectedItemId) {
      setSelectedTimeline(undefined);
      return;
    }

    mainScreenService
      .getWorkflowTimeline(sessionToken, selectedItemId)
      .then((timeline) => setSelectedTimeline(timeline))
      .catch(() => setSelectedTimeline(undefined));
  }, [selectedItemId, sessionToken]);

  const refresh = useCallback(async () => {
    await loadPayload();
  }, [loadPayload]);

  const evaluateAction = useCallback(
    async (itemId: string, actionKey: string) => {
      if (!sessionToken) {
        return { allowed: false, reason: "Missing session" };
      }

      const decision = await mainScreenService.evaluateAction(sessionToken, {
        itemId,
        actionKey,
      });

      return {
        allowed: decision.allowed,
        reason: decision.reasonMessage,
      };
    },
    [sessionToken]
  );

  return {
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
  };
}
