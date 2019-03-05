import Vue from 'vue'
import App from './App.vue'
import draggable from 'vuedraggable'

Vue.config.productionTip = false

Vue.mixin({
  methods: {
    log(...params) {
      console.log(...params)
    },
  }
})

Vue.component('draggable', draggable)

new Vue({
  render: h => h(App),
}).$mount('#app')
