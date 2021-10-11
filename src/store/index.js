import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    appData: {
      appBtns: [
        { label: "Application" },
        { label: "Scale & versatility" },
        {
          label: "Connectivity",
        },
        {
          label: "Innovation",
        },
      ],
      mainArcs: [
        { label: "Streaming data" },
        { label: "CTV+ sources" },
        { label: "Operator data" },
        { label: "CRM systems" },
        { label: "AdTech" },
        { label: "Brand data" },
      ],
      sections: [
        { label: "Streaming data", video: "xxxx", title: "Title for the modal streaming data" },
        { label: "CTV+ sources", video: "xxxx", title: "Title for the modal ctv" },
        { label: "Operator data", video: "xxxx", title: "Title for the modal operator data" },
        { label: "CRM systems", video: "xxxx", title: "Title for the modal CRM" },
        { label: "AdTech", video: "xxxx", title: "Title for the modal adTech" },
        { label: "Brand data", video: "xxxx", title: "Title for the modal brand" },
      ],
    },
    modalOn: false,
    activeSection: null,
  },
  mutations: {
    toggleModal(state, val) {
      state.modalOn = val;
    },
    selectSection(state, val) {
      state.activeSection = state.appData.sections.filter((section) => section.label === val);
    },
  },
});

export default store;
