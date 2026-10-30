// Progress and settings, kept only on this device (localStorage). No accounts and
// nothing is sent anywhere. If storage is blocked we fall back to memory.
const KEY = 'genesis-kids:v1';
let memory = {};

function read() {
  try {
    return { ...memory, ...(JSON.parse(localStorage.getItem(KEY)) ?? {}) };
  } catch {
    return { ...memory };
  }
}

function write(next) {
  memory = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode, blocked). Progress lasts for this visit only.
  }
}

export const getStars = (id) => read().stars?.[id] ?? 0;

export function saveStars(id, value) {
  const data = read();
  const best = Math.max(data.stars?.[id] ?? 0, value);
  write({ ...data, stars: { ...data.stars, [id]: best } });
  return best;
}

export const isMuted = () => read().muted === true;
export const setMuted = (muted) => write({ ...read(), muted });
