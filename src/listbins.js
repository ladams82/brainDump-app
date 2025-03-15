//this script will get the folders and files from the dir and list them
//users should be able to click on each bin to show the files within them
//users should be able to click on the files to be shown in read mode

async function init() {
  const binList = document.getElementById("binList");

  try {
    const bins = await window.electronAPI.getBins();
    console.log(bins);
    bins.forEach((bin) => {
      const listItem = document.createElement("li");
      listItem.textContent = bin;
      binList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error reading bin list", error);
  }
}
document.addEventListener("DOMContentLoaded", init);
