<template>
  <div>
    Works!
    <img src="https://nuxtjs.org/logos/nuxt-icon.png">
    <div v-for="project in projects" :key="project.id">
      {{ project.Title }}
      <img :src="getCompleteUrl(project.Image.url)">
    </div>
  </div>
</template>

<script>
import axios from 'axios'
const TEST_LOCAL_API = false
const API_URL = 'http://localhost:1337'

export default {
  asyncData () {
    if (!TEST_LOCAL_API) {
      return {}
    }
    return axios.get(`${API_URL}/projects`).then((r) => {
      return {
        projects: r.data
      }
    })
  },
  data () {
    return {
      projects: [],
      test: 1,
      url: 'https://nuxtjs.org/logos/nuxt-icon.png'
    }
  },
  async fetch () {
    return await Promise.resolve('https://nuxtjs.org/logos/nuxt-icon.png')
  },
  head () {
    return {
      meta: [
        {
          hid: 'og:image',
          name: 'og:image',
          content: 'https://nuxtjs.org/logos/nuxt-icon-white.png'
        }
      ]
    }
  },
  methods: {
    getCompleteUrl (url) {
      return `${API_URL}${url}`
    }
  }
}
</script>
