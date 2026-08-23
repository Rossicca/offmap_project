export default function SpeechBubble({ message, visible }) {
  return (
    <div className={`speech-bubble ${visible ? "is-visible" : ""}`} role="status" aria-live="polite">
      <span aria-hidden="true">✦</span>
      <p>{message}</p>
    </div>
  );
}
