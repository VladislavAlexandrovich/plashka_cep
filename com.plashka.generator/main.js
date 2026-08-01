var csInterface = new CSInterface();
var _plashkaCounter = 0;

var appState = {
  selectedPreset: null,
  isCreating: false
};

var textInput = null;
var createBtn = null;
var presetCards = null;
var statusEl = null;

function setStatus(msg, isError) {
  if (statusEl) {
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#ff6b6b' : '#4fc3f7';
  }
}

function init() {
  textInput = document.getElementById('text-input');
  createBtn = document.getElementById('create-btn');
  presetCards = document.querySelectorAll('.preset-card');
  statusEl = document.getElementById('status');

  if (!textInput || !createBtn || presetCards.length === 0) return;

  textInput.addEventListener('input', onTextChange);
  presetCards.forEach(function(card) { card.addEventListener('click', onPresetSelect); });
  createBtn.addEventListener('click', onCreateClick);

  updateCreateButton();
  setStatus('Ready', false);
}

function onTextChange() { updateCreateButton(); }

function onPresetSelect(event) {
  var card = event.currentTarget;
  if (appState.selectedPreset === card.dataset.preset) {
    card.classList.remove('selected', 'glass', 'three-d', 'neon', 'minimal');
    appState.selectedPreset = null;
  } else {
    presetCards.forEach(function(c) {
      c.classList.remove('selected', 'glass', 'three-d', 'neon', 'minimal');
    });
    card.classList.add('selected');
    card.classList.add(card.dataset.preset === '3d' ? 'three-d' : card.dataset.preset);
    appState.selectedPreset = card.dataset.preset;
  }
  updateCreateButton();
}

function updateCreateButton() {
  var hasText = textInput && textInput.value.trim().length > 0;
  var hasPreset = appState.selectedPreset !== null;
  createBtn.disabled = !(hasText && hasPreset);
}

function onCreateClick() {
  if (appState.isCreating) return;
  var text = textInput.value.trim();
  if (!text || !appState.selectedPreset) return;

  appState.isCreating = true;
  createBtn.textContent = 'Creating...';
  createBtn.disabled = true;
  setStatus('', false);
  _plashkaCounter++;

  var script = 'createPlashka("' + appState.selectedPreset + '", ' + JSON.stringify(text) + ', ' + _plashkaCounter + ')';
  csInterface.evalScript(script, function(result) {
    appState.isCreating = false;
    createBtn.textContent = 'Create';
    createBtn.disabled = false;
    updateCreateButton();

    if (result === 'OK') {
      setStatus('Plashka created!', false);
    } else {
      setStatus(result ? result.replace('ERROR: ', '') : 'Unknown error', true);
    }
  });
}

init();