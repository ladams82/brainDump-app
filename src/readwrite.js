//this file will take submitted form information and create a file for it
//will also allow users to read preexisting dumps

function init() {
  const form = document.getElementById("dumpForm");
  const dumpName = document.getElementById("dumpName");
  const dumpText = document.getElementById("dumpText");
  const chooseOldBin = document.getElementById("bins");
  const chooseNewBin = document.getElementById("newBin");

  const wordCountSpan = document.getElementById("wordCount");
  const lastModSpan = document.getElementById("lastMod");
  const savedToSpan = document.getElementById("savedTo");

  // Current file path for editing existing files
  let currentFilePath = null;

  // Update word count when typing
  dumpText.addEventListener("input", () => {
    const count = window.electronAPI.updateWordCount(dumpText.value);
    wordCountSpan.textContent = count;
  });

  //form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("sent!");
    //hold form data
    const formData = {
      dumpName: dumpName.value,
      dumpText: dumpText.value,
      chooseOldBin: chooseOldBin.value,
      chooseNewBin: chooseNewBin.value,
    };
    console.log(formData);
    //send form data to main process via preload function
    const result = await window.electronAPI.saveDumpToFile(formData);

    if (result.success) {
      lastModSpan.textContent = result.lastMod;
      savedToSpan.textContent = result.path;
      currentFilePath = result.path;
      alert("File Saved!");
    } else {
      alert(`Error Saving File: ${result.error}`);
    }
  });

  

}
document.addEventListener("DOMContentLoaded", init);
