let temp = 0;
let new_cus_index = 0;
// let server_status = "idle";
let IAT = [];
let AT = [];
let FT = [];
let ST = [];
let WT = [];
let DT = [];
let animateQueue = []; // 排隊等動畫秀出來的客人
let speed = 250; // 客人的行走速度
let queuing_count = 0; // 總排隊人數
let queuing_count_temp = 0; // 總排隊人數_temp
let moveX = 0;
let duration = 0;
let i = 0;
let testAni = null;
let outAni = null;
let cus_amount = 0;
// let updateAni = null;
let animeList = [];

class Customer {
	constructor(
		customer_num,
		ArrivalTime,
		ServiceTime,
		WaitingTime,
		DepartureTime,
		FlowTime
	) {
		this.customer_num = customer_num;
		this.ArrivalTime = ArrivalTime;
		this.ServiceTime = ServiceTime;
		this.WaitingTime = WaitingTime;
		this.DepartureTime = DepartureTime;
		this.FlowTime = FlowTime;
	}
	// getter
	get order() {
		return this.customer_num;
	}
	get AT() {
		return this.ArrivalTime;
	}
	get ST() {
		return this.ServiceTime;
	}
	get WT() {
		return this.WaitingTime;
	}
	get DT() {
		return this.DepartureTime;
	}
	get FT() {
		return this.FlowTime;
	}
}

function randomExponential(rate) {
	rate = rate || 1;
	var U = Math.random();
	return (-Math.log(U) / rate) * 60; // 隔這麼多分秒來一個
}

function random_arrival_rate(value) {
	temp = randomExponential(value);

	// IAT不能等於0，才不會有一起進來的客人（會重疊）
	while (Math.round(temp * 100) / 100 == 0) {
		temp = randomExponential(value);
	}

	// push to IAT array
	IAT.push(Math.round(temp * 100) / 100);

	// push to AT array
	if (new_cus_index == 0) {
		AT.push(Math.round(temp * 100) / 100);
	} else {
		AT.push(AT[AT.length - 1] + Math.round(temp * 100) / 100);
	}
}

function random_service_rate(value) {
	temp = randomExponential(value);

	// 第n個人的service time + flow time不能等於第n-1個人的departure time，才不會一起離開（會重疊）
	if (new_cus_index != 0) {
		while (
			DT[new_cus_index - 1] ==
			ST[new_cus_index] + Math.round(temp * 100) / 100
		) {
			temp = randomExponential(value);
		}
		FT.push(Math.round(temp * 100) / 100);
	} else {
		FT.push(Math.round(temp * 100) / 100);
	}
	// console.log(`FT = ${Math.round(temp)}`);

	// 計算departure time
	DT.push(ST[new_cus_index] + FT[new_cus_index]);
}

function uniform_arrival_rate(value) {
	temp = Math.round((60 / value) * 100) / 100;

	// push to IAT array
	IAT.push(temp);
	// console.log(temp);

	// push to AT array
	if (new_cus_index == 0) {
		AT.push(temp);
	} else {
		AT.push(AT[AT.length - 1] + temp);
	}
}

function uniform_service_rate(value) {
	temp = Math.round((60 / value) * 100) / 100;

	// push to FT array
	FT.push(temp);

	// push to DT array
	DT.push(ST[new_cus_index] + FT[new_cus_index]);
}

function createCus(new_cus_index) {
	// 新增一位客人（幫客人建檔）
	cus = new Customer(
		new_cus_index,
		AT[new_cus_index],
		ST[new_cus_index],
		WT[new_cus_index],
		DT[new_cus_index],
		FT[new_cus_index]
	);

	// 將新增的客人加到動畫queue
	// console.log(cus);
	animateQueue.push(cus);
}

// 產生一個新客人
function generate_cus() {
	// 產生interarrival time, arrival time
	if (arrival_cv.val() == 0) {
		uniform_arrival_rate(arrival_rate.val());
	} else {
		random_arrival_rate(arrival_rate.val());
	}

	// 計算wait time
	if (new_cus_index == 0 || DT[new_cus_index - 1] - AT[new_cus_index] < 0) {
		WT.push(0);
	} else {
		WT.push(DT[new_cus_index - 1] - AT[new_cus_index]);
	}

	// 計算service time
	ST.push(AT[new_cus_index] + WT[new_cus_index]);

	// 產生flow time, 計算departure time
	if (service_cv.val() == 0) {
		uniform_service_rate(service_rate.val());
	} else {
		random_service_rate(service_rate.val());
	}

	// 建立客人數據
	createCus(new_cus_index);

	// if (new_cus_index >= 1) {
	// 	console.log(`come after ${IAT[new_cus_index] * 1000}`);
	// } else {
	// 	console.log(`come after ${(IAT[new_cus_index] - 2.5) * 1000}`);
	// }

	new_cus_index += 1;
}

