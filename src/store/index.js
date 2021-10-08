import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    appData: {
      appBtns: [
        { label: "application" },
        { label: "Scale & versatility" },
        {
          label: "Connectivity",
        },
        {
          label: "Innovation",
        },
      ],
    },
  },
});

export default store;
