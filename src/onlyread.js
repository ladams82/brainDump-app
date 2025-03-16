//function to send file data to createedit.html when Edit button is pressed.
function edit() {
  const dumpData = JSON.parse(localeStorage.getItem("fileContent") || "{}");

  console.log("sending to edit");

  window.location.href = "createedit.html";
}

function init() {
  const dumpTxtDiv = document.getElementById("dumpText");
  const dumpNmDiv = document.getElementById("dumpName");

  //get file data from localStorage
  const dumpData = JSON.parse(localStorage.getItem("fileContent") || "{}");

  if (dumpData.content) {
    dumpNmDiv.textContent = dumpData.fileName;
    dumpTxtDiv.innerHTML = `<pre>${dumpData.content}</pre>`;
  } else {
    dumpTxtDiv.textContent = "<p>No content to display :(</p>";
  }
}
document.addEventListener("DOMContentLoaded", init);
