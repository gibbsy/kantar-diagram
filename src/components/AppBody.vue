<template>
  <div class="k-app-view">
    <h1>Test font</h1>
    <diagram />
    <app-btns :nav-btns="appData.appBtns" />
  </div>
</template>

<script>
import Diagram from "./Diagram.vue";
import AppBtns from "./AppBtns.vue";

export default {
  name: "AppBody",
  components: {
    Diagram,
    AppBtns,
  },
  computed: {
    appData() {
      return this.$store.state.appData;
    },
  },
  mounted() {
    console.log(PIXI);
    console.log(this.appData);
  },
};
</script>

<style scoped lang="scss">
@import "../style/vars.scss";
h1 {
  font-family: "KantarBrown";
  font-weight: 100;
}
.view {
  background: $goldGrad;
  h1 {
    color: white;
  }
}
</style>
