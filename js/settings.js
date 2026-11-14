
(() => {
  "use strict";

  const STORAGE_KEY = "lev_settings_v1";

  const defaults = {
    sound: true,
    musicVolume: 70,
    effectsVolume: 80,
    quality: "high",
    shadows: true,
    performance: false,
    sensitivity: 5,
    language: "ar",
    textSize: "medium"
  };

  const $ = (id) => document.getElementById(id);

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

      return {
        ...defaults,
        ...saved,
        sound: saved.sound !== undefined ? saved.sound : defaults.sound
      };
    } catch {
      return { ...defaults };
    }
  }

  let settings = loadSettings();

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const status = $("saveStatus");
    status.classList.add("show");

    clearTimeout(saveSettings.timer);
    saveSettings.timer = setTimeout(() => {
      status.classList.remove("show");
    }, 2200);
  }

  function applySettings() {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = "rtl";

    const sizes = {
      small: "14px",
      medium: "16px",
      large: "18px"
    };

    document.body.style.fontSize =
      sizes[settings.textSize] || sizes.medium;
  }

  function updateInterface() {
    $("soundEnabled").checked = settings.sound;
    $("musicVolume").value = settings.musicVolume;
    $("effectsVolume").value = settings.effectsVolume;
    $("quality").value = settings.quality;
    $("shadows").checked = settings.shadows;
    $("performance").checked = settings.performance;
    $("sensitivity").value = settings.sensitivity;
    $("language").value = settings.language;
    $("textSize").value = settings.textSize;

    $("musicValue").textContent = settings.musicVolume + "%";
    $("effectsValue").textContent = settings.effectsVolume + "%";
    $("sensitivityValue").textContent = settings.sensitivity;

    applySettings();
  }

  function updateSetting(key, value) {
    settings[key] = value;
    updateInterface();
    saveSettings();
  }

  // التنقل بين أقسام الإعدادات
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const sectionId = button.dataset.section;

      document.querySelectorAll(".tab-button").forEach((tab) => {
        tab.classList.remove("active");
      });

      document.querySelectorAll(".settings-section").forEach((section) => {
        section.classList.remove("active");
      });

      button.classList.add("active");
      $(sectionId).classList.add("active");
    });
  });

  // الصوت
  $("soundEnabled").addEventListener("change", (event) => {
    updateSetting("sound", event.target.checked);
  });

  $("musicVolume").addEventListener("input", (event) => {
    settings.musicVolume = Number(event.target.value);
    $("musicValue").textContent = settings.musicVolume + "%";
    saveSettings();
  });

  $("effectsVolume").addEventListener("input", (event) => {
    settings.effectsVolume = Number(event.target.value);
    $("effectsValue").textContent = settings.effectsVolume + "%";
    saveSettings();
  });

  // الرسومات
  $("quality").addEventListener("change", (event) => {
    updateSetting("quality", event.target.value);
  });

  $("shadows").addEventListener("change", (event) => {
    updateSetting("shadows", event.target.checked);
  });

  $("performance").addEventListener("change", (event) => {
    updateSetting("performance", event.target.checked);
  });

  // التحكم
  $("sensitivity").addEventListener("input", (event) => {
    settings.sensitivity = Number(event.target.value);
    $("sensitivityValue").textContent = settings.sensitivity;
    saveSettings();
  });

  // الإعدادات العامة
  $("language").addEventListener("change", (event) => {
    updateSetting("language", event.target.value);
  });

  $("textSize").addEventListener("change", (event) => {
    updateSetting("textSize", event.target.value);
  });

  // استعادة الإعدادات الافتراضية
  $("resetSettings").addEventListener("click", () => {
    const confirmed = window.confirm(
      "هل تريد استعادة جميع الإعدادات الافتراضية؟"
    );

    if (!confirmed) return;

    settings = { ...defaults };
    updateInterface();
    saveSettings();
  });

  // تحميل الإعدادات المحفوظة
  updateInterface();
})();
