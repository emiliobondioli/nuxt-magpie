<template>
  <div>
    Works!
    <img src="https://nuxtjs.org/logos/nuxt-icon.png">
  </div>
</template>

<script>
export default {
  async fetch () {
    return await Promise.resolve('https://nuxtjs.org/logos/nuxt-icon.png')
  },
  data () {
    return {
      test: 1,
      url: 'https://nuxtjs.org/logos/nuxt-icon.png'
    }
  }
}
</script>
