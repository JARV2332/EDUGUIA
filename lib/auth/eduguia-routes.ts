/** Rutas públicas de autenticación EDUGUIA. */
export const EDUGUIA_ROUTES = {
  login: "/eduguia",
  register: "/eduguia/register",
  forgotPassword: "/eduguia/forgot-password",
  resetPassword: "/eduguia/reset-password",
  home: "/dashboard",
} as const;

export function isEduguiaAuthPath(path: string): boolean {
  return (
    path === EDUGUIA_ROUTES.login ||
    path === EDUGUIA_ROUTES.register ||
    path === EDUGUIA_ROUTES.forgotPassword ||
    path === EDUGUIA_ROUTES.resetPassword ||
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/reset-password"
  );
}
