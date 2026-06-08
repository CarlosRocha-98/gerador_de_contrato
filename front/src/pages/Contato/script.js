// --- Hamburguer menu ---
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navActions = document.getElementById("navActions");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  navActions.classList.toggle("open");
});

// --- Status de atendimento em tempo real ---
function updateStatus() {
  const badge = document.getElementById("statusBadge");
  const now = new Date();
  const day = now.getDay(); // 0=Dom … 6=Sab
  const hour = now.getHours();
  const min = now.getMinutes();
  const time = hour * 60 + min;

  const abertoSemana = day >= 1 && day <= 5 && time >= 8 * 60 && time < 18 * 60;
  const abertoSab = day === 6 && time >= 9 * 60 && time < 13 * 60;

  if (abertoSemana || abertoSab) {
    badge.textContent = "🟢 Aberto agora";
    badge.style.background = "rgba(63, 185, 80, 0.18)";
    badge.style.color = "#3fb950";
    badge.style.borderColor = "rgba(63, 185, 80, 0.35)";
  } else {
    badge.textContent = "🔴 Fechado";
    badge.style.background = "rgba(248, 81, 73, 0.12)";
    badge.style.color = "#f85149";
    badge.style.borderColor = "rgba(248, 81, 73, 0.4)";
  }
}

updateStatus();
setInterval(updateStatus, 60000);

// --- Máscara de telefone ---
document.getElementById("telefone").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
  } else if (v.length > 0) {
    v = "(" + v;
  }
  this.value = v;
});

// --- Validação e envio do formulário ---
const form = document.getElementById("contactForm");

function setError(fieldId, errId, show) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (show) {
    field.classList.add("invalid");
    err.classList.add("show");
  } else {
    field.classList.remove("invalid");
    err.classList.remove("show");
  }
  return show;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const assunto = document.getElementById("assunto").value;
  const mensagem = document.getElementById("mensagem").value.trim();
  const lgpd = document.getElementById("lgpd").checked;
  const feedback = document.getElementById("formFeedback");
  const submitBtn = document.getElementById("submitBtn");

  let hasError = false;

  hasError = setError("nome", "nomeErr", nome === "") || hasError;
  hasError = setError("email", "emailErr", !validateEmail(email)) || hasError;
  hasError = setError("assunto", "assuntoErr", assunto === "") || hasError;
  hasError = setError("mensagem", "mensagemErr", mensagem === "") || hasError;

  // LGPD checkbox separado
  const lgpdErr = document.getElementById("lgpdErr");
  if (!lgpd) {
    lgpdErr.classList.add("show");
    hasError = true;
  } else {
    lgpdErr.classList.remove("show");
  }

  if (hasError) {
    feedback.className = "form-feedback error";
    feedback.textContent = "Por favor, corrija os campos destacados antes de enviar.";
    return;
  }

  // Simula envio
  feedback.className = "form-feedback";
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Enviando…';

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Mensagem";
    feedback.className = "form-feedback success";
    feedback.textContent = "✅ Mensagem enviada com sucesso! Retornaremos em até 24 horas.";
    form.reset();
  }, 1800);
});

// Remove erro ao digitar
["nome", "email", "assunto", "mensagem"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    document.getElementById(id).classList.remove("invalid");
    const errEl = document.getElementById(id + "Err");
    if (errEl) errEl.classList.remove("show");
  });
});

document.getElementById("lgpd").addEventListener("change", () => {
  document.getElementById("lgpdErr").classList.remove("show");
});
