export default {
    props: ['loggedIn'],
    template: `
    <div class="row border">
        <div class="col-7 fs-2 border">
            HouseHold Services
        </div>
        <div class="col-5 border">
            <div class="mt-1">
                <router-link v-if="!loggedIn" class="btn btn-primary my-2" to="/login">Login</router-link>
                <router-link v-if="!loggedIn" class="btn btn-warning my-2" to="/register">Register Customer</router-link>
                <router-link v-if="!loggedIn" class="btn btn-warning my-2" to="/registersp">Register Professional</router-link>
                <button v-if="loggedIn" @click="logoutUser" class="btn btn-danger">Logout</button>
            </div>
        </div>
    </div>`,
    data: function(){
        return {
            loggedIn: localStorage.getItem('auth_token')
        }
    },
    methods:{
        logoutUser(){
            localStorage.clear()
            this.$router.go('/')
            this.$emit('logout')
        }
    }

}