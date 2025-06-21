// version 1.5 refactored functions
import { processMarriageEvent, processBaptismOrBirth, processDeathRegistration } from './eventProcessing.js';

(function () {
  // --- all other functions unchanged (detectEventType, etc.) ---

  function promptUserToSelectAndCopy(choices) {
    if (!choices || choices.length === 0) return;

    // Build prompt message
    const defaultIdx = choices.findIndex(c => c.isDefault);
    let promptMsg = "Válassz egy opciót a következők közül:\n";
    promptMsg += choices.map((c, i) =>
      `${i + 1}. ${c.label}${c.isDefault ? " [alapértelmezett]" : ""}\n${c.output}`
    ).join("\n\n");
    promptMsg += `\n\nÍrd be a sorszámot (1-${choices.length}), vagy nyomj Enter az alapértelmezett kiválasztásához (${defaultIdx + 1}):`;

    // Show prompt and get input
    let userInput = prompt(promptMsg, "");
    let idx;
    if ((!userInput || userInput.trim() === "") && defaultIdx !== -1) {
      idx = defaultIdx;
    } else {
      idx = parseInt(userInput) - 1;
    }

    // Validate input
    if (isNaN(idx) || idx < 0 || idx >= choices.length) {
      alert("Nincs érvényes kiválasztás. Kilépés.");
      return;
    }

    // Copy selected output and show on screen
    navigator.clipboard.writeText(choices[idx].output).then(() =>
      alert("Kiválasztott szöveg a vágólapra másolva:\n\n" + choices[idx].output)
    );
  }

  // --- FUTÁS ---
  const eventTypeRaw = detectEventType();
  const eventType = eventTypeRaw.toLowerCase();

  if (!eventTypeRaw) {
    alert("Nem sikerült kiolvasni az esemény típusát.");
  } else if (["házasság", "marriage"].some(k => eventType.includes(k))) {
    const choices = processMarriageEvent();
    promptUserToSelectAndCopy(choices);
  } else if (["baptism", "keresztelő", "birth registration"].some(k => eventType.includes(k))) {
    const choices = processBaptismOrBirth();
    promptUserToSelectAndCopy(choices);
  } else if (["death registration"].some(k => eventType.includes(k))) {
    const choices = processDeathRegistration();
    promptUserToSelectAndCopy(choices);
  } else {
    alert(`Esemény típusa: ${eventTypeRaw}\n(Nem támogatott még ebben a verzióban.)`);
  }
})();
