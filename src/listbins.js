//this script will get the folders and files from the dir and list them
//users should be able to click on each bin to show the files within them
//users should be able to click on the files to be shown in read mode
async function readDump(dumpName, binName ) {
  console.log("this is " + dumpName + " which is in " + binName);

  try{
    const result = await window.electronAPI.getFileContent(binName, dumpName);

    if (result.success){
      localStorage.setItem("fileContent", JSON.stringify(result));
      window.location.href = 'read.html';
    }else {
      alert("error reading file: ", result.error);
    }
  } catch (error){
    console.error("Error in readDump: ", error);
    alert("Failed to load content :(");

  }
}

async function listDump(fileName) {
  const binLi = document.getElementById(fileName);
  console.log("Please List " + fileName);

  try {
    const dumps = await window.electronAPI.getDumps(fileName);
    console.log(dumps);
    dumps.forEach((dump) => {
      const dumpUl = document.createElement("ul");
      const dumpLi = document.createElement("li");
      const dumpButton = document.createElement("button");
      dumpButton.setAttribute(
        "onClick",
        "readDump('" + dump + "', '" + fileName + "')"
      );
      dumpButton.textContent = dump;

      binLi.appendChild(dumpUl);
      dumpUl.appendChild(dumpLi);
      dumpLi.appendChild(dumpButton);
    });
  } catch (error) {
    console.error("Error reading dump list", error);
  }
}

async function init() {
  const binList = document.getElementById("binList");

  try {
    const bins = await window.electronAPI.getBins();
    console.log(bins);
    bins.forEach((bin) => {
      const listItem = document.createElement("li");
      listItem.setAttribute("id", bin);
      const itemButton = document.createElement("button");
      itemButton.setAttribute("onClick", `listDump('${bin}')`);
      itemButton.textContent = bin;
      listItem.appendChild(itemButton);
      binList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error reading bin list", error);
  }
}
document.addEventListener("DOMContentLoaded", init);
window.listDump = listDump;
