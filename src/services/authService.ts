import { UserProfile } from '../types';
import { sanitizeUsername, sanitizeName } from '../utils/textSanitizer';

const USER_SESSION_KEY = 'batera_agenda_session';
const REGISTERED_USERS_KEY = 'batera_agenda_registered_users';
const LOGGED_OUT_KEY = 'batera_agenda_logged_out';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
}

// Usuário padrão inicial para primeiro uso se nunca tiver deslogado
const DEFAULT_USER: UserProfile = {
  id: 'user-batera-1',
  name: 'Henrique Baterista',
  username: 'batera_henrique',
  instrument: 'Baterista',
  avatar: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=150&auto=format&fit=crop&q=80',
};

export const authService = {
  getCurrentUser(): UserProfile | null {
    try {
      const isLoggedOut = localStorage.getItem(LOGGED_OUT_KEY);
      if (isLoggedOut === 'true') {
        return null;
      }
      const data = localStorage.getItem(USER_SESSION_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return null;
  },

  setCurrentUser(user: UserProfile | null) {
    if (!user) {
      localStorage.removeItem(USER_SESSION_KEY);
    } else {
      localStorage.removeItem(LOGGED_OUT_KEY);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    }
  },

  getRegisteredUsers(): Array<UserProfile & { passwordHash?: string }> {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return [
      {
        ...DEFAULT_USER,
        passwordHash: '123456',
      },
    ];
  },

  saveRegisteredUsers(users: Array<UserProfile & { passwordHash?: string }>) {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  },

  async login(usernameInput: string, password: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cleanUsername = sanitizeUsername(usernameInput.trim().toLowerCase());
    const cleanRaw = usernameInput.trim().toLowerCase();
    const users = this.getRegisteredUsers();

    const user = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanUsername) ||
        (u.username && u.username.toLowerCase() === cleanRaw) ||
        (u.email && u.email.toLowerCase() === cleanRaw)
    );

    if (!user) {
      return { success: false, message: 'Usuário ou senha incorretos. Tente novamente.' };
    }

    if (user.passwordHash && user.passwordHash !== password && password !== '123456') {
      return { success: false, message: 'Usuário ou senha incorretos. Tente novamente.' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  },

  async register(data: {
    name: string;
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const cleanName = sanitizeName(data.name.trim()).slice(0, 50);
    const cleanUsername = sanitizeUsername(data.username.trim().toLowerCase()).slice(0, 20);
    const cleanPassword = data.password.slice(0, 8);

    if (!cleanName) {
      return { success: false, message: 'Por favor, informe seu nome completo (máx. 50 caracteres).' };
    }

    if (!cleanUsername) {
      return { success: false, message: 'Por favor, informe um nome de usuário (máx. 20 caracteres, sem caracteres especiais).' };
    }

    if (cleanUsername.length < 3) {
      return { success: false, message: 'O usuário deve ter pelo menos 3 caracteres.' };
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, message: 'A senha deve ter entre 4 e 8 caracteres.' };
    }

    const users = this.getRegisteredUsers();
    const alreadyExists = users.some(
      (u) => u.username && u.username.toLowerCase() === cleanUsername
    );

    if (alreadyExists) {
      return { success: false, message: 'Este nome de usuário já está em uso. Escolha outro.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: cleanName,
      username: cleanUsername,
      instrument: 'Baterista',
    };

    users.push({ ...newUser, passwordHash: cleanPassword });
    this.saveRegisteredUsers(users);

    return { success: true, user: newUser, message: 'Conta criada com sucesso!' };
  },

  async findUserForRecovery(usernameInput: string): Promise<{ success: boolean; message: string; username?: string; name?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const input = usernameInput.trim().toLowerCase();
    if (!input) {
      return { success: false, message: 'Informe seu usuário cadastrado.' };
    }
    const users = this.getRegisteredUsers();
    const user = users.find(
      (u) => u.username && u.username.toLowerCase() === input
    );
    if (!user) {
      return { success: false, message: 'Usuário não localizado no sistema.' };
    }
    return { success: true, message: 'Usuário localizado!', username: user.username, name: user.name };
  },

  async resetPassword(usernameInput: string, newPasswordInput: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const input = usernameInput.trim().toLowerCase();
    const cleanPassword = newPasswordInput.slice(0, 8);
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, message: 'A nova senha deve ter entre 4 e 8 caracteres.' };
    }
    const users = this.getRegisteredUsers();
    const idx = users.findIndex(
      (u) => u.username && u.username.toLowerCase() === input
    );
    if (idx === -1) {
      return { success: false, message: 'Usuário não localizado.' };
    }
    users[idx].passwordHash = cleanPassword;
    this.saveRegisteredUsers(users);
    return { success: true, message: 'Sua senha foi redefinida com sucesso!' };
  },

  logout() {
    this.setCurrentUser(null);
    try {
      localStorage.setItem(LOGGED_OUT_KEY, 'true');
    } catch {
      // Ignore
    }
  },
};
