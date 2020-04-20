<template>
  <div id="container">
    <h1>{{initData}}</h1>
    <div class="img"></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      initData: 'webpack配置vue开发环境'
    }
  }
}
</script>

<style scoped>
  @import url('assets/index.less');
  
  #container {
    color: rebeccapurple;
    display: flex;
  }
  .img {
    width: 128px;
    height: 128px;
    background-image: url("assets/shizukaRin.jpg");
  }
</style>