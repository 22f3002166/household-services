import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Registersp from './components/Registersp.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import admin from './components/admin.js';
import customer from './components/customer.js';
import professional from './components/professional.js';
import create_service from './components/create_service.js';
import edit_service from './components/edit_service.js';
import review from './components/review.js';
import searchservice from './components/searchservice.js';
import searchprofessional from './components/searchprofessional.js';

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/registersp', component: Registersp},
    {path: '/navbar', component: Navbar},
    {path: '/foot', component: Footer},
    {path: '/admin', component: admin},
    {path: '/customer', component: customer},
    {path: '/professional', component: professional},
    {path: '/create_service', component: create_service},
    {path: '/edit_service/:id', component: edit_service},
    {path: '/review/:id', component: review},
    {path: '/searchservice', component: searchservice},
    {path: '/searchprofessional', component: searchprofessional}

]
const router = new VueRouter({
    routes 
})
const app = new Vue({
  el: "#app",
  router, // router: router
  template: `
  <div class="container">
      <nav-bar :loggedIn = 'loggedIn' @logout="handleLogout"></nav-bar>
      <router-view :loggedIn = 'loggedIn' @login="handleLogin"></router-view>
      <foot></foot>
  </div>
  `,
  data: {
      loggedIn: false
  },
  components:{
      "nav-bar": Navbar,
      "foot": Footer
  },
  methods:{
      handleLogout(){
          this.loggedIn = false
      },
      handleLogin(){
          this.loggedIn = true
      }
  }
}) 