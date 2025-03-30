export default {
    data() {
        return {
            service: {
                id: null,
                name: '',
                base_price: '',
                description: ''
            },
            message: ''
        };
    },
    methods: {
        async fetchService() {
            const token = localStorage.getItem("auth_token");
            const serviceId = this.$route.params.id; // Assuming the service ID is passed as a route parameter

            if (!token) {
                this.message = "Unauthorized! Please log in.";
                return;
            }

            try {
                const response = await fetch(`/api/service_get/${serviceId}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    this.service = data; // Assuming the API returns the service object directly
                } else {
                    this.message = data.message || "Failed to fetch service.";
                }
            } catch (error) {
                console.error("Error fetching service:", error);
                this.message = "Error fetching service.";
            }
        },
        async submitService() {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                this.message = "Unauthorized! Please log in.";
                return;
            }

            try {
                const response = await fetch(`/api/service_update/${this.service.id}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify(this.service)
                });

                const data = await response.json();
                if (response.ok) {
                    this.message = "Service updated successfully!";
                } else {
                    this.message = data.message || "Failed to update service.";
                }
            } catch (error) {
                console.error("Error updating service:", error);
                this.message = "Error updating service.";
            }
        }
    },
    mounted() {
        this.fetchService(); // Fetch the service details when the component is mounted
    },
    template: `
        <div class="container mt-4">
            <h2>Edit Service</h2>
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
                <button type="submit" class="btn btn-primary">Update Service</button>
                <router-link to="/admin" class="btn btn-secondary ml-2">Cancel</router-link>
            </form>
        </div>
    `
};