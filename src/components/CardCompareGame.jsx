import { useState } from "react";
import useDialogFocus from "../hooks/useDialogFocus";

const freshDeck = () => {
  const cards = Array.from({ length: 10 }, (_, index) => index + 1);
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[swapIndex]] = [cards[swapIndex], cards[index]];
  }
  return cards;
};

export default function CardCompareGame({ characterName, onRound, onClose }) {
  const [playerDeck, setPlayerDeck] = useState(freshDeck);
  const [characterDeck, setCharacterDeck] = useState(freshDeck);
  const [round, setRound] = useState(null);
  const [score, setScore] = useState({ player: 0, character: 0 });
  const [drawing, setDrawing] = useState(false);
  const dialogRef = useDialogFocus(onClose);
  const finished = playerDeck.length === 0;

  const draw = () => {
    if (drawing || finished) return;
    setDrawing(true);
    setRound(null);
    window.setTimeout(() => {
      const playerCard = playerDeck[0];
      const characterCard = characterDeck[0];
      const result = playerCard === characterCard ? "draw" : playerCard > characterCard ? "win" : "lose";
      const roundNumber = 11 - playerDeck.length;
      setPlayerDeck((cards) => cards.slice(1));
      setCharacterDeck((cards) => cards.slice(1));
      setScore((current) => ({
        player: current.player + (result === "win" ? 1 : 0),
        character: current.character + (result === "lose" ? 1 : 0),
      }));
      setRound({ playerCard, characterCard, result, roundNumber });
      setDrawing(false);
      onRound?.({ playerCard, characterCard, result, roundNumber });
    }, 560);
  };

  const restart = () => {
    setPlayerDeck(freshDeck());
    setCharacterDeck(freshDeck());
    setRound(null);
    setScore({ player: 0, character: 0 });
  };

  const roundText = round?.result === "win" ? "你的牌更大！" : round?.result === "lose" ? `${characterName}的牌更大！` : "一样大，平局！";
  const finalText = score.player === score.character ? "最后是平局！" : score.player > score.character ? "你赢得了整场比赛！" : `${characterName}赢得了整场比赛！`;

  return (
    <div className="card-compare-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="card-compare-game" role="dialog" aria-modal="true" aria-labelledby="card-compare-title">
        <button className="card-compare-close" type="button" onClick={onClose} aria-label="关闭比大小">×</button>
        <header><span aria-hidden="true">🂠 1—10 🂠</span><h2 id="card-compare-title">和{characterName}比大小</h2><p>每人都有 1～10，抽过的牌不会再出现。</p></header>
        <div className="card-compare-score" aria-label={`你${score.player}分，${characterName}${score.character}分`}><b>你 <em>{score.player}</em></b><span>第 {10 - playerDeck.length} / 10 轮</span><b><em>{score.character}</em> {characterName}</b></div>
        <div className={`card-compare-table ${drawing ? "is-drawing" : ""}`} aria-live="polite">
          <div className="card-player"><small>你的牌</small>{round ? <i>{round.playerCard}</i> : <i className="is-back">?</i>}</div>
          <strong>{drawing ? "正在抽牌……" : finished ? finalText : round ? roundText : "抽一张，看看谁更大！"}</strong>
          <div className="card-character"><small>{characterName}的牌</small>{round ? <i>{round.characterCard}</i> : <i className="is-back">?</i>}</div>
        </div>
        <div className="card-deck-status"><span>你的牌堆还剩 <b>{playerDeck.length}</b> 张</span><div aria-hidden="true">{playerDeck.map((_, index) => <i key={index} style={{ transform: `translateX(${index * 3}px)` }} />)}</div><span>{characterName}还剩 <b>{characterDeck.length}</b> 张</span></div>
        {finished
          ? <button className="card-draw-button" type="button" onClick={restart}>重新洗牌再玩一次</button>
          : <button className="card-draw-button" type="button" disabled={drawing} onClick={draw}>{drawing ? "翻牌中……" : round ? "抽下一张牌" : "开始抽牌"}</button>}
      </section>
    </div>
  );
}