function add_new_customers(target) {
	// 新增客人image
	let img = document.createElementNS("http://www.w3.org/2000/svg", "image");
	// let target = animateQueue.shift();

	img.setAttributeNS(null, "id", `cus-${target.order}`);
	img.setAttributeNS(null, "class", "customer");
	img.setAttributeNS(null, "height", "50");
	img.setAttributeNS(null, "width", "50");
	img.setAttributeNS(
		"http://www.w3.org/1999/xlink",
		"href",
		"img/walking.png"
	);
	img.setAttributeNS(null, "x", "0");
	img.setAttributeNS(null, "y", "60");

	// 要來排隊的人放到queuing群組
	$("#arriving").append(img);

	queuing_count_temp = queuing_count;
	queuing_count += 1;
	update_queue_text();

	in_animation(target);
}

function in_animation(target) {
	// 計算移動距離，最多250px，每20px排一個人
	if (queuing_count <= 1) {
		moveX = 550;
	} else {
		moveX = 550 - 35 * (queuing_count - 1);
	}
	// console.log(moveX);
	// 計算進場時間
	duration = (moveX / (speed * speed_times.val())) * 1000;

	// 進場動畫
	testAni = anime({
		targets: `#cus-${target.order}`,
		translateX: moveX,
		easing: "linear",
		duration: duration,
		autoplay: false,
		// 動畫跑完就執行complete callback，以校正位置
		complete: function (anim) {
			$(`#cus-${target.order}`).appendTo($("#queuing"));
			if ($("#queuing").children().length <= queuing_count_temp) {
				anime({
					targets: `#cus-${target.order}`,
					translateX:
						550 - 35 * ($("#queuing").children().length - 1),
					easing: "linear",
					duration: 0,
				});
			}
		},
	});
	testAni.play();
}

function out_animate() {
	// 正在離開的人移到leaving群組處理
	$(`#cus-${i}`).appendTo($("#leaving"));

	i += 1;
	// console.log(i);
	// 出場動畫
	outAni = anime({
		targets: `#cus-${i - 1}`,
		translateX: "+=50",
		easing: "linear",
		duration: 200 / speed_times.val(),
		complete: function (anim) {
			// 動畫結束直接remove出場的人
			$("#leaving").empty();
			queuing_count -= 1;
			update_queue_text();
			update_queue_animate();
			// console.log(queuing_count);
		},
	});

	add_data();
	add_avg_data();
}

// 更新排隊位置（有人離開就往前排）
function update_queue_animate() {
	anime({
		targets: [document.querySelectorAll("#queuing image")],
		translateX: `+=35`,
		easing: "linear",
		duration: 0,
	});
}

function update_queue_text() {
	// console.log(queuing_count);
	$("#cus-num").text(queuing_count);
}

function add_data() {
	if (i + 1 > 15) {
		labels.push(i + 1);
	}
	dataset.push(WT[i - 1]);
	line_graph.update();
	// console.log(line_graph.data.datasets[0].data);
}

function add_avg_data() {
	if (i > 1) {
		if (avg_dataset[i - 2] * (i - 1) + WT[i - 1] == 0) {
			avg_dataset.push(0);
		} else {
			avg_dataset.push((avg_dataset[i - 2] * (i - 1) + WT[i - 1]) / i);
		}
	} else {
		avg_dataset.push(WT[i - 1]);
	}
	line_graph.update();
	// console.log(line_graph.data.datasets[1].data);
}

// main
// 產生第一個客人的資料
// for (let i = 0; i < cus_num.val(); i++) {
// 	generate_cus();
// }
// console.log(`cus_amount: ${cus_num.val()} done!`);

let startTime = null;
let startTime2 = null;
let pauseTime = null;
let timer1_delay = (IAT[0] * 1000 - 2500) / speed_times.val();
let timer2_delay = (DT[0] * 1000) / speed_times.val();
let isPause = true;
let pTime = 0;
let pTime2 = 0;
let elapsed = 0;
let elapsed2 = 0;
// let reset_flag = 0;

