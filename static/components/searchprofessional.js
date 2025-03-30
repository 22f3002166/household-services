export default {
    template: `
    <div class="container">
        <h2>Search Users</h2>

        <!-- Search Input -->
        <div class="input-group mb-3">
            <input type="text" v-model="searchQuery" class="form-control" placeholder="Enter user name...">
            <button class="btn btn-primary" @click="fetchUsers">Search</button>
        </div>

        <!-- Display Search Results -->
        <table class="table table-bordered" v-if="users.length > 0">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                </tr>
            </tbody>
        </table>
        <p v-else>No Users found.</p>
    </div>`,

    data() {
        return {
            searchQuery: "",
            users: []  // Changed 'Users' to 'users'
        };
    },

    methods: {
        async fetchUsers() {
            if (!this.searchQuery.trim()) {
                alert("Please enter a user name.");
                return;
            }

            try {
                const response = await fetch(`/api/search_professional?query=${encodeURIComponent(this.searchQuery)}`);
                const data = await response.json();
                console.log(data); // Debugging step

                if (data.users) {
                    this.users = data.users;
                } else {
                    this.users = [];
                }
            } catch (error) {
                console.error("Error fetching Users:", error);
            }
        },
    }
};
