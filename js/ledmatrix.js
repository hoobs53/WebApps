const getdata_url = "http://localhost/server mock/leddata.json";
const setdata_url = "http://localhost/server mock/setdata.json";

var currentLedState = new Array(64);
var displayLedState = new Array(64);

function checkIfChanged(){
	for(let i = 0; i < displayLedState.length; i++){
		let test = currentLedState[i][0];
		let test2 = displayLedState[i][0];
		if( currentLedState[i][0] != displayLedState[i][0] || currentLedState[i][1]!= displayLedState[i][1] || currentLedState[i][2]!= displayLedState[i][2]){
			return true;
		}
	}
	return false;
}

function updateStatus(){
	if(checkIfChanged()){
		$("#status").text("UNSAVED CHANGES*");
	}
	else {
		$("#status").text("");
	}
}

function changeColor() {
	let r = $("#seekbarR").val();
	let g = $("#seekbarG").val();
	let b = $("#seekbarB").val();
	let color = "rgb(" + r + ", " + g + ", " + b + ")";
	$(this).css("background-color", color);
	let id = $(this).attr('id').split('_')[1]
	displayLedState[id][0] = r;
	displayLedState[id][1] = g;
	displayLedState[id][2] = b;
	updateStatus();
}

function clearAll() {
	for (var i=0; i < 64; i++) {
		$("#led_"+i).css("background-color", "#000000");
		currentLedState[i] = [0, 0 ,0];
		displayLedState[i] = [0, 0 ,0];
	}
	$("#status").text("");
}

function initDisplay(responseJSON){
	let r, g, b, color;
	let row, col;
	for(let i=0; i<responseJSON.length; i++){
		currentLedState[i] = [...responseJSON[i]];
		displayLedState[i] = [...responseJSON[i]];
		r = responseJSON[i][0];
		g = responseJSON[i][1];
		b = responseJSON[i][2];
		color = "rgb(" + r + ", " + g + ", " + b + ")";
		let btn = $("<input>", {
			id: "led_"+i, 
			type: "button",
			"class":"btn btn-default form-control"
		});
		btn.css("background-color", color);
		btn.css("border", "1px solid #000000");
		btn.click(changeColor);
		if(i % 8 == 0){
			row = $("<div>",{"class":"row pad_top"});
		}
		let col = $("<div>",{"class":"col", "id":"led_div_"+i});					
		let input_group = $("<div>",{"class":"input-group"});
		input_group.append(btn);
		col.append(input_group);
		row.append(col);
		$("#led_matrix").append(row);
	}
}

function sendData() {
	let x, y, id;
	let r, g, b;
	let data = new Array(5);
	let obj = {};
	for(let i=0; i< displayLedState.length; i++){
	x = i % 8;
	y = Math.floor(i/8);
	id = "LED" + x + y;

	r = displayLedState[i][0];
	g = displayLedState[i][1];
	b = displayLedState[i][2];
	
	data[0] = x;
	data[1] = y;
	data[2] = r;
	data[3] = g;
	data[4] = b;
	
	obj[id] = data;
	}
	return obj;
}

function setLeds() {
	$.ajax({
	type: 'POST', 
	url: setdata_url,
	dataType: 'json',
	data: sendData()
	});
}

function init() {
	$.ajax(getdata_url, {
	type: 'GET', dataType: 'json',
	success: function(responseJSON, status, xhr) {
		initDisplay(responseJSON);
	}
	});
};

$(document).ready(() => { 
	init();
	$("#send").click(setLeds);
	$("#clear").click(clearAll);
});