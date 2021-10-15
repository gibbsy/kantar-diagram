import Vue from "vue";
import store from "./store/index.js";
import App from "./App.vue";

import BlockContent from "sanity-blocks-vue-component";
Vue.component("BlockContent", BlockContent);

const app = new Vue({
  render: (h) => h(App),
  store,
});

app.$mount("#app");
