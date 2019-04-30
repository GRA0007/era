let menu_darkMode = document.getElementById('dark_mode');
let menu_logOut = document.getElementById('log_out');

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
}

function onSignIn() {
	window.location.replace('app.html');
}
