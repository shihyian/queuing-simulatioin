const chart = document.getElementById("chart-animation");

let labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
let dataset = [];
let avg_dataset = [];

const data = {
	labels: labels,
	datasets: [
		{
			label: "Individual wait times",
			data: dataset,
			fill: false,
			borderWidth: 2,
			borderColor: "rgb(75, 142, 239)",
			tension: 0,
		},
		{
			label: "Average Wait time",
			data: avg_dataset,
			fill: false,
			borderColor: "rgb(70, 206, 123)",
			tension: 0,
		},
	],
};

const config = {
	type: "line",
	data: data,
	options: {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
                title: {
                    display: true,
                    text: "customer id",
                    font: {
                        size: 14
                    }
                }
            },
            y: {
                beginAtZero: true,

                title: {
                    display: true,
                    text: "minute(s)",
                    font: {
                        size: 14
                    }
                }
            }
		},
		elements: {
			point: {
				pointRadius: 0,
			},
		},
	},
	plugins: {
		title: {
			display: true,
			text: "Wait Time",
		},
	},
};

const line_graph = new Chart(chart, config);

// $("#btn").click(function () {
// 	labels.push(8);
// 	dataset.push(77);
// 	line_graph.update();
// });