function playNpause() {
	if (isPause) {
		for (let i = 0; i < cus_num.val(); i++) {
			generate_cus();
		}
		timer1_delay = (IAT[0] * 1000 - 2500) / speed_times.val();
		timer2_delay = (DT[0] * 1000) / speed_times.val();
		console.log(`cus_amount: ${cus_num.val()} done!`);
		isPause = false;
		cus_num.prop("disabled", true);
		arrival_rate.prop("disabled", true);
		arrival_cv.prop("disabled", true);
		service_rate.prop("disabled", true);
		service_cv.prop("disabled", true);
		speed_times.prop("disabled", true);

		if (animeList) {
			animeList.forEach((a) => a.play());
			animeList = [];
		}
		// if (reset_flag == 1) {
		// 	console.log(animateQueue.length);
		// 	reset_flag = 0;
		// }
		window.requestAnimationFrame(generate);
	} else {
		isPause = true;
		anime.running.forEach((a) => a.pause());
		anime.running.forEach((a) => animeList.push(a));

		cus_num.prop("disabled", false);
		arrival_rate.prop("disabled", false);
		arrival_cv.prop("disabled", false);
		service_rate.prop("disabled", false);
		service_cv.prop("disabled", false);
		speed_times.prop("disabled", false);
	}
}

function ani_reset() {
	reset_flag = 1;
	// 移除畫面上的客人
	$(".customer").remove();

	// 圖表歸零
	line_graph.reset();
	// dataset = [];
	// avg_dataset = [];
	labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
	line_graph.data.datasets[0].data.length = 0;
	line_graph.data.datasets[1].data.length = 0;
	line_graph.data.labels = labels;
	line_graph.update();

	// 參數歸零
	temp = 0;
	new_cus_index = 0;
	IAT = [];
	AT = [];
	FT = [];
	ST = [];
	WT = [];
	DT = [];
	animateQueue = []; // 排隊等動畫秀出來的客人
	speed = 250; // 客人的行走速度
	queuing_count = 0; // 總排隊人數
	queuing_count_temp = 0; // 總排隊人數_temp
	moveX = 0;
	duration = 0;
	i = 0;
	testAni = null;
	outAni = null;
	animeList = [];

	// 產生第一個客人的資料

	// generate_cus();

	startTime = null;
	startTime2 = null;
	pauseTime = null;
	timer1_delay = (IAT[0] * 1000 - 2500) / speed_times.val();
	timer2_delay = (DT[0] * 1000) / speed_times.val();
	isPause = true;
	pTime = 0;
	pTime2 = 0;
	elapsed = 0;
	elapsed2 = 0;

	cus_num.prop("disabled", false);
	arrival_rate.prop("disabled", false);
	arrival_cv.prop("disabled", false);
	service_rate.prop("disabled", false);
	service_cv.prop("disabled", false);
	speed_times.prop("disabled", false);
}

function generate(timestamp) {
	// 第一次按開始
	if (!startTime || !startTime2) {
		startTime = timestamp;
		startTime2 = timestamp;
	}
	// 如果暫停，就記下暫停當下的timestamp，並跳出動畫迴圈
	if (isPause) {
		pauseTime = timestamp;
		return;
		// 如果開始
	} else if (!isPause) {
		// console.log("run");
		if (pauseTime) {
			// 計算暫停了多久(一個IAT區間可能不只暫停一次，所以pTime要用累加的)
			pTime += timestamp - pauseTime;
			pTime2 += timestamp - pauseTime;
			// console.log(`ptime:${pTime}`);
			pauseTime = null;
		}
		// 把elapsed回復到暫停前的狀態，然後繼續計時
		elapsed = timestamp - startTime - pTime;
		elapsed2 = timestamp - startTime2 - pTime2;

		// console.log(elapsed);
	}
	// 過了一個IAT之後重新計算elapsed
	if (elapsed >= timer1_delay) {
		let target = animateQueue.shift();
		// generate_cus();
		// console.log(target.order);
		add_new_customers(target);
		testAni.tick(timestamp);
		elapsed = 0;
		pTime = 0;

		// 更新delay和startTime
		timer1_delay = (IAT[target.order + 1] * 1000) / speed_times.val();
		startTime = timestamp;
	}
	if (!timer2_delay) {
		timer2_delay = ((DT[i] - DT[i - 1]) * 1000) / speed_times.val();
	}
	if (elapsed2 >= timer2_delay) {
		// console.log(`cus-${i} leave`);
		out_animate();
		// outAni.tick(timestamp);
		elapsed2 = 0;
		pTime2 = 0;
		timer2_delay = ((DT[i] - DT[i - 1]) * 1000) / speed_times.val();
		// console.log(timer2_delay);
		startTime2 = timestamp;
	}
	window.requestAnimationFrame(generate);
}

let timer1 = window.requestAnimationFrame(generate);
