const reveals = document.querySelectorAll('.reveal');
const scrollIndicator = document.getElementById('scrollIndicator');
const heroHalo = document.querySelector('.hero-art .halo');
const heroGrid = document.querySelector('.hero-art .grid');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

const observeRevealElement = (el) => {
  if (!el) {
    return;
  }
  observer.observe(el);
};

reveals.forEach((el) => observeRevealElement(el));

const updateScrollIndicator = () => {
  if (!scrollIndicator) {
    return;
  }

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollIndicator.style.height = `${Math.min(progress, 100)}%`;
};

const updateHeroParallax = () => {
  if (!heroHalo || !heroGrid) {
    return;
  }

  const scrollTop = window.scrollY;
  const haloShift = Math.min(scrollTop * 0.12, 50);
  const gridShift = Math.min(scrollTop * 0.08, 35);

  heroHalo.style.transform = `translateY(${haloShift}px)`;
  heroGrid.style.transform = `translateY(${gridShift}px) perspective(800px) rotateX(6deg)`;
};

const handleScroll = () => {
  updateScrollIndicator();
  updateHeroParallax();
};

handleScroll();
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll);

const gigsSection = document.getElementById('gigs');
const gigList = document.getElementById('gigList');
const gigStatus = document.getElementById('gigStatus');

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim() !== '')) {
    rows.push(row);
  }

  return rows;
};

const normalizeKey = (value) => value.trim().toLowerCase();

const parseIsoDate = (value) => {
  if (!value) {
    return null;
  }

  const clean = value.trim();
  const parts = clean.split(/[-/]/).map((part) => part.trim());

  if (parts.length === 3 && parts[0].length === 4) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      return new Date(year, month - 1, day);
    }
  }

  const fallback = new Date(clean);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatGigDate = (date) => {
  if (!date) {
    return 'Date TBA';
  }

  const now = new Date();
  const showYear = date.getFullYear() !== now.getFullYear();
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: showYear ? 'numeric' : undefined,
  }).format(date);
};

const parseTimeToMinutes = (value) => {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const suffix = match[3] ? match[3].toLowerCase() : null;

  if (suffix) {
    if (suffix === 'pm' && hours < 12) {
      hours += 12;
    }
    if (suffix === 'am' && hours === 12) {
      hours = 0;
    }
  }

  return hours * 60 + minutes;
};

const getField = (row, keys) => {
  for (const key of keys) {
    if (row[key]) {
      return row[key].trim();
    }
  }
  return '';
};

const normalizeTicketUrl = (value) => {
  if (!value) {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  const lowered = trimmed.toLowerCase();
  if (lowered === 'none' || lowered === 'n/a' || lowered === 'na' || lowered === 'no' || lowered === 'tba') {
    return '';
  }
  return trimmed;
};

const renderGigs = (gigs) => {
  if (!gigList || !gigStatus) {
    return;
  }

  gigList.innerHTML = '';

  if (gigs.length === 0) {
    gigStatus.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'gig-empty';
    empty.textContent = 'No upcoming gigs yet. Check back soon.';
    gigList.appendChild(empty);
    return;
  }

  gigStatus.textContent = '';

  gigs.forEach((gig) => {
    const card = document.createElement('article');
    card.className = 'gig-card reveal';

    const date = document.createElement('div');
    date.className = 'gig-date';
    date.textContent = formatGigDate(gig.date);

    const title = document.createElement('div');
    title.className = 'gig-title';
    title.textContent = gig.venue || 'Venue TBA';

    const meta = document.createElement('div');
    meta.className = 'gig-meta';
    const locationParts = [gig.city, gig.time].filter((value) => value);
    meta.textContent = locationParts.length ? locationParts.join(' · ') : 'Details coming soon';

    card.appendChild(date);
    card.appendChild(title);
    card.appendChild(meta);

    if (gig.notes) {
      const note = document.createElement('div');
      note.className = 'gig-note';
      note.textContent = gig.notes;
      card.appendChild(note);
    }

    if (gig.ticketUrl) {
      const actions = document.createElement('div');
      actions.className = 'gig-actions';
      const link = document.createElement('a');
      link.href = gig.ticketUrl;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = 'Tickets';
      actions.appendChild(link);
      card.appendChild(actions);
    }

    gigList.appendChild(card);
    observeRevealElement(card);
  });
};

const fetchGigs = async () => {
  if (!gigsSection || !gigList || !gigStatus) {
    return;
  }

  if (window.location.protocol === 'file:') {
    gigStatus.textContent = 'Gigs load only when the site is hosted (not from a local file).';
    return;
  }

  const sheetUrl = gigsSection.dataset.sheetUrl || '';
  if (!sheetUrl || sheetUrl.includes('PASTE_CSV_URL_HERE')) {
    gigStatus.textContent = 'Add your Google Sheet CSV link to show gigs.';
    return;
  }

  try {
    const response = await fetch(sheetUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to load gigs');
    }

    const text = await response.text();
    const rows = parseCsv(text);
    if (rows.length < 2) {
      renderGigs([]);
      return;
    }

    const headers = rows[0].map(normalizeKey);
    const dataRows = rows.slice(1).map((values) => {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].trim() : '';
      });
      return row;
    });

    const gigs = dataRows
      .map((row) => {
        const dateValue = getField(row, ['date', 'gig date', 'show date']);
        const date = parseIsoDate(dateValue);
        const time = getField(row, ['time', 'doors', 'start']);
        const venue = getField(row, ['venue', 'location', 'spot']);
        const city = getField(row, ['city', 'town']);
        const ticketUrl = normalizeTicketUrl(
          getField(row, ['ticket_url', 'tickets', 'ticket link', 'url', 'link'])
        );
        const notes = getField(row, ['notes', 'details', 'info']);

        return {
          date,
          rawDate: dateValue,
          time,
          venue,
          city,
          ticketUrl,
          notes,
        };
      })
      .filter((gig) => gig.date || gig.rawDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = gigs.filter((gig) => {
      if (!gig.date) {
        return true;
      }
      return gig.date >= today;
    });

    upcoming.sort((a, b) => {
      if (!a.date && !b.date) {
        return 0;
      }
      if (!a.date) {
        return 1;
      }
      if (!b.date) {
        return -1;
      }
      const dateDiff = a.date - b.date;
      if (dateDiff !== 0) {
        return dateDiff;
      }
      const timeA = parseTimeToMinutes(a.time);
      const timeB = parseTimeToMinutes(b.time);
      if (timeA === null || timeB === null) {
        return 0;
      }
      return timeA - timeB;
    });

    renderGigs(upcoming);
  } catch (error) {
    gigStatus.textContent = 'Unable to load gigs right now.';
    // Helpful for debugging if needed.
    console.error('Gig fetch failed', error);
  }
};

fetchGigs();
