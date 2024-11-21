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
            <aside class="k-dia-modal-pullout-mobile">
              <div class="k-dia-modal-aside-mobile">
                <h2 class="k-dia-heading-thin">{{ content.pullout }}</h2>
              </div>
            </aside>
            <a v-if="!isStandalone" class="k-dia-btn-primary" @click.prevent="onClickCta">{{
              content.mainCta.title
            }}</a>
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
    isStandalone() {
      return this.$store.state.isStandalone;
    },
  },
  methods: {
    closeModal() {
      this.$store.commit("toggleModal", false);
    },
    onClickCta() {
      window.parent.location.href = this.content.mainCta.link.href;
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
    z-index: 1000;
  }
  &-modal-content {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    overflow: scroll;
    background-color: #fff;
    /*     display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end; */
    @include bp(1024) {
      width: 90%;
      height: 80vh;
      display: flex;
      justify-content: flex-start;
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
    padding: 30px 20px;
    @include bp(1200) {
      padding: 60px 30px 30px 20px;
    }
    @include bp(1600) {
      padding: 80px 30px 30px 20px;
    }
  }
  &-modal-left-col {
    position: relative;
    width: 100%;
    height: auto;
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: auto;
    background: $beige;
    display: none;
    @include bp(1024) {
      display: block;
      width: 24vw;
      height: 100%;
      background-attachment: fixed;
    }
  }
  &-modal-aside-mobile {
    position: relative;
    background: $beige;
    width: 100%;
    padding: 30px 16px;
    margin-bottom: 16px;
    > * {
      margin: 0;
    }
    @include bp(1024) {
      display: none;
    }
    &:before {
      content: "";
      position: absolute;
      width: 6px;
      height: 100%;
      top: 0;
      left: 0;
      background: $goldGrad;
      @include bp(1024) {
        width: 8px;
      }
    }
  }
  &-modal-fixed-aside {
    position: relative;
    width: 100%;
    background-color: $beige;
    padding: 20px;
    @include bp(1024) {
      padding: 30px 16px 16px 16px;
      position: fixed;
      width: inherit;
      height: 80vh;
    }
    @include bp(1200) {
      padding: 60px 30px 20px 24px;
    }
    @include bp(1600) {
      padding: 80px 20px 30px 30px;
    }
    &:before {
      content: "";
      position: absolute;
      width: 6px;
      height: 100%;
      top: 0;
      left: 0;
      background: $goldGrad;
      @include bp(1024) {
        width: 8px;
      }
    }
  }
  &-modal-close-btn-container {
    position: relative;
    width: 30px;
    height: 30px;
    margin-left: auto;
    margin-bottom: 8px;
    @include bp(1024) {
      position: absolute;
      top: 20px;
      right: 20px;
      margin: 0;
    }
    @include bp(1200) {
      width: 40px;
      height: 40px;
    }
  }
  &-modal-close-btn {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: none;
    @include bp(1024) {
      position: fixed;
    }
    @include bp(1200) {
      width: 40px;
      height: 40px;
    }
    span {
      position: absolute;
      width: 30px;
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
        width: 40px;
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
      padding: 0 40px 40px 0;
    }
  }
  &-video-wrapper {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    margin-bottom: 20px;
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
