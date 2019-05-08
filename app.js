let menu_darkMode = document.getElementById('dark_mode');
let menu_logOut = document.getElementById('log_out');
let button_newTimer = document.getElementById('new_timer');
let new_dialog = document.getElementById('new_dialog');

let timer_interval;

let timers = null;
let fileName = 'Era_timers.json';

menu_darkMode.onclick = function() {
	if (document.body.classList.contains('dark')) {
		this.innerHTML = 'Dark mode';
		document.body.classList.remove('dark');
	} else {
		this.innerHTML = 'Light mode';
		document.body.classList.add('dark');
	}
	return false;
};

menu_logOut.onclick = function() {
	let auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function() {
		// Redirect back
		window.location.replace('index.html');
	});
	return false;
};

function gapiLoad() {
	gapi.load('auth2', function() {
		gapi.auth2.init().then(function() {
			let auth2 = gapi.auth2.getAuthInstance();
			if (auth2.isSignedIn.get()) {
				let profile = auth2.currentUser.get().getBasicProfile();
				document.getElementById('profile_image').src = profile.getImageUrl();
				document.getElementById('profile_image').title = "Logged in as " + profile.getName();
			} else {
				window.location.replace('index.html');
			}
		});
	});
	gapi.load('client', function() {
		gapi.client.load('drive', 'v2', function() {
			loadData();
		});
	});
}

button_newTimer.onclick = newTimer;

new_dialog.onsubmit = function(e) {
	e.preventDefault();

	let name = document.getElementById('name_input').value;
	let color = document.getElementById('color_input').value;
	let date = document.getElementById('date_input').value;
	let time = document.getElementById('time_input').value;

	let values = {
		name: name,
		color: color,
		date: moment(date + ' ' + time, "YYYY-MM-DD HH:mm")
	};

	if (new_dialog.querySelector('#action').value == "new") {
		timers.push(values);
	} else if (new_dialog.querySelector('#action').value == "edit") {
		timers[new_dialog.dataset.timerId] = values;
	}

	loadTimers();
	document.body.classList.remove('dialog');

	this.reset();

	return false;
};


function loadTimers(save = true) {
	if (save) {
		saveData();
	}

	if (timers.length == 0) {
		// No timers yet
		let empty = document.createElement('div');
		empty.id = 'empty';
		let empty_img = document.createElement('img');
		empty_img.src = 'empty.svg';
		let empty_text = document.createElement('span');
		let empty_link = document.createElement('a');
		empty_link.href = "#";
		empty_link.onclick = function() {
			newTimer();
			return false;
		};
		empty_link.appendChild(document.createTextNode('Create one'));
		empty_text.appendChild(document.createTextNode('You don\'t have any countdowns yet. '));
		empty_text.appendChild(empty_link);
		empty_text.appendChild(document.createTextNode('!'));
		empty.appendChild(empty_img);
		empty.appendChild(empty_text);

		document.querySelector('main').innerHTML = '';
		document.querySelector('main').appendChild(empty);
	} else {
		timers.sort(function(a, b) {
			if (a.date.isBefore(b.date)) {
				return -1;
			}
			if (a.date.isAfter(b.date)) {
				return 1;
			}
			return 0;
		});

		// For now load from array
		let html = [];

		for (let i = 0; i < timers.length; i++) {
			let container = document.createElement('div');
			container.classList.add('timer');
			container.classList.add(timers[i].color);

			let counters = document.createElement('div');
			counters.classList.add('counters');

			let counter_cats = [];
			if (timers[i].date.diff(moment(), 'years') > 0) {
				counter_cats.push('years');
			}
			if (timers[i].date.diff(moment(), 'days') > 0) {
				counter_cats.push('days');
			}
			if (timers[i].date.diff(moment(), 'hours') > 0) {
				counter_cats.push('hours');
			}
			if (timers[i].date.diff(moment(), 'minutes') > 0) {
				counter_cats.push('minutes');
			}
			counter_cats.push('seconds');

			for (let j = 0; j < counter_cats.length; j++) {
				let counter = document.createElement('div');
				let num = document.createElement('span');
				let label = document.createElement('span');
				label.appendChild(document.createTextNode(counter_cats[j]));
				label.classList.add('label');
				num.classList.add('number');
				num.dataset.label = counter_cats[j];
				counter.appendChild(num);
				counter.appendChild(label);
				counters.appendChild(counter);
			}

			let title = document.createElement('span');
			title.appendChild(document.createTextNode(timers[i].name));
			title.classList.add('title');

			let menu = document.createElement('div');
			menu.classList.add('menu');
			let menu_inner = document.createElement('div');
			let menu_edit = document.createElement('a');
			menu_edit.classList.add('edit');
			menu_edit.appendChild(document.createTextNode('Edit'));
			menu_edit.onclick = function() {
				editTimer(i);
			};
			let menu_delete = document.createElement('a');
			menu_delete.classList.add('delete');
			menu_delete.appendChild(document.createTextNode('Delete'));
			menu_delete.onclick = function() {
				if (confirm("Delete " + timers[i].name + "?")) {
					timers.splice(i, 1);
					loadTimers();
					return false;
				}
			};
			menu_inner.appendChild(menu_edit);
			menu_inner.appendChild(menu_delete);
			menu.appendChild(menu_inner);
			menu.onclick = function() {
				this.classList.toggle('open');
			};

			container.appendChild(menu);
			container.appendChild(counters);
			container.appendChild(title);
			container.id = 't_' + i;
			html.push(container);
		}

		document.querySelector('main').innerHTML = '';
		clearTimeout(timer_interval);

		for (let i = 0; i < html.length; i++) {
			document.querySelector('main').appendChild(html[i]);
		}

		startTimers();
	}
}

