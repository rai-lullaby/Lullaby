import { formatDateISO } from './dateUtils.js';

// =====================================================
// 📅 CALENDÁRIO — SEMANAL (RESP/EDUC) | MENSAL (ADMIN)
// =====================================================
(function () {

  // =====================================================
  // DOM
  // =====================================================
  const titleEl = document.getElementById('calendarTitle');
  const daysEl = document.getElementById('calendarDays');
  const prevBtn = document.getElementById('prevWeek');
  const nextBtn = document.getElementById('nextWeek');

  if (!titleEl || !daysEl || !prevBtn || !nextBtn) return;

  // =====================================================
  // USER / MODE
  // =====================================================
  const user = JSON.parse(localStorage.getItem('user'));
  const MODE = user?.perfil === 'ADMIN' ? 'month' : 'week';

  // =====================================================
  // STATE
  // =====================================================
  let selectedDate = new Date();

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

  function isSameDay(a, b) {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  function formatTitle(date) {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  }

  // =====================================================
  // RENDER ROOT
  // =====================================================
  function render() {
    daysEl.innerHTML = '';
    titleEl.textContent = formatTitle(selectedDate);

    MODE === 'month'
      ? renderMonth()
      : renderWeek();
  }

  // =====================================================
  // SEMANAL — CARDS (PRINT)
  // =====================================================
  function renderWeek() {
    const start = startOfWeek(selectedDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      daysEl.appendChild(createWeekDayCard(day));
    }
  }

  function createWeekDayCard(day) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day-card';
    btn.dataset.date = formatDateISO(day);

    btn.innerHTML = `
      <span class="weekday">
        ${day.toLocaleDateString('pt-BR', { weekday: 'long' })}
      </span>
      <strong class="day-number">${day.getDate()}</strong>
    `;

    if (isSameDay(day, selectedDate)) btn.classList.add('active');

    btn.onclick = () => {
      selectedDate = new Date(day);
      render();
      dispatch();
    };

    return btn;
  }

  // =====================================================
  // MENSAL — ADMIN
  // =====================================================
  function renderMonth() {
    const start = startOfWeek(startOfMonth(selectedDate));

    for (let i = 0; i < 42; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      daysEl.appendChild(createMonthDay(day));
    }
  }

  function createMonthDay(day) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day';
    btn.dataset.date = formatDateISO(day);
    btn.textContent = day.getDate();

    if (isSameDay(day, selectedDate)) btn.classList.add('active');

    btn.onclick = () => {
      selectedDate = new Date(day);
      render();
      dispatch();
    };

    return btn;
  }

  // =====================================================
  // NAV
  // =====================================================
  prevBtn.onclick = () => {
    MODE === 'month'
      ? selectedDate.setMonth(selectedDate.getMonth() - 1)
      : selectedDate.setDate(selectedDate.getDate() - 7);
    render();
    dispatch();
  };

  nextBtn.onclick = () => {
    MODE === 'month'
      ? selectedDate.setMonth(selectedDate.getMonth() + 1)
      : selectedDate.setDate(selectedDate.getDate() + 7);
    render();
    dispatch();
  };

  // =====================================================
  // DISPATCH
  // =====================================================
  function dispatch() {
    document.dispatchEvent(
      new CustomEvent('calendar:dateSelected', {
        detail: {
          date: formatDateISO(selectedDate),
          dateObj: selectedDate
        }
      })
    );
  }

  // =====================================================
  // INIT
  // =====================================================
  render();
  dispatch();

})();
