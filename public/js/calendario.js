import { formatDateISO } from './dateUtils.js';

// =====================================================
// 📅 CALENDÁRIO — SELETOR DE DATA (FUNCIONAL)
// =====================================================
(function () {

  // =====================================================
  // DOM
  // =====================================================
  const titleEl = document.getElementById('calendarTitle');
  const daysEl = document.getElementById('calendarDays');
  const prevBtn = document.getElementById('prevWeek');
  const nextBtn = document.getElementById('nextWeek');

  if (!titleEl || !daysEl || !prevBtn || !nextBtn) {
    console.warn('📅 Calendário não inicializado (DOM ausente)');
    return;
  }

  // =====================================================
  // PERFIL / MODO
  // =====================================================
  const user = JSON.parse(localStorage.getItem('user'));
  const MODE = user?.perfil === 'ADMIN' ? 'month' : 'week';

  console.log('📅 Calendário modo:', MODE);

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

  function formatTitle(date) {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  }

  function isSameDay(a, b) {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  function render() {
    daysEl.innerHTML = '';
    titleEl.textContent = formatTitle(selectedDate);

    MODE === 'month'
      ? renderMonth()
      : renderWeek();
  }

  function renderWeek() {
    const start = startOfWeek(selectedDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      daysEl.appendChild(createDayButton(day));
    }
  }

  function renderMonth() {
    const start = startOfWeek(startOfMonth(selectedDate));

    for (let i = 0; i < 42; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      daysEl.appendChild(createDayButton(day, day.getMonth() !== selectedDate.getMonth()));
    }
  }

  // =====================================================
  // DAY BUTTON
  // =====================================================
  function createDayButton(day, muted = false) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day';
    btn.dataset.date = formatDateISO(day);

    btn.innerHTML = `
      <span class="week-day">${day.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
      <strong>${day.getDate()}</strong>
    `;

    if (muted) btn.classList.add('muted');
    if (isSameDay(day, new Date())) btn.classList.add('today');
    if (isSameDay(day, selectedDate)) btn.classList.add('active');

    btn.addEventListener('click', () => {
      selectedDate = new Date(day);
      render();
      dispatchSelectedDate();
    });

    return btn;
  }

  // =====================================================
  // NAVIGAÇÃO
  // =====================================================
  prevBtn.addEventListener('click', () => {
    MODE === 'month'
      ? selectedDate.setMonth(selectedDate.getMonth() - 1)
      : selectedDate.setDate(selectedDate.getDate() - 7);
    render();
    dispatchSelectedDate();
  });

  nextBtn.addEventListener('click', () => {
    MODE === 'month'
      ? selectedDate.setMonth(selectedDate.getMonth() + 1)
      : selectedDate.setDate(selectedDate.getDate() + 7);
    render();
    dispatchSelectedDate();
  });

  // =====================================================
  // DISPATCH
  // =====================================================
  function dispatchSelectedDate() {
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
  dispatchSelectedDate();

})();
