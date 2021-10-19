<template>
  <div class="k-dia-app-view">
    <diagram />
    <app-btns v-if="isStandalone" :nav-btns="appData.bottomBtns" />
    <transition name="fade" appear>
      <modal v-if="modalOn" />
    </transition>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Diagram from "./Diagram.vue";
import AppBtns from "./AppBtns.vue";
import Modal from "./Modal.vue";

export default {
  name: "AppBody",
  components: {
    Diagram,
    AppBtns,
    Modal,
  },
  computed: mapState(["appData", "modalOn", "isStandalone"]),
};
</script>

<style scoped lang="scss">
@import "../style/vars.scss";
</style>
