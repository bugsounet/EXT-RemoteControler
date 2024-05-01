/*
 * EXT-FireTVRemote
 *
 * based from MMM-KeyBindings
 * https://github.com/shbatm/MMM-KeyBindings
 * Adapted for MMM-GoogleAssistant
 */

var log = (...args) => { /* do nothing */ };
const exec = require("child_process").exec;
const path = require("path");
const NodeHelper = require("node_helper");
const evdev = require("evdev");
const udev = require("udev");


module.exports = NodeHelper.create({
  start () {
    this.MonitorCreated = false;
    this.config = {};
    this.eventPath= "/dev/input/EXT-RemoteControler";
    this.throttled = false;
    this.throttledTimeout = null;
    this.throttledLastValue = null;
  },

  socketNotificationReceived (notification, payload) {
    switch (notification) {
      case "INIT":
        if (!this.evdevMonitorCreated) {
          this.config=payload;
          this.initialize();
        }
        break;
      case "SHELLEXEC":
        let cwdPath = path.resolve(__dirname, "scripts/");
        var command = payload;
        if (!command) {
          this.sendSocketNotification("WARN", { message: "ShellExec: no command to execute!" } );
          return console.log("[REMOTE] ShellExec: no command to execute!");
        }
        exec (command, { cwd: cwdPath }, (e,so,se)=> {
          log("ShellExec command:", command);
          if (e) {
            console.log(`[REMOTE] ShellExec Error:${  e}`);
            this.sendSocketNotification("WARN", { message: "ShellExec: execute Error !" } );
          }

          log("SHELLEXEC_RESULT", {
            executed: payload,
            result: {
              error: e,
              stdOut: so,
              stdErr: se
            }
          });
        });
        break;
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
    console.log("[REMOTE] Start Monitor...");
    this.evdevReader = new evdev({ raw: this.config.develop });
    this.MonitorCreated = true;
    this.pendingKeyPress = {};
    this.throttled = false;
    this.throttledLastValue = false;
    this.throttledTimeout = null;

    this.evdevReader
      .on("event", (data) => {
        console.log("[REMOTE] [DEVELOP]", data);
      })
      .on("EV_REL", (data) => {

        // samsung remote controler compatibility
        if (data.code > 0 && this.config.type === "samsung") {
          if (data.value !== this.throttledLastValue) {
            this.throttledLastValue = data.value;
            this.throttled = true;
            clearTimeout(this.throttledTimeout);
            this.throttledTimeout = null;
          } else {
            if (!this.throttledTimeout) {
              this.throttledTimeout = setTimeout(() => {
                this.throttled = false;
                this.throttledTimeout = null;
                this.throttledLastValue = null;
              }, this.config.throttledTimeout);
            }
            if (this.throttled) return;
            else this.throttled = true;
          }

          this.sendSocketNotification("KEY", {
            keyName: data.value,
            keyState: "KEY_PRESSED"
          });
          log(`[TYPE ${this.config.type}] -- SEND Value: ${data.value}`);
        }

        // other remote controler compatibility (for later maybe)

      })
      .on("EV_KEY", (data) => {
        if (this.config.type !== "amazon") return;
        if (data.value > 0) {
          this.pendingKeyPress.code = data.code;
          this.pendingKeyPress.value = data.value;
          this.pendingKeyPress.state = this.pendingKeyPress.value === 1 ? "KEY_PRESSED" : "KEY_LONGPRESSED";
        } else {
          if ("code" in this.pendingKeyPress && this.pendingKeyPress.code === data.code) {
            log(`[TYPE ${this.config.type}] SEND: ${this.pendingKeyPress.code} --> ${this.pendingKeyPress.state}`);
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
          if (e.path) console.warn(`[REMOTE] Device not connected, nothing at path ${e.path}, waiting for device…`);
          else console.warn("[REMOTE] Device disconnected, waiting for device…");
          this.sendSocketNotification("WARN", "Remote disconnected");
          this.waitForDevice();
        } else {
          console.error("[REMOTE]", e);
        }
      });
    this.setupDevice();
    //this.waitForDevice();
  },

  setupDevice () {
    this.device = this.evdevReader.open(this.eventPath);
    this.device.on("open", () => {
      log(`Connected to device: ${this.eventPath} ${JSON.stringify(this.device.id)}`);
      this.sendSocketNotification("INFO", "Remote connected.");
    });
    this.device.on("close", () => {
      log("Connection to device has been closed.");
      this.waitForDevice();
    });
  },

  waitForDevice () {
    this.udevMonitor = udev.monitor("input");
    this.udevMonitor.on("add", (device) => {
      if ("DEVNAME" in device && device.DEVNAME.includes("event")) {
        log("[DEBUG] Found:", device.DEVNAME);
      }
      if ("DEVLINKS" in device && device.DEVLINKS === this.eventPath) {
        log(`Device connected: ${device.DEVNAME}`);
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
