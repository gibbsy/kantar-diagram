<template>
  <div class="k-dia-modal-container">
    <div ref="content" class="k-dia-modal-content">
      <aside class="k-dia-modal-left-col">
        <div class="k-dia-modal-fixed-aside">
          <h2 class="k-dia-heading-thin">{{ content.pullout }}</h2>
        </div>
      </aside>
      <div class="k-dia-modal-main-col">
        <div class="k-dia-modal-close-btn-container">
          <button
            class="k-dia-modal-close-btn"
            aria-label="Close window"
            @click.prevent="closeModal"
          >
            <span />
            <span />
          </button>
        </div>
        <article class="k-dia-modal-main-article">
          <h2 class="k-dia-modal-main-title">{{ content.title }}</h2>
          <div v-if="content.video" class="k-dia-video-wrapper">
            <vimeo-player :video-url="content.video" :options="{ responsive: true }" />
          </div>
          <div class="k-dia-modal-text">
            <block-content :blocks="content.textContent" />
            <button class="k-dia-btn-primary">{{ content.mainCta.title }}</button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
<script>
import { vueVimeoPlayer } from "vue-vimeo-player";
export default {
  components: {
    VimeoPlayer: vueVimeoPlayer,
  },
  computed: {
    content() {
      return this.$store.state.activeSection[0];
    },
  },
  mounted() {
    console.log("overlay mounted");
    this.$refs["content"].scrollTop = 0;
  },
  methods: {
    closeModal() {
      this.$store.commit("toggleModal", false);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../style/vars.scss";
@import "../style/_mixins-utils.scss";

.k-dia {
  &-modal-container {
    position: fixed;
    background: rgba(0, 0, 0, 0.8);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
  }
  &-modal-content {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    overflow: scroll;
    background-color: #fff;
    display: flex;
    flex-direction: column-reverse;
    @include bp(1024) {
      width: 90%;
      height: 80vh;
      flex-direction: row;
    }
    @include bp(1400) {
      width: 70%;
      max-width: 1600px;
      height: 80vh;
    }
    @include bp(1800) {
      width: 60%;
    }
  }
  &-modal-main-col {
    // flex-basis: 70%;
    position: relative;
    padding: 1.6rem;
    @include bp(1200) {
      padding: 6rem 3rem 3rem 1.6rem;
    }
    @include bp(1600) {
      padding: 8rem 3rem 3rem 2rem;
    }
  }
  &-modal-left-col {
    position: relative;
    display: block;
    width: 100%;
    height: auto;
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: auto;
    background: $beige;
    @include bp(1024) {
      width: 24vw;
      height: 100%;
      background-attachment: fixed;
    }
  }
  &-modal-fixed-aside {
    position: relative;
    width: 100%;
    background-color: $beige;
    padding: 2rem;
    @include bp(1024) {
      padding: 3rem 1.6rem 1.6rem 1.6rem;
      position: fixed;
      width: inherit;
      height: 80vh;
    }
    @include bp(1200) {
      padding: 6rem 2rem 3rem 3rem;
    }
    @include bp(1600) {
      padding: 8rem 2rem 3rem 3rem;
    }
    &:before {
      content: "";
      position: absolute;
      width: 0.25rem;
      height: 100%;
      top: 0;
      left: 0;
      background: $goldGrad;
      @include bp(1024) {
        width: 0.5rem;
      }
    }
  }
  &-modal-close-btn-container {
    position: relative;
    width: 3rem;
    height: 3rem;
    margin-left: auto;
    margin-bottom: 8px;
    @include bp(1024) {
      position: absolute;
      top: 2rem;
      right: 2rem;
      margin: 0;
    }
    @include bp(1200) {
      width: 4rem;
      height: 4rem;
    }
  }
  &-modal-close-btn {
    position: relative;
    display: inline-block;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: none;
    @include bp(1024) {
      position: fixed;
    }
    @include bp(1200) {
      width: 4rem;
      height: 4rem;
    }
    span {
      position: absolute;
      width: 3rem;
      height: 2px;
      left: 0;
      margin: 0;
      display: inline-block;
      background: #000;
      border-radius: 1px;
      z-index: 21;
      transform-origin: 50% 50%;
      transform: rotate(45deg);
      @include bp(1200) {
        width: 4rem;
      }

      &:last-child {
        transform: rotate(-45deg);
      }
    }
  }
  &-modal-main-article {
    display: flex;
    flex-direction: column;
    @include bp(1024) {
      display: inline-block;
      padding: 0 4rem 4rem 0;
    }
  }
  &-video-wrapper {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    max-width: 100%;
    margin-bottom: 2rem;
    #vimeo-player-1 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      & iframe,
      & object,
      & embed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
