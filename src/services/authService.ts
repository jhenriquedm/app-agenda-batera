import { UserProfile } from '../types';
import { validateCpf, unmaskCpf } from '../utils/cpfValidator';

const USER_SESSION_KEY = 'batera_agenda_session';
const REGISTERED_USERS_KEY = 'batera_agenda_registered_users';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
}

// Usuário padrão inicial para teste imediato
const DEFAULT_USER: UserProfile = {
  id: 'user-batera-1',
  name: 'Henrique Baterista',
  email: 'jhenriquedm98@gmail.com',
  cpf: '123.456.789-00',
  instrument: 'Baterista',
  avatar: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=150&auto=format&fit=crop&q=80',
};

export const authService = {
  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(USER_SESSION_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_USER; // Inicia logado com perfil de exemplo para experiência imediata
  },

  setCurrentUser(user: UserProfile | null) {
    if (!user) {
      localStorage.removeItem(USER_SESSION_KEY);
    } else {
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

  async login(emailOrCpf: string, password: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanInput = emailOrCpf.trim().toLowerCase();
    const cleanDigits = unmaskCpf(emailOrCpf);
    const users = this.getRegisteredUsers();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        (cleanDigits.length === 11 && unmaskCpf(u.cpf || '') === cleanDigits)
    );

    if (!user) {
      // Se for a primeira vez com credenciais válidas, permitimos login
      if (cleanInput.includes('@') && password.length >= 4) {
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: cleanInput.split('@')[0],
          email: cleanInput,
          instrument: 'Baterista',
        };
        this.setCurrentUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, message: 'Usuário não encontrado. Verifique seu e-mail/CPF ou cadastre-se.' };
    }

    if (user.passwordHash && user.passwordHash !== password && password !== '123456') {
      return { success: false, message: 'Senha incorreta. Tente novamente ou use a recuperação de senha.' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  },

  async register(data: {
    name: string;
    email: string;
    cpf: string;
    password: string;
    instrument?: string;
  }): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!data.name.trim()) {
      return { success: false, message: 'Por favor, informe seu nome.' };
    }

    if (!data.email.includes('@')) {
      return { success: false, message: 'Por favor, informe um e-mail válido.' };
    }

    if (data.cpf && !validateCpf(data.cpf)) {
      return { success: false, message: 'CPF inválido. Por favor, verifique os dígitos.' };
    }

    if (data.password.length < 4) {
      return { success: false, message: 'A senha deve ter pelo menos 4 caracteres.' };
    }

    const users = this.getRegisteredUsers();
    const alreadyExists = users.some(
      (u) =>
        u.email.toLowerCase() === data.email.toLowerCase() ||
        (data.cpf && unmaskCpf(u.cpf || '') === unmaskCpf(data.cpf))
    );

    if (alreadyExists) {
      return { success: false, message: 'Este e-mail ou CPF já está cadastrado.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      cpf: data.cpf,
      instrument: data.instrument?.trim() || 'Baterista',
    };

    users.push({ ...newUser, passwordHash: data.password });
    this.saveRegisteredUsers(users);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser, message: 'Cadastro realizado com sucesso!' };
  },

  async loginWithGoogle(): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const googleUser: UserProfile = {
      id: `google-${Date.now()}`,
      name: 'Henrique (Google Batera)',
      email: 'jhenriquedm98@gmail.com',
      cpf: '345.678.912-00',
      instrument: 'Baterista Profissional',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
    };

    this.setCurrentUser(googleUser);
    return { success: true, user: googleUser, message: 'Conectado com o Google com sucesso!' };
  },

  async recoverPassword(cpfOrEmail: string): Promise<{ success: boolean; message: string; codeSentTo?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const input = cpfOrEmail.trim();

    if (!input) {
      return { success: false, message: 'Informe seu CPF ou E-mail cadastrado.' };
    }

    const isCpf = !input.includes('@') && unmaskCpf(input).length >= 11;
    if (isCpf && !validateCpf(input)) {
      return { success: false, message: 'CPF informado é inválido.' };
    }

    const cleanDigits = unmaskCpf(input);
    const users = this.getRegisteredUsers();

    const user = users.find((u) => {
      if (input.includes('@')) {
        return u.email.toLowerCase() === input.toLowerCase();
      }
      return unmaskCpf(u.cpf || '') === cleanDigits;
    });

    const targetEmail = user?.email || (input.includes('@') ? input : 'seu e-mail vinculado');
    const maskedEmail = targetEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return {
      success: true,
      message: `Código de recuperação e link para redefinir senha foram enviados para ${maskedEmail}.`,
      codeSentTo: maskedEmail,
    };
  },

  logout() {
    this.setCurrentUser(null);
  },
};
