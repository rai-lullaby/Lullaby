// =========================
// COMPONENTE CALENDÁRIO — VISÃO SEMANAL
// =========================
(function () {
  const calendarTitle = document.getElementById('calendarTitle');
  const calendarDays = document.getElementById('calendarDays');
  const prevBtn = document.getElementById('prevWeek');
  const nextBtn = document.getElementById('nextWeek');

  if (!calendarTitle || !calendarDays || !prevBtn || !nextBtn) {
    console.warn('📅 Calendário semanal não encontrado');
    return;
  }

  let selectedDate = new Date();

  // =========================
  // HELPERS
  // =========================
  function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = domingo
    d.setDate(d.getDate() - day);
    return d;
  }

  function isSameDay(a, b) {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  // =========================
  // RENDER
  // =========================
  function renderWeek() {
    calendarDays.innerHTML = '';

    const weekStart = startOfWeek(selectedDate);
    const today = new Date();

    // Título: Janeiro 2026
    calendarTitle.textContent = selectedDate.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);

      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';

      const weekDay = day.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayNumber = day.getDate();

      dayEl.innerHTML = `
        <span class="week-day">${weekDay}</span>
        <strong class="day-number">${dayNumber}</strong>
      `;

      if (isSameDay(day, today)) {
        dayEl.classList.add('today');
      }

      if (isSameDay(day, selectedDate)) {
        dayEl.classList.add('active');
      }

      dayEl.addEventListener('click', () => {
        selectedDate = new Date(day);

        document
          .querySelectorAll('.calendar-day')
          .forEach(d => d.classList.remove('active'));

        dayEl.classList.add('active');

        console.log('📅 Semana | Dia selecionado:', selectedDate);

        document.dispatchEvent(
          new CustomEvent('calendar:dateSelected', {
            detail: { date: selectedDate }
          })
        );
      });

      calendarDays.appendChild(dayEl);
    }
  }

  // =========================
  // NAVEGAÇÃO SEMANAL
  // =========================
  prevBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 7);
    renderWeek();
  });

  nextBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 7);
    renderWeek();
  });

  // =========================
  // INIT
  // =========================
  renderWeek();
})();
