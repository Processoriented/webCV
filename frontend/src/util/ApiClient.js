import axios from 'axios'
import store from '../store'
import { URL } from '../config/Api'

const apiClient = () => {
  const token = store.getState().token
  const params = {
    baseURL: URL,
    headers: { Authorization: `Token ${token}` },
  }
  return axios.create(params)
}

export default apiClient
