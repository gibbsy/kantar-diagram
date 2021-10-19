import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    appData: {},
    pages: [],
    modalOn: false,
    activeSection: null,
    isStandalone: undefined,
    lang: "",
  },
  mutations: {
    saveAppData(state, payload) {
      state.appData = payload;
    },
    savePages(state, payload) {
      state.pages = payload;
    },
    toggleModal(state, val) {
      state.modalOn = val;
    },
    selectSection(state, id) {
      state.activeSection = state.pages.filter((page) => page._id === id);
    },
    setStandalone(state, val) {
      state.isStandalone = val;
    },
    setLang(state, val) {
      state.lang = val;
    },
  },
});

export default store;
