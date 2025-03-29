import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Registersp from './components/Registersp.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import admin from './components/admin.js';

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/registersp', component: Registersp},
    {path: '/navbar', component: Navbar},
    {path: '/foot', component: Footer},
    {path: '/admin', component: admin}

]
const router = new VueRouter({
    routes 
})
const app = new Vue({
  el: '#app',
  router,
  template: `
    <div class="container">
        <nav-bar></nav-bar>
        <router-view></router-view>
        <foot></foot>
    </div>
  `,
  data: {
    section: "frontend"
  },
  components: {
    "nav-bar": Navbar,
    "foot": Footer
  }


});

