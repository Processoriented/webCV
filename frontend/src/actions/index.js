import * as actionType from './types'

const setToken = data => ({
  type: actionType.SET_TOKEN,
  data,
})

export default setToken
