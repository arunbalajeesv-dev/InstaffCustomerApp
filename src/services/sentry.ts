import * as Sentry from '@sentry/react-native';

// Sentry project: instaff-2b / react-native. The DSN is a public identifier
// (where to send events), safe to ship inside the app — unlike an auth
// token, it grants no read access to project data.
const SENTRY_DSN = 'https://ea081551381e03510e4923fa8f873c98@o4512141032554496.ingest.us.sentry.io/4512141037076480';

// Call once, before the app renders (see index.js). After this, native
// crashes and unhandled JS errors are captured automatically — nothing
// else to wire up per-screen for that part.
export function initSentry(): void {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}

// Wraps the root component so Sentry can track app start time and catch
// render errors React's own error boundaries would otherwise swallow.
export const wrapWithSentry = Sentry.wrap;

// Called on every navigation state change (see RootNavigator) so any error
// reported after this point is tagged with the screen the user was on when
// it happened — shows up as a filterable "screen" tag on every Sentry issue.
export function setCurrentScreen(screenName: string): void {
  Sentry.setTag('screen', screenName);
}
