import { formatDateISO } from './dateUtils.js';

/* =====================================================
 📅 COMPONENTE CALENDÁRIO — VISÃO SEMANAL
===================================================== */

(function () {

  /* =====================================================
   DOM
  ===================================================== */
  const calendarTitle = document.getElementById('calendarTitle');
  const calendarDays = document.getElementById('calendarDays');
  const prevBtn = document.getElementById('prevWeek');
  const nextBtn = document.getElementById('nextWeek');

  if (!calendarTitle || !calendarDays || !prevBtn || !nextBtn) {
    console.warn('📅 Calendário semanal não encontrado no DOM');
    return;
  }

  /* =====================================================
   STATE
  ===================================================== */
  let selectedDate = new Date(); // sempre Date nativo

  /* =====================================================
   HELPERS
  ===================================================== */
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

  /* =====================================================
   RENDER — SEMANA
  ===================================================== */
  function renderWeek() {
    calendarDays.innerHTML = '';

    const weekStart = startOfWeek(selectedDate);
    const today = new Date();

    // 🗓️ Título (Janeiro 2026)
    calendarTitle.textContent = formatMonthTitle(selectedDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);

      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.dataset.date = formatDateISO(day);

      dayEl.innerHTML = `
        <span class="week-day">${formatWeekDay(day)}</span>
        <span class="day-number">${day.getDate()}</span>
      `;

      // 🟢 Hoje
      if (isSameDay(day, today)) {
        dayEl.classList.add('today');
      }

      // 🔵 Selecionado
      if (isSameDay(day, selectedDate)) {
        dayEl.classList.add('active');
      }

      // 🖱️ Clique no dia
      dayEl.addEventListener('click', () => {
        selectedDate = new Date(day);

        document
          .querySelectorAll('.calendar-day')
          .forEach(el => el.classList.remove('active'));

        dayEl.classList.add('active');

        const iso = formatDateISO(selectedDate);

        console.log('📅 Dia selecionado:', iso);

        // 🔔 Evento global (dashboard escuta)
        document.dispatchEvent(
          new CustomEvent('calendar:dateSelected', {
            detail: {
              date: selectedDate,   // Date
              dateISO: iso          // YYYY-MM-DD
            }
          })
        );
      });

      calendarDays.appendChild(dayEl);
    }
  }

  /* =====================================================
   NAVEGAÇÃO SEMANAL
  ===================================================== */
  prevBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 7);
    renderWeek();
  });

  nextBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 7);
    renderWeek();
  });

  /* =====================================================
   INIT
  ===================================================== */
  renderWeek();

  // 🔔 Dispara data inicial (carregar agenda ao abrir)
  document.dispatchEvent(
    new CustomEvent('calendar:dateSelected', {
      detail: {
        date: selectedDate,
        dateISO: formatDateISO(selectedDate)
      }
    })
  );

})();
