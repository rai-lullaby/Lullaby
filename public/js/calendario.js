import { formatDateISO } from './dateUtils.js';

// =====================================================
// 📅 CALENDÁRIO — MENSAL (ADMIN) | SEMANAL (OUTROS)
// =====================================================
(function () {

  // =====================================================
  // DOM
  // =====================================================
  const calendarTitle = document.getElementById('calendarTitle');
  const calendarDays = document.getElementById('calendarDays');
  const prevBtn = document.getElementById('prevWeek');
  const nextBtn = document.getElementById('nextWeek');

  if (!calendarTitle || !calendarDays || !prevBtn || !nextBtn) {
    console.warn('📅 Calendário não encontrado');
    return;
  }

  // =====================================================
  // USER / MODE
  // =====================================================
  const user = JSON.parse(localStorage.getItem('user'));
  const MODE = user?.perfil === 'ADMIN' ? 'month' : 'week';

  console.log('📅 Calendário modo:', MODE);

  // =====================================================
  // STATE
  // =====================================================
  let currentDate = new Date();
  let datesWithEvents = new Set();

  // =====================================================
  // HELPERS
  // =====================================================
  function startOfWeek(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  }

  // =====================================================
  // RENDER — SEMANA
  // =====================================================
  function renderWeek() {
    calendarDays.innerHTML = '';

    const weekStart = startOfWeek(currentDate);
    calendarTitle.textContent = formatMonthTitle(currentDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      renderDay(day);
    }
  }

  // =====================================================
  // RENDER — MÊS (ADMIN)
  // =====================================================
  function renderMonth() {
    calendarDays.innerHTML = '';

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    calendarTitle.textContent = formatMonthTitle(currentDate);

    const gridStart = startOfWeek(start);

    for (let i = 0; i < 42; i++) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);

      const muted = day.getMonth() !== currentDate.getMonth();
      renderDay(day, muted);
    }
  }

  // =====================================================
  // RENDER DAY
  // =====================================================
  function renderDay(day, muted = false) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.dataset.date = formatDateISO(day);

    dayEl.innerHTML = `
      <span class="week-day">${formatWeekDay(day)}</span>
      <span class="day-number">${day.getDate()}</span>
    `;

    if (muted) dayEl.classList.add('muted');
    if (isSameDay(day, new Date())) dayEl.classList.add('today');
    if (isSameDay(day, currentDate)) dayEl.classList.add('active');

    if (datesWithEvents.has(dayEl.dataset.date)) {
      dayEl.classList.add('has-event');
    }

    dayEl.addEventListener('click', () => {
      currentDate = new Date(day);
      render();
      dispatchDate();
    });

    calendarDays.appendChild(dayEl);
  }

  // =====================================================
  // NAVIGAÇÃO
  // =====================================================
  prevBtn.addEventListener('click', () => {
    if (MODE === 'month') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 7);
    }
    render();
    dispatchDate();
  });

  nextBtn.addEventListener('click', () => {
    if (MODE === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 7);
    }
    render();
    dispatchDate();
  });

  // =====================================================
  // EVENTOS EXTERNOS (DASHBOARD)
  // =====================================================
  document.addEventListener('calendar:markEvents', e => {
    datesWithEvents = new Set(e.detail.dates || []);
    render();
  });

  // =====================================================
  // DISPATCH DATA SELECIONADA
  // =====================================================
  function dispatchDate() {
    document.dispatchEvent(
      new CustomEvent('calendar:dateSelected', {
        detail: {
          date: formatDateISO(currentDate),
          dateObj: currentDate
        }
      })
    );
  }

  // =====================================================
  // INIT
  // =====================================================
  function render() {
    MODE === 'month' ? renderMonth() : renderWeek();
  }

  render();
  dispatchDate();

})();
