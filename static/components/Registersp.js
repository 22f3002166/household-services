export default {
    template: `
    <div class="row border justify-content-center align-items-center" style="height: 750px;">
        <div class="col-md-4">
            <div class="border p-4 rounded shadow bg-white">
                <h2 class="text-center mb-3">Register as Service Professional</h2>
                <p class="text-danger text-center" v-if="message">{{ message }}</p>
                <p class="text-success text-center" v-if="successMessage">{{ successMessage }}</p>
                
                <div class="mb-3">
                    <label for="name" class="form-label">Full Name</label>
                    <input type="text" class="form-control" id="name" v-model="formData.name" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="name@example.com" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" v-model="formData.password" required>
                </div>
                <div class="mb-3">
                    <label for="experience" class="form-label">Experience (Years)</label>
                    <input type="number" class="form-control" id="experience" v-model="formData.service_provider_experience" required>
                </div>
                <div class="text-center">
                    <button class="btn btn-primary w-100" @click="registerServiceProfessional"  :disabled="!formData.email || !formData.password || !formData.name || !formData.service_provider_experience">Register</button>
                </div>
            </div>
        </div>
    </div>`,

    data() {
        return {
            formData: {
                name: "",
                email: "",
                password: "",
                service_provider_experience: ""
            },
            message: "",
            successMessage: ""
        };
    },

    methods: {
        registerServiceProfessional() {
            fetch('/api/register_service_professional', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => { 
                console.log(data);
                if (data.success) {
                    this.successMessage = "Registration successful! Redirecting to login...";
                    this.message = "";
                    setTimeout(() => this.$router.push('/login'), 2000);
                } else {
                    this.message = data.message;
                    this.successMessage = "";
                }
            })
            .catch(error => {
                console.error("Registration error:", error);
                this.message = "An error occurred. Please try again.";
                this.successMessage = "";
            });
        }
    }
}
