<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'painel-web',
    mounted () {
      console.log('App component mounted')
    }
  }
</script>

<style>
  @import "~bulma/css/bulma.css";
  @import "~font-awesome/css/font-awesome.min.css";
</style>
