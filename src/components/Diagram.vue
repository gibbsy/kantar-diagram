<template>
  <div id="k-diagram" class="k-dia-canvas-container" />
</template>
<script>
import AppGfx from "../graphics/AppGfx.js";
import bus from "../graphics/eventBus.js";
export default {
  data() {
    return {
      diagram: undefined,
      diagramReady: false,
      diagramInview: false,
    };
  },
  computed: {
    appData() {
      return this.$store.state.appData;
    },
  },
  watch: {
    diagramReady(val) {
      if (val === true && this.diagramInview === true) {
        this.diagram.enter();
      }
    },
    diagramInview(val) {
      if (val === true && this.diagramReady === true) {
        this.diagram.enter();
      }
    },
  },
  mounted() {
    this.initDiagram();
    bus.on("DIAGRAM_READY", () => {
      this.diagramReady = true;
      ScrollTrigger.create({
        trigger: "#k-diagram",
        start: "top center",
        toggleClass: "is-inview",
        once: true,
        onToggle: () => (this.diagramInview = true),
      });
    });
  },
  methods: {
    initDiagram() {
      const el = document.getElementById("k-diagram");
      this.diagram = new AppGfx(el, this.appData);
    },
    diagramEnter() {
      this.diagram.enter();
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../style/vars.scss";
@import "../style/_mixins-utils.scss";

.k-dia-canvas-container {
  position: relative;
  display: inline-block;
  width: 96vw;
  height: 96vw;
  @include bp(768) {
    width: 85vw;
    height: 85vw;
  }
  @include bp(1024) {
    width: 60vw;
    height: 60vw;
  }
  @include bp(1200) {
    width: 50vw;
    height: 50vw;
  }
  @include bp(1400) {
    width: 45vw;
    height: 45vw;
  }
  @include bp(1800) {
    width: 40vw;
    height: 40vw;
  }
  canvas {
    width: 100%;
  }
  /*   @include bpMax(767) {
    .standalone & {
      // margin-top: -10px;
    }
  } */
}
</style>
