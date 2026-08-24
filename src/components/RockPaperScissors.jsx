import { useState } from "react";
import victoryIcon from "../assets/rps-victory.svg";
import defeatIcon from "../assets/rps-defeat.svg";
import useDialogFocus from "../hooks/useDialogFocus";


const choices = [
  { id: "rock", label: "石头", emoji: "✊" },
  { id: "scissors", label: "剪刀", emoji: "✌️" },
  { id: "paper", label: "布", emoji: "✋" },
];


const beats = { rock: "scissors", scissors: "paper", paper: "rock" };


export default function RockPaperScissors({ characterName, onRound, onClose }) {
  const [round, setRound] = useState(null);
  const [score, setScore] = useState({ player: 0, character: 0 });
  const [countdown, setCountdown] = useState(false);
  const dialogRef = useDialogFocus(onClose);


  const play = (playerChoice) => {
    if (countdown) return;
    setCountdown(true);
    setRound(null);
    window.setTimeout(() => {
      const characterChoice = choices[Math.floor(Math.random() * choices.length)].id;
      const result = playerChoice === characterChoice ? "draw" : beats[playerChoice] === characterChoice ? "win" : "lose";
      setRound({ playerChoice, characterChoice, result });
      setScore((current) => ({
        player: current.player + (result === "win" ? 1 : 0),
        character: current.character + (result === "lose" ? 1 : 0),
      }));
      setCountdown(false);
      onRound?.({ playerChoice, characterChoice, result });
    }, 620);
  };


  const choiceById = (id) => choices.find((choice) => choice.id === id);
  const resultText = round?.result === "win" ? `${characterName}输了！` : round?.result === "lose" ? `${characterName}赢了！` : "平局，再来一次！";
  const resultIcon = round?.result === "win" ? defeatIcon : round?.result === "lose" ? victoryIcon : null;


  return (
    <div className="rps-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="rps-game-card" role="dialog" aria-modal="true" aria-labelledby="rps-title">
        <button className="rps-close" type="button" onClick={onClose} aria-label="关闭石头剪刀布">×</button>
        <header>
          <span aria-hidden="true">✊ ✌️ ✋</span>
          <h2 id="rps-title">和{characterName}玩石头剪刀布</h2>
          <p>选一个，我们一起出拳！</p>
        </header>

        <div className="rps-score" aria-label={`你${score.player}分，${characterName}${score.character}分`}>
          <b>你 <em>{score.player}</em></b><span>比</span><b><em>{score.character}</em> {characterName}</b>
        </div>

        <div className={`rps-round ${countdown ? "is-counting" : ""}`} aria-live="polite">
          {countdown
            ? <strong>石头、剪刀、布……</strong>
            : round
              ? <>
                <div><small>你出了</small><span>{choiceById(round.playerChoice).emoji}</span><b>{choiceById(round.playerChoice).label}</b></div>
                <strong className={`rps-result result-${round.result}`}>
                  {resultIcon ? <img src={resultIcon} alt={round.result === "lose" ? "胜利奖杯" : "失望的失败表情"} /> : <span aria-hidden="true">🤝</span>}
                  <b>{resultText}</b>
                </strong>
                <div><small>{characterName}出了</small><span>{choiceById(round.characterChoice).emoji}</span><b>{choiceById(round.characterChoice).label}</b></div>
              </>
              : <strong>准备好了吗？</strong>}
        </div>

        <div className="rps-choices">
          {choices.map((choice) => (
            <button key={choice.id} type="button" disabled={countdown} onClick={() => play(choice.id)}>
              <span aria-hidden="true">{choice.emoji}</span><b>{choice.label}</b>
            </button>
          ))}
        </div>
        <small className="rps-credit">胜负图案来自 <a href="https://openmoji.org/" target="_blank" rel="noreferrer">OpenMoji</a> · CC BY-SA 4.0</small>
      </section>
    </div>
  );
}
