//this script will get the folders and files from the dir and list them
//users should be able to click on each bin to show the files within them
//users should be able to click on the files to be shown in read mode
async function readDump(dumpName, binName) {
  console.log("this is " + dumpName + " which is in " + binName);

  try {
    const result = await window.electronAPI.getFileContent(binName, dumpName);

    if (result.success) {
      localStorage.setItem("fileContent", JSON.stringify(result));
      window.location.href = "display.html";
    } else {
      alert("error reading file: ", result.error);
    }
  } catch (error) {
    console.error("Error in readDump: ", error);
    alert("Failed to load content : ", error);
  }
}

async function listDump(fileName) {
  const binLi = document.getElementById(fileName);
  console.log("Toggling list for " + fileName);

  // Check if this bin already has content visible
  const existingDumpUl = binLi.querySelector("ul");

  // If content exists and is visible, just hide it (toggle)
  if (existingDumpUl) {
    existingDumpUl.style.display =
      existingDumpUl.style.display === "none" ? "block" : "none";

    // Change the button text/indicator to show collapsed/expanded state
    const binButton = binLi.querySelector("button");
    if (binButton) {
      if (existingDumpUl.style.display === "none") {
        binButton.innerHTML = `${fileName} &#9654;`; // Right-pointing triangle (collapsed)
      } else {
        binButton.innerHTML = `${fileName} &#9660;`; // Down-pointing triangle (expanded)
      }
    }

    return; // Exit function early since we're just toggling visibility
  }

  // If we get here, the content doesn't exist yet, so we need to fetch and create it
  try {
    const dumps = await window.electronAPI.getDumps(fileName);
    console.log(dumps);

    // Create the container for the dump list
    const dumpUl = document.createElement("ul");
    dumpUl.className = "dump-list";

    // Change the button to show expanded state
    const binButton = binLi.querySelector("button");
    if (binButton) {
      binButton.innerHTML = `${fileName} &#9660;`; // Down-pointing triangle
    }

    // If no dumps found, show a message
    if (!dumps || dumps.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.textContent = "No dumps found in this bin";
      dumpUl.appendChild(emptyLi);
    } else {
      // Add each dump to the list
      dumps.forEach((dump) => {
        const dumpLi = document.createElement("li");
        const dumpButton = document.createElement("button");
        dumpButton.className = "dump-button";
        dumpButton.setAttribute(
          "onClick",
          "readDump('" + dump + "', '" + fileName + "')"
        );
        dumpButton.textContent = dump;

        dumpLi.appendChild(dumpButton);
        dumpUl.appendChild(dumpLi);
      });
    }

    // Add the dump list to the bin list item
    binLi.appendChild(dumpUl);
  } catch (error) {
    console.error("Error reading dump list", error);

    // Show error message
    const errorUl = document.createElement("ul");
    const errorLi = document.createElement("li");
    errorLi.textContent = "Error loading dumps: " + error.message;
    errorUl.appendChild(errorLi);
    binLi.appendChild(errorUl);
  }
}

async function addNewBin() {
  const newBinForm = document.getElementById("newBinForm");
  const newBinButton = document.getElementById("newBinButton");
  const createButton = document.getElementById("submit");
  const newBinName = document.getElementById("newBinName");

  if (newBinForm.style.display === "none") {
    newBinForm.style.display = "initial";
  } else {
    newBinForm.style.display = "none";
  }
}

async function init() {
  const binList = document.getElementById("binList");
  newBinForm.style.display = "none";

  try {
    const bins = await window.electronAPI.getBins();
    console.log(bins);

    if (!bins || bins.length === 0) {
      // Handle the case where no bins are found
      const noBinsItem = document.createElement("li");
      noBinsItem.textContent =
        "No bins found. Create a new dump to get started!";
      binList.appendChild(noBinsItem);
      return;
    }

    bins.forEach((bin) => {
      const listItem = document.createElement("li");
      listItem.setAttribute("id", bin);
      listItem.className = "bin-item";

      const itemButton = document.createElement("button");
      itemButton.className = "bin-button";
      itemButton.setAttribute("onClick", `listDump('${bin}')`);
      itemButton.innerHTML = `${bin} &#9654;`; // Right-pointing triangle (collapsed)

      listItem.appendChild(itemButton);
      binList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error reading bin list", error);

    // Show error message
    const errorItem = document.createElement("li");
    errorItem.textContent = "Error loading bins: " + error.message;
    binList.appendChild(errorItem);
  }
}
document.addEventListener("DOMContentLoaded", init);
window.listDump = listDump;
