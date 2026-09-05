document.addEventListener("DOMContentLoaded", () => {
  // 1. Control del Menú Hamburguesa en Celulares
  const navToggle = document.getElementById("navToggle");
  const navWrapper = document.getElementById("navWrapper");

  if (navToggle && navWrapper) {
    // Abrir y cerrar al tocar el botón ☰
    navToggle.addEventListener("click", () => {
      navWrapper.classList.toggle("active");
      const icon = navToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
      }
    });

    // Cerrar automáticamente el menú al hacer clic en cualquier opción
    navWrapper.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navWrapper.classList.remove("active");
        const icon = navToggle.querySelector("i");
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-xmark");
        }
      });
    });
  }

  // 2. Acordeón FAQ
  document.querySelectorAll(".faq-question").forEach((item) => {
    item.addEventListener("click", () => {
      const parent = item.parentElement;
      const isActive = parent.classList.contains("active");

      document.querySelectorAll(".faq-item").forEach((child) => {
        child.classList.remove("active");
      });

      if (!isActive) {
        parent.classList.add("active");
      }
    });
  });

  // 3. Envío AJAX para Web3Forms
  const form = document.getElementById("contactForm");
  const result = document.getElementById("form-result");
  const submitBtn = document.getElementById("btn-submit-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Enviando...";

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      })
        .then(async (response) => {
          let res = await response.json();
          if (response.status == 200) {
            result.style.display = "block";
            result.style.backgroundColor = "rgba(153, 234, 21, 0.15)";
            result.style.color = "#99ea15";
            result.style.border = "1px solid #99ea15";
            result.innerHTML =
              "¡Solicitud enviada con éxito! Te contactaremos a la brevedad 🚀";
            form.reset();
          } else {
            result.style.display = "block";
            result.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
            result.style.color = "#ef4444";
            result.style.border = "1px solid #ef4444";
            result.innerHTML =
              res.message ||
              "Ocurrió un error al enviar. Por favor contáctanos por WhatsApp.";
          }
        })
        .catch((error) => {
          result.style.display = "block";
          result.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
          result.style.color = "#ef4444";
          result.innerHTML = "Error de conexión. Inténtalo nuevamente.";
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML =
            'Enviar Solicitud <i class="fa-solid fa-arrow-up-right-from-square"></i>';
          setTimeout(() => {
            result.style.display = "none";
          }, 6000);
        });
    });
  }

  // 4. Animación progresiva de números en métricas
  const counters = document.querySelectorAll(".hero-metrics .counter");
  const metricsContainer = document.querySelector(".hero-metrics");
  let animated = false;

  const runCounter = () => {
    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      const duration = 1800;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const currentVal = Math.floor(easeOutQuad * target);

        counter.innerText = currentVal;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.innerText = target;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          runCounter();
          animated = true;
        }
      });
    },
    { threshold: 0.3 }
  );

  if (metricsContainer) {
    observer.observe(metricsContainer);
  }
});