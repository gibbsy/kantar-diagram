<template>
  <div :class="['k-dia-container', { standalone: isStandalone }, lang.toString()]">
    <transition name="slow-fade" appear>
      <header v-if="isStandalone" class="k-dia-page-header">
        <div class="k-dia-demo-logo">
          <svg viewBox="0 0 149 28" role="img">
            <use :xlink:href="logoUrl" />
          </svg>
        </div>
        <div class="k-dia-title-container">
          <h1 class="k-dia-main-title">{{ appData.standaloneTitle }}</h1>
          <p>{{ appData.standaloneSubtitle }}</p>
        </div>
      </header>
    </transition>
    <app-body v-if="loading == false" />
    <div v-if="error !== null">
      <p>Sorry, we couldn't load the data.</p>
    </div>
    <transition name="slow-delay-fade" appear>
      <div class="app-footer">
        <p id="k-dia-copyright">© Kantar Media</p>
      </div>
    </transition>
  </div>
</template>

<script>
import AppBody from "./components/AppBody.vue";
import sanity from "./client.js";
import config from "./config.js";

const query = `
{
  "appData": *[_type=="diagram" && version=="${config.lang}"][0]{
  standaloneTitle, standaloneSubtitle, title, fontSize,
  mainArcs[]->{label, _id}, centreLinkTop->{label, _id}, centreLinkBottom->{label, _id}, 
  blackRing->{label, _id}, outerLinkLeft->{label, _id}, outerLinkRight->{label, _id}, bottomBtns[]->{label, _id}
}, 
"pages": *[_type=="page" && version == "${config.lang}"]
}
`;

export default {
  name: "App",
  components: { AppBody },
  data() {
    return {
      loading: true,
      error: null,
    };
  },
  computed: {
    appData() {
      return this.$store.state.appData;
    },
    isStandalone() {
      return this.$store.state.isStandalone;
    },
    lang() {
      return this.$store.state.lang;
    },
    logoUrl() {
      return `https://cdn.sanity.io/images/k7sqtopt/production/5a5ea40f763aea0167b1957b169809bbe91528cb-149x28.svg`;
    },
    modalOn() {
      return this.$store.state.modalOn;
    },
  },
  watch: {
    modalOn(val) {
      if (val) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    },
  },
  created() {
    this.fetchData();
    this.$store.commit("setStandalone", config.standalone);
    this.$store.commit("setLang", config.lang);
  },
  methods: {
    fetchData() {
      sanity.fetch(query).then(
        (diagram) => {
          diagram.appData.title = diagram.appData.title.replaceAll("\\n", "\n");
          this.$store.commit("saveAppData", diagram.appData);
          this.$store.commit("savePages", diagram.pages);
          this.loading = false;
        },
        (error) => {
          this.error = error;
        }
      );
    },
  },
};
</script>
<style lang="scss">
@import "./style/vars.scss";
@import "./style/_mixins-utils.scss";
@import "./style/reset.scss";
@import "./style/transitions.scss";

#k-diagram-app,
.k-dia-container {
  font-family: "Kantar Brown", sans-serif !important;
  font-weight: 300;
  font-style: normal;
  font-size: 1rem;
}

.k-dia-container {
  color: #000;
  letter-spacing: 0.3px;
  line-height: 1.5;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  @include bp(1080) {
    font-size: 1.125rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hgroup,
  ul,
  ol,
  dd,
  p,
  figure,
  pre,
  table,
  fieldset,
  hr {
    margin: 0;
    margin-bottom: 12px;
    font-weight: inherit;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .k-dia-modal-main-title,
  .k-dia-main-title {
    font-size: 1.25rem;
    line-height: 1.25;
    @include bp(720) {
      font-size: 1.5rem;
    }
    @include bp(1080) {
      font-size: 1.825rem;
    }
  }
  .k-dia-heading-thin {
    font-size: 1.125rem;
    line-height: 1.25;
    font-weight: 200;
    @include bp(720) {
      font-size: 1.375rem;
      line-height: 1.5;
    }
    @include bp(1080) {
      font-size: 1.75rem;
    }
  }
  p,
  a,
  li {
    font-weight: 300;
    font-size: 1rem;
    @include bp(1080) {
      font-size: 1.125rem;
    }
  }
  button {
    border: none;
    outline: none;
    cursor: pointer;
  }
  button.k-dia-btn-primary,
  a.k-dia-btn-primary {
    position: relative;
    display: inline-block;
    text-decoration: none;
    border: none;
    outline: none;
    background: $darkGrey;
    color: #fff;
    padding: 20px 30px;
    font-size: 1rem;
    cursor: pointer;
    overflow: hidden;
    font-weight: 400;
    margin: 10px 0;
    width: 100%;
    @include bp(768) {
      width: auto;
    }
    @include bp(1024) {
      padding: 18px 40px;
    }
    &:before {
      content: "";
      position: absolute;
      width: 8px;
      height: 100%;
      left: 0;
      top: 0;
      background: $goldGrad;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    &:hover:before {
      transform: translateX(0);
    }
  }
  .k-dia-app-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1440px;
    padding: 0 20px;
  }

  .k-dia-page-header {
    position: relative;
    display: flex;
    flex-direction: row-reverse;
    padding: 20px;
    width: 100%;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    background: #000;
    @include bp(768) {
      align-items: center;
      padding: 30px 30px 20px 30px;
    }
    @include bp(1024) {
      flex-direction: column;
      position: absolute;
      background: none;
      top: 0;
      left: 0;
      align-items: flex-start;
      justify-content: flex-start;
      max-width: 33vw;
    }
  }

  .k-dia-title-container {
    line-height: 1.2;
    color: #fff;
    h1,
    h2 {
      line-height: 1;
      margin-bottom: 0;
    }
    h1 {
      margin-bottom: 0.5rem;
    }
    @include bp(1024) {
      color: #000;
    }
  }

  .k-dia-demo-logo {
    position: relative;
    width: 100px;
    display: inline-block;
    svg {
      fill: #fff;
      width: 100%;
      @include bp(1024) {
        fill: #000;
      }
    }
    /* margin-top: auto; */
    @include bp(768) {
      width: 120px;
    }
    @include bp(1080) {
      width: 140px;
    }
  }

  .app-footer {
    width: 100%;
    font-weight: 300;
    display: flex;
    margin-top: 10px;
    justify-content: flex-end;
    padding: 0 20px;
    transition-delay: 4s;

    p {
      font-size: 0.875rem;
    }
    @include bp(768) {
      margin-top: 20px;
      padding: 0 40px;
    }
    @include bp(1080) {
      margin-top: 30px;
      padding: 0 60px;
    }
  }
}
</style>
