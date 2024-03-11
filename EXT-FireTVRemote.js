
Module.register("EXT-FireTVRemote", {
  defaults: {
    debug: false,
    keyMap: {
      Home: "KEY_HOMEPAGE",
      Enter: "KEY_KPENTER",
      ArrowLeft: "KEY_LEFT",
      ArrowRight: "KEY_RIGHT",
      ArrowUp: "KEY_UP",
      ArrowDown: "KEY_DOWN",
      Menu: "KEY_MENU",
      MediaPlayPause: "KEY_PLAYPAUSE",
      MediaNextTrack: "KEY_FASTFORWARD",
      MediaPreviousTrack: "KEY_REWIND",
      Return: "KEY_BACK"
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
    for (var eKey in this.config.keyMap) {
      if (this.config.keyMap.hasOwnProperty(eKey)) {
        this.reverseKeyMap[this.config.keyMap[eKey]] = eKey;
      }
    }
  },

  notificationReceived (notification, payload, sender) {
    if (notification === "GA_READY" && sender.name === "MMM-GoogleAssistant" ) {
      this.sendSocketNotification("INIT", this.config);
    }
  },

  socketNotificationReceived (notification, payload) {
    if (notification === "KEY") {
      this.handleKey(payload);
    }
  },

  handleKey (payload) {
    if (payload.keyName in this.reverseKeyMap) {
      payload.keyName = this.reverseKeyMap[payload.keyName];
    }
    let action = this.config.actions.filter((k) => k.key === payload.keyName);
    if (action) {
      action.forEach((a) => {
        if (a.state && a.state !== payload.keyState) return;
        this.sendNotification(a.notification, a.payload);
      });
    }
  }
});
