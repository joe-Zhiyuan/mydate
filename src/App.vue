<template>
  <div id="container">
    <h1 :title='title'>{{message}}</h1>
    <div class="img"></div>
    <div class="contentTxt">{{bodyContent}}</div>
    <button @click="reverseMessage">点击逆转</button>
  </div>
</template>

<script>
import $ from 'jquery';

export default {
  data () {
    return {
      message: 'webpack配置vue开发环境',
      title: '配置标题',
      bodyContent: '内容文本'
    }
  },
  methods: {
    reverseMessage : function () {
      this.message = this.message.split('').reverse().join('');
      console.log(-1);
    }
  },
  mounted: function () {
    $('.contentTxt').css("color", "green");
  },
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