export default {
    data() {
        return {
            services: [],
            serviceRequests: [],
            serviceProfessionals: [],
            unapprovedProfessionals: [],
            message: "",
            requestMessage: "",
            professionalMessage: "",
            unapprovedMessage: "",
            users: [],
            userMessage: "",
            reviews: [],
            reviewMessage: ""
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
                        "Authorization": token
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
                        "Authorization": token
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Service deleted successfully!");
                    this.fetchServices();
                } else {
                    alert(`Error deleting service: ${data.error || response.status}`);
                }
            } catch (error) {
                console.error("Error deleting service:", error);
                alert("Failed to delete service. Try again!");
            }
        },

        async fetchServiceRequests() {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                this.requestMessage = "Unauthorized! Please log in.";
                return;
            }

            try {
                const response = await fetch('/api/service_requests', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    this.serviceRequests = data.service_requests.length ? data.service_requests : [];
                    this.requestMessage = data.service_requests.length ? "" : "No service requests found.";
                } else {
                    this.requestMessage = data.message || "Failed to fetch service requests.";
                }
            } catch (error) {
                console.error("Error fetching service requests:", error);
                this.requestMessage = "Error fetching service requests.";
            }
        },

        async fetchServiceProfessionals() {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                this.professionalMessage = "Unauthorized! Please log in.";
                return;
            }

            try {
                const response = await fetch('/api/admin/service_professionals', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    this.serviceProfessionals = data.service_professionals.length ? data.service_professionals : [];
                    this.professionalMessage = data.service_professionals.length ? "" : "No service professionals found.";
                } else {
                    this.professionalMessage = data.message || "Failed to fetch service professionals.";
                }
            } catch (error) {
                console.error("Error fetching service professionals:", error);
                this.professionalMessage = "Error fetching service professionals.";
            }
        },
    async fetchUnapprovedProfessionals() {
        const token = localStorage.getItem("auth_token");

        if (!token) {
            this.unapprovedMessage = "Unauthorized! Please log in.";
            return;
        }

        try {
            const response = await fetch('/api/admin/unapproved_providers', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            });

            const data = await response.json();
            if (response.ok) {
                this.unapprovedProfessionals = data.length ? data : [];
                this.unapprovedMessage = data.length ? "" : "No unapproved professionals found.";
            } else {
                this.unapprovedMessage = data.message || "Failed to fetch unapproved professionals.";
            }
        } catch (error) {
            console.error("Error fetching unapproved professionals:", error);
            this.unapprovedMessage = "Error fetching unapproved professionals.";
        }
    },

    async approveProfessional(providerId) {
        const token = localStorage.getItem("auth_token");

        if (!token) {
            alert("Unauthorized! Please log in.");
            return;
        }

        if (!confirm("Are you sure you want to approve this professional?")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/approve_provider/${providerId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert("Professional approved successfully!");
                this.unapprovedProfessionals = this.unapprovedProfessionals.filter(provider => provider.id !== providerId);
            } else {
                alert(`Error approving professional: ${data.message || response.status}`);
            }
        } catch (error) {
            console.error("Error approving professional:", error);
            alert("Failed to approve professional. Try again!");
        }
    },
    async fetchUsers() {
        const token = localStorage.getItem("auth_token");
  
        if (!token) {
          this.userMessage = "Unauthorized! Please log in.";
          return;
        }
  
        try {
          const response = await fetch('/api/admin/users', {
            method: 'GET',
            headers: {
              "Content-Type": "application/json",
              "Authorization": token
            }
          });
  
          const data = await response.json();
          if (response.ok) {
            this.users = data.users || [];
            this.userMessage = this.users.length ? "" : "No users found.";
          } else {
            this.userMessage = data.message || "Failed to fetch users.";
          }
        } catch (error) {
          this.userMessage = "Error fetching users.";
        }
      },
  
    async toggleUserStatus(user) {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        alert("Unauthorized! Please log in.");
        return;
    }

    if (!confirm(`Are you sure you want to ${user.active ? "block" : "unblock"} this user?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${user.id}/toggle`, {
            method: "PATCH", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await response.json();
        if (response.ok) {
            user.active = data.active; 
        } else {
            alert(`Error: ${data.error || "Failed to update user status"}`);
        }
    } catch (error) {
        console.error("Error updating user status:", error);
        alert("An error occurred while updating user status.");
    }
},
async fetchReviews() {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        this.reviewMessage = "Unauthorized! Please log in.";
        return;
    }

    try {
        const response = await fetch('/api/admin/reviews', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await response.json();
        if (response.ok) {
            this.reviews = data.reviews || [];
            this.reviewMessage = this.reviews.length ? "" : "No reviews found.";
        } else {
            this.reviewMessage = data.message || "Failed to fetch reviews.";
        }
    } catch (error) {
        console.error("Error fetching reviews:", error);
        this.reviewMessage = "Error fetching reviews.";
    }
}

    
},
mounted() {
    this.fetchServices();
    this.fetchServiceRequests();
    this.fetchServiceProfessionals();
    this.fetchUnapprovedProfessionals();
    this.fetchUsers();
    this.fetchReviews();
    },
    template: `
        <div>
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
        
                <hr class="mt-5"/>
                <h2>Unapproved Service Professionals</h2>
                <div v-if="unapprovedMessage" class="alert alert-warning text-center mt-3">{{ unapprovedMessage }}</div>
                <div v-else class="row mt-3">
                    <div v-for="professional in unapprovedProfessionals" :key="professional.id" class="col-md-4 mb-3">
                        <div class="card border-danger">
                            <div class="card-body">
                                <h5 class="card-title">{{ professional.name }}</h5>
                                <p><strong>Email:</strong> {{ professional.email }}</p>
                                <p><strong>Service:</strong> {{ professional.service_name }}</p>
                                <p><strong>Experience:</strong> {{ professional.experience }} years</p>
                                <button @click="approveProfessional(professional.id)" class="btn btn-success w-100 mt-2">
                                    ✅ Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container mt-4">
                    <!-- Manage Users -->
                    <h2>Manage Users</h2>
                    <router-link to="/searchprofessional" class="btn btn-success">
                        Search Professional
                    </router-link>
                    <div v-if="userMessage" class="alert alert-warning text-center mt-3">
                    {{ userMessage }}
                    </div>

                    <div v-else class="table-responsive">
                    <table class="table table-bordered">
                        <thead class="table-dark">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.role }}</td>
                           <td :class="user.active ? 'text-success' : 'text-danger'">
                                {{ user.active ? "Unblocked" : "Blocked" }}  <!-- Fixed text -->
                            </td>
                            <td>
                                <button @click="toggleUserStatus(user)" 
                                    :class="user.active ? 'btn btn-danger' : 'btn btn-success'">
                                    {{ user.active ? "🚫 Block" : "✅ Unblock" }}  <!-- Fixed text -->
                                </button>
                            </td>


                        </tr>
                        </tbody>
                    </table>
                    </div>
                </div>
                <div class="container mt-4">
                    <h2>All Reviews</h2>
                    <div v-if="reviewMessage" class="alert alert-warning text-center mt-3">
                        {{ reviewMessage }}
                    </div>

                    <div v-else class="table-responsive">
                        <table class="table table-bordered">
                            <thead class="table-dark">
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Service Provider Name</th>
                                    <th>Service Name</th>
                                    <th>Rating</th>
                                    <th>Review Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="review in reviews" :key="review.id">
                                    <td>{{ review.customer_name }}</td>
                                    <td>{{ review.service_provider_name }}</td>
                                    <td>{{ review.service_name }}</td>
                                    <td>{{ review.rating }}</td>
                                    <td>{{ review.review_description }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
    
};
