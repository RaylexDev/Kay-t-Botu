import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

const DIR  = "./data";
const PATH = `${DIR}/kayit.json`;

mkdirSync(DIR, { recursive: true });

const SCHEMA = {
  settings: {},  // guildId -> { logChannel, registerChannel, maleRole, femaleRole, memberRole, staffRoles[] }
  history:  {},  // guildId -> { userId -> [ { registrar, name, age, gender, timestamp } ] }
};

function load() {
  if (!existsSync(PATH)) return structuredClone(SCHEMA);
  try { return JSON.parse(readFileSync(PATH, "utf8")); }
  catch { return structuredClone(SCHEMA); }
}

function save(data) {
  writeFileSync(PATH, JSON.stringify(data, null, 2), "utf8");
}

function write(fn) {
  const data = load();
  fn(data);
  save(data);
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function getSettings(guildId) {
  return load().settings[guildId] ?? {
    guildId,
    logChannel:      null,
    registerChannel: null,
    maleRole:        null,
    femaleRole:      null,
    memberRole:      null,
    staffRoles:      [],
  };
}

export function saveSettings(guildId, patch) {
  write((data) => {
    const cur = data.settings[guildId] ?? {
      guildId,
      logChannel:      null,
      registerChannel: null,
      maleRole:        null,
      femaleRole:      null,
      memberRole:      null,
      staffRoles:      [],
    };
    data.settings[guildId] = { ...cur, ...patch };
  });
}

// ── History ───────────────────────────────────────────────────────────────────

export function addHistory(guildId, userId, entry) {
  write((data) => {
    if (!data.history[guildId]) data.history[guildId] = {};
    if (!data.history[guildId][userId]) data.history[guildId][userId] = [];
    data.history[guildId][userId].unshift(entry); // newest first
    // keep last 20 records per user
    data.history[guildId][userId] = data.history[guildId][userId].slice(0, 20);
  });
}

export function getHistory(guildId, userId) {
  return load().history[guildId]?.[userId] ?? [];
}