function startTimers() {
	let interval = 1000;

	doTimerTick();
	timer_interval = setInterval(doTimerTick, interval);
}

function doTimerTick() {
	for (let i = 0; i < timers.length; i++) {
		let timer = document.getElementById('t_' + i);
		if (!timer.classList.contains('finished')) {
			let numbers = timer.querySelectorAll('.number');
			let now = moment();
			let duration = moment.duration(timers[i].date.diff(now));
			let times = {};

			times['years'] = duration.years();
			times['days'] = duration.days();
			times['days'] += moment.duration(duration.months(), 'months').asDays();
			times['hours'] = duration.hours();
			times['minutes'] = duration.minutes();
			times['seconds'] = duration.seconds();

			for (let j = 0; j < numbers.length; j++) {
				numbers[j].innerHTML = times[numbers[j].dataset.label];
			}

			if (duration.asSeconds() <= 0) {
				timer.classList.add('finished');
				new Confetti(timer);
				for (let j = 0; j < numbers.length; j++) {
					numbers[j].innerHTML = 0;
				}
			}
		}
	}
}

function newTimer() {
	new_dialog.querySelector('.title').innerHTML = "New countdown";
	new_dialog.querySelector('#action').value = "new";
	new_dialog.querySelector('#color_input').className = "";
	new_dialog.querySelector('#add_new').innerHTML = "Create";

	document.body.classList.add('dialog');
	document.getElementById('name_input').focus();
	return false;
}

function editTimer(timer_id) {
	new_dialog.dataset.timerId = timer_id;
	new_dialog.querySelector('.title').innerHTML = "Edit countdown";
	new_dialog.querySelector('#action').value = "edit";
	new_dialog.querySelector('#name_input').value = timers[timer_id].name;
	new_dialog.querySelector('#color_input').value = timers[timer_id].color;
	new_dialog.querySelector('#color_input').className = timers[timer_id].color;
	new_dialog.querySelector('#date_input').value = timers[timer_id].date.format("YYYY-MM-DD");
	new_dialog.querySelector('#time_input').value = timers[timer_id].date.format("HH:mm");
	new_dialog.querySelector('#add_new').innerHTML = "Save";

	document.body.classList.add('dialog');
	document.getElementById('name_input').focus();
	return false;
}


function saveData() {
	let file = new Blob([JSON.stringify(timers)], {type: 'application/json'});
	let metadata = {
		name: fileName,
		mimeType: 'application/json',
		parents: ['appDataFolder']
	};

	let accessToken = gapi.auth.getToken().access_token;
	let form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
	form.append('file', file);

	let xhr = new XMLHttpRequest();
	xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.responseType = 'json';
	xhr.onload = function() {
		console.log(xhr.response);
	};
	xhr.send(form);
}

function convertDates(timer) {
	timer.date = moment(timer.date);
	return timer;
}

function loadData() {
	let request = gapi.client.drive.files.list({
		q: '\'appdata\' in parents'
	});
	request.execute(function(res) {
		let exists = res.items.filter(function(f) {
			return f.title.toLowerCase() == fileName.toLowerCase();
		}).length > 0;

		if (exists) {
			// Load timers from drive
			console.log('Load save');

			return gapi.client.drive.files.get({
				fileId: res.items[0].id,
				alt: 'media'
			}).then(function (data) {
				timers = data.result.map(convertDates);
				loadTimers(false);
			});
		} else {
			timers = new Array();
			loadTimers(false);
		}
		/*timers = [
			{
				name: "Sam's Birthday",
				color: "blue",
				date: moment("10-05-2019", "DD-MM-YYYY")
			},
			{
				name: "Graduation",
				color: "yellow",
				date: moment("23-04-2024", "DD-MM-YYYY")
			},
			{
				name: "Christmas",
				color: "green",
				date: moment("25-12-2019", "DD-MM-YYYY")
			},
			{
				name: "Finished timer",
				color: "amber",
				date: moment("05-05-2019", "DD-MM-YYYY")
			},
			{
				name: "Soonish",
				color: "purple",
				date: moment("07-05-2019 16:55", "DD-MM-YYYY HH:mm")
			}
		];*/
	});
}
