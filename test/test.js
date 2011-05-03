var holder = document.getElementById('holder'),
state = document.getElementById('status');

if (typeof window.FileReader === 'undefined') {
	state.className = 'fail';
} else {
	state.className = 'success';
	state.innerHTML = 'File API & FileReader available';
}
function uploadFile(file) {
	var fd = new FormData();
	console.log(file);
	fd.append("fileToUpload", file);
	var xhr = new XMLHttpRequest();
	xhr.upload.addEventListener("progress", uploadProgress, false);
	xhr.addEventListener("load", uploadComplete, false);
	xhr.addEventListener("error", uploadFailed, false);
	xhr.addEventListener("abort", uploadCanceled, false);
	xhr.open("POST", file.fileName);
	xhr.send(fd);
}

function uploadProgress(evt) {
	var percentComplete = Math.round(evt.loaded * 100 / evt.total);
	console.log(percentComplete.toString() + '%')
}

function uploadComplete(evt) {
	/* This event is raised when the server send back a response */
	alert(evt.target.responseText);
}

function uploadFailed(evt) {
	alert("There was an error attempting to upload the file.");
}

function uploadCanceled(evt) {
	alert("The upload has been canceled by the user or the browser dropped the connection.");
}

holder.ondragover = function () {
	this.className = 'hover';
	return false;
};
holder.ondragend = function () {
	this.className = '';
	return false;
};
holder.ondrop = function (e) {
	this.className = '';
	e.preventDefault();

	var file = e.dataTransfer.files[0];
	uploadFile(file)

	return false;
};