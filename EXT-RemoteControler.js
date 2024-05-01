
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
        VolumeUp: 7,
        VolumeDown: 11,
        VolumeMute: 15,
        ChannelUp: 18,
        ChannelDown: 16,
        ChannelGuide: 79
      }
    },
    
    actions: [
      // type samsung
      {
        type: "samsung",
        key: "Power",
        notification: "EXT_SCREEN-FORCE_TOGGLE"
      },
      {
        type: "samsung",
        key: "Mic",
        notification: "GA_ACTIVATE"
      },
      {
        type: "samsung",
        key: "123",
        notification: "EXT_FREEBOXTV-PLAY",
        payload: "RMCDecouverte"
      },
      {
        type: "samsung",
        key: "Colors",
        notification: "GA_SYSINFO"
      },
      {
        type: "samsung",
        key: "ArrowLeft",
        notification: "EXT_PAGES-DECREMENT"
      },
      {
        type: "samsung",
        key: "ArrowRight",
        notification: "EXT_PAGES-INCREMENT"
      },
      {
        type: "samsung",
        key: "Enter",
        notification: "GA_STOP"
      },
      /* with EXT-Music
      {
        type: "samsung",
        key: "ArrowUp",
        notification: "EXT_MUSIC-NEXT"
      },
      {
        type: "samsung",
        key: "ArrowDown",
        notification: "EXT_MUSIC-PREVIOUS"
      },
      */
      {
        type: "samsung",
        key: "ArrowUp",
        notification: "EXT_SPOTIFY-NEXT"
      },
      {
        type: "samsung",
        key: "ArrowDown",
        notification: "EXT_SPOTIFY-PREVIOUS"
      },
      {
        type: "samsung",
        key: "Return",
        notification: "EXT_STOP"
      },
      {
        type: "samsung",
        key: "Home",
        notification: "EXT_PAGES-HOME"
      },
      /* with EXT-Music
      {
        type: "samsung",
        key: "PlayPause",
        notification: "EXT_MUSIC-PLAY"
      },
      */
      {
        type: "samsung",
        key: "PlayPause",
        notification: "EXT_SPOTIFY-PLAY-TOGGLE"
      },
      {
        type: "samsung",
        key: "VolumeUp",
        notification: "EXT_VOLUME-SPEAKER_UP"
      },
      {
        type: "samsung",
        key: "VolumeDown",
        notification: "EXT_VOLUME-SPEAKER_DOWN"
      },
      {
        type: "samsung",
        key: "VolumeMute",
        notification: "EXT_VOLUME-SPEAKER_MUTE_TOGGLE"
      },
      {
        type: "samsung",
        key: "ChannelUp",
        notification: "EXT_FREEBOXTV-NEXT"
      },
      {
        type: "samsung",
        key: "ChannelDown",
        notification: "EXT_FREEBOXTV-PREVIOUS"
      },
      {
        type: "samsung",
        key: "ChannelGuide",
        notification: "EXT_FREEBOXTV-STOP"
      },

      // type amazon
      {
        type: "amazon",
        key: "ArrowLeft",
        notification: "EXT_PAGES-DECREMENT"
      },
      {
        type: "amazon",
        key: "ArrowRight",
        notification: "EXT_PAGES-INCREMENT"
      },
      {
        type: "amazon",
        key: "Enter",
        state: "KEY_PRESSED",
        notification: "GA_ACTIVATE"
      },
      {
        type: "amazon",
        key: "Enter",
        state: "KEY_LONGPRESSED",
        notification: "GA_STOP"
      },
      {
        type: "amazon",
        key: "ArrowUp",
        notification: "EXT_VOLUME-SPEAKER_UP"
      },
      {
        type: "amazon",
        key: "ArrowDown",
        notification: "EXT_VOLUME-SPEAKER_DOWN"
      },
      {
        type: "amazon",
        key: "Return",
        state: "KEY_PRESSED",
        notification: "EXT_STOP"
      },
      {
        type: "amazon",
        key: "Home",
        state: "KEY_PRESSED",
        notification: "EXT_PAGES-HOME"
      },
      {
        type: "amazon",
        key: "Menu",
        state: "KEY_PRESSED",
        notification: "EXT_SCREEN-FORCE_WAKEUP"
      },
      {
        type: "amazon",
        key: "Menu",
        state: "KEY_LONGPRESSED",
        notification: "EXT_SCREEN-FORCE_END"
      },
      /* with EXT-Music
      {
        type: "amazon",
        key: "PreviousTrack",
        state: "KEY_PRESSED",
        notification: "EXT_MUSIC-PREVIOUS"
      },
      {
        type: "amazon",
        key: "PlayPause",
        state: "KEY_PRESSED",
        notification: "EXT_MUSIC-PLAY"
      },
      {
        type: "amazon",
        key: "PlayPause",
        state: "KEY_LONGPRESSED",
        notification: "EXT_MUSIC-PAUSE"
      },
      {
        type: "amazon",
        key: "NextTrack",
        state: "KEY_PRESSED",
        notification: "EXT_MUSIC-NEXT"
      },
      */
      {
        type: "amazon",
        key: "PreviousTrack",
        state: "KEY_PRESSED",
        notification: "EXT_SPOTIFY-PREVIOUS"
      },
      {
        type: "amazon",
        key: "PlayPause",
        state: "KEY_PRESSED",
        notification: "EXT_SPOTIFY-PLAY"
      },
      {
        type: "amazon",
        key: "PlayPause",
        state: "KEY_LONGPRESSED",
        notification: "EXT_SPOTIFY-PAUSE"
      },
      {
        type: "amazon",
        key: "NextTrack",
        state: "KEY_PRESSED",
        notification: "EXT_SPOTIFY-NEXT"
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
        if (a.type !== this.config.type) return;
        if (a.state && a.state !== Key.keyState && a.type !== "samsung") return;
        if (a.notification) this.sendNotification(a.notification, a.payload || undefined);
        if (a.command) this.sendSocketNotification("SHELLEXEC", a.command);
        if (a.sound) this.audio.src = `${this.resources + a.sound}.mp3`;
      });
    }
  }
});
