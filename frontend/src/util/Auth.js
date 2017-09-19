import axios from 'axios'
import _ from 'lodash'
import store from '../store'
import { setToken } from '../actions'
import { URL, LOGIN } from '../config/Api'

export function InvalidCredentialsException(message) {
  this.message = message
  this.name = 'InvalidCredentialsException'
}

export const login = (username, password) => (
  axios
    .post(URL + LOGIN, { username, password })
    .then(response => store.dispatch(setToken(response.data.token)))
    .catch((error) => {
      // raise different exception if due to invalid credentials
      if (_.get(error, 'response.status') === 400) {
        throw new InvalidCredentialsException(error)
      }
      throw error
    })
)

export function loggedIn() {
  return store.getState().token == null
}
