// bar
let arrival_rate = $("#arrival-rate-bar");
let arrival_cv = $("#arrival-cv-bar");
let service_rate = $("#service-rate-bar");
let service_cv = $("#service-cv-bar");
let speed_times = $("#speed-bar");
let cus_num = $("#cus-amount");

// bar_text
let arrival_rate_text = $("#arrival-rate");
let arrival_cv_text = $("#arrival-cv");
let service_rate_text = $("#service-rate");
let service_cv_text = $("#service-cv");
let speed_times_text = $("#speed-times");

// button
let playBtn = $("#play");
let reset = $("#reset");

// event listener
// cus_num.on("input", () => {
// 	cus_amount = cus_num.val();
// });

function updateOverlay() {
    let speedValue = speed_times.val();
    let overlay = $("#high-speed-overlay");
    let speedText = $("#high-speed-text");

    if (speedValue > 20) {
        overlay.css("display", "block");  // 顯示遮罩
        speedText.css("display", "block"); // 顯示文字
    } else {
        overlay.css("display", "none");   // 隱藏遮罩
        speedText.css("display", "none"); // 隱藏文字
    }
}

arrival_rate.on("input", () => {
	arrival_rate_text.text(arrival_rate.val());
	// console.log(
	// 	`arrival, service, speed = ${arrival_rate.val()}, ${service_rate.val()}, ${speed_times.val()}`
	// );
});

arrival_cv.on("input", () => {
	arrival_cv_text.text(arrival_cv.val());
	// console.log(
	// 	`arrival, service, speed = ${arrival_rate.val()}, ${service_rate.val()}, ${speed_times.val()}`
	// );
});

service_rate.on("input", () => {
	service_rate_text.text(service_rate.val());
	// console.log(
	// 	`arrival, service, speed = ${arrival_rate.val()}, ${service_rate.val()}, ${speed_times.val()}`
	// );
});

service_cv.on("input", () => {
	service_cv_text.text(service_cv.val());
	// console.log(
	// 	`arrival, service, speed = ${arrival_rate.val()}, ${service_rate.val()}, ${speed_times.val()}`
	// );
});

speed_times.on("input", () => {
	speed_times_text.text(speed_times.val());
	// 是否顯示停用動畫遮罩
	updateOverlay()
	// console.log(
	// 	`arrival, service, speed = ${arrival_rate.val()}, ${service_rate.val()}, ${speed_times.val()}`
	// );
	timer1_delay = timer1_delay / speed_times.val();
	timer2_delay = timer2_delay / speed_times.val();
});

playBtn.on("click", () => {
	playNpause();
	isPause ? playBtn.attr("value", "play") : playBtn.attr("value", "pause");
});

reset.on("click", () => {
	ani_reset();
	isPause ? playBtn.attr("value", "play") : playBtn.attr("value", "pause");
	console.log("reset");
});
