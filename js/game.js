/* LEV Main Menu
   حفظ التقدم محليًا باستخدام localStorage.
*/
(() => {
  "use strict";

  const SAVE_KEY = "lev_save_v1";
  const SETTINGS_KEY = "lev_settings_v1";

  const $ = (id) => document.getElementById(id);

  const playButton = $("playButton");
  const continueButton = $("continueButton");
  const settingsButton = $("settingsButton");
  const helpButton = $("helpButton");
  const exitButton = $("exitButton");

  const modalBackdrop = $("modalBackdrop");
  const modalTitle = $("modalTitle");
  const modalContent = $("modalContent");
  const modalActions = $("modalActions");
  const toast = $("toast");

  // التأكد من وجود العناصر الأساسية
  if (
    !playButton ||
    !continueButton ||
    !settingsButton ||
    !helpButton ||
    !exitButton ||
    !modalBackdrop ||
    !modalTitle ||
    !modalContent ||
    !modalActions ||
    !toast
  ) {
    console.error("LEV: بعض عناصر القائمة الرئيسية غير موجودة في HTML.");
    return;
  }

  // جميع أزرار القائمة
  const menuButtons = [
    playButton,
    continueButton,
    settingsButton,
    helpButton,
    exitButton
  ];

  // تحديد الزر الذي تم الضغط عليه فقط
  function setActiveButton(activeButton) {
    menuButtons.forEach((button) => {
      button.classList.remove("is-active");
    });

    if (activeButton) {
      activeButton.classList.add("is-active");
    }
  }

  // إعادة جميع الأزرار إلى اللون الأسود
  function clearActiveButton() {
    menuButtons.forEach((button) => {
      button.classList.remove("is-active");
    });
  }

  // قراءة التقدم المحفوظ
  function readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);

      if (!raw) return null;

      const data = JSON.parse(raw);

      return data && data.hasProgress === true ? data : null;
    } catch {
      return null;
    }
  }

  // إظهار زر متابعة عند وجود تقدم محفوظ فقط
  function refreshContinueButton() {
    continueButton.hidden = !readSave();
  }

  // حفظ التقدم
  function saveProgress(progress = {}) {
    const current = {
      hasProgress: true,
      checkpoint: progress.checkpoint || "بداية اللعبة",
      updatedAt: new Date().toISOString(),
      ...progress
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(current));

    refreshContinueButton();

    return current;
  }

  // إنشاء نافذة منبثقة
  function showModal(title, html, actions = []) {
    modalTitle.textContent = title;
    modalContent.innerHTML = html;
    modalActions.replaceChildren();

    actions.forEach((action) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = `action-button ${action.primary ? "confirm" : ""}`;
      button.textContent = action.label;

      button.addEventListener("click", action.onClick);

      modalActions.appendChild(button);
    });

    modalBackdrop.hidden = false;
  }

  // إغلاق النافذة وإعادة الألوان
  function closeModal() {
    modalBackdrop.hidden = true;
    clearActiveButton();
  }

  // إشعار صغير
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);

    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  // حماية النصوص قبل عرضها داخل HTML
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  // بدء لعبة جديدة
  function startNewGame() {
    showModal(
      "لعبة جديدة",
      `
        <p>
          هنا هتبدأ رحلة عادل من أول يوم في الشقة.
        </p>
        <p>
          مرحلة اللعب نفسها لسه تحت التطوير،
          ولما نضيفها هنربطها بنظام الحفظ ونحدد أول نقطة حفظ فعلية.
        </p>
      `,
      [
        {
          label: "رجوع للقائمة",
          primary: true,
          onClick: closeModal
        }
      ]
    );
  }

  // متابعة آخر تقدم محفوظ
  function continueGame() {
    const save = readSave();

    if (!save) {
      refreshContinueButton();
      showToast("مفيش تقدم محفوظ لحد دلوقتي.");
      clearActiveButton();
      return;
    }

    const date = save.updatedAt
      ? new Date(save.updatedAt).toLocaleString("ar-EG")
      : "";

    showModal(
      "متابعة اللعبة",
      `
        <p>
          آخر نقطة حفظ:
          <strong>${escapeHtml(save.checkpoint || "نقطة محفوظة")}</strong>
        </p>

        ${date ? `<small>آخر حفظ: ${escapeHtml(date)}</small>` : ""}

        <br><br>

        <p>
          هنربط الزر ده بتحميل المرحلة المحفوظة عند إضافة نظام اللعب.
        </p>
      `,
      [
        {
          label: "رجوع للقائمة",
          primary: true,
          onClick: closeModal
        }
      ]
    );
  }

  // قراءة الإعدادات
  function readSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
        sound: true,
        quality: "high"
      };
    } catch {
      return {
        sound: true,
        quality: "high"
      };
    }
  }

  // نافذة إعدادات مؤقتة
  function openSettings() {
    const settings = readSettings();

    showModal(
      "الإعدادات",
      `
        <label class="setting-row">
          <span>المؤثرات الصوتية</span>
          <input
            id="soundSetting"
            type="checkbox"
            ${settings.sound ? "checked" : ""}
          >
        </label>

        <label class="setting-row">
          <span>جودة العرض</span>

          <select id="qualitySetting">
            <option value="high" ${settings.quality === "high" ? "selected" : ""}>
              عالية
            </option>

            <option value="medium" ${settings.quality === "medium" ? "selected" : ""}>
              متوسطة
            </option>

            <option value="low" ${settings.quality === "low" ? "selected" : ""}>
              منخفضة
            </option>
          </select>
        </label>

        <small>
          الإعدادات دي مبدئية، وسيتم ربطها بالصوت والجرافيك الفعليين أثناء تطوير اللعبة.
        </small>
      `,
      [
        {
          label: "حفظ",
          primary: true,
          onClick: () => {
            const next = {
              sound: $("soundSetting").checked,
              quality: $("qualitySetting").value
            };

            localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));

            closeModal();

            showToast("تم حفظ الإعدادات.");
          }
        },
        {
          label: "إلغاء",
          onClick: closeModal
        }
      ]
    );
  }

  // المساعدة
  function openHelp() {
    showModal(
      "المساعدة",
      `
        <p>استخدم أزرار القائمة للتنقل بين أقسام اللعبة.</p>

        <p><strong>العب:</strong> بدء مغامرة جديدة.</p>

        <p>
          <strong>متابعة:</strong>
          استكمال آخر تقدم محفوظ، ولن يظهر قبل وجود حفظ.
        </p>

        <p>
          <strong>الإعدادات:</strong>
          التحكم في الخيارات المتاحة للعبة.
        </p>

        <p>اللعبة ما زالت في مرحلة بناء النموذج الأولي.</p>
      `,
      [
        {
          label: "تمام",
          primary: true,
          onClick: closeModal
        }
      ]
    );
  }

  // الخروج
  function exitGame() {
    showModal(
      "هل أنت متأكد من الخروج؟",
      `
        <div class="exit-dialog">

          <div class="exit-icon">
            <i class="fa-solid fa-power-off"></i>
          </div>

          <p>هل تريد مغادرة لعبة ليف الآن؟</p>

          <small>تأكد من حفظ تقدمك قبل الخروج.</small>

        </div>
      `,
      [
        {
          label: "العودة للعبة",
          onClick: closeModal
        },
        {
          label: "نعم، خروج",
          primary: true,
          onClick: () => {
            closeModal();

            window.close();

            showToast("يمكنك إغلاق صفحة اللعبة من المتصفح.");
          }
        }
      ]
    );
  }

  // زر العب
  playButton.addEventListener("click", () => {
    setActiveButton(playButton);
    startNewGame();
  });

  // زر متابعة
  continueButton.addEventListener("click", () => {
    setActiveButton(continueButton);
    continueGame();
  });

  // زر الإعدادات
  settingsButton.addEventListener("click", () => {
    setActiveButton(settingsButton);
    window.location.href = "settings.html";
  });

  // زر المساعدة
  helpButton.addEventListener("click", () => {
    setActiveButton(helpButton);
    openHelp();
  });

  // زر الخروج
  exitButton.addEventListener("click", () => {
    setActiveButton(exitButton);
    exitGame();
  });

  // إغلاق النافذة
  $("modalClose").addEventListener("click", closeModal);

  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  // إغلاق النافذة بزر Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalBackdrop.hidden) {
      closeModal();
    }
  });

  // عند الرجوع إلى القائمة الرئيسية
  window.addEventListener("pageshow", () => {
    clearActiveButton();
    refreshContinueButton();
  });

  // وظائف متاحة لنظام اللعب مستقبلًا
  window.LEV = {
    saveProgress,
    getSave: readSave,

    clearSave() {
      localStorage.removeItem(SAVE_KEY);
      refreshContinueButton();
    }
  };

  // تشغيل التحديث الأولي
  refreshContinueButton();
  clearActiveButton();

})();
