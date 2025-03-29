export default {
    data() {
        return {
            services: [],
            message: "",
        };
    },
    methods: {
        async fetchServices() {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                this.message = "Unauthorized! Please log in.";
                return;
            }

            try {
                const response = await fetch('/api/service_get', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": localStorage.getItem("auth_token") // ✅ Kept as it is
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    this.services = data.length ? data : [];
                    this.message = data.length ? "" : "No services available.";
                } else {
                    this.message = data.error || "Failed to fetch services.";
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                this.message = "Error fetching services.";
            }
        },

        async deleteService(serviceId) {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                alert("Unauthorized! Please log in.");
                return;
            }

            if (!confirm("Are you sure you want to delete this service?")) {
                return;
            }

            try {
                const response = await fetch(`/api/service_delete/${serviceId}`, {
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": localStorage.getItem("auth_token") // ✅ Kept as it is
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Service deleted successfully!");
                    this.fetchServices(); // ✅ Refresh list after deletion
                } else {
                    alert(`Error deleting service: ${data.error || response.status}`);
                }
            } catch (error) {
                console.error("Error deleting service:", error);
                alert("Failed to delete service. Try again!");
            }
        }
    },
    mounted() {
        this.fetchServices();
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center">
            <h2>All Services</h2>
            <router-link to="/create_service" class="btn btn-primary">
                + Create New Service
            </router-link>
        </div>

        <div v-if="message" class="alert alert-warning text-center mt-3">
            {{ message }}
        </div>

        <div v-else class="row mt-3">
            <div v-for="service in services" :key="service.id" class="col-md-4 mb-3">
                <div class="card border-dark">
                    <div class="card-body">
                        <h5 class="card-title">{{ service.name }}</h5>
                        <p class="card-text">{{ service.description }}</p>
                        <p class="card-text"><strong>Price:</strong> ₹{{ service.base_price }}</p>
                        <div class="d-flex justify-content-between mt-3">
                            <router-link :to="'/edit_service/' + service.id" class="btn btn-warning">
                                ✏️ Edit
                            </router-link>
                            <button @click="deleteService(service.id)" class="btn btn-danger">
                                ❌ Delete
                            </button>
                        </div> 
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};
