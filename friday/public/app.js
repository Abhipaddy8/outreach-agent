// Friday — the voice loop (runs entirely in the browser).
//
// Flow:  you speak  →  Web Speech API transcribes (free, on-device)
//        →  send transcript + history to /chat  →  Claude streams a reply
//        →  speechSynthesis speaks it out loud automatically (no file to tap)
//        →  Friday listens again.
//
// Tap the orb once to start a session (a user gesture is required by iOS to
// unlock the microphone and audio playback). Tap again to stop. Tap while
// Friday is talking to interrupt her (barge-in).

const orb = document.getElementById("orb");
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Conversation history sent to the brain each turn (the API is stateless).
const history = [];

let active = false;       // is a session running?
let recognizing = false;  // is the recognizer currently listening?
let recognition = null;
let preferredVoice = null;

// ---------- UI helpers ----------
function setState(state, message) {
  document.body.className = state; // "", "listening", "thinking", "speaking"
  if (message !== undefined) statusEl.textContent = message;
}

function addBubble(role, text) {
  const div = document.createElement("div");
  div.className = "bubble " + (role === "user" ? "user" : "friday");
  div.textContent = text;
  transcriptEl.appendChild(div);
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
  return div;
}

// ---------- Voice output ----------
// Two modes: "elevenlabs" (natural, via the server) or "browser" (free, on-device).
// The server tells us which at /config. Chunks are spoken in order through a queue
// so streamed sentences don't overlap.
let ttsMode = "browser";
let speakQueue = [];
let speaking = false;
let currentAudio = null;

async function loadConfig() {
  try {
    const cfg = await (await fetch("/config")).json();
    ttsMode = cfg.tts || "browser";
  } catch (_) { /* keep browser default */ }
}
loadConfig();

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  preferredVoice =
    voices.find(v => /en[-_]?(GB|US)/i.test(v.lang) && /female|samantha|aria|jenny|libby/i.test(v.name)) ||
    voices.find(v => /^en/i.test(v.lang)) ||
    voices[0];
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

// Queue a chunk of text to be spoken (non-blocking).
function enqueueSpeak(text) {
  if (!text.trim()) return;
  speakQueue.push(text);
  if (!speaking) drainSpeakQueue();
}

async function drainSpeakQueue() {
  speaking = true;
  while (speakQueue.length) {
    const text = speakQueue.shift();
    try {
      if (ttsMode === "elevenlabs") await speakEleven(text);
      else await speakBrowser(text);
    } catch (_) {
      try { await speakBrowser(text); } catch (_) {} // fall back if ElevenLabs fails
    }
  }
  speaking = false;
}

function speakBrowser(text) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    if (preferredVoice) u.voice = preferredVoice;
    u.rate = 1.25;
    u.pitch = 1.0;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

async function speakEleven(text) {
  const res = await fetch("/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("tts " + res.status);
  const url = URL.createObjectURL(await res.blob());
  return new Promise(resolve => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.playbackRate = 1.12; // a touch snappier
    const done = () => { URL.revokeObjectURL(url); if (currentAudio === audio) currentAudio = null; resolve(); };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

// Stop everything immediately (barge-in / session end).
function stopSpeaking() {
  speakQueue = [];
  speaking = false;
  speechSynthesis.cancel();
  if (currentAudio) { try { currentAudio.pause(); } catch (_) {} currentAudio = null; }
}

function isSpeaking() {
  return speaking || speakQueue.length > 0 || speechSynthesis.speaking ||
    (currentAudio && !currentAudio.paused);
}

// Unlock audio playback inside the user's tap (required by iOS for both modes).
function unlockAudio() {
  try { speechSynthesis.speak(new SpeechSynthesisUtterance(" ")); } catch (_) {}
  try {
    const silent = new Audio(
      "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    );
    silent.play().catch(() => {});
  } catch (_) {}
}

// ---------- Talking to the brain ----------
async function askFriday(userText) {
  history.push({ role: "user", content: userText });
  setState("thinking", "Friday is thinking…");

  const reply = addBubble("friday", "");
  let full = "";
  let spokenUpTo = 0; // index in `full` we've already sent to TTS

  // Speak complete sentences as they stream in, for low latency.
  const flushSentences = (final = false) => {
    const pending = full.slice(spokenUpTo);
    const matches = [...pending.matchAll(/[^.!?]+[.!?]+(\s|$)/g)];
    let cut = 0;
    for (const m of matches) cut = m.index + m[0].length;
    const ready = final ? pending : pending.slice(0, cut);
    if (ready.trim()) {
      spokenUpTo += final ? pending.length : cut;
      enqueueSpeak(ready);
    }
  };

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });

    const readerStream = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    setState("speaking", "Friday");

    while (true) {
      const { value, done } = await readerStream.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const obj = JSON.parse(data);
          if (obj.error) throw new Error(obj.error);
          if (obj.text) {
            full += obj.text;
            reply.textContent = full;
            transcriptEl.scrollTop = transcriptEl.scrollHeight;
            flushSentences(false);
          }
        } catch (e) { /* ignore partial JSON */ }
      }
    }
    flushSentences(true); // speak any trailing fragment
    history.push({ role: "assistant", content: full });

    // Wait for speech to drain, then listen again.
    await waitForSpeechEnd();
  } catch (err) {
    reply.textContent = "(Friday had a problem: " + err.message + ")";
    enqueueSpeak("Sorry, I ran into a problem.");
    await waitForSpeechEnd();
  }

  if (active) startListening();
}

function waitForSpeechEnd() {
  return new Promise(resolve => {
    const check = () => {
      if (!isSpeaking()) resolve();
      else setTimeout(check, 150);
    };
    check();
  });
}

// ---------- Voice input (free, on-device STT) ----------
function startListening() {
  if (!active || recognizing) return;
  try {
    recognition.start();
  } catch (_) { /* already starting */ }
}

function buildRecognition() {
  const r = new SpeechRecognition();
  r.lang = "en-US";
  r.continuous = false;     // iOS Safari stops after each utterance — we restart on end
  r.interimResults = true;

  r.onstart = () => { recognizing = true; setState("listening", "Listening…"); };

  r.onresult = (event) => {
    let finalText = "";
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += t;
      else interim += t;
    }
    if (interim) setState("listening", interim);
    if (finalText.trim()) {
      recognition.stop();
      addBubble("user", finalText.trim());
      askFriday(finalText.trim());
    }
  };

  r.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      stopSession("Microphone blocked. Allow mic access and reload.");
    }
    // "no-speech" / "aborted" are normal — onend will restart.
  };

  r.onend = () => {
    recognizing = false;
    // Restart only if we're between turns (not thinking/speaking).
    if (active && document.body.className === "listening") startListening();
  };

  return r;
}

// ---------- Session control ----------
function startSession() {
  if (!SpeechRecognition) {
    setState("", "This browser has no speech recognition. Use Safari on iOS or Chrome.");
    return;
  }
  active = true;
  history.length = 0;
  transcriptEl.innerHTML = "";

  // Unlock audio playback on iOS within the tap gesture (both voice modes).
  unlockAudio();

  recognition = buildRecognition();
  startListening();
}

function stopSession(message = "Tap to wake Friday") {
  active = false;
  recognizing = false;
  try { recognition && recognition.stop(); } catch (_) {}
  stopSpeaking();
  setState("", message);
}

orb.addEventListener("click", () => {
  if (!active) {
    startSession();
  } else if (isSpeaking()) {
    // Barge-in: stop talking, listen again.
    stopSpeaking();
    startListening();
  } else {
    stopSession();
  }
});
