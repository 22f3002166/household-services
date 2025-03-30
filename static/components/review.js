export default {
    data() {
        return {
            searchQuery: "",
            services: [],
            message: ""
        };
    },
    methods: {
        async fetchServices() {
            if (!this.searchQuery.trim()) {
                this.message = "Please enter a service name.";
                return;
            }

            try {
                const token = localStorage.getItem("auth_token"); 

                if (!token) {
                    this.message = "Unauthorized! Please log in.";
                    return;
                }

                const response = await fetch(`/api/search_services?query=${encodeURIComponent(this.searchQuery)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                });

                const data = await response.json();
                console.log(data);
                if (response.ok) {
                    this.services = data.services;
                    this.message = data.services.length ? "" : "No services found.";
                } else {
                    this.message = data.message || "Error fetching services.";
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                this.message = "Error fetching services.";
            }
        }
    },
    template: `
        <div class="container mt-4">
            <h2>Search Services</h2>
            
            <!-- Search Input -->
            <div class="input-group mb-3">
                <input type="text" v-model="searchQuery" class="form-control" placeholder="Enter service name...">
                <button class="btn btn-primary" @click="fetchServices">Search</button>
            </div>

            <!-- Message -->
            <div v-if="message" class="alert alert-warning text-center mt-3">
                {{ message }}
            </div>

            <!-- Display Search Results -->
            <table class="table table-bordered mt-3" v-if="services.length > 0">
                <thead>
                    <tr>
                        <th>Service Name</th>
                        <th>Service Provider</th>
                        <th>Base Price</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="service in services" :key="service.id">
                        <td>{{ service.name }}</td>
                        <td>{{ service.user_name }}</td>
                        <td>{{ service.base_price }}</td>
                        <td>{{ service.description }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
};
