// version 1.4.1

//import { processMarriageEvent, processBaptismOrBirth, processDeathRegistration } from './eventProcessing.js';

(function () {
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

  // Gather data and link presence
  rows.forEach(row => {
    const th = row.querySelector('th')?.innerText?.trim();
    const td = row.querySelector('td');
    const value = td?.innerText?.trim();
    if (th && value) {
      data[th] = value;
      links[th] = !!td.querySelector('a');
    }
  });

  const personName = data["Név"] || "";
  const personYear = data["Születési dátum"] || "";
  let spouseName = data["Házastárs neve"] || "";
  const spouseYear = data["Házastárs születési dátuma"] || "";
  const marriageDate = data["Esemény dátuma"] || "";

  // Remove redundant last name from spouseName, if present
  const personLastName = personName.split(" ")[0];
  const spouseParts = spouseName.split(" ");
  if (spouseParts.length > 2 && spouseParts.includes(personLastName)) {
    spouseParts.splice(spouseParts.indexOf(personLastName), 1);
    spouseName = spouseParts.join(" ");
  }

  const marriageYear = (marriageDate.match(/\d{4}/) || [])[0] || "";

  // Define relevant persons
  const persons = [
    { key: "vőlegény",        label: personName,                 sourceKey: "Név",                          suffix: "(fő személy)" },
    { key: "menyasszony",     label: spouseName,                 sourceKey: "Házastárs neve",               suffix: "(házastárs)" },
    { key: "apa",             label: data["Apa neve"] || "",     sourceKey: "Apa neve",                     suffix: "(apa)" },
    { key: "anya",            label: data["Anya neve"] || "",    sourceKey: "Anya neve",                    suffix: "(anya)" },
    { key: "házastárs apja",  label: data["Házastárs apjának neve"] || "", sourceKey: "Házastárs apjának neve", suffix: "(házastárs apja)" },
    { key: "házastárs anyja", label: data["Házastárs anyjának neve"] || "", sourceKey: "Házastárs anyjának neve", suffix: "(házastárs anyja)" }
  ].filter(p => p.label && !p.label.includes("undefined") && p.label.trim() !== "()");

  // Find default person (the only one without a link, if any)
  const noLinkEntries = persons.filter(p => links[p.sourceKey] === false);
  const defaultPersonKey = noLinkEntries.length === 1 ? noLinkEntries[0].key : null;

  // Build outputs for each possible choice
  const outputs = persons.map(p => {
    let out = "";
    if (p.key === "vőlegény" || p.key === "menyasszony") {
      out = `${personName} ${personYear} és ${spouseName} ${spouseYear} hzakv ${marriageYear}`;
    } else if (p.key === "apa" || p.key === "anya") {
      out = `${data[p.key === "apa" ? "Apa neve" : "Anya neve"]} itt fia ${personName} ${personYear} és ${spouseName} ${spouseYear} hzakv ${marriageYear}`;
    } else if (p.key === "házastárs apja" || p.key === "házastárs anyja") {
      const other = p.key === "házastárs apja" ? "Házastárs apjának neve" : "Házastárs anyjának neve";
      out = `${data[other]} itt lánya ${spouseName} ${spouseYear} és ${personName} ${personYear} hzakv ${marriageYear}`;
    }
    return {
      label: `${p.label} ${p.suffix}`,
      isDefault: p.key === defaultPersonKey,
      output: out
    };
  });

  return outputs;
}

  function processBaptismOrBirth() {
  const rows = document.querySelectorAll('table tr');
  const data = {};
  const links = {};

  rows.forEach(row => {
    const th = row.querySelector('th')?.innerText?.trim().toLowerCase();
    const td = row.querySelector('td');
    const value = td?.innerText?.trim();
    if (th && value) {
      data[th] = value;
      links[th] = !!td.querySelector('a');
    }
  });

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

  const outputs = persons.map(p => {
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

  return outputs;
}

  function processDeathRegistration() {
  const rows = document.querySelectorAll('table tr');
  const data = {};
  const links = {};

  rows.forEach(row => {
    const th = row.querySelector('th')?.innerText?.trim().toLowerCase();
    const td = row.querySelector('td');
    const value = td?.innerText?.trim();
    if (th && value) {
      data[th] = value;
      links[th] = !!td.querySelector('a');
    }
  });

  const name = data["név"] || "";
  const genderRaw = data["nem"] || "";
  const gender = genderRaw.toLowerCase();
  const birthYear = (data["születési év (becsült)"] || "").match(/\d{4}/)?.[0] || "";
  const deathYear = (data["elhalálozási dátum"] || "").match(/\d{4}/)?.[0] || "";
  const eventYear = (data["esemény dátuma"] || "").match(/\d{4}/)?.[0] || "";

  const fiaLanya = (gender === "m" || gender === "male" || gender === "férfi") ? "fia" :
                   (gender === "f" || gender === "female" || gender === "női") ? "lánya" : "gyermeke";

  const persons = [
    { key: "gyermek", label: name ? `${name} (${birthYear})` : "", sourceKey: "név" },
    { key: "apa", label: data["apa neve"] ? `${data["apa neve"]} (apa)` : "", sourceKey: "apa neve" },
    { key: "anya", label: data["anya neve"] ? `${data["anya neve"]} (anya)` : "", sourceKey: "anya neve" }
  ].filter(p => p.label && !p.label.includes("undefined") && p.label.trim() !== "()");

  const noLinkEntries = persons.filter(p => links[p.sourceKey] === false);
  const defaultPersonKey = noLinkEntries.length === 1 ? noLinkEntries[0].key : null;

  const outputs = persons.map(p => {
    let out = "";
    if (p.key === "gyermek") {
      out = `${name} ${birthYear} hlakv ${eventYear} (${deathYear})`;
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

  return outputs;
}

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
