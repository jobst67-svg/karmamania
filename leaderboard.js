// The publishable key grants no access to private profiles. Supabase RLS limits
// this leaderboard to signed-in players who explicitly enabled its visibility.
(() => {
  const base = 'https://hewoznyyecalpvkufoow.supabase.co';
  const key = 'sb_publishable_msPWvi0k9BS2_avYVh-QAg_tHuiGx4c';
  const form = document.querySelector('#leaderboard-login');
  const status = document.querySelector('#leaderboard-status');
  const results = document.querySelector('#leaderboard-results');
  const submit = form.querySelector('button[type="submit"]');
  const logout = document.querySelector('#leaderboard-logout');
  let accessToken = null;

  function row(player, place) {
    const item = document.createElement('li');
    const position = document.createElement('span');
    position.className = 'rank-position';
    position.textContent = String(place).padStart(2, '0');
    const identity = document.createElement('span');
    identity.className = 'rank-identity';
    const username = document.createElement('strong');
    username.textContent = `@${player.username}`;
    const country = document.createElement('small');
    country.textContent = player.country;
    identity.append(username, country);
    const score = document.createElement('strong');
    score.className = `rank-score ${player.karma < 0 ? 'negative' : ''}`;
    score.textContent = `${player.karma > 0 ? '+' : ''}${player.karma}`;
    score.setAttribute('aria-label', `${player.karma} Karma`);
    item.append(position, identity, score);
    return item;
  }

  function render(target, players, emptyMessage) {
    target.replaceChildren(...players.map((player, index) => row(player, index + 1)));
    if (players.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'rank-empty';
      empty.textContent = emptyMessage;
      target.append(empty);
    }
  }

  async function leaderboard(path, token) {
    const response = await fetch(`${base}/rest/v1/karma_leaderboard_entries?select=username,country,karma&${path}&limit=10`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('leaderboard_unavailable');
    return response.json();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      status.textContent = 'Bitte gib deinen Username aus der App ein.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Anmeldung und Rangliste werden geladen …';
    try {
      const response = await fetch(`${base}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `${username.toLowerCase()}@accounts.karmamania.invalid`, password }),
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('login_failed');
      const session = await response.json();
      accessToken = session.access_token;
      form.elements.password.value = '';
      const [top, worst] = await Promise.all([
        leaderboard('karma=gte.0&order=karma.desc,username.asc', accessToken),
        leaderboard('karma=lt.0&order=karma.asc,username.asc', accessToken)
      ]);
      render(document.querySelector('#leaderboard-top'), top, 'Noch keine freigegebenen Spieler mit 0 oder mehr Karma.');
      render(document.querySelector('#leaderboard-worst'), worst, 'Noch niemand unter 0 Karma.');
      form.hidden = true;
      results.hidden = false;
      status.textContent = '';
    } catch (error) {
      accessToken = null;
      form.elements.password.value = '';
      status.textContent = error.message === 'login_failed'
        ? 'Username oder Passwort stimmt nicht.'
        : 'Die Bestenliste ist gerade nicht erreichbar. Bitte später erneut versuchen.';
    } finally {
      submit.disabled = false;
    }
  });

  logout.addEventListener('click', () => {
    accessToken = null;
    results.hidden = true;
    form.hidden = false;
    form.reset();
    form.elements.username.focus();
  });
})();
