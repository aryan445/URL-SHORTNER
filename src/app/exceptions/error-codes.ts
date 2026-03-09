export enum ErrorCode {
  LINK_EXPIRED = 'link.expired',
  SHORT_KEY_ALREADY_EXISTS = 'url.short_key_already_exists',
  WRONG_CREDENTIALS = 'login.wrong_credentials',
  FORBIDDEN = 'auth.forbidden',
  INTERNAL_SERVER_ERROR = 'server.internal-server-error',
  TOO_MANY_REQUESTS = 'auth.too-many-requests',
  VALIDATION_ERROR = 'validation.error',
  REQUEST_TIMEOUT = 'server.request-timeout',
}
