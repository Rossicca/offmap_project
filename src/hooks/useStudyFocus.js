import { useEffect, useState } from "react";
import { getNewStudyRewards, STUDY_PROGRESS_STORAGE_KEY } from "../data/studyRewards";

const emptyProgress = {
  version: 1,
  totalSeconds: 0,
  subjectSeconds: {},
  completedSessions: 0,
  activeSession: null,
};

const safeNumber = (value, maximum = Number.MAX_SAFE_INTEGER) => Math.max(0, Math.min(maximum, Math.floor(Number(value) || 0)));

const sanitizeSession = (session) => {
  if (!session || !session.id || !session.subjectId) return null;
  const plannedSeconds = safeNumber(session.plannedSeconds, 24 * 60 * 60);
  if (!plannedSeconds) return null;
  return {
    id: String(session.id),
    subjectId: String(session.subjectId),
    plannedSeconds,
    elapsedSeconds: safeNumber(session.elapsedSeconds, plannedSeconds),
    startedAt: safeNumber(session.startedAt),
    running: Boolean(session.running),
  };
};

const loadStudyProgress = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STUDY_PROGRESS_STORAGE_KEY) || "null");
    if (!stored || typeof stored !== "object") return emptyProgress;
    const subjectSeconds = Object.fromEntries(Object.entries(stored.subjectSeconds || {}).map(([subject, seconds]) => [subject, safeNumber(seconds)]));
    return {
      ...emptyProgress,
      totalSeconds: safeNumber(stored.totalSeconds),
      subjectSeconds,
      completedSessions: safeNumber(stored.completedSessions),
      activeSession: sanitizeSession(stored.activeSession),
    };
  } catch {
    return emptyProgress;
  }
};

export const getStudySessionElapsed = (session, now = Date.now()) => {
  if (!session) return 0;
  const runningSeconds = session.running && session.startedAt ? Math.floor(Math.max(0, now - session.startedAt) / 1000) : 0;
  return Math.min(session.plannedSeconds, safeNumber(session.elapsedSeconds) + runningSeconds);
};

export default function useStudyFocus() {
  const [progress, setProgress] = useState(loadStudyProgress);
  const [now, setNow] = useState(Date.now());
  const [lastCompletion, setLastCompletion] = useState(null);
  const activeSession = progress.activeSession;
  const elapsedSeconds = getStudySessionElapsed(activeSession, now);

  useEffect(() => {
    const stored = {
      version: progress.version,
      totalSeconds: progress.totalSeconds,
      subjectSeconds: progress.subjectSeconds,
      completedSessions: progress.completedSessions,
      activeSession: progress.activeSession,
    };
    localStorage.setItem(STUDY_PROGRESS_STORAGE_KEY, JSON.stringify(stored));
  }, [progress]);

  useEffect(() => {
    if (!activeSession?.running) return undefined;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeSession?.id, activeSession?.running]);

  const finishCurrent = (completed = false) => {
    setProgress((current) => {
      const session = current.activeSession;
      if (!session) return current;
      const creditedSeconds = getStudySessionElapsed(session, Date.now());
      const beforeSeconds = current.totalSeconds;
      const afterSeconds = beforeSeconds + creditedSeconds;
      const completion = {
        id: session.id,
        subjectId: session.subjectId,
        creditedSeconds,
        completed: completed || creditedSeconds >= session.plannedSeconds,
        beforeSeconds,
        afterSeconds,
        newRewards: getNewStudyRewards(beforeSeconds, afterSeconds),
      };
      window.queueMicrotask(() => setLastCompletion(completion));
      return {
        ...current,
        totalSeconds: afterSeconds,
        subjectSeconds: {
          ...current.subjectSeconds,
          [session.subjectId]: (current.subjectSeconds[session.subjectId] || 0) + creditedSeconds,
        },
        completedSessions: current.completedSessions + (completion.completed ? 1 : 0),
        activeSession: null,
      };
    });
  };

  useEffect(() => {
    if (activeSession?.running && elapsedSeconds >= activeSession.plannedSeconds) finishCurrent(true);
  }, [activeSession?.id, activeSession?.plannedSeconds, activeSession?.running, elapsedSeconds]);

  const startStudy = (subjectId, minutes) => {
    const plannedSeconds = safeNumber(Number(minutes) * 60, 24 * 60 * 60);
    if (!subjectId || !plannedSeconds) return;
    setLastCompletion(null);
    setNow(Date.now());
    setProgress((current) => current.activeSession ? current : {
      ...current,
      activeSession: {
        id: `study-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        subjectId,
        plannedSeconds,
        elapsedSeconds: 0,
        startedAt: Date.now(),
        running: true,
      },
    });
  };

  const pauseStudy = () => {
    setProgress((current) => {
      const session = current.activeSession;
      if (!session?.running) return current;
      return {
        ...current,
        activeSession: {
          ...session,
          elapsedSeconds: getStudySessionElapsed(session, Date.now()),
          startedAt: 0,
          running: false,
        },
      };
    });
  };

  const resumeStudy = () => {
    setNow(Date.now());
    setProgress((current) => current.activeSession && !current.activeSession.running ? {
      ...current,
      activeSession: { ...current.activeSession, startedAt: Date.now(), running: true },
    } : current);
  };

  const remainingSeconds = activeSession ? Math.max(0, activeSession.plannedSeconds - elapsedSeconds) : 0;
  const completionRatio = activeSession?.plannedSeconds ? Math.min(1, elapsedSeconds / activeSession.plannedSeconds) : 0;

  return {
    progress,
    activeSession,
    elapsedSeconds,
    remainingSeconds,
    completionRatio,
    lastCompletion,
    startStudy,
    pauseStudy,
    resumeStudy,
    finishStudy: () => finishCurrent(false),
  };
}
