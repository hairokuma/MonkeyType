document.addEventListener('DOMContentLoaded', async () => {
  const checkboxCaseSensitive = document.querySelector('#monkeyTypeCaseSensitive');
  const data = await chrome.storage.sync.get("monkeyTypeCaseSensitive");
  checkboxCaseSensitive.checked = data.monkeyTypeCaseSensitive;
  checkboxCaseSensitive.addEventListener('change', async (e) => {
    const checked = e.target.checked;
    console.log(checked);
    await chrome.storage.sync.set({ "monkeyTypeCaseSensitive": checked });
  });
  const checkboxAutoStart = document.querySelector('#monkeyTypeAutoStart');
  const data2 = await chrome.storage.sync.get("monkeyTypeAutoStart");
  checkboxAutoStart.checked = data2.monkeyTypeAutoStart;
  checkboxAutoStart.addEventListener('change', async (e) => {
    const checked = e.target.checked;
    await chrome.storage.sync.set({ "monkeyTypeAutoStart": checked });
  });
  const monkeyTypeShowSummary = document.querySelector('#monkeyTypeShowSummary');
  const data3 = await chrome.storage.sync.get("monkeyTypeShowSummary");
  monkeyTypeShowSummary.checked = data3.monkeyTypeShowSummary;
  monkeyTypeShowSummary.addEventListener('change', async (e) => {
    const checked = e.target.checked;
    await chrome.storage.sync.set({ "monkeyTypeShowSummary": checked });
  });
});  