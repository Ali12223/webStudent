// js/charts.js

window.dashboardCharts = {
    createBarChart,
    createPieChart,
    createDoughnutChart,
    // Add other chart types if needed
    updateChart,
    destroyChart,
};

const activeCharts = {}; // To keep track of active chart instances for updating/destroying

function createChart(canvasId, type, data, options, chartTitle = '') {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.error(`Canvas with id "${canvasId}" not found.`);
        return null;
    }

    // Destroy existing chart on this canvas if any
    destroyChart(canvasId);

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        family: "'Tajawal', sans-serif",
                    }
                }
            },
            title: {
                display: !!chartTitle,
                text: chartTitle,
                font: {
                    size: 16,
                    family: "'Tajawal', sans-serif",
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                titleFont: { family: "'Tajawal', sans-serif" },
                bodyFont: { family: "'Tajawal', sans-serif" },
                footerFont: { family: "'Tajawal', sans-serif" },
                rtl: true,
                textDirection: 'rtl',
            }
        },
        scales: { // Default scales, can be overridden
            y: {
                beginAtZero: true,
                ticks: {
                    font: { family: "'Tajawal', sans-serif" }
                },
                grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }
            },
            x: {
                ticks: {
                    font: { family: "'Tajawal', sans-serif" }
                },
                grid: {
                    display: false, // Often cleaner for bar charts
                }
            }
        }
    };

    const chartOptions = deepMerge(defaultOptions, options);
    
    const chart = new Chart(ctx, { type, data, options: chartOptions });
    activeCharts[canvasId] = chart;
    return chart;
}

function createBarChart(canvasId, labels, datasets, chartTitle = '', options = {}) {
    const data = {
        labels: labels,
        datasets: datasets.map(dataset => ({
            backgroundColor: dataset.backgroundColor || 'rgba(54, 162, 235, 0.5)', // Default blue
            borderColor: dataset.borderColor || 'rgba(54, 162, 235, 1)',
            borderWidth: dataset.borderWidth || 1,
            ...dataset, // Spread other dataset properties like data, label
        }))
    };
    const defaultBarOptions = { // Specific defaults for bar charts
        scales: {
            x: { grid: { display: false } }
        }
    };
    return createChart(canvasId, 'bar', data, deepMerge(defaultBarOptions, options), chartTitle);
}

function createPieChart(canvasId, labels, datasetData, chartTitle = '', options = {}) {
    const defaultColors = [
        'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)', 'rgba(40, 159, 64, 0.7)'
    ];
    const data = {
        labels: labels,
        datasets: [{
            data: datasetData,
            backgroundColor: options.colors || defaultColors.slice(0, labels.length),
            hoverOffset: 4
        }]
    };
     const defaultPieOptions = { // Specific defaults for pie charts
        scales: { // Pie/Doughnut charts don't use cartesian axes by default
            x: { display: false },
            y: { display: false }
        }
    };
    return createChart(canvasId, 'pie', data, deepMerge(defaultPieOptions,options), chartTitle);
}
function createDoughnutChart(canvasId, labels, datasetData, chartTitle = '', options = {}) {
     const defaultColors = [
        'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'
    ];
    const data = {
        labels: labels,
        datasets: [{
            data: datasetData,
            backgroundColor: options.colors || defaultColors.slice(0, labels.length),
            hoverOffset: 4
        }]
    };
    const defaultDoughnutOptions = {
        scales: { x: { display: false }, y: { display: false } },
        cutout: options.cutout || '50%', // Default cutout for doughnut
    };
    return createChart(canvasId, 'doughnut', data, deepMerge(defaultDoughnutOptions, options), chartTitle);
}


function updateChart(canvasId, newData) {
    const chart = activeCharts[canvasId];
    if (chart) {
        chart.data = newData;
        chart.update();
    } else {
        console.warn(`Chart with id "${canvasId}" not found for update.`);
    }
}

function destroyChart(canvasId) {
    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
        delete activeCharts[canvasId];
    }
}

// Helper for deep merging options
function deepMerge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}