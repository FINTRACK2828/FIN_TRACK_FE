import { request, getSession, saveSession, clearSession, toUser } from './api';

async function authenticate(path, body, remember = true) {
  try {
    const result = await request(path, { method: 'POST', body, token: null });
    const user = toUser(result.user);
    saveSession({ token: result.token, user }, remember);
    return { success: true, user };
  } catch (error) { return { success: false, error: error.message }; }
}
export const StorageService = {
  authenticate: (email, password, remember = true) => authenticate('/auth/login', { email: email.trim(), password }, remember),
  registerUser: ({ name, email, password }) => authenticate('/auth/register', { name, email: email.trim(), password }),
  getSessionUser: () => getSession()?.user || null,
  setSessionUser: user => {
    const session = getSession();
    if (session) saveSession({ ...session, user }, localStorage.getItem('fintrack_api_session') !== null);
  },
  logout: clearSession,
  async forgotPassword(email) {
    try {
      await request('/auth/forgot-password', { method: 'POST', body: { email: email.trim() }, token: null });
      return { success: true, message: 'If an account exists, password reset instructions will be sent to your email.' };
    } catch (error) { return { success: false, error: error.message }; }
  },
};
