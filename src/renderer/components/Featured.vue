<template>
  <div class="featured-message" :class="{ 'is-blinking': isBlinking }">
    <p class="description" :style="{ 'color': fontColor }">
      {{ message.description || '---' }}
    </p>
    <h1 class="title" :style="{ 'color': fontColor }">
      {{ message.title || '---' }}
    </h1>
    <h2 class="subtitle" :style="{ 'color': fontColor }">
      {{ message.subtitle || '---' }}
    </h2>
  </div>
</template>

<script>
import Queue from 'promise-queue'

const queue = new Queue(1, 10)

export default {
  name: 'Featured',
  props: {
    message: {
      required: true
    },
    fontColor: {
      type: String,
      default: '#000000'
    }
  },
  data () {
    return {
      isBlinking: false
    }
  },
  mounted () {
    queue.add(this.blink)
  },
  methods: {
    blink () {
      this.$emit('blink')
      return new Promise((resolve) => {
        this.isBlinking = true
        setTimeout(() => {
          this.isBlinking = false
          resolve()
        }, 2000) // Pisca durante 2 segundos suavemente
      })
    }
  },
  watch: {
    message () {
      queue.add(this.blink)
    }
  }
}
</script>

<style lang="sass" scoped>
@keyframes pulseBlink
  0%
    transform: scale(1)
    opacity: 1
  50%
    transform: scale(1.03)
    opacity: 0.6
  100%
    transform: scale(1)
    opacity: 1

.is-blinking
  animation: pulseBlink 0.8s ease-in-out infinite
</style>
