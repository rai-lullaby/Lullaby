// agendaTurma.js

// Toggle accordion
const toggle = document.getElementById('toggleAgenda');
const content = document.getElementById('agendaContent');
const arrow = toggle.querySelector('.arrow');

if (toggle) {
  toggle.addEventListener('click', () => {
    const open = content.classList.toggle('open');
    content.style.maxHeight = open ? content.scrollHeight + 'px' : null;
    arrow.style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
  });
}

// Carregar educadores
async function carregarEducadores() {
  const token = localStorage.getItem('token');

  const res = await fetch('/educadores', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return;

  const educadores = await res.json();
  const select = document.getElementById('educadorId');

  educadores.forEach(e => {
    const option = document.createElement('option');
    option.value = e.id;
    option.textContent = e.nome;
    select.appendChild(option);
  });
}

carregarEducadores();

// Submit do formulário
const form = document.getElementById('formAgendaTurma');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      educador_id: document.getElementById('educadorId').value,
      tipo: document.getElementById('tipoEvento').value,
      descricao: document.getElementById('descricao').value,
      data_hora: document.getElementById('dataHora').value
    };

    const token = localStorage.getItem('token');

    const res = await fetch('/eventos/turma', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
