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
                <div class="mb-3">
                    <label for="service" class="form-label">Select Service</label>
                    <select class="form-control" id="service" v-model="formData.service_name" required>
                        <option v-for="service in services" :key="service.id" :value="service.name">
                            {{ service.name }}
                        </option>
                    </select>
                </div>
                <div class="text-center">
                    <button class="btn btn-primary w-100" @click="registerServiceProfessional"  
                        :disabled="!formData.email || !formData.password || !formData.name || 
                        !formData.service_provider_experience || !formData.service_name">
                        Register
                    </button>
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
                service_provider_experience: "",
                service_name: "" 
            },
            services: [],
            message: "",
            successMessage: ""
        };
    },

    mounted() {
        this.getServices();
    },

    methods: {
        async getServices() {
            try {
                const response = await fetch('/api/get_unassigned_services');
                this.services = await response.json();
            } catch (error) {
                console.error("Error fetching services:", error);
                this.message = "Failed to load services.";
            }
        },

        async registerServiceProfessional() {
            try {
                const response = await fetch('/api/register_service_professional', {
                    method: 'POST',
                    headers: { "Content-Type": 'application/json' },
                    body: JSON.stringify(this.formData)
                });

                const data = await response.json();
                if (response.ok) {
                    this.successMessage = "Registration successful! Redirecting to login...";
                    this.message = "";
                    setTimeout(() => this.$router.push('/login'), 2000);
                } else {
                    this.message = data.message;
                    this.successMessage = "";
                }
            } catch (error) {
                console.error("Registration error:", error);
                this.message = "An error occurred. Please try again.";
                this.successMessage = "";
            }
        }
    }
}
