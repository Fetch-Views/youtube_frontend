async function fetchDashboardStats() {
    try {
        const response = await fetch('https://web-production-5b55f.up.railway.app/api/users/statistics/', {
            method: 'GET',
            credentials: 'include', 
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
}

async function updateDashboard() {
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
