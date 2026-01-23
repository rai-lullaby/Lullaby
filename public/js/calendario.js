// =========================
// COMPONENTE CALENDÁRIO
// =========================
(function () {
  const calendarTitle = document.getElementById('calendarTitle');
  const calendarDays = document.getElementById('calendarDays');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');

  // Segurança: só executa se o HTML existir
  if (!calendarTitle || !calendarDays || !prevMonthBtn || !nextMonthBtn) {
    console.warn('📅 Calendário não encontrado na página');
    return;
  }

  let currentDate = new Date();

  function renderCalendar(date) {
    calendarDays.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const today = new Date();

    calendarTitle.textContent = date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      calendarDays.appendChild(document.createElement('div'));
    }

    // Dias do mês
    for (let day = 1; day <= lastDate; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.textContent = day;

      // Hoje
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        dayEl.classList.add('today', 'active');
      }

      dayEl.addEventListener('click', () => {
        document
          .querySelectorAll('.calendar-day')
          .forEach(d => d.classList.remove('active'));

        dayEl.classList.add('active');

        const selectedDate = new Date(year, month, day);

        console.log('📅 Dia selecionado:', selectedDate.toISOString());

        // 🔔 Dispara evento global (dashboard pode escutar)
        document.dispatchEvent(
          new CustomEvent('calendar:dateSelected', {
            detail: { date: selectedDate }
          })
        );
      });

      calendarDays.appendChild(dayEl);
    }
  }

  // Navegação
  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  // Inicializa
  renderCalendar(currentDate);
})();
