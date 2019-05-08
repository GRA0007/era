function onSuccess(googleUser) {
	console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
	window.location.replace('app.html');
}
function onFailure(error) {
	console.log(error);
}
function gapiLoad() {
	gapi.signin2.render('my-signin2', {
		'scope': 'profile email https://www.googleapis.com/auth/drive.appdata',
		'onsuccess': onSuccess,
		'onfailure': onFailure
	});
}
