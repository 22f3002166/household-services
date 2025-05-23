export default {
    data() {
        return {
            service: {
                name: '',
                base_price: '',
                description: ''
            },
            message: ''
        };
    },
    methods: {
        async submitService() {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                this.message = "Unauthorized! Please log in.";
                return;
            }

            try {
                const response = await fetch('/api/service_create', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify(this.service)
                });

                const data = await response.json();
                if (response.ok) {
                    this.message = "Service created successfully!";
                    this.resetForm();
                } else {
                    this.message = data.message || "Failed to create service.";
                }
            } catch (error) {
                console.error("Error creating service:", error);
                this.message = "Error creating service.";
            }
        },
        resetForm() {
            this.service.name = '';
            this.service.base_price = '';
            this.service.description = '';
        }
    },
    template: `
        <div class="container mt-4">
            <h2>Create New Service</h2>
            <div v-if="message" class="alert alert-warning text-center mt-3">
                {{ message }}
            </div>
            <form @submit.prevent="submitService">
                <div class="form-group">
                    <label for="name">Service Name</label>
                    <input type="text" v-model="service.name" class="form-control" id="name" required />
                </div>
                <div class="form-group">
                    <label for="base_price">Base Price</label>
                    <input type="number" v-model="service.base_price" class="form-control" id="base_price" required />
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea v-model="service.description" class="form-control" id="description" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Create Service</button>
                <router-link to="/admin" class="btn btn-secondary ml-2">Cancel</router-link>
            </form>
        </div>
    `
};