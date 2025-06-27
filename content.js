// version 1.5.4 refactored by GitHub Co-pilot
// option handling test

(function () {

 function getAutoSaveEnabled() {
  return new Promise(resolve => {
    chrome.storage.local.get('autoSaveEnabled', data => {
      resolve(!!data.autoSaveEnabled);
    });
  });
}
 
  function sendStatisticEvent(eventName, url) {
    const baseUrl = url.split("/").slice(0, -1).join("/");
    const params = new URLSearchParams();
    params.append("event", eventName);
    params.append("url", baseUrl);

    fetch("https://script.google.com/macros/s/AKfycbyRVTp97VB0xbve8biOZ5-A-y0VcdGaNxoVWMOntH685oGx5KV0Frqa_iLbkkaJifJApg/exec", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    }).catch(err => console.warn("Tracker failed", err));
  }

  function clearObject(obj) {
    Object.keys(obj).forEach(k => delete obj[k]);
  }

  function detectEventType() {
    const rows = document.querySelectorAll('table tr');
    for (const row of rows) {
      const key = row.querySelector('th')?.innerText?.trim().toLowerCase();
      if (key === "esemény típusa") {
        const value = row.querySelector('td')?.innerText?.trim();
        return value || "";
      }
    }
    return "";
  }

  function processMarriageEvent() {
    const rows = document.querySelectorAll('table tr');
    const data = {};
    const links = {};

    rows.forEach(row => {
      const th = row.querySelector('th')?.innerText?.trim().toLowerCase();
      const td = row.querySelector('td');
      const value = td?.innerText?.trim();

      if (th === "név" && value) {
        clearObject(data);
        clearObject(links);
      }

      if (th && value) {
        data[th] = value;
        links[th] = !!td.querySelector('a');
      }
    });

    // Debug
    console.log(data);

    const personName = data["név"] || "";
    const personYear = data["születési dátum"] || "";
    let spouseName = data["házastárs neve"] || "";
    const spouseYear = data["házastárs születési dátuma"] || "";
    const marriageDate = data["esemény dátuma"] || "";

    // Remove redundant last name from spouseName, if present
    const personLastName = personName.split(" ")[0];
    const spouseParts = spouseName.split(" ");
    if (spouseParts.length > 2 && spouseParts.includes(personLastName)) {
      spouseParts.splice(spouseParts.indexOf(personLastName), 1);
      spouseName = spouseParts.join(" ");
    }

    const marriageYear = (marriageDate.match(/\d{4}/) || [])[0] || "";

    const persons = [
      { key: "vőlegény", label: personName, sourceKey: "név", suffix: "(fő személy)" },
      { key: "menyasszony", label: spouseName, sourceKey: "házastárs neve", suffix: "(házastárs)" },
      { key: "apa", label: data["apa neve"] || "", sourceKey: "apa neve", suffix: "(apa)" },
      { key: "anya", label: data["anya neve"] || "", sourceKey: "anya neve", suffix: "(anya)" },
      { key: "házastárs apja", label: data["házastárs apjának neve"] || "", sourceKey: "házastárs apjának neve", suffix: "(házastárs apja)" },
      { key: "házastárs anyja", label: data["házastárs anyjának neve"] || "", sourceKey: "házastárs anyjának neve", suffix: "(házastárs anyja)" }
    ].filter(p => p.label && !p.label.includes("undefined") && p.label.trim() !== "()");

    const noLinkEntries = persons.filter(p => links[p.sourceKey] === false);
    const defaultPersonKey = noLinkEntries.length === 1 ? noLinkEntries[0].key : null;

    return persons.map(p => {
      let out = "";
      if (p.key === "vőlegény" || p.key === "menyasszony") {
        out = `${personName} ${personYear} és ${spouseName} ${spouseYear} hzakv ${marriageYear}`;
      } else if (p.key === "apa" || p.key === "anya") {
        out = `${data[p.key === "apa" ? "apa neve" : "anya neve"]} itt fia ${personName} ${personYear} és ${spouseName} ${spouseYear} hzakv ${marriageYear}`;
      } else if (p.key === "házastárs apja" || p.key === "házastárs anyja") {
        const other = p.key === "házastárs apja" ? "házastárs apjának neve" : "házastárs anyjának neve";
        out = `${data[other]} itt lánya ${spouseName} ${spouseYear} és ${personName} ${personYear} hzakv ${marriageYear}`;
      }
      return {
        label: `${p.label} ${p.suffix}`,
        isDefault: p.key === defaultPersonKey,
        output: out
      };
    });
  }

  function processBaptismOrBirth() {
    const rows = document.querySelectorAll('table tr');
    const data = {};
    const links = {};

    rows.forEach(row => {
      const th = row.querySelector('th')?.innerText?.trim().toLowerCase();
      const td = row.querySelector('td');
      const value = td?.innerText?.trim();

      if (th === "név" && value) {
        clearObject(data);
        clearObject(links);
      }

      if (th && value) {
        data[th] = value;
        links[th] = !!td.querySelector('a');
      }
    });

    // Debug
    console.log(data);

    const name = data["név"] || "";
    const genderRaw = data["nem"] || "";
    const gender = genderRaw.toLowerCase();
    const birthDate = data["születési dátum"] || data["esemény dátuma"] || "";
    const eventDate = data["esemény dátuma"] || "";
    const birthYear = (birthDate.match(/\d{4}/) || [])[0] || "";
    const eventYear = (eventDate.match(/\d{4}/) || [])[0] || "";

    const fiaLanya = (gender === "m" || gender === "male" || gender === "férfi") ? "fia" :
      (gender === "f" || gender === "female" || gender === "női") ? "lánya" : "gyermeke";

    const persons = [
      { key: "gyermek", label: name ? `${name} (${birthYear})` : "", sourceKey: "név" },
      { key: "apa", label: data["apa neve"] ? `${data["apa neve"]} (apa)` : "", sourceKey: "apa neve" },
      { key: "anya", label: data["anya neve"] ? `${data["anya neve"]} (anya)` : "", sourceKey: "anya neve" }
    ].filter(p => p.label && !p.label.includes("undefined") && p.label.trim() !== "()");

    const noLinkEntries = persons.filter(p => links[p.sourceKey] === false);
    const defaultPersonKey = noLinkEntries.length === 1 ? noLinkEntries[0].key : null;

    const labelType = (["baptism", "keresztelő"].some(k => (data["esemény típusa"] || "").toLowerCase().includes(k))) ? "kerakv" : "szakv";

    return persons.map(p => {
      let out = "";
      if (p.key === "gyermek") {
        out = `${name} ${birthYear} ${labelType} ${eventYear}`;
      } else {
        const parentName = data[p.key + " neve"];
        out = `${parentName} itt ${fiaLanya} ${name} ${birthYear} ${labelType} ${eventYear}`;
      }
      return {
        label: p.label,
        isDefault: p.key === defaultPersonKey,
        output: out
      };
    });
  }

  function processDeathRegistration() {
    const rows = document.querySelectorAll('table tr');
    const data = {};
    const links = {};

    rows.forEach(row => {
      const th = row.querySelector('th')?.innerText?.trim().toLowerCase();
      const td = row.querySelector('td');
      const value = td?.innerText?.trim();

      if (th === "név" && value) {
        clearObject(data);
        clearObject(links);
      }

      if (th && value) {
        data[th] = value;
        links[th] = !!td.querySelector('a');
      }
    });

    // Debug
    console.log(data);

    const name = data["név"] || "";
    const genderRaw = data["nem"] || "";
    const gender = genderRaw.toLowerCase();
    let spouseName = data["házastárs neve"] || "";

    // Find birth year key dynamically
    const szulKey = Object.keys(data).find(k => k.startsWith("születési"));
    const birthYear = (szulKey ? data[szulKey] : "").match(/\d{4}/)?.[0] || "";
    const deathYear = (data["elhalálozási dátum"] || "").match(/\d{4}/)?.[0] || "";
    const eventYear = (data["esemény dátuma"] || "").match(/\d{4}/)?.[0] || "";

    // Remove redundant last name from spouseName, if present
    const personLastName = name.split(" ")[0];
    const spouseParts = spouseName.split(" ");
    if (spouseParts.length > 2 && spouseParts.includes(personLastName)) {
      spouseParts.splice(spouseParts.indexOf(personLastName), 1);
      spouseName = spouseParts.join(" ");
    }

    const fiaLanya = (gender === "m" || gender === "male" || gender === "férfi") ? "fia" :
      (gender === "f" || gender === "female" || gender === "női") ? "lánya" : "gyermeke";
    const ferjeNeje = (gender === "m" || gender === "male" || gender === "férfi") ? "férje" :
      (gender === "f" || gender === "female" || gender === "női") ? "neje" : "házastársa";

    const persons = [
      { key: "gyermek", label: name ? `${name} (${birthYear})` : "", sourceKey: "név" },
      { key: "apa", label: data["apa neve"] ? `${data["apa neve"]} (apa)` : "", sourceKey: "apa neve" },
      { key: "anya", label: data["anya neve"] ? `${data["anya neve"]} (anya)` : "", sourceKey: "anya neve" },
      { key: "házastárs", label: data["házastárs neve"] ? `${data["házastárs neve"]} (házastárs)` : "", sourceKey: "házastárs neve" }
    ].filter(p => p.label && !p.label.includes("undefined") && p.label.trim() !== "()");

    const noLinkEntries = persons.filter(p => links[p.sourceKey] === false);
    const defaultPersonKey = noLinkEntries.length === 1 ? noLinkEntries[0].key : null;

    return persons.map(p => {
      let out = "";
      if (p.key === "gyermek") {
        out = `${name} ${birthYear} hlakv ${eventYear} (${deathYear})`;
      } else if (p.key === "házastárs") {
        out = `${spouseName} itt ${ferjeNeje} ${name} ${birthYear} hlakv ${eventYear} (${deathYear})`;
      } else {
        const parentName = data[p.key + " neve"];
        out = `${parentName} itt ${fiaLanya} ${name} ${birthYear} hlakv ${eventYear} (${deathYear})`;
      }
      return {
        label: p.label,
        isDefault: p.key === defaultPersonKey,
        output: out
      };
    });
  }

  function promptUserToSelectAndCopy(choices) {
    if (!choices || choices.length === 0) return;

    const defaultIdx = choices.findIndex(c => c.isDefault);
    const OUTPUT_MAXLEN = 100;

    let promptMsg = "Válassz egy opciót a következők közül:\n";
    promptMsg += choices.map((c, i) => {
      let shortOutput = c.output;
      if (shortOutput.length > OUTPUT_MAXLEN) {
        shortOutput = shortOutput.slice(0, OUTPUT_MAXLEN - 3) + "...";
      }
      return `${i + 1}. ${c.label}${c.isDefault ? " [alapértelmezett]" : ""}\n${shortOutput}`;
    }).join("\n\n");
    promptMsg += `\n\nÍrd be a sorszámot (1-${choices.length}), vagy nyomj Enter az alapértelmezett kiválasztásához (${defaultIdx + 1}):`;

    let userInput = prompt(promptMsg, "");
    let idx;
    if (userInput === null) {
      idx = -1;
      return;
    } else if (userInput.trim() === "" && defaultIdx !== -1) {
      idx = defaultIdx;
    } else {
      idx = parseInt(userInput) - 1;
    }

    if (isNaN(idx) || idx < 0 || idx >= choices.length) {
      alert("Nincs érvényes kiválasztás. Kilépés.");
      return;
    }

    navigator.clipboard.writeText(choices[idx].output).then(() => {
      simulateEditAndFillSourceTitle(choices[idx].output);
    });
  }

  function simulateEditAndFillSourceTitle(newValue = "vajon sikerült a szöveg átírása?") {
    // 1. Find visible 'Szerkesztés' (Edit) button and click it
    const buttons = Array.from(document.querySelectorAll('button[data-testid^="source-button_edit"]'));
    const visibleButton = buttons.find(btn =>
      btn.offsetParent !== null &&
      !btn.disabled &&
      btn.getBoundingClientRect().height > 0
    );

    if (visibleButton) {
      visibleButton.click();
    } else {
      alert("Nem található látható, aktív 'Szerkesztés' gomb.");
      return;
    }

    // 2. Fill in the input and save, with delay for edit field to appear
    setTimeout(() => {
      const input = document.querySelector('input[data-testid="source-title-field"]');
      if (input) {
        input.value = newValue;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        alert("Nem található a 'Forrás címe' mező.");
        return;
      }

      // 3. Find and click the Save button
      // this block execution must depend on autoSaveEnabled option from options.html and options.js
if (await getAutoSaveEnabled()) {
  const saveButton = document.querySelector('[data-testid="source-save-button"]');
  if (
    saveButton &&
    !saveButton.disabled &&
    saveButton.offsetParent !== null &&
    saveButton.getBoundingClientRect().height > 0
  ) {
    saveButton.click();
  } else {
    alert("A 'Mentés' gomb nem aktív vagy nem található.");
  }
}
    }, 1000);
  }

  // --- ENTRY POINT ---
  const eventTypeRaw = detectEventType();
  const eventType = eventTypeRaw.toLowerCase();

  if (!eventTypeRaw) {
    alert("Nem sikerült kiolvasni az esemény típusát.");
  } else if (["házasság", "marriage"].some(k => eventType.includes(k))) {
    const choices = processMarriageEvent();
    promptUserToSelectAndCopy(choices);
    sendStatisticEvent("resolved_event_" + eventTypeRaw.trim().toLowerCase().replace(/\s+/g, "_"), window.location.href);
  } else if (["baptism", "keresztelő", "birth registration"].some(k => eventType.includes(k))) {
    const choices = processBaptismOrBirth();
    promptUserToSelectAndCopy(choices);
    sendStatisticEvent("resolved_event_" + eventTypeRaw.trim().toLowerCase().replace(/\s+/g, "_"), window.location.href);
  } else if (["death registration", "burial"].some(k => eventType.includes(k))) {
    const choices = processDeathRegistration();
    promptUserToSelectAndCopy(choices);
    sendStatisticEvent("resolved_event_" + eventTypeRaw.trim().toLowerCase().replace(/\s+/g, "_"), window.location.href);
  } else {
    alert(`Esemény típusa: ${eventTypeRaw}\n(Nem támogatott még ebben a verzióban.)`);
    sendStatisticEvent("unsopported_event_" + eventTypeRaw.trim().toLowerCase().replace(/\s+/g, "_"), window.location.href);
  }

})();
