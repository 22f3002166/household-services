export default {
    props: ['loggedIn'],
    template: `
    <div class="row border justify-content-center align-items-center" style="height: 750px;">
        <div class="col-md-4">
            <div class="border p-4 rounded shadow bg-white">
                <h2 class="text-center mb-3">Login</h2>
                <p class="text-danger text-center" v-if="message">{{ message }}</p>
                <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="name@example.com" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" v-model="formData.password" required>
                </div>
                <div class="text-center">
                    <button class="btn btn-primary w-100" @click="loginUser" :disabled="!formData.email || !formData.password">Login</button>
                </div>
            </div>
        </div>
    </div>`,
    
    data() {
        return {
            formData: {
                email: "",
                password: ""
            },
            message: ""
        };
    },

    methods: {
        loginUser() {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => { 
                console.log(data);
                if (data.user && data.user["auth-token"]) {  // Corrected this line
                    localStorage.setItem("auth_token", data.user["auth-token"]); 
                    localStorage.setItem("id", data.user.id);
                    localStorage.setItem("username", data.user.name);
                    this.$emit('login');
    
                    // Route user based on role
                    if (data.user.role === 'admin') {
                        this.$router.push('/admin');
                    } else if (data.user.role === 'customer') {
                        this.$router.push('/customer');
                    } else if (data.user.role === 'service_professional') {
                        this.$router.push('/professional');
                    } else {
                        this.message = "Invalid role assigned. Contact support.";
                    }
                } else {
                    this.message = "Invalid email or password. Please try again.";
                }
            })
            .catch(error => {
                console.error("Login error:", error);
                this.message = "An error occurred. Please try again.";
            });
        }
    }
    
}
