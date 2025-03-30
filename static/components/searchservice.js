export default {
    template: `
    <div class="container">
        <h2>Search Services</h2>
        
        <!-- Search Input -->
        <div class="input-group mb-3">
            <input type="text" v-model="searchQuery" class="form-control" placeholder="Enter service name...">
            <button class="btn btn-primary" @click="fetchServices">Search</button>
        </div>

        <!-- Display Search Results -->
        <table class="table table-bordered" v-if="services.length > 0">
            <thead>
                <tr>
                    <th>Service Name</th>
                    <th>Service Provider</th>
                    <th>Base Price</th>
                    <th>Description</th>
                    <th>Action</th> <!-- Add Action header -->
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in services" :key="service.id">
                    <td>{{ service.name }}</td>
                    <td>{{ service.user_name }}</td>
                    <td>{{ service.base_price }}</td>
                    <td>{{ service.description }}</td>
                    <td>
                        <button class="btn btn-primary" @click="requestService(service.id, service.user_id)">Request Service</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-else>No services found.</p>
    </div>`,

    data() {
        return {
            searchQuery: "",
            services: []
        };
    },

    methods: {
        async fetchServices() {
            if (!this.searchQuery.trim()) {
                alert("Please enter a service name.");
                return;
            }
            
            try {
                const response = await fetch(`/api/search_services?query=${encodeURIComponent(this.searchQuery)}`);
                const data = await response.json();
                this.services = data.services;
                console.log(this.services); 
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        },
        async requestService(serviceId, serviceProviderId) {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                alert("Unauthorized! Please log in.");
                return;
            }
            console.log(serviceId, serviceProviderId);
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
                    this.fetchServices(); 
                } else {
                    alert("Failed to create service request: " + result.message);
                }
            } catch (error) {
                console.error("Error requesting service:", error);
                alert("Error requesting service.");
            }
        }
    }
};