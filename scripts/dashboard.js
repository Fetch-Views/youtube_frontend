const BACKEND_URL = window.location.hostname === "127.0.0.1" 
        ? "http://127.0.0.1:8000" 
        : "https://web-production-5b55f.up.railway.app";

async function fetchDashboardStats() {
    try {
        const response = await fetchWithAuth(`${BACKEND_URL}/api/users/statistics/`);

        if (!response) {  
            throw new Error('Failed to fetch dashboard stats');
        }

        return response;  
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
}


async function updateDashboard() {
    const stats = await fetchDashboardStats();
    
    if (stats) {
        // Total Subscribers
        document.querySelector('#totalSubscribers').textContent = stats.total_subscribers;

        // Average Percentage Watched
        document.querySelector('#averagePercentageWatched').textContent = `${stats.total_averageViewPercentage.toFixed(2)}%`;

        // Average Watch Time (Seconds)
        document.querySelector('#averageWatchTime').textContent = `${stats.total_averageViewDuration} seconds`;

        // Average Likes
        document.querySelector('#averageLikes').textContent = stats.average_likes;

        // Update Subscribers Growth Chart
        updateChart('subscribersChart', stats.subscribers_growth_last_7_days);

        // Update Views Growth Chart
        updateChart('viewsChart', stats.views_growth_last_7_days);

        // Update Subscribers/Videos Ratio
        document.querySelector('#subscribers_to_video_ratio').textContent = stats.subscribers_to_video_ratio;

        //Update Engagement Rate
        document.querySelector('#engagement_rate').textContent = `${stats.engagement_rate.toFixed(2)}%`;
    } else {
        console.error('Failed to update dashboard stats.');
    }
}

function updateChart(chartId, data) {
    const chart = Chart.getChart(chartId); 
    if (chart) {
        chart.data.labels = Object.keys(data); 
        chart.data.datasets[0].data = Object.values(data); 
        chart.update();
    }
}

document.addEventListener('DOMContentLoaded', updateDashboard);
