import axios from 'axios'
import _ from 'lodash'
import store from '../store'
import { setToken } from '../actions'
import { URL, LOGIN, CLIENT_ID, CLIENT_SECRET } from '../config/Api'

export function InvalidCredentialsException(message) {
  this.message = message
  this.name = 'InvalidCredentialsException'
}

export const login = (username, password) => (
  axios.request({
    url: LOGIN,
    method: 'post',
    baseURL: URL,
    data: {
      grant_type: 'password',
      username,
      password,
    },
    auth: {
      username: CLIENT_ID,
      password: CLIENT_SECRET,
    },
  }).then(response => store.dispatch(setToken(response.data.token)))
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
