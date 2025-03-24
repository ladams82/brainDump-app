//function to send file data to createedit.html when Edit button is pressed.
function edit() {
  //const dumpData = JSON.parse(localeStorage.getItem("fileContent") || "{}");

  console.log("sending to edit");

  window.location.href = "createedit.html?edit=true";
}

async function renameDump() {
  const dumpData = JSON.parse(localStorage.getItem("fileContent") || "{}");
  const miniForm = document.getElementById("renameDump");
  const newName = document.getElementById("newDumpName");

  const dumpNmDiv = document.getElementById("dumpName");
  const renameInput = document.getElementById("newDumpName");

  const oldName = dumpData.fileName;
  const oldNamePath = dumpData.path;
  const currentBin = dumpData.folderName;

  if (miniForm) {
    miniForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log("Form submitted!");

      //put new name into a var
      newDumpName = newName.value;
      console.log(oldName + " renamed to " + newDumpName);

      const rename = await window.electronAPI.renameFile(
        oldNamePath,
        currentBin,
        newDumpName
      );

      if (rename.success) {
        console.log("Success!");

        // Update page
        dumpNmDiv.textContent = rename.newFileName;

        // Update localStorage
        dumpData.fileName = rename.newFileName;
        dumpData.path = rename.newFilePath;
        dumpData.lastMod = rename.lastModif;

        localStorage.setItem("fileContent", JSON.stringify(dumpData));

        //Clear the input
        renameInput.value = "";
      } else {
        alert(`Error renaming dump: ${rename.error}`);
      }
    });
  }
}

function init() {
  const dumpTxtDiv = document.getElementById("dumpText");
  const dumpNmDiv = document.getElementById("dumpName");
  const wordCount = document.getElementById("wordCount");
  const lastMod = document.getElementById("lastMod");
  const savedTo = document.getElementById("savedTo");

  //get file data from localStorage
  const dumpData = JSON.parse(localStorage.getItem("fileContent") || "{}");

  if (dumpData.content) {
    dumpNmDiv.textContent = dumpData.fileName;
    dumpTxtDiv.innerHTML = `<pre>${dumpData.content}</pre>`;
  } else {
    dumpTxtDiv.textContent = "<p>No content to display :(</p>";
  }

  //display stats
  const count = window.electronAPI.updateWordCount(dumpData.content);

  lastMod.textContent = dumpData.lastMod;
  savedTo.textContent = dumpData.folderName;
  wordCount.textContent = count;

  renameDump();
}
document.addEventListener("DOMContentLoaded", init);
