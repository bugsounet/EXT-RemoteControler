
Module.register("EXT-RemoteControler", {
  defaults: {
    debug: false,
    develop: false,
    keyFinder: false,
    type: "samsung",
    throttledTimeout: 250,
    keyMap: {
      amazon: {
        Home: "KEY_HOMEPAGE",
        Enter: "KEY_KPENTER",
        ArrowLeft: "KEY_LEFT",
        ArrowRight: "KEY_RIGHT",
        ArrowUp: "KEY_UP",
        ArrowDown: "KEY_DOWN",
        Menu: "KEY_MENU",
        PlayPause: "KEY_PLAYPAUSE",
        NextTrack: "KEY_FASTFORWARD",
        PreviousTrack: "KEY_REWIND",
        Return: "KEY_BACK"
      },
      samsung: {
        Power: 2,
        Mic: 160,
        123: 210,
        Colors: 206,
        Enter: 104,
        ArrowLeft: 101,
        ArrowRight: 98,
        ArrowUp: 96,
        ArrowDown: 97,
        Return: 88,
        Home: 121,
        PlayPause: 185,
        VolumeInc: 7,
        VolumeDec: 11,
        VolumeMute: 15,
        ChannelInc: 18,
        ChannelDec: 16,
        ChannelGuide: 79
      }
    },
    
    actions: [
      {
        key: "Enter",
        state: "KEY_PRESSED",
        notification: "GA_ACTIVATE"
      },
      {
        key: "Enter",
        state: "KEY_LONGPRESSED",
        notification: "GA_STOP"
      }
    ]
  },

  start () {
    this.reverseKeyMap = {};
    for (var eKey in this.config.keyMap[this.config.type]) {
      if (this.config.keyMap[this.config.type].hasOwnProperty(eKey)) {
        this.reverseKeyMap[this.config.keyMap[this.config.type][eKey]] = eKey;
      }
    }
    this.resources = "/modules/EXT-RemoteControler/resources/";
    this.audio = null;
  },

  getDom () {
    var wrapper = document.createElement("div");
    wrapper.style.display = "none";
    return wrapper;
  },

  notificationReceived (notification, payload, sender) {
    if (notification === "GA_READY" && sender.name === "MMM-GoogleAssistant" ) {
      this.sendSocketNotification("INIT", this.config);
      this.audio = new Audio();
      this.audio.autoplay = true;
      this.sendNotification("EXT_HELLO", this.name);
    }
  },

  socketNotificationReceived (notification, payload) {
    switch (notification) {
      case "KEY":
        this.handleKey(payload);
        break;
      case "WARN":
        this.sendNotification("EXT_ALERT", {
          type: "warning",
          message: payload,
          timer: 2000,
          icon: `${this.resources}remote.jpg`
        });
        break;
      case "INFO":
        this.sendNotification("EXT_ALERT", {
          type: "information",
          message: payload,
          timer: 2000,
          icon: `${this.resources}remote.jpg`
        });
    }
  },

  handleKey (payload) {
    let Key = payload;
    if (Key.keyName in this.reverseKeyMap) {
      Key.keyMap = this.reverseKeyMap[Key.keyName];
    }
    if (this.config.keyFinder) {
      this.sendNotification("EXT_ALERT", {
        type: "information",
        message: `You pressed: ${Key.keyName} (KeyMap: ${Key.keyMap}) with ${Key.keyState}`,
        timer: 1000,
        icon: `${this.resources}remote.jpg`
      });
    }
    let action = this.config.actions.filter((k) => k.key === Key.keyMap);
    if (action) {
      action.forEach((a) => {
        if (a.state && a.state !== Key.keyState) return;
        if (a.notification) this.sendNotification(a.notification, a.payload || undefined);
        if (a.command) this.sendSocketNotification("SHELLEXEC", a.command);
        if (a.sound) this.audio.src = `${this.resources + a.sound}.mp3`;
      });
    }
  }
});
