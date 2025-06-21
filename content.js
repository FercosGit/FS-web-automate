// verzió: 1.4.0

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
  const defaultIdx = persons.findIndex(p => p.key === defaultPersonKey);

  const choice = prompt(
    "Ki legyen a kezdő személy?\n" +
    persons.map((p, i) => {
      const label = (p.key === defaultPersonKey) ? `*${p.label}*` : p.label;
      return `${i + 1}. ${label}`;
    }).join("\n") +
    (defaultIdx !== -1 ? `\n(Nyomj Entert az alapértelmezett (${defaultIdx + 1}) kiválasztásához)` : "")
  );

  let idx;
  if (!choice && defaultIdx !== -1) {
    idx = defaultIdx;
  } else {
    idx = parseInt(choice) - 1;
  }

  if (isNaN(idx) || idx < 0 || idx >= persons.length) return;

  const who = persons[idx].key;

  const label = (["baptism", "keresztelő"].some(k => detectEventType().toLowerCase().includes(k))) ? "kerakv" : "szakv";

  let out = "";
  if (who === "gyermek") {
    out = `${name} ${birthYear} ${label} ${eventYear}`;
  } else {
    const parentName = data[who + " neve"];
    out = `${parentName} itt ${fiaLanya} ${name} ${birthYear} ${label} ${eventYear}`;
  }

  return out;
}


  function processMarriageEvent() {
  const rows = document.querySelectorAll('table tr');
  const data = {};
  const links = {};

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

  const personLastName = personName.split(" ")[0];
  const spouseParts = spouseName.split(" ");
  if (spouseParts.length > 2 && spouseParts.includes(personLastName)) {
    spouseParts.splice(spouseParts.indexOf(personLastName), 1);
    spouseName = spouseParts.join(" ");
  }

  const marriageYear = (marriageDate.match(/\d{4}/) || [])[0] || "";

  const persons = [
    { key: "vőlegény",        label: personName,                 sourceKey: "Név",                          suffix: "(fő személy)" },
    { key: "menyasszony",     label: spouseName,                 sourceKey: "Házastárs neve",               suffix: "(házastárs)" },
    { key: "apa",             label: data["Apa neve"] || "",     sourceKey: "Apa neve",                     suffix: "(apa)" },
    { key: "anya",            label: data["Anya neve"] || "",    sourceKey: "Anya neve",                    suffix: "(anya)" },
    { key: "házastárs apja",  label: data["Házastárs apjának neve"] || "", sourceKey: "Házastárs apjának neve", suffix: "(házastárs apja)" },
    { key: "házastárs anyja", label: data["Házastárs anyjának neve"] || "", sourceKey: "Házastárs anyjának neve", suffix: "(házastárs anyja)" }
  ].filter(p => p.label && !p.label.includes("undefined") && p.label.trim() !== "()");

  // Azonosítsuk azt az egyetlen nevet, amelyhez nincs link
  const noLinkEntries = persons.filter(p => links[p.sourceKey] === false);
  const defaultPersonKey = noLinkEntries.length === 1 ? noLinkEntries[0].key : null;
  const defaultIdx = persons.findIndex(p => p.key === defaultPersonKey);

  const choice = prompt(
    "Ki legyen a kezdő személy?\n" +
    persons.map((p, i) => {
      const prefix = (p.key === defaultPersonKey) ? `*${p.label}*` : p.label;
      return `${i + 1}. ${prefix} ${p.suffix}`;
    }).join("\n") +
    (defaultIdx !== -1 ? `\n(Nyomj Entert az alapértelmezett (${defaultIdx + 1}) kiválasztásához)` : "")
  );

  let idx;
  if (!choice && defaultIdx !== -1) {
    idx = defaultIdx;
  } else {
    idx = parseInt(choice) - 1;
  }

  if (isNaN(idx) || idx < 0 || idx >= persons.length) return;

  const who = persons[idx].key;

  let out = "";
  if (who === "vőlegény" || who === "menyasszony") {
    out = `${personName} ${personYear} és ${spouseName} ${spouseYear} hzakv ${marriageYear}`;
  } else if (who === "apa" || who === "anya") {
    out = `${data[who === "apa" ? "Apa neve" : "Anya neve"]} itt fia ${personName} ${personYear} és ${spouseName} ${spouseYear} hzakv ${marriageYear}`;
  } else {
    const other = who === "házastárs apja" ? "Házastárs apjának neve" : "Házastárs anyjának neve";
    out = `${data[other]} itt lánya ${spouseName} ${spouseYear} és ${personName} ${personYear} hzakv ${marriageYear}`;
  }

  return out;
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

  const noLinkEntries = persons.filter(p => links[p.sourceKey.toLowerCase()] === false);
  const defaultPersonKey = noLinkEntries.length === 1 ? noLinkEntries[0].key : null;
  const defaultIdx = persons.findIndex(p => p.key === defaultPersonKey);

  const choice = prompt(
    "Ki legyen a kezdő személy?\n" +
    persons.map((p, i) => {
      const label = (p.key === defaultPersonKey) ? `*${p.label}*` : p.label;
      return `${i + 1}. ${label}`;
    }).join("\n") +
    (defaultIdx !== -1 ? `\n(Nyomj Entert az alapértelmezett (${defaultIdx + 1}) kiválasztásához)` : "")
  );

  let idx;
  if (!choice && defaultIdx !== -1) {
    idx = defaultIdx;
  } else {
    idx = parseInt(choice) - 1;
  }

  if (isNaN(idx) || idx < 0 || idx >= persons.length) return;

  const who = persons[idx].key;
  let out = "";

  if (who === "gyermek") {
    out = `${name} ${birthYear} hlakv ${eventYear} (${deathYear})`;
  } else {
    const parentName = data[who + " neve"];
    out = `${parentName} itt ${fiaLanya} ${name} ${birthYear} hlakv ${eventYear} (${deathYear})`;
  }

  return out;
}


  // --- FUTÁS ---
  const eventTypeRaw = detectEventType();
  const eventType = eventTypeRaw.toLowerCase();

  if (!eventTypeRaw) {
    alert("Nem sikerült kiolvasni az esemény típusát.");
  } else if (["házasság", "marriage"].some(k => eventType.includes(k))) {
    const text = processMarriageEvent();
    if (text) {
      navigator.clipboard.writeText(text).then(() =>
        alert("Kimásolva a vágólapra:\n" + text)
      );
    }
  } else if (["baptism", "keresztelő", "birth registration"].some(k => eventType.includes(k))) {
    const text = processBaptismOrBirth();
    if (text) {
      navigator.clipboard.writeText(text).then(() =>
        alert("Kimásolva a vágólapra:\n" + text)
      );
    }
  } else if (["death registration"].some(k => eventType.includes(k))) {
    const text = processDeathRegistration();
    if (text) {
      navigator.clipboard.writeText(text).then(() =>
        alert("Kimásolva a vágólapra:\n" + text)
      );
    }
  } else {
    alert(`Esemény típusa: ${eventTypeRaw}\n(Nem támogatott még ebben a verzióban.)`);
  }
})();
