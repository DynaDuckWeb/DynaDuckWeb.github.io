// Example: publish idea and append to feed on success
const ideaForm = document.getElementById('idea-form');
if (ideaForm) {
  ideaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = ideaForm.elements['title'].value;
    const body = ideaForm.elements['body'].value;
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || res.statusText);
      // Append to local feed so others can see (immediate UX)
      const feed = document.getElementById('ideas-feed');
      if (feed) {
        const el = document.createElement('article');
        el.innerHTML = `<h3>${payload.title}</h3><p>${payload.body}</p>`;
        feed.prepend(el);
      }
      ideaForm.reset();
    } catch (err) {
      console.error('Publish idea failed', err);
      alert('Publish failed: ' + err.message);
    }
  });
}