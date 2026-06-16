export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// MVP / self-hosted build uses a standalone email login page.
// (The Manus OAuth portal flow is not available outside Manus.)
export const getLoginUrl = () => "/login";
