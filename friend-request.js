// Example: attach submit handler and update UI after POST
document.querySelectorAll('.friend-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = form.elements['userId'].value;
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      // Update button/UI to show request sent
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Requested';
    } catch (err) {
      console.error('Friend request failed', err);
      alert('Friend request failed: ' + err.message);
    }
  });
});