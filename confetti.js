var maxParticleCount = 30; //set max confetti count
var particleSpeed = 1; //set the particle animation speed
var confettiFrameInterval = 20; //the confetti animation frame interval
var supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
var colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"]

function Confetti(element) {
	this.streamingConfetti = false;
	this.animationTimer = null;
	this.lastFrameTime = Date.now();
	this.particles = [];
	this.waveAngle = 0;
	this.context = null;
	this.element = element;

	window.requestAnimationFrame = (function() {
		return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
			return window.setTimeout(callback, confettiFrameInterval);
		};
	})();

	var canvas = document.createElement("canvas");
	canvas.setAttribute("class", "confetti");
	element.appendChild(canvas);
	canvas.width = element.clientWidth;
	canvas.height = element.clientHeight;
	window.addEventListener("resize", function() {
		canvas.width = element.clientWidth;
		canvas.height = element.clientHeight;
	}, true);
	this.context = canvas.getContext("2d");

	while (this.particles.length < maxParticleCount)
	this.particles.push(resetParticle({}, this.element.clientWidth, this.element.clientHeight));
	this.streamingConfetti = true;
	this.runAnimation(this.particles);
}

function resetParticle(particle, width, height) {
	particle.color = colors[(Math.random() * colors.length) | 0];
	particle.x = Math.random() * width;
	particle.y = Math.random() * height - height;
	particle.diameter = Math.random() * 10 + 5;
	particle.tilt = Math.random() * 10 - 10;
	particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
	particle.tiltAngle = 0;
	return particle;
}

Confetti.prototype.runAnimation = function(particles) {
	if (particles.length === 0) {
		this.context.clearRect(0, 0, this.element.clientWidth, this.element.clientHeight);
		this.animationTimer = null;
	} else {
		var now = Date.now();
		var delta = now - this.lastFrameTime;
		if (!supportsAnimationFrame || delta > confettiFrameInterval) {
			this.context.clearRect(0, 0, this.element.clientWidth, this.element.clientHeight);
			this.updateParticles();
			this.drawParticles();
			this.lastFrameTime = now - (delta % confettiFrameInterval);
		}
		var that = this;
		this.animationTimer = requestAnimationFrame(function() {
			that.runAnimation(particles);
		});
	}
}

Confetti.prototype.stopConfetti = function() {
	this.streamingConfetti = false;
}

Confetti.prototype.removeConfetti = function() {
	this.stopConfetti();
	this.particles = [];
}

Confetti.prototype.drawParticles = function() {
	var particle;
	var x;
	for (var i = 0; i < this.particles.length; i++) {
		particle = this.particles[i];
		this.context.beginPath();
		this.context.lineWidth = particle.diameter;
		this.context.strokeStyle = particle.color;
		x = particle.x + particle.tilt;
		this.context.moveTo(x + particle.diameter / 2, particle.y);
		this.context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2);
		this.context.stroke();
	}
}

Confetti.prototype.updateParticles = function() {
	var width = this.element.clientWidth;
	var height = this.element.clientHeight;
	var particle;
	this.waveAngle += 0.01;
	for (var i = 0; i < this.particles.length; i++) {
		particle = this.particles[i];
		if (!this.streamingConfetti && particle.y < -15)
		particle.y = height + 100;
		else {
			particle.tiltAngle += particle.tiltAngleIncrement;
			particle.x += Math.sin(this.waveAngle);
			particle.y += (Math.cos(this.waveAngle) + particle.diameter + particleSpeed) * 0.5;
			particle.tilt = Math.sin(particle.tiltAngle) * 15;
		}
		if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
			if (this.streamingConfetti && this.particles.length <= maxParticleCount)
			resetParticle(particle, width, height);
			else {
				this.particles.splice(i, 1);
				i--;
			}
		}
	}
}
