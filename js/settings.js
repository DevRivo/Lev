
(() => {
  "use strict";

  const STORAGE_KEY = "lev_settings_v1";
  const GAME_VERSION = "1.0.0";

  const defaults = {
    sound: true,
    musicVolume: 70,
    effectsVolume: 80,
    microphone: false,
    quality: "high",
    lighting: "high",
    shadows: true,
    movementSensitivity: 5,
    cameraSensitivity: 5,
    language: "ar-eg",
    resolution: "auto",
    brightness: 100,
    vibration: true
  };

  const $ = (id) => document.getElementById(id);

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

      return {
        ...defaults,
        ...saved,
        movementSensitivity: saved.movementSensitivity ?? 5,
        cameraSensitivity: saved.cameraSensitivity ?? 5,
        microphone: saved.microphone ?? false,
        lighting: saved.lighting ?? "high",
        resolution: saved.resolution ?? "auto",
        brightness: saved.brightness ?? 100,
        vibration: saved.vibration ?? true
      };
    } catch {
      return { ...defaults };
    }
  }

  let settings = loadSettings();

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      const status = $("saveStatus");
      status.classList.add("show");

      clearTimeout(saveSettings.timer);
      saveSettings.timer = setTimeout(() => {
        status.classList.remove("show");
      }, 2200);
    } catch {
      $("saveStatus").textContent = "تعذر حفظ الإعدادات على هذا المتصفح.";
      $("saveStatus").classList.add("show");
    }
  }

  function applySettings() {
    // تطبيق سطوع واجهة الإعدادات
    document.documentElement.style.setProperty(
      "--brightness",
      String(settings.brightness / 100)
    );

    // اللغة الحالية للعبة
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";

    // إعدادات حجم العرض هنا تحفظ كاختيار فقط.
    // لا يستطيع المتصفح تغيير دقة شاشة الجهاز الفعلية.
  }

  function updateInterface() {
    $("movementSensitivity").value = settings.movementSensitivity;
    $("cameraSensitivity").value = settings.cameraSensitivity;

    $("soundEnabled").checked = settings.sound;
    $("musicVolume").value = settings.musicVolume;
    $("effectsVolume").value = settings.effectsVolume;

    $("microphoneEnabled").checked = settings.microphone;

    $("quality").value = settings.quality;
    $("lighting").value = settings.lighting;
    $("shadows").checked = settings.shadows;

    $("languageChoice").value = settings.language;
    $("resolution").value = settings.resolution;
    $("brightness").value = settings.brightness;

    $("vibrationEnabled").checked = settings.vibration;

    $("movementValue").textContent = settings.movementSensitivity;
    $("cameraValue").textContent = settings.cameraSensitivity;
    $("musicValue").textContent = settings.musicVolume + "%";
    $("effectsValue").textContent = settings.effectsVolume + "%";
    $("brightnessValue").textContent = settings.brightness + "%";

    applySettings();
  }

  function updateSetting(key, value) {
    settings[key] = value;
    updateInterface();
    saveSettings();
  }

  // التنقل بين الأقسام
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

  // التحكم
  $("movementSensitivity").addEventListener("input", (event) => {
    settings.movementSensitivity = Number(event.target.value);
    $("movementValue").textContent = settings.movementSensitivity;
    saveSettings();
  });

  $("cameraSensitivity").addEventListener("input", (event) => {
    settings.cameraSensitivity = Number(event.target.value);
    $("cameraValue").textContent = settings.cameraSensitivity;
    saveSettings();
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

  // الميكروفون
  $("microphoneEnabled").addEventListener("change", (event) => {
    updateSetting("microphone", event.target.checked);
  });

  // الجرافيك
  $("quality").addEventListener("change", (event) => {
    updateSetting("quality", event.target.value);
  });

  $("lighting").addEventListener("change", (event) => {
    updateSetting("lighting", event.target.value);
  });

  $("shadows").addEventListener("change", (event) => {
    updateSetting("shadows", event.target.checked);
  });

  // اللغة
  $("languageChoice").addEventListener("change", (event) => {
    updateSetting("language", event.target.value);
  });

  // الشاشة
  $("resolution").addEventListener("change", (event) => {
    updateSetting("resolution", event.target.value);
  });

  $("brightness").addEventListener("input", (event) => {
    settings.brightness = Number(event.target.value);
    $("brightnessValue").textContent = settings.brightness + "%";
    applySettings();
    saveSettings();
  });

  $("fullscreenButton").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        $("fullscreenButton").textContent = "إلغاء ملء الشاشة";
      } else {
        await document.exitFullscreen();
        $("fullscreenButton").textContent = "تفعيل";
      }
    } catch {
      alert("المتصفح لا يدعم ملء الشاشة في هذه الحالة.");
    }
  });

  document.addEventListener("fullscreenchange", () => {
    $("fullscreenButton").textContent =
      document.fullscreenElement ? "إلغاء ملء الشاشة" : "تفعيل";
  });

  // الاهتزاز
  $("vibrationEnabled").addEventListener("change", (event) => {
    updateSetting("vibration", event.target.checked);
  });

  // التحديثات
  $("currentVersion").textContent = GAME_VERSION;

  $("checkUpdates").addEventListener("click", () => {
    $("updateResult").textContent =
      "لم يتم ربط خادم التحديثات بعد. إصدار لعبتك الحالي هو " +
      GAME_VERSION + ".";
  });

  // استعادة الإعدادات الافتراضية
  $("resetSettings").addEventListener("click", () => {
    const confirmed = window.confirm(
      "هل تريد استعادة جميع إعدادات ليف إلى الوضع الافتراضي؟"
    );

    if (!confirmed) return;

    settings = { ...defaults };
    updateInterface();
    saveSettings();
  });

  // تحميل الإعدادات عند فتح الصفحة
  updateInterface();

})();
