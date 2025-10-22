<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import {onBeforeMount} from 'vue';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();

onBeforeMount(async () => {
  await authStore.checkAuth();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>