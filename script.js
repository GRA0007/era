let menu_darkMode = document.getElementById('dark_mode');

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
