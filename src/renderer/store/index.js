import { createStore } from 'vuex'
import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'
import modules from './modules'

const state = {
  config: {},
  dict: {},
  apiInfo: {},
  messages: []
}

export default createStore({
  state,
  getters,
  actions,
  mutations,
  modules,
  strict: false
})
