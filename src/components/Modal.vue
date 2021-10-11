<template>
  <div class="k-dia-modal-container">
    <div class="k-dia-modal-content">
      <aside class="k-dia-modal-left-col">
        <div class="k-dia-modal-fixed-aside">
          <h2 class="k-dia-heading-thin">This is the pullout quote</h2>
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
          <h2>{{ content.title }}</h2>
          <div class="k-dia-video-wrapper 16-9" />
          <div class="k-dia-modal-text">
            <p>
              Data underpins business strategy, but not all data is equal. The opportunities to
              source data directly from connected devices are expanding the possibilities for
              audience measurement, but it’s not the devices watching content or ads, it’s people.
            </p>
            <p>
              We provide true people-based measurement - trusted, privacycompliant, and used by the
              industry to make the most informed decisions about real-world behaviour.
            </p>
            <p>
              The number and the profile of those viewers can vary dramatically, with profound
              implications for your business.
            </p>
            <p>
              Panels bring big data streams together and make sense of them. They offer a value
              exchange for planning and trading and to enhance your own first-party data. [4]
            </p>
            <p>High-quality, consented panels lie at the heart of our solution</p>
            <p>
              Data underpins business strategy, but not all data is equal. The opportunities to
              source data directly from connected devices are expanding the possibilities for
              audience measurement, but it’s not the devices watching content or ads, it’s people.
            </p>
            <p>
              We provide true people-based measurement - trusted, privacycompliant, and used by the
              industry to make the most informed decisions about real-world behaviour.
            </p>
            <p>
              The number and the profile of those viewers can vary dramatically, with profound
              implications for your business.
            </p>
            <p>
              Panels bring big data streams together and make sense of them. They offer a value
              exchange for planning and trading and to enhance your own first-party data. [4]
            </p>
            <p>High-quality, consented panels lie at the heart of our solution</p>
            <button class="k-dia-btn-primary">Discover more</button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
<script>
// import bus from "../"
// import { mapState } from "vuex";
export default {
  /*  computed: mapState({
    content: "activeSection",
  }), */
  computed: {
    content() {
      return this.$store.state.activeSection[0];
    },
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
  }
  &-modal-content {
    position: relative;
    display: block;
    width: 60vw;
    height: 70vh;
    overflow: scroll;
    background-color: #fff;
    display: flex;
  }
  &-modal-main-col {
    // flex-basis: 70%;
    position: relative;
    padding: 4rem 2rem 2rem 1rem;
    @include bp(1600) {
      padding: 6rem 2rem 1rem 1rem;
    }
  }
  &-modal-left-col {
    position: relative;
    display: block;
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: auto;
    height: 100%;
    width: 24vw;
    background: $beige;
    background-attachment: fixed;
  }
  &-modal-fixed-aside {
    position: fixed;
    width: inherit;
    height: 70vh;
    background-color: $beige;
    padding: 4rem 2rem 2rem 1rem;
    @include bp(1600) {
      padding: 6rem 2rem 1rem 3rem;
    }
    &:before {
      content: "";
      position: absolute;
      width: 0.5rem;
      height: 100%;
      top: 0;
      left: 0;
      background: $goldGrad;
    }
  }
  &-modal-close-btn-container {
    position: absolute;
    width: 3rem;
    height: 3rem;
    top: 1.5rem;
    right: 1.5rem;
  }
  &-modal-close-btn {
    position: fixed;
    display: inline-block;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: none;
    span {
      position: absolute;
      left: 0;
      margin: 0;
      display: inline-block;
      width: 3rem;
      height: 2px;
      background: #000;
      border-radius: 1px;
      z-index: 21;
      transform-origin: 50% 50%;
      transform: rotate(45deg);

      &:last-child {
        transform: rotate(-45deg);
      }
    }
  }
  &-modal-main-article {
    padding: 0 4rem 4rem 0;
  }
}
</style>
