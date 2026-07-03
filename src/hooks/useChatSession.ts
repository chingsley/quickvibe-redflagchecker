import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/client';
import { removeMessagesById } from '@/lib/experienceDelete';
import { applyEditExperienceResult } from '@/lib/experienceEdit';
import { mergeChatMessages } from '@/lib/mergeChatMessages';
import type { ChatMessage, ChatSession, PendingClarification } from '@/api/types';

export function useChatSession(friendId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingClarification, setPendingClarification] =
    useState<PendingClarification | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<string | null>(null);
  const [editingAnalysisId, setEditingAnalysisId] = useState<string | null>(null);

  const applySession = useCallback((session: ChatSession) => {
    setMessages(session.messages);
    setPendingClarification(session.pendingClarification);
    setIsAnalyzing(session.isAnalyzing);
  }, []);

  const loadSession = useCallback(
    async (options?: { showLoader?: boolean; }) => {
      const showLoader = options?.showLoader ?? true;
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const session = await api.getMessages(friendId);
        applySession(session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [friendId, applySession],
  );

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const applySendResult = useCallback(
    (
      optimisticId: string,
      result: {
        messages: ChatMessage[];
        pendingClarification: PendingClarification | null;
        isAnalyzing: boolean;
      },
    ) => {
      setMessages((prev) =>
        mergeChatMessages(prev, {
          removeIds: [optimisticId],
          append: result.messages,
        }),
      );
      setPendingClarification(result.pendingClarification);
      setIsAnalyzing(result.isAnalyzing);
      return result.messages.length === 0;
    },
    [],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isSending || pendingClarification) return;

      setIsSending(true);
      setError(null);
      setIsAnalyzing(true);

      const optimistic: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        friendId,
        analysisId: null,
        role: 'user',
        kind: 'text',
        content: trimmed,
        metadata: null,
        sequence: messages.length + 1,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const result = await api.sendMessage(friendId, trimmed);
        const needsReload = applySendResult(optimistic.id, result);
        if (needsReload) {
          await loadSession({ showLoader: false });
        }
      } catch (err) {
        setMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
        setError(err instanceof Error ? err.message : 'Failed to send message');
        setIsAnalyzing(false);
      } finally {
        setIsSending(false);
      }
    },
    [
      friendId,
      isSending,
      pendingClarification,
      messages.length,
      applySendResult,
      loadSession,
    ],
  );

  const submitClarification = useCallback(
    async (answer: string) => {
      if (!pendingClarification || isSending) return;

      const trimmed = answer.trim();
      if (!trimmed) return;

      setIsSending(true);
      setError(null);

      const optimistic: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        friendId,
        analysisId: pendingClarification.analysisId,
        role: 'user',
        kind: 'text',
        content: trimmed,
        metadata: null,
        sequence: messages.length + 1,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      const analysisId = pendingClarification.analysisId;
      setPendingClarification(null);
      setIsAnalyzing(true);

      try {
        const result = await api.submitClarification(analysisId, trimmed);
        const needsReload = applySendResult(optimistic.id, result);
        if (needsReload) {
          await loadSession({ showLoader: false });
        }
      } catch (err) {
        setMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
        setError(err instanceof Error ? err.message : 'Failed to submit answer');
        setIsAnalyzing(false);
        await loadSession({ showLoader: false });
      } finally {
        setIsSending(false);
      }
    },
    [
      friendId,
      pendingClarification,
      isSending,
      messages.length,
      applySendResult,
      loadSession,
    ],
  );

  const abandonActiveAnalysis = useCallback(async () => {
    setIsAbandoning(true);
    setError(null);
    try {
      const result = await api.abandonActiveAnalysis(friendId);
      if (result.abandonedAnalysisId) {
        setMessages((prev) =>
          prev.filter((message) => message.analysisId !== result.abandonedAnalysisId),
        );
      }
      setPendingClarification(null);
      setIsAnalyzing(false);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to discard analysis';
      setError(message);
      throw err;
    } finally {
      setIsAbandoning(false);
    }
  }, [friendId]);

  const deleteExperience = useCallback(
    async (analysisId: string, userMessageId: string) => {
      setDeletingAnalysisId(analysisId);
      setError(null);
      try {
        const result = await api.deleteExperience(friendId, analysisId, userMessageId);
        setMessages((prev) => removeMessagesById(prev, result.deletedMessageIds));
        if (result.deletedAnalysisId) {
          setPendingClarification((current) => {
            if (current?.analysisId === analysisId) {
              setIsAnalyzing(false);
              return null;
            }
            return current;
          });
        } else {
          const session = await api.getMessages(friendId);
          applySession(session);
        }
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete experience';
        setError(message);
        throw err;
      } finally {
        setDeletingAnalysisId(null);
      }
    },
    [friendId, applySession],
  );

  const editExperience = useCallback(
    async (analysisId: string, userMessageId: string, content: string) => {
      setEditingAnalysisId(analysisId);
      setError(null);
      setIsAnalyzing(true);

      try {
        const result = await api.editExperience(
          friendId,
          analysisId,
          userMessageId,
          content,
        );
        setMessages((prev) => applyEditExperienceResult(prev, result));
        setPendingClarification(result.pendingClarification);
        setIsAnalyzing(result.isAnalyzing);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to edit experience';
        setError(message);
        setIsAnalyzing(false);
        throw err;
      } finally {
        setEditingAnalysisId(null);
      }
    },
    [friendId],
  );

  const hasOngoingAnalysis = Boolean(pendingClarification) || isAnalyzing;

  const inputDisabled =
    isSending || isAnalyzing || Boolean(pendingClarification) || Boolean(editingAnalysisId);

  return {
    messages,
    pendingClarification,
    isAnalyzing,
    isLoading,
    isSending,
    isAbandoning,
    deletingAnalysisId,
    editingAnalysisId,
    inputDisabled,
    hasOngoingAnalysis,
    error,
    sendMessage,
    submitClarification,
    abandonActiveAnalysis,
    deleteExperience,
    editExperience,
    reload: loadSession,
  };
}
