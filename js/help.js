(() => {

  const buttons = document.querySelectorAll(".nav-item");

  const sections = document.querySelectorAll(".help-section");

  const breadcrumb = document.getElementById("breadcrumb");


  function showSection(id) {

    const target = document.getElementById(id);

    if (!target) return;


    // إخفاء جميع الأقسام وإظهار القسم المطلوب

    sections.forEach(section => {

      section.classList.toggle(
        "active",
        section.id === id
      );

    });


    // تحديث القائمة الجانبية

    buttons.forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.section === id
      );

    });


    // تحديث اسم القسم بالأعلى

    const activeButton = document.querySelector(
      `.nav-item[data-section="${id}"]`
    );

    if (activeButton && breadcrumb) {

      breadcrumb.textContent =
        activeButton.innerText.trim();

    }


    // تحريك الشاشة للمحتوى على الموبايل

    if (window.innerWidth <= 850) {

      document
        .querySelector(".content-panel")
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    }

  }


  // الضغط على الأقسام

  buttons.forEach(button => {

    button.addEventListener("click", () => {

      showSection(button.dataset.section);

    });

  });


  // فتح قسم محدد من الرابط

  const requestedSection =
    window.location.hash.replace("#", "");

  if (requestedSection) {

    showSection(requestedSection);

  }


  // جعل سؤال واحد فقط مفتوحًا في الأسئلة الشائعة

  const faqItems = document.querySelectorAll(".faq-list details");

  faqItems.forEach(item => {

    item.addEventListener("toggle", () => {

      if (item.open) {

        faqItems.forEach(other => {

          if (other !== item) {

            other.open = false;

          }

        });

      }

    });

  });

})();
