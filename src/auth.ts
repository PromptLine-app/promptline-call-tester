// Simple local auth for the Calling App
// Credentials are hardcoded; no backend required.

export interface AppUser {
  email: string;
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  addedOn: string;
}

const VALID_USERS: { email: string; password: string; name: string }[] = [
  { email: 'chaitanya.s@promptline.app', password: 'admin123', name: 'Chaitanya' },
];

const SESSION_KEY = 'calling_app_session';
const TEAM_KEY = 'calling_app_team';

// Seed default team on first load
function seedTeam(): TeamMember[] {
  return [
    {
      id: '1',
      name: 'Chaitanya',
      email: 'chaitanya.s@promptline.app',
      status: 'active',
      addedOn: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
    },
  ];
}

export function getTeam(): TeamMember[] {
  const raw = localStorage.getItem(TEAM_KEY);
  if (!raw) {
    const defaults = seedTeam();
    localStorage.setItem(TEAM_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(raw) as TeamMember[];
}

export function saveTeam(team: TeamMember[]): void {
  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
}

export function signIn(email: string, password: string): AppUser | null {
  const match = VALID_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!match) return null;
  const user: AppUser = { email: match.email, name: match.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): AppUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}
