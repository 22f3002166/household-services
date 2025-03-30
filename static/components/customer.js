export default {
    data() {
        return {
            username: "", // Customer name
            availableServices: [], // List of services
            inProgressRequests: [], // List of in-progress requests
            message: ""
        };
    },
    methods: {
        async fetchCustomerData() {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                this.message = "Unauthorized! Please log in.";
                return;
            }
            try {
                // Fetch customer name
                const userResponse = await fetch('/api/customer', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });
                const userData = await userResponse.json();
                if (userResponse.ok) {
                    this.username = userData.username;
                } else {
                    this.message = "Failed to fetch user data.";
                }

                // Fetch available services for the customer
                const servicesResponse = await fetch('/api/customer/service', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });
                const servicesData = await servicesResponse.json();
                if (servicesResponse.ok) {
                    this.availableServices = servicesData.service_requests;
                } else {
                    this.message = "Failed to fetch services.";
                }

                // Fetch in-progress service requests
                const progressResponse = await fetch('/api/customer/in_progress_requests', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });
                const progressData = await progressResponse.json();
                console.log("In-progress requests:", progressData);

                if (progressResponse.ok) {
                    this.inProgressRequests = progressData.in_progress_requests; // Update this line
                } else {
                    this.message = progressData.message || "Failed to fetch in-progress requests.";
}
            } catch (error) {
                console.error("Error fetching data:", error);
                this.message = "Error fetching data.";
            }
        },
        async requestService(serviceId, serviceProviderId) {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                this.message = "Unauthorized! Please log in.";
                return;
            }
            
            if (!serviceId || !serviceProviderId) {
                alert("Missing required fields. Please try again.");
                return;
            }
        
            try {
                const response = await fetch('/api/customer/create_service_request', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify({
                        service_id: serviceId,
                        service_provider_id: serviceProviderId
                    })
                });
        
                const result = await response.json();
                
                if (response.ok) {
                    alert("Service request created successfully!");
                    this.fetchCustomerData();
                } else {
                    alert("Failed to create service request: " + result.message);
                }
            } catch (error) {
                console.error("Error requesting service:", error);
                alert("Error requesting service.");
            }
        },
        async completeServiceRequest(requestId) {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                this.message = "Unauthorized! Please log in.";
                return;
            }
            try {
                // Use requestId instead of request.id
                const response = await fetch(`/api/customer/complete_service_request/${requestId}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });
                const result = await response.json();
                if (response.ok) {
                    alert("Service request completed successfully!");
                    this.fetchCustomerData(); // Refresh the data
                } else {
                    alert("Failed to complete service request: " + result.message);
                }
            } catch (error) {
                console.error("Error completing service request:", error);
                alert("Error completing service request.");
            }
        }
    },
    mounted() {
        this.fetchCustomerData();
    },
    template: `
    <div class="container mt-4">
        <div v-if="message" class="alert alert-warning text-center">
            {{ message }}
        </div>
        <div v-else class="text-center">
            <h2>Welcome, {{ username }}!</h2>
            <h3>All Available Services</h3>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Service Name</th>
                        <th>Service Provider</th>
                        <th>Base Price</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="service in availableServices" :key="service.id">
                        <td>{{ service.name }}</td>
                        <td>{{ service.user_name }}</td>
                        <td>{{ service.base_price }}</td>
                        <td>{{ service.description }}</td>
                        <td>
                            <button class="btn btn-primary" @click="requestService(service.id, service.service_provider_id)">Request Service</button>
                        </td>
                    </tr>
                    <tr v-if="availableServices.length === 0">
                        <td colspan="5" class="text-center">No services available.</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="mt-4">In Progress Requests</h3>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Service Name</th>
                        <th>Service Provider</th>
                        <th>Status</th>
                        <th>Date of Register</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in inProgressRequests" :key="request.id">
                        <td>{{ request.service_name }}</td>
                        <td>{{ request.service_provider_email }}</td>
                        <td>{{ request.service_status }}</td>
                        <td>{{ request.date_of_register }}</td>
                        <td>
                            <button class="btn btn-success" @click="completeServiceRequest(request.id)">Complete</button>
                        </td>
                    </tr>
                    <tr v-if="inProgressRequests.length === -1">
                        <td colspan="5" class="text-center">No in-progress requests.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `
};
