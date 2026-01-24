// =========================
// 📅 COMPONENTE CALENDÁRIO — VISÃO SEMANAL
// =========================
import { formatDateISO } from './dateUtils.js';

(function () {
  // =========================
  // DOM
  // =========================
  const calendarTitle = document.getElementById('calendarTitle');
  const calendarDays = document.getElementById('calendarDays');
  const prevBtn = document.getElementById('prevWeek');
  const nextBtn = document.getElementById('nextWeek');

  if (!calendarTitle || !calendarDays || !prevBtn || !nextBtn) {
    console.warn('📅 Calendário semanal não encontrado no DOM');
    return;
  }

  // =========================
  // STATE
  // =========================
  let selectedDate = new Date();              // dia selecionado
  let diasComEventos = new Set();             // YYYY-MM-DD

  // =========================
  // HELPERS
  // =========================
  function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = domingo
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isSameDay(a, b) {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  function formatMonthTitle(date) {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  }

  function formatWeekDay(date) {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short'
    });
  }

  // =========================
  // MARCAR DIAS COM EVENTOS
  // =========================
  function marcarDiasComEventos(dates = []) {
    diasComEventos = new Set(dates);
    renderWeek();
  }

  // =========================
  // RENDER SEMANA
  // =========================
  function renderWeek() {
    calendarDays.innerHTML = '';

    const weekStart = startOfWeek(selectedDate);
    const today = new Date();

    calendarTitle.textContent = formatMonthTitle(selectedDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);

      const iso = formatDateISO(day);

      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.dataset.date = iso;

      dayEl.innerHTML = `
        <span class="week-day">${formatWeekDay(day)}</span>
        <span class="day-number">${day.getDate()}</span>
      `;

      // hoje
      if (isSameDay(day, today)) {
        dayEl.classList.add('today');
      }

      // selecionado
      if (isSameDay(day, selectedDate)) {
        dayEl.classList.add('active');
      }

      // tem eventos
      if (diasComEventos.has(iso)) {
        dayEl.classList.add('has-event');
      }

      // clique
      dayEl.addEventListener('click', () => {
        selectedDate = new Date(day);

        document
          .querySelectorAll('.calendar-day')
          .forEach(el => el.classList.remove('active'));

        dayEl.classList.add('active');

        document.dispatchEvent(
          new CustomEvent('calendar:dateSelected', {
            detail: {
              date: iso,
              dateObj: selectedDate
            }
          })
        );
      });

      calendarDays.appendChild(dayEl);
    }
  }

  // =========================
  // NAVEGAÇÃO
  // =========================
  prevBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 7);
    renderWeek();

    document.dispatchEvent(
      new CustomEvent('calendar:weekChanged', {
        detail: { date: selectedDate }
      })
    );
  });

  nextBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 7);
    renderWeek();

    document.dispatchEvent(
      new CustomEvent('calendar:weekChanged', {
        detail: { date: selectedDate }
      })
    );
  });

  // =========================
  // EVENTOS EXTERNOS
  // =========================
  document.addEventListener('calendar:markEvents', e => {
    marcarDiasComEventos(e.detail.dates || []);
  });

  // =========================
  // INIT
  // =========================
  renderWeek();

  // dispara data inicial (dashboard carrega agenda + resumo)
  document.dispatchEvent(
    new CustomEvent('calendar:dateSelected', {
      detail: {
        date: formatDateISO(selectedDate),
        dateObj: selectedDate
      }
    })
  );
})();
