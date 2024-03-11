/*
 * EXT-FireTVRemote
 *
 * based from MMM-KeyBindings
 * https://github.com/shbatm/MMM-KeyBindings
 * Adapted for MMM-GoogleAssistant
 */

var log = (...args) => { /* do nothing */ };
const NodeHelper = require("node_helper");
const evdev = require("evdev");
const udev = require("udev");

module.exports = NodeHelper.create({
  start () {
    this.MonitorCreated = false;
    this.config = {};
    this.eventPath= "/dev/input/FireTVRemote";
  },

  socketNotificationReceived (notification, payload) {
    if (notification === "INIT") {
      if (!this.evdevMonitorCreated) {
        this.config=payload;
        this.initialize();
      }
    }
  },

  initialize () {
    if (this.MonitorCreated) {
      console.warn("[REMOTE] Already initialized");
      return;
    }
    if (this.config.debug) log = (...args) => { console.log("[REMOTE]", ...args); };
    console.log("[REMOTE] EXT-FireTVRemote Version:", require("./package.json").version, "rev:", require("./package.json").rev);
    log("Config:", this.config);
    this.startMonitor();
  },

  startMonitor () {
    this.evdevReader = new evdev();
    this.MonitorCreated = true;
    this.pendingKeyPress = {};

    this.evdevReader
      .on("EV_KEY", (data) => {
        if (data.value > 0) {
          this.pendingKeyPress.code = data.code;
          this.pendingKeyPress.value = data.value;
          this.pendingKeyPress.state = this.pendingKeyPress.value === 1 ? "KEY_PRESSED" : "KEY_LONGPRESSED";
          this.pendingKeyPress.type = this.pendingKeyPress.value === 1 ? "pressed." : "long pressed.";
        } else {
          if ("code" in this.pendingKeyPress && this.pendingKeyPress.code === data.code) {
            log(`SEND: ${this.pendingKeyPress.code} --> ${this.pendingKeyPress.type}`);
            this.sendSocketNotification("KEY", {
              keyName: data.code,
              keyState: this.pendingKeyPress.state
            });
          }
          this.pendingKeyPress = {};
        }
      })
      .on("error", (e) => {
        if (e.code === "ENODEV" || e.code === "ENOENT") {
          console.warn(`[REMOTE] Device not connected, nothing at path ${e.path}, waiting for device…`);
          this.waitForDevice();
        } else {
          console.error("[REMOTE]", e);
        }
      });
    this.setupDevice();
  },

  setupDevice () {
    this.device = this.evdevReader.open(this.eventPath);
    this.device.on("open", () => {
      log(`Connected to device: ${this.eventPath} ${JSON.stringify(this.device.id)}`);
    });
    this.device.on("close", () => {
      log("Connection to device has been closed.");
      this.waitForDevice();
    });
  },

  waitForDevice () {
    this.udevMonitor = udev.monitor();
    this.udevMonitor.on("add", (device) => {
      if ("DEVLINKS" in device && device.DEVLINKS === this.eventPath) {
        log("Device connected.");
        this.udevMonitor.close();
        this.setupDevice();
      }
    });
  },

  stop () {
    if (this.MonitorCreated) {
      console.log("[REMOTE] Closing monitor and reader");
      try {
        this.udevMonitor.close();
      } catch (e) {
        if (e.toString().indexOf("Cannot read property 'close' of undefined") === -1) {
          console.error("[REMOTE]", e);
        }
      }
      try {
        this.evdevReader.close();
      } catch (e) {
        console.error("[REMOTE]", e);
      }
    }
  }
});
