let menu_darkMode = document.getElementById('dark_mode');
let menu_logOut = document.getElementById('log_out');
let button_newTimer = document.getElementById('new_timer');
let new_dialog = document.getElementById('new_dialog');

let timer_interval;

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
				//window.location.replace('index.html');
			}
		});
	});
}

var timers = [
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
];
loadTimers();

button_newTimer.onclick = function() {
	document.body.classList.add('dialog');
	document.getElementById('name_input').focus();
	return false;
};

new_dialog.onsubmit = function(e) {
	e.preventDefault();

	let name = document.getElementById('name_input').value;
	let color = document.getElementById('color_input').value;
	let date = document.getElementById('date_input').value;
	let time = document.getElementById('time_input').value;

	timers.push({
		name: name,
		color: color,
		date: moment(date + ' ' + time, "YYYY-MM-DD HH:mm")
	});

	loadTimers();
	document.body.classList.remove('dialog');

	this.reset();

	return false;
};


function loadTimers() {
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
