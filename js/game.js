/* LEV Main Menu
   القائمة الرئيسية ونظام حفظ التقدم والتنقل إلى عالم اللعبة.
*/

(() => {
  "use strict";

  const SAVE_KEY = "lev_save_v1";

  const $ = (id) => document.getElementById(id);

  // أزرار القائمة
  const playButton = $("playButton");
  const continueButton = $("continueButton");
  const settingsButton = $("settingsButton");
  const helpButton = $("helpButton");
  const exitButton = $("exitButton");

  // عناصر النوافذ
  const modalBackdrop = $("modalBackdrop");
  const modalTitle = $("modalTitle");
  const modalContent = $("modalContent");
  const modalActions = $("modalActions");
  const toast = $("toast");

  // التأكد من وجود العناصر
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

  const menuButtons = [
    playButton,
    continueButton,
    settingsButton,
    helpButton,
    exitButton
  ];

  // تحديد الزر النشط
  function setActiveButton(activeButton) {
    menuButtons.forEach((button) => {
      button.classList.remove("is-active");
    });

    if (activeButton) {
      activeButton.classList.add("is-active");
    }
  }

  // إعادة الأزرار إلى حالتها الطبيعية
  function clearActiveButton() {
    menuButtons.forEach((button) => {
      button.classList.remove("is-active");
    });
  }

  // قراءة الحفظ
  function readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);

      if (!raw) return null;

      const data = JSON.parse(raw);

      return data && data.hasProgress === true ? data : null;

    } catch (error) {
      console.error("LEV: تعذر قراءة الحفظ.", error);
      return null;
    }
  }

  // تحديث زر متابعة
  function refreshContinueButton() {
    continueButton.hidden = !readSave();
  }

  // حفظ التقدم
  function saveProgress(progress = {}) {
    const current = {
      ...progress,
      hasProgress: true,
      checkpoint: progress.checkpoint || "بداية اليوم الأول",
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(current)
      );

      refreshContinueButton();

      return current;

    } catch (error) {
      console.error("LEV: تعذر حفظ التقدم.", error);
      showToast("تعذر حفظ التقدم على الجهاز.");
      return null;
    }
  }

  // إنشاء نافذة منبثقة
  function showModal(title, html, actions = []) {
    modalTitle.textContent = title;
    modalContent.innerHTML = html;
    modalActions.replaceChildren();

    actions.forEach((action) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className =
        `action-button ${action.primary ? "confirm" : ""}`;

      button.textContent = action.label;

      button.addEventListener("click", action.onClick);

      modalActions.appendChild(button);
    });

    modalBackdrop.hidden = false;
  }

  // إغلاق النافذة
  function closeModal() {
    modalBackdrop.hidden = true;
    clearActiveButton();
  }

  // إشعار
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);

    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  // حماية النصوص
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
    saveProgress({
      checkpoint: "بداية اليوم الأول",
      scene: "apartment",
      day: 1
    });

    window.location.href = "play.html?mode=new";
  }

  // متابعة آخر تقدم
  function continueGame() {
    const save = readSave();

    if (!save) {
      refreshContinueButton();
      showToast("مفيش تقدم محفوظ لحد دلوقتي.");
      clearActiveButton();
      return;
    }

    window.location.href = "play.html?mode=continue";
  }

  // الخروج
  function exitGame() {
    showModal(
      "الخروج",
      `
        <div class="exit-dialog">

          <div class="exit-icon">
            <i class="fa-solid fa-power-off"></i>
          </div>

          <p>هل تريد مغادرة لعبة ليف الآن؟</p>

          <small>
            تأكد من حفظ تقدمك قبل الخروج.
          </small>

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

            showToast(
              "يمكنك إغلاق صفحة اللعبة من المتصفح."
            );
          }
        }
      ]
    );
  }

  // زر العب
  playButton.addEventListener("click", () => {
    startNewGame();
  });

  // زر متابعة
  continueButton.addEventListener("click", () => {
    continueGame();
  });

  // زر الإعدادات
  settingsButton.addEventListener("click", () => {
    window.location.href = "settings.html";
  });

  // زر المساعدة
  helpButton.addEventListener("click", () => {
    window.location.href = "help.html";
  });

  // زر الخروج
  exitButton.addEventListener("click", () => {
    setActiveButton(exitButton);
    exitGame();
  });

  // إغلاق النافذة
  const modalClose = $("modalClose");

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  // الضغط خارج النافذة
  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  // زر Escape
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !modalBackdrop.hidden
    ) {
      closeModal();
    }
  });

  // عند الرجوع للقائمة
  window.addEventListener("pageshow", () => {
    clearActiveButton();
    refreshContinueButton();
  });

  // وظائف الحفظ المتاحة لباقي أجزاء اللعبة
  window.LEV = {
    saveProgress,
    getSave: readSave,

    clearSave() {
      try {
        localStorage.removeItem(SAVE_KEY);
        refreshContinueButton();
        showToast("تم حذف التقدم المحفوظ.");
      } catch (error) {
        console.error("LEV: تعذر حذف الحفظ.", error);
      }
    }
  };

  // التشغيل الأول
  refreshContinueButton();
  clearActiveButton();

})();
