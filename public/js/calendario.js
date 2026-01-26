import { formatDateISO } from './dateUtils.js';

// =====================================================
// 📅 CALENDÁRIO — SEMANAL (RESP/EDUC) | MENSAL (ADMIN)
// =====================================================
(function () {

  // =====================================================
  // DOM
  // =====================================================
  const titleEl = document.getElementById('calendarTitle');
  const daysEl  = document.getElementById('calendarDays');
  const prevBtn = document.getElementById('prevWeek');
  const nextBtn = document.getElementById('nextWeek');

  if (!titleEl || !daysEl || !prevBtn || !nextBtn) {
    console.warn('📅 Calendário não inicializado: DOM ausente');
    return;
  }

  // =====================================================
  // USER / MODE
  // =====================================================
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }

  const MODE = user?.perfil === 'ADMIN' ? 'month' : 'week';
  console.log('📅 Calendário modo:', MODE);

  // =====================================================
  // STATE
  // =====================================================
  let selectedDate = new Date();

  // =====================================================
  // HELPERS — DATA
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

    if (MODE === 'month') {
      renderMonth();
    } else {
      renderWeek();
    }
  }

  // =====================================================
  // 🟧 SEMANAL — RESPONSÁVEL / EDUCADOR
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

    if (isSameDay(day, selectedDate)) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      selectDate(day);
    });

    return btn;
  }

  // =====================================================
  // 🟦 MENSAL — ADMIN
  // =====================================================
  function renderMonth() {
    const start = startOfWeek(startOfMonth(selectedDate));

    for (let i = 0; i < 42; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      daysEl.appendChild(createMonthDayCell(day));
    }
  }

  function createMonthDayCell(day) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day';
    btn.dataset.date = formatDateISO(day);
    btn.textContent = day.getDate();

    if (isSameDay(day, selectedDate)) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      selectDate(day);
    });

    return btn;
  }

  // =====================================================
  // SELEÇÃO DE DATA (CENTRALIZADO)
  // =====================================================
  function selectDate(date) {
    selectedDate = new Date(date);
    render();
    dispatchSelectedDate();
  }

  // =====================================================
  // NAVIGAÇÃO
  // =====================================================
  prevBtn.addEventListener('click', () => {
    if (MODE === 'month') {
      selectedDate.setMonth(selectedDate.getMonth() - 1);
    } else {
      selectedDate.setDate(selectedDate.getDate() - 7);
    }

    render();
    dispatchSelectedDate();
  });

  nextBtn.addEventListener('click', () => {
    if (MODE === 'month') {
      selectedDate.setMonth(selectedDate.getMonth() + 1);
    } else {
      selectedDate.setDate(selectedDate.getDate() + 7);
    }

    render();
    dispatchSelectedDate();
  });

  // =====================================================
  // DISPATCH EVENT
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
