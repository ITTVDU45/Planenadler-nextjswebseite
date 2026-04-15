import { ApolloClient, InMemoryCache } from '@apollo/client';
import { RESET_USER_PASSWORD } from '@/shared/lib/GQL_MUTATIONS';

interface RegistrationInput {
  email: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

interface ResetPasswordInput {
  key: string;
  login: string;
  password: string;
}

function createAuthClient() {
  if (!process.env.NEXT_PUBLIC_GRAPHQL_URL) {
    throw new Error('GraphQL-URL fehlt. Bitte NEXT_PUBLIC_GRAPHQL_URL in .env.local setzen.');
  }

  return new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    cache: new InMemoryCache(),
    credentials: 'include',
  });
}

async function callWordPressAuthApi<TResponse>(
  endpoint: string,
  payload: Record<string, unknown>,
  fallbackMessage: string
): Promise<TResponse> {
  let response: Response;
  let data: Record<string, unknown> = {};

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Netzwerkfehler. Bitte Internetverbindung pruefen und erneut versuchen.');
  }

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMessage =
      typeof data?.error === 'string' && data.error.trim().length
        ? data.error
        : fallbackMessage;
    throw new Error(errorMessage);
  }

  return data as TResponse;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getErrorMessage(error: unknown, fallback = 'Anfrage fehlgeschlagen. Bitte erneut versuchen.'): string {
  if (isRecord(error)) {
    const graphQLErrors = Array.isArray(error.graphQLErrors) ? error.graphQLErrors : null
    if (graphQLErrors?.length) {
      const firstGraphQLError = isRecord(graphQLErrors[0]) ? graphQLErrors[0] : null
      const message = String(firstGraphQLError?.message ?? '');
    const mapped: Record<string, string> = {
      invalid_username: 'Ungueltiger Benutzername oder E-Mail-Adresse.',
      incorrect_password: 'Falsches Passwort.',
      invalid_email: 'Ungueltige E-Mail-Adresse.',
      empty_username: 'Bitte Benutzername oder E-Mail eingeben.',
      empty_password: 'Bitte Passwort eingeben.',
      too_many_retries: 'Zu viele fehlgeschlagene Versuche. Bitte spaeter erneut probieren.',
      existing_user_login: 'Dieser Benutzername ist bereits vergeben.',
      existing_user_email: 'Diese E-Mail-Adresse ist bereits registriert.',
      invalid_password_reset_key: 'Der Passwort-Reset-Link ist ungueltig oder abgelaufen.',
    };

      if (mapped[message]) return mapped[message];
      if (message.includes('Cannot query field "loginWithCookies"')) {
        return 'Die GraphQL-Login-Mutation fehlt im WordPress-Backend (loginWithCookies nicht verfuegbar).';
      }
      if (message.trim()) return message;
    }

    if (error.networkError) {
      return 'Netzwerkfehler. Bitte Internetverbindung pruefen und erneut versuchen.';
    }
  }

  return fallback;
}

export async function login(username: string, password: string) {
  try {
    const result = await callWordPressAuthApi<{ success: boolean; status: 'SUCCESS' }>(
      '/api/auth/wordpress/login',
      { username, password, remember: true },
      'Anmeldung fehlgeschlagen. Bitte erneut versuchen.'
    );

    if (!result?.success || result?.status !== 'SUCCESS') {
      throw new Error('Anmeldung fehlgeschlagen.');
    }

    return { success: true, status: result.status };
  } catch (error: unknown) {
    const userFriendlyMessage = getErrorMessage(error, 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.');
    throw new Error(userFriendlyMessage);
  }
}

export async function registerAccount(input: RegistrationInput) {
  try {
    const email = input.email?.trim();
    if (!email) {
      throw new Error('Bitte E-Mail-Adresse eingeben.');
    }

    const result = await callWordPressAuthApi<{
      success: boolean;
      status: 'SUCCESS';
      loggedIn?: boolean;
      message?: string;
    }>(
      '/api/auth/wordpress/register',
      { email },
      'Registrierung fehlgeschlagen. Bitte erneut versuchen.'
    );

    if (!result?.success || result?.status !== 'SUCCESS') {
      throw new Error('Registrierung fehlgeschlagen.');
    }

    return {
      success: true,
      loggedIn: Boolean(result.loggedIn),
      message: result.message || 'Registrierung erfolgreich.',
    };
  } catch (error: unknown) {
    const userFriendlyMessage = getErrorMessage(error, 'Registrierung fehlgeschlagen. Bitte erneut versuchen.');
    throw new Error(userFriendlyMessage);
  }
}

export async function sendPasswordResetEmail(username: string) {
  try {
    await callWordPressAuthApi<{ success: boolean; status: 'SUCCESS' }>(
      '/api/auth/wordpress/lost-password',
      { username },
      'Passwort-Reset konnte nicht gestartet werden. Bitte erneut versuchen.'
    );

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (
      message.includes('benutzername oder e-mail sind ungueltig') ||
      message.includes('benutzername oder e-mail sind ungültig') ||
      message.includes('invalid username')
    ) {
      // Kein User-Enumeration-Leak im UI.
      return { success: true };
    }

    const userFriendlyMessage = getErrorMessage(
      error,
      'Passwort-Reset konnte nicht gestartet werden. Bitte erneut versuchen.'
    );
    throw new Error(userFriendlyMessage);
  }
}

export async function resetPasswordWithKey(input: ResetPasswordInput) {
  try {
    const client = createAuthClient();
    const { data } = await client.mutate({
      mutation: RESET_USER_PASSWORD,
      variables: {
        key: input.key,
        login: input.login,
        password: input.password,
      },
    });

    if (!data?.resetUserPassword) {
      throw new Error('Passwort konnte nicht zurueckgesetzt werden.');
    }

    return { success: true };
  } catch (error: unknown) {
    const userFriendlyMessage = getErrorMessage(
      error,
      'Passwort konnte nicht zurueckgesetzt werden. Bitte erneut versuchen.'
    );
    throw new Error(userFriendlyMessage);
  }
}

/**
 * Meldet den Kunden ab (lokale Proxy-Cookies + WordPress-Session serverseitig).
 */
export async function logout(redirectTo: '/' | '/anmelden' = '/anmelden') {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/auth/wordpress/logout', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  } catch {
    // Fallback: Redirect trotzdem ausführen.
  }

  if (redirectTo === '/anmelden') {
    const target = new URL(redirectTo, window.location.origin);
    target.searchParams.set('logout', 'success');
    window.location.href = `${target.pathname}${target.search}`;
    return;
  }

  window.location.href = redirectTo;
}
