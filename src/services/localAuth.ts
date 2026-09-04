import { localStorage_safe } from '../utils/helpers';
import type { StudentInfo } from '../contexts/StudentContext';

const LS_ACCOUNTS = 'eduspark_local_accounts_v1';

type StoredRow = {
  email: string;
  password: string;
  user: StudentInfo;
};

function readRows(): StoredRow[] {
  const raw = localStorage_safe.getItem(LS_ACCOUNTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredRow[];
  } catch {
    return [];
  }
}

function writeRows(rows: StoredRow[]) {
  localStorage_safe.setItem(LS_ACCOUNTS, JSON.stringify(rows));
}

/** Demo/local accounts when no backend auth API is available. */
export function upsertLocalAccount(password: string, user: StudentInfo) {
  const list = readRows();
  const email = user.email.trim().toLowerCase();
  const i = list.findIndex((x) => x.email.toLowerCase() === email);
  const row: StoredRow = { email: user.email.trim(), password, user: { ...user, email: user.email.trim() } };
  if (i >= 0) list[i] = row;
  else list.push(row);
  writeRows(list);
}

export function findLocalLogin(email: string, password: string): StudentInfo | null {
  const e = email.trim().toLowerCase();
  const row = readRows().find((x) => x.email.toLowerCase() === e && x.password === password);
  return row?.user ?? null;
}
