export default {
    data() {
        return {
            serviceRequestId: null, // This will be set when navigating to the review page
            rating: null, // Rating value (1-5)
            reviewDescription: '', // Review text
            message: '' // Message to display to the user
        };
    },
    methods: {
        async submitReview() {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                this.message = "Unauthorized! Please log in.";
                return;
            }

            try {
                const response = await fetch('/api/customer/rate_service', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify({
                        service_request_id: this.serviceRequestId,
                        rating: this.rating,
                        review: this.reviewDescription
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    this.message = "Service rated successfully!";
                    this.resetForm();
                } else {
                    this.message = data.message || "Failed to submit review.";
                }
            } catch (error) {
                console.error("Error submitting review:", error);
                this.message = "Error submitting review.";
            }
        },
        resetForm() {
            this.rating = null;
            this.reviewDescription = '';
        }
    },
    mounted() {
        // Assuming the service request ID is passed as a route parameter
        this.serviceRequestId = this.$route.params.id; // Adjust based on your routing setup
    },
    template: `
        <div class="container mt-4">
            <h2>Rate Service</h2>
            <div v-if="message" class="alert alert-warning text-center mt-3">
                {{ message }}
            </div>
            <form @submit.prevent="submitReview">
                <div class="form-group">
                    <label for="rating">Rating (1-5)</label>
                    <select v-model="rating" class="form-control" id="rating" required>
                        <option value="" disabled>Select a rating</option>
                        <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="review">Review</label>
                    <textarea v-model="reviewDescription" class="form-control" id="review" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Review</button>
                <router-link to="/admin" class="btn btn-secondary ml-2">Cancel</router-link>
            </form>
        </div>
    `
};