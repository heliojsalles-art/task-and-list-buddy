// localStorage helpers with typed access

export interface Reminder {
  id: string;
  text: string;
  done: boolean;
  doneAt?: number; // timestamp when marked done
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // day of month
  recurring: boolean;
  paid: boolean;
  month: number; // 0-11
  year: number;
  createdAt: number;
}

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Reminders
export function getReminders(): Reminder[] {
  const reminders = get<Reminder[]>('reminders', []);
  // Auto-delete items done > 48h ago
  const now = Date.now();
  const filtered = reminders.filter(r => {
    if (r.done && r.doneAt) {
      return now - r.doneAt < 48 * 60 * 60 * 1000;
    }
    return true;
  });
  if (filtered.length !== reminders.length) {
    set('reminders', filtered);
  }
  return filtered;
}

export function saveReminders(reminders: Reminder[]) {
  set('reminders', reminders);
}

// Shopping Lists
export function getShoppingLists(): ShoppingList[] {
  return get<ShoppingList[]>('shoppingLists', []);
}

export function saveShoppingLists(lists: ShoppingList[]) {
  set('shoppingLists', lists);
}

// Bills
export function getBills(): Bill[] {
  return get<Bill[]>('bills', []);
}

export function saveBills(bills: Bill[]) {
  set('bills', bills);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
