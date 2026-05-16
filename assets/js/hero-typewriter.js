(function () {
  const root = document.querySelector(".hero-typewriter");
  if (!root) return;

  const content = root.querySelector(".hero-typewriter__content");
  if (!content) return;

  const config = JSON.parse(root.getAttribute("data-config") || "{}");
  const pick = (camel, fallback) =>
    config[camel] ?? config[camel.toLowerCase()] ?? fallback;
  const typingSpeed = pick("typingSpeed", 75);
  const pauseBetweenWords = pick("pauseBetweenWords", 400);
  const pauseDuration = pick("pauseDuration", 1500);
  const deletingSpeed = pick("deletingSpeed", 50);
  const loop = pick("loop", false);
  const cursorBlinkDuration = pick("cursorBlinkDuration", 0.5);

  const cursor = root.querySelector(".hero-typewriter__cursor");
  if (cursor) {
    cursor.style.animationDuration = `${cursorBlinkDuration}s`;
  }

  const usePhraseList = Array.isArray(config.texts) && config.texts.length > 0;
  const words = usePhraseList
    ? config.texts.map(String)
    : (content.dataset.words || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

  if (!words.length) return;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function typeText(text) {
    for (let i = 0; i < text.length; i++) {
      content.textContent += text[i];
      await sleep(typingSpeed);
    }
  }

  async function deleteText() {
    while (content.textContent.length > 0) {
      content.textContent = content.textContent.slice(0, -1);
      await sleep(deletingSpeed);
    }
  }

  /** Type each word, backspace it, then show the next (last word stays unless loop). */
  async function runWordCycle(wordList) {
    for (let w = 0; w < wordList.length; w++) {
      content.textContent = "";
      await typeText(wordList[w]);
      await sleep(pauseBetweenWords);

      const isLast = w === wordList.length - 1;
      if (isLast && !loop) continue;

      await deleteText();
      if (!isLast) await sleep(pauseBetweenWords);
    }
  }

  /** Full phrases: type → pause → delete → next phrase. */
  async function runPhraseCycle(phraseList) {
    for (let i = 0; i < phraseList.length; i++) {
      content.textContent = "";
      await typeText(phraseList[i]);
      const isLast = i === phraseList.length - 1;
      if (!loop && isLast) return;
      await sleep(pauseDuration);
      await deleteText();
    }
  }

  async function run() {
    do {
      if (usePhraseList) {
        await runPhraseCycle(words);
      } else {
        await runWordCycle(words);
      }
    } while (loop);
  }

  run();
})();
