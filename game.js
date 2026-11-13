/* LEV Main Menu
   حفظ التقدم محليًا على نفس المتصفح والجهاز باستخدام localStorage.
   عند بناء اللعب الفعلي، استدعِ saveProgress({ checkpoint: "اسم النقطة", ... })
   بعد الوصول إلى نقطة حفظ داخل اللعبة.
*/
(() => {
  "use strict";

  const SAVE_KEY = "lev_save_v1";
  const SETTINGS_KEY = "lev_settings_v1";

  const $ = (id) => document.getElementById(id);
  const playButton = $("playButton");
  const continueButton = $("continueButton");
  const modalBackdrop = $("modalBackdrop");
  const modalTitle = $("modalTitle");
  const modalContent = $("modalContent");
  const modalActions = $("modalActions");
  const toast = $("toast");

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

  function refreshContinueButton() {
    // لا يظهر زر متابعة إطلاقًا إلا إذا وُجد تقدم محفوظ وصالح.
    continueButton.hidden = !readSave();
  }

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

  function closeModal() {
    modalBackdrop.hidden = true;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function startNewGame() {
    // حاليًا هذه واجهة بداية مؤقتة؛ لا ننشئ حفظًا وهميًا قبل وجود مرحلة لعب فعلية.
    showModal(
      "لعبة جديدة",
      "هنا هتبدأ رحلة عادل من أول يوم في الشقة. مرحلة اللعب نفسها لسه تحت التطوير، ولما نضيفها هنربطها بنظام الحفظ ونحدد أول نقطة حفظ فعلية.",
      [{ label: "رجوع للقائمة", primary: true, onClick: closeModal }]
    );
  }

  function continueGame() {
    const save = readSave();
    if (!save) {
      refreshContinueButton();
      showToast("مفيش تقدم محفوظ لحد دلوقتي.");
      return;
    }
    const date = save.updatedAt ? new Date(save.updatedAt).toLocaleString("ar-EG") : "";
    showModal(
      "متابعة اللعبة",
      `آخر نقطة حفظ: <strong>${escapeHtml(save.checkpoint || "نقطة محفوظة")}</strong>${date ? `<br><small>آخر حفظ: ${escapeHtml(date)}</small>` : ""}<br><br>هنربط الزر ده بتحميل المرحلة المحفوظة عند إضافة نظام اللعب.`,
      [{ label: "رجوع للقائمة", primary: true, onClick: closeModal }]
    );
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function readSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { sound: true, quality: "high" }; }
    catch { return { sound: true, quality: "high" }; }
  }

  function openSettings() {
    const settings = readSettings();
    showModal("الإعدادات", `
      <label class="setting-row"><span>المؤثرات الصوتية</span><input id="soundSetting" type="checkbox" ${settings.sound ? "checked" : ""}></label>
      <label class="setting-row"><span>جودة العرض</span>
        <select id="qualitySetting">
          <option value="high" ${settings.quality === "high" ? "selected" : ""}>عالية</option>
          <option value="medium" ${settings.quality === "medium" ? "selected" : ""}>متوسطة</option>
          <option value="low" ${settings.quality === "low" ? "selected" : ""}>منخفضة</option>
        </select>
      </label>
      <small>الإعدادات دي مبدئية، وسيتم ربطها بالصوت والجرافيك الفعليين أثناء تطوير اللعبة.</small>
    `, [
      { label: "حفظ", primary: true, onClick: () => {
        const next = {
          sound: $("soundSetting").checked,
          quality: $("qualitySetting").value
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        closeModal();
        showToast("تم حفظ الإعدادات.");
      }},
      { label: "إلغاء", onClick: closeModal }
    ]);
  }

  function openHelp() {
    showModal("المساعدة", `
      <p>استخدم أزرار القائمة للتنقل بين أقسام اللعبة.</p>
      <p><strong>العب:</strong> بدء مغامرة جديدة.</p>
      <p><strong>متابعة:</strong> استكمال آخر تقدم محفوظ، ولن يظهر قبل وجود حفظ.</p>
      <p><strong>الإعدادات:</strong> خيارات الصوت وجودة العرض.</p>
      <p>اللعبة ما زالت في مرحلة بناء النموذج الأولي.</p>
    `, [{ label: "تمام", primary: true, onClick: closeModal }]);
  }

  function exitGame() {
    showModal(
      "الخروج",
      "هل تريد إغلاق اللعبة؟",
      [
        { label: "إلغاء", onClick: closeModal },
        { label: "خروج", primary: true, onClick: () => {
          closeModal();
          // المتصفحات غالبًا تمنع إغلاق التبويب برمجيًا؛ نعرض رسالة واضحة بدلًا من ذلك.
          showToast("تقدر تقفل صفحة اللعبة من المتصفح.");
        }}
      ]
    );
  }

  playButton.addEventListener("click", startNewGame);
  continueButton.addEventListener("click", continueGame);
  $("settingsButton").addEventListener("click", openSettings);
  $("helpButton").addEventListener("click", openHelp);
  $("exitButton").addEventListener("click", exitGame);
  $("modalClose").addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
  });

  // متاح لمرحلة اللعب لاحقًا: window.LEV.saveProgress({ checkpoint: "المطبخ" })
  window.LEV = {
    saveProgress,
    getSave: readSave,
    clearSave() {
      localStorage.removeItem(SAVE_KEY);
      refreshContinueButton();
    }
  };

  refreshContinueButton();
})();
