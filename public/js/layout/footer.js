export async function carregarFooter() {
  const container = document.getElementById('app-footer');
  if (!container) return;

  const res = await fetch('/partials/footer.html');
  container.innerHTML = await res.text();

  carregarVersao();
}

async function carregarVersao() {
  try {
    const res = await fetch('/api/version');
    const data = await res.json();
    document.getElementById('appVersion').textContent = data.version;
  } catch {
    document.getElementById('appVersion').textContent = '1.0.x';
  }
}
