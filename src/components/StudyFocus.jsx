import { useState } from "react";
import {
  focusDurations,
  formatCountdown,
  formatStudyTotal,
  getNextStudyReward,
  remainingStudyMinutes,
  studyRewards,
  studySubjects,
} from "../data/studyRewards";

export default function StudyFocus({ topic, onTopicChange, study }) {
  const [duration, setDuration] = useState(15);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const subject = studySubjects.find((item) => item.id === (study.activeSession?.subjectId || topic)) || studySubjects[3];
  const nextReward = getNextStudyReward(study.progress.totalSeconds);
  const subjectTotal = study.progress.subjectSeconds[subject.id] || 0;

  return (
    <div className="study-focus">
      {!study.activeSession ? <>
        <div className="study-focus-heading">
          <div><b>专注陪伴</b><small>{subject.name} {formatStudyTotal(subjectTotal)} · 总计 {formatStudyTotal(study.progress.totalSeconds)}</small></div>
          {nextReward ? <p><span aria-hidden="true">{nextReward.mark}</span>再学 {remainingStudyMinutes(nextReward, study.progress.totalSeconds)} 分钟解锁{nextReward.label}</p> : <p><span aria-hidden="true">✓</span>动作奖励已全部解锁</p>}
        </div>
        <div className="learning-topic-list" aria-label="选择学习科目">
          {studySubjects.map((item) => <button key={item.id} type="button" className={topic === item.id ? "is-active" : ""} onClick={() => onTopicChange(item.id)} aria-pressed={topic === item.id}><span aria-hidden="true">{item.mark}</span>{item.name}</button>)}
        </div>
        <div className="study-duration-row" aria-label="选择专注时长">
          <span>学习多久？</span>
          {focusDurations.map((minutes) => <button key={minutes} type="button" className={duration === minutes ? "is-active" : ""} onClick={() => setDuration(minutes)} aria-pressed={duration === minutes}>{minutes} 分钟</button>)}
        </div>
        <button className="study-start-button" type="button" onClick={() => study.startStudy(topic, duration)}><span aria-hidden="true">▶</span>开始 {duration} 分钟{subject.name}专注</button>
      </> : <div className={`study-timer ${study.activeSession.running ? "is-running" : "is-paused"}`}>
        <div className="study-timer-top"><span className="study-subject-mark" aria-hidden="true">{subject.mark}</span><div><b>{subject.name}专注中</b><small>{study.activeSession.running ? "伙伴会安静地陪着你" : "已经暂停，准备好再继续"}</small></div><em>{study.activeSession.running ? "进行中" : "已暂停"}</em></div>
        <strong aria-label={`剩余 ${formatCountdown(study.remainingSeconds)}`}>{formatCountdown(study.remainingSeconds)}</strong>
        <progress max="1" value={study.completionRatio}>已完成 {Math.round(study.completionRatio * 100)}%</progress>
        <div className="study-timer-actions">
          <button type="button" onClick={study.activeSession.running ? study.pauseStudy : study.resumeStudy}>{study.activeSession.running ? "暂停一下" : "继续学习"}</button>
          {!confirmFinish ? <button type="button" onClick={() => setConfirmFinish(true)}>提前结束</button> : <button className="is-confirm" type="button" onClick={() => { setConfirmFinish(false); study.finishStudy(); }}>确认结束并记录</button>}
        </div>
      </div>}

      <div className="study-reward-track" aria-label="学习奖励进度">
        {studyRewards.map((reward) => {
          const unlocked = study.progress.totalSeconds >= reward.seconds;
          return <div key={reward.action} className={unlocked ? "is-unlocked" : "is-locked"} title={`${reward.minutes} 分钟解锁${reward.label}`}><span aria-hidden="true">{unlocked ? reward.mark : "锁"}</span><small>{reward.minutes} 分</small><b>{reward.label}</b></div>;
        })}
      </div>
    </div>
  );
}
