/* ========================================
   LEV - HELP PAGE JAVASCRIPT
   ======================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    // عناصر القائمة
    const navItems = document.querySelectorAll(".nav-item");

    // أقسام المساعدة
    const sections = document.querySelectorAll(".help-section");

    // عنوان القسم الحالي
    const breadcrumb = document.getElementById("breadcrumb");

    // التأكد من وجود العناصر
    if (!navItems.length || !sections.length || !breadcrumb) {
      console.error("LEV Help: لم يتم العثور على عناصر صفحة المساعدة.");
      return;
    }

    // تغيير القسم
    function showSection(sectionId) {

      const targetSection = document.getElementById(sectionId);

      // التأكد أن القسم موجود
      if (!targetSection || !targetSection.classList.contains("help-section")) {
        return;
      }

      // إخفاء جميع الأقسام وإزالة التحديد
      sections.forEach((section) => {
        section.classList.remove("active");
      });

      navItems.forEach((item) => {
        item.classList.remove("active");
        item.removeAttribute("aria-current");
      });

      // إظهار القسم المطلوب
      targetSection.classList.add("active");

      // تحديد زر القسم
      const activeButton = document.querySelector(
        `.nav-item[data-section="${sectionId}"]`
      );

      if (activeButton) {
        activeButton.classList.add("active");
        activeButton.setAttribute("aria-current", "page");
        breadcrumb.textContent = activeButton.textContent.trim();
      }

      // إغلاق الأسئلة المفتوحة عند تغيير القسم
      closeOtherFaqs();

      // الرجوع لأعلى محتوى الصفحة
      const contentPanel = document.querySelector(".content-panel");

      if (contentPanel) {
        contentPanel.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }

    // الضغط على أزرار القائمة
    navItems.forEach((button) => {

      button.addEventListener("click", () => {

        const sectionId = button.dataset.section;

        showSection(sectionId);

      });

    });

    // إغلاق الأسئلة الأخرى عند فتح سؤال جديد
    const faqItems = document.querySelectorAll(".faq-list details");

    faqItems.forEach((item) => {

      item.addEventListener("toggle", () => {

        if (item.open) {

          faqItems.forEach((otherItem) => {

            if (otherItem !== item) {
              otherItem.open = false;
            }

          });

        }

      });

    });

    // إغلاق الأسئلة المفتوحة
    function closeOtherFaqs() {

      faqItems.forEach((item) => {
        item.open = false;
      });

    }

    // عرض أول قسم عند فتح الصفحة
    showSection("how-to");

  });

})();
