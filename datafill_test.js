chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // 1. Látható 'Szerkesztés' gomb megkeresése és megnyomása
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

      // 2. Adatbeírás és Mentés késleltetéssel
      setTimeout(() => {
        const input = document.querySelector('input[data-testid="source-title-field"]');
        if (input) {
          const newValue = "vajon sikerült a szöveg átírása?"; // ezt írd majd dinamikusan ha kell
          input.value = newValue;

          // Triggereljük az eseményeket, mintha tényleg beírták volna
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          alert("Nem található a 'Forrás címe' mező.");
          return;
        }

        // 3. Mentés gomb keresése és kattintása
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
      }, 2000); // várunk 2 másodpercet, hogy megjelenjen a mező
    }
  });
});
