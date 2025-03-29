export default {
    template: `
    <div class="row border justify-content-center align-items-center" style="height: 750px;">
        <div class="col-md-4">
            <div class="border p-4 rounded shadow bg-white">
                <h2 class="text-center mb-3">Register</h2>
                <p class="text-danger text-center" v-if="message">{{ message }}</p>
                
                <div class="mb-3">
                    <label for="name" class="form-label">Full Name</label>
                    <input type="text" class="form-control" id="name" v-model.trim="formData.name" placeholder="Enter your full name" required>
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="email" v-model.trim="formData.email" placeholder="name@example.com" required>
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" v-model.trim="formData.password" required>
                </div>

                <div class="text-center">
                    <button class="btn btn-primary w-100" @click="registerCustomer" :disabled="!formData.name || !formData.email || !formData.password">
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
                password: ""
            },
            message: ""
        };
    },

    methods: {
        registerCustomer() {
            if (!this.formData.name || !this.formData.email || !this.formData.password) {
                this.message = "All fields are required!";
                return;
            }

            fetch('/api/register_customer', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.message = data.message;
            })
            .catch(error => {
                console.error("Registration error:", error);
                this.message = "An error occurred. Please try again.";
            });
        }
    }
}
