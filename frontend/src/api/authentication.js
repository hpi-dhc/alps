import { authEndpoint } from '.'

export const requestToken = (username, password) => {
  return authEndpoint.post('login/', { username, password })
}

export const requestLogout = () => {
  return authEndpoint.post('logout/')
}
