<template>
<p contenteditable="true"
   @input="update"
   @keydown.enter="onEnter"
   @keydown.backspace="onBackspace"
   @blur="onBlur"
/>
</template>

<script>
export default {
  name: "text-unit",
  props: ['content'],
  mounted() {
    this.setInnerText()
  },
  methods: {
    setInnerText() {
      this.$el.innerText = this.content
    },
    onEnter(event) {
      this.$emit('enter')

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    },
    onBackspace(event) {
      if (!this.$el.innerText.length) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        
        this.$emit('delete')
      }
    },
    onBlur(event) {
      this.$emit('blur')
      this.$nextTick(this.setInnerText)
    },
    update: function (event) {
      if (event.inputType === 'insertParagraph') {
        event.stopImmediatePropagation()
        console.log('is enter')
        return
      }

      this.$emit('update', event.target.innerText)
    }
  }
}
</script>

<style>

</style>