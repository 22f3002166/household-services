export default {
    data() {
        return {
            username: "",
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
                const response = await fetch('/api/customer', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    this.username = data.username;
                } else {
                    this.message = "Failed to fetch user data.";
                }
            } catch (error) {
                console.error("Error fetching customer data:", error);
                this.message = "Error fetching user details.";
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
            <h2>Hey, {{ username }}!</h2>
        </div>
    </div>
    `
};
