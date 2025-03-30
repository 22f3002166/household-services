export default {
    data() {
        return {
            username: "", // Professional's name
            serviceRequests: [], // Service requests array
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
                const userResponse = await fetch('/api/service_professional', {
                    method: 'GET',
                    headers: { "Content-Type": "application/json", "Authorization": token }
                });
                const userData = await userResponse.json();
                if (userResponse.ok) this.username = userData.username;
                else this.message = "Failed to fetch user data.";

                const requestsResponse = await fetch('/api/service_requests', {
                    method: 'GET',
                    headers: { "Content-Type": "application/json", "Authorization": token }
                });
                const requestsData = await requestsResponse.json();
                if (requestsResponse.ok) this.serviceRequests = requestsData.service_requests;
                else this.message = "Failed to fetch service requests.";
            } catch (error) {
                console.error("Error fetching data:", error);
                this.message = "Error fetching user details.";
            }
        },
        async updateServiceStatus(request, status) {
            const token = localStorage.getItem("auth_token");
            let endpoint = "";
        
            if (status === "accepted") {
                endpoint = `/api/professional/accept_service_request/${request.id}`;
            } else if (status === "rejected") {
                endpoint = `/api/professional/reject_service_request/${request.id}`;
            } else if (status === "completed") {
                endpoint = `/api/professional/complete_service_request/${request.id}`;
            } else {
                return;
            }
        
            try {
                const response = await fetch(endpoint, {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json", 
                        "Authorization": token 
                    }
                });
        
                if (response.ok) {
                    request.service_status = status;
                } else {
                    console.error("Failed to update status");
                }
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }        
    },
    mounted() {
        this.fetchCustomerData();
    },
    template: `
    <div class="container mt-4">
        <div v-if="message" class="alert alert-warning text-center">{{ message }}</div>
        <div v-else class="text-center">
            <h2>Hey, {{ username }}!</h2>
            <h3>All Service Requests</h3>
            <table class="table table-bordered mt-3">
                <thead>
                    <tr>
                        <th>User Email</th>
                        <th>Status</th>
                        <th>Date Registered</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in serviceRequests" :key="request.id">
                        <td>{{ request.user_email }}</td>
                        <td>{{ request.service_status }}</td>
                        <td>{{ request.date_of_register }}</td>
                        <td>
                            <button v-if="request.service_status === 'requested' || request.service_status === 'pending'" 
                                    @click="updateServiceStatus(request, 'accepted')" 
                                    class="btn btn-success btn-sm">Accept</button>
                            <button v-if="request.service_status === 'requested' || request.service_status === 'pending'" 
                                    @click="updateServiceStatus(request, 'rejected')" 
                                    class="btn btn-danger btn-sm">Reject</button>
                            <button v-if="request.service_status === 'rejected'" 
                                    class="btn btn-secondary btn-sm" disabled>Rejected</button>
                            <button v-if="request.service_status === 'accepted'" 
                                    @click="updateServiceStatus(request, 'completed')" 
                                    class="btn btn-primary btn-sm">Completed</button>
                            <button v-if="request.service_status === 'completed'" 
                                    class="btn btn-secondary btn-sm" disabled>Completed</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `
};
