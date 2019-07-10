export const getAuthenticationToken = (state) => state.authentication.token;
export const isAuthenticated = (state) => !!state.authentication.token;
export const getErrorMessage = (state) => state.authentication.errorMessage;
