
const Application = function() {
  this.tuner = new Tuner();
  this.notes = new Notes('.notes', this.tuner);
  this.meter = new Meter('.meter');
  this.frequencyBars = new FrequencyBars('.frequency-bars');
  this.update({ name: 'A', frequency: 440, octave: 4, value: 69, cents: 0 })
};

Application.prototype.start = function() {
  const self = this;

  this.tuner.onNoteDetected = function(note) {
    if (self.notes.isAutoMode) {
      if (self.lastNote === note.name) {
        self.update(note)
      } else {
        self.lastNote = note.name
      }
    }
  };

  self.tuner.init();
  self.frequencyData = new Uint8Array(self.tuner.analyser.frequencyBinCount)

  if (!/Android/i.test(navigator.userAgent)) {
    this.updateFrequencyBars()
  }
};

Application.prototype.updateFrequencyBars = function() {
  if (this.tuner.analyser) {
    this.tuner.analyser.getByteFrequencyData(this.frequencyData);
    this.frequencyBars.update(this.frequencyData)
  }
  requestAnimationFrame(this.updateFrequencyBars.bind(this))
};

Application.prototype.update = function(note) {
  this.notes.update(note);
  this.meter.update((note.cents / 50) * 45)
};

// noinspection JSUnusedGlobalSymbols
Application.prototype.toggleAutoMode = function() {
  this.notes.toggleAutoMode()
};

const app = new Application();
app.start();

// document.getElementById('toggleAutoMode').onclick = app.toggleAutoMode.bind(app);

document.getElementById('startStop').onclick = function (e) {
  if (app.tuner.isRecording()){
    e.target.innerHTML = 'START';
    app.tuner.stopRecord();
  } else {
    e.target.innerHTML = 'STOP';
    app.tuner.init();
    app.tuner.startRecord();
    URL.revokeObjectURL(srcPlayback);
  }
};

var audioElement = document.getElementById('audio');
const uploadButton = document.getElementById('uploadButton');
const uploadInput = document.getElementById('inputUpload');
let srcPlayback;

audioElement.onplay = function (e) {
  app.tuner.init();
  app.tuner.startPlayback();
};

audioElement.onpause = function (e) {
  app.tuner.stopPlayback();
};

uploadInput.onchange = function (ev) {
  URL.revokeObjectURL(srcPlayback);
  const file = ev.target.files[0];
  srcPlayback = URL.createObjectURL(file);
  audioElement.src = srcPlayback;
  audioElement.load();
  uploadButton.innerText = 'FILE: ' + file.name;
};

document.getElementById('clearAudio').onclick = function () {
  audioElement.removeAttribute('src');
  audioElement.load();
  uploadButton.innerText = 'LOAD'
};

uploadButton.onclick = function () {
    uploadInput.click()
};