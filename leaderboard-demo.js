// Purely fictional homepage data. No accounts, network requests or database writes.
const countries = [
  ['Deutschland', '🇩🇪'], ['Österreich', '🇦🇹'], ['Schweiz', '🇨🇭'],
  ['Frankreich', '🇫🇷'], ['Italien', '🇮🇹'], ['Spanien', '🇪🇸'],
  ['Niederlande', '🇳🇱'], ['Indien', '🇮🇳'], ['Türkei', '🇹🇷']
];

const fakeUsers = Array.from({length: 1099}, (_, index) => {
  const number = index + 1;
  const [country, flag] = countries[(index * 7) % countries.length];
  return {
    username: `fakeuser${String(number).padStart(4, '0')}`,
    country,
    flag,
    karma: ((number * 97 + 31) % 241) - 60
  };
});

const ranked = [...fakeUsers].sort((a, b) => b.karma - a.karma || a.username.localeCompare(b.username));
const top = ranked.filter(user => user.karma >= 0).slice(0, 10);
const flop = [...fakeUsers].filter(user => user.karma < 0)
  .sort((a, b) => a.karma - b.karma || a.username.localeCompare(b.username)).slice(0, 10);

const search = document.querySelector('#demo-search');
const all = document.querySelector('#demo-all');
const pageLabel = document.querySelector('#demo-page');
const previous = document.querySelector('#demo-prev');
const next = document.querySelector('#demo-next');
const pageSize = 25;
let page = 1;

function row(user, rank) {
  const item = document.createElement('li');
  const position = document.createElement('span');
  position.className = 'demo-position';
  position.textContent = String(rank).padStart(2, '0');
  const identity = document.createElement('span');
  identity.className = 'demo-identity';
  const username = document.createElement('strong');
  username.textContent = `@${user.username}`;
  const country = document.createElement('small');
  country.textContent = `${user.flag} ${user.country}`;
  identity.append(username, country);
  const score = document.createElement('strong');
  score.className = `demo-score ${user.karma < 0 ? 'negative' : ''}`;
  score.textContent = `${user.karma > 0 ? '+' : ''}${user.karma}`;
  score.setAttribute('aria-label', `${user.karma} Karma`);
  item.append(position, identity, score);
  return item;
}

function renderList(target, users, offset = 0) {
  target.replaceChildren(...users.map((user, index) => row(user, offset + index + 1)));
}

function renderDirectory() {
  const term = search.value.trim().toLocaleLowerCase('de-DE');
  const matches = term ? ranked.filter(user =>
    user.username.includes(term) || user.country.toLocaleLowerCase('de-DE').includes(term)
  ) : ranked;
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  page = Math.min(page, pages);
  const start = (page - 1) * pageSize;
  renderList(all, matches.slice(start, start + pageSize), start);
  if (!matches.length) {
    const empty = document.createElement('li');
    empty.className = 'demo-empty';
    empty.textContent = 'Keinen Fakeuser gefunden.';
    all.append(empty);
  }
  pageLabel.textContent = `${matches.length.toLocaleString('de-DE')} Profile · Seite ${page} von ${pages}`;
  previous.disabled = page === 1;
  next.disabled = page === pages;
}

renderList(document.querySelector('#demo-top'), top);
renderList(document.querySelector('#demo-flop'), flop);
renderDirectory();
search.addEventListener('input', () => {page = 1; renderDirectory();});
previous.addEventListener('click', () => {page--; renderDirectory();});
next.addEventListener('click', () => {page++; renderDirectory();});
