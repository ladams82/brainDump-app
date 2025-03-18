//this file will take submitted form information and create a file for it
//will also allow users to read preexisting dumps

async function init() {
  // Get all form elements
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

  // If any of these critical elements don't exist, log error and return
  if (!form || !dumpName || !dumpText) {
    console.error("Critical form elements not found");
    return;
  }

  console.log("Form elements found:", { form, dumpName, dumpText });

  // Make sure input fields are enabled and editable for new files
  dumpName.removeAttribute("readonly");
  dumpText.removeAttribute("readonly");

  // Check URL parameters for edit mode
  const lookForDump = new URLSearchParams(window.location.search);
  const isEditDump = lookForDump.get("edit");
  console.log("Edit mode:", isEditDump);

  // Add word count listener
  if (dumpText && wordCountSpan) {
    console.log("Adding word count listener");
    dumpText.addEventListener("input", () => {
      const count = window.electronAPI.updateWordCount(dumpText.value);
      wordCountSpan.textContent = count;
      console.log("Word count updated:", count);
    });
  }

  // Add form submission listener
  if (form) {
    console.log("Adding form submission listener");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log("Form submitted!");

      // Hold form data
      const formData = {
        dumpName: dumpName.value,
        dumpText: dumpText.value,
        chooseOldBin: chooseOldBin ? chooseOldBin.value : "default",
        chooseNewBin: chooseNewBin ? chooseNewBin.value : "",
      };

      console.log("Form data:", formData);

      // Send form data to main process via preload function
      const result = await window.electronAPI.saveDumpToFile(formData);

      if (result.success) {
        if (lastModSpan) lastModSpan.textContent = result.lastMod;
        if (savedToSpan) savedToSpan.textContent = result.path;
        currentFilePath = result.path;
        alert("File Saved!");
      } else {
        alert(`Error Saving File: ${result.error}`);
      }
    });
  }

  // Check if user came here from display.html page
  if (isEditDump === "true") {
    console.log("Loading existing file data for editing");

    const dumpData = JSON.parse(localStorage.getItem("fileContent") || "{}");
    console.log("Loaded data from localStorage:", dumpData);

    // Show current file path
    if (lastModSpan) lastModSpan.textContent = dumpData.lastModi || "";
    if (savedToSpan) savedToSpan.textContent = dumpData.folderName || "";
    currentFilePath = dumpData.path;

    // Set the input field values
    if (dumpName && dumpData.fileName) {
      // Remove .txt extension if present
      const fileName = dumpData.fileName.replace(/\.txt$/, "");
      console.log("Setting filename:", fileName);
      dumpName.value = fileName;
    }

    if (dumpText && dumpData.content) {
      console.log(
        "Setting content:",
        dumpData.content.substring(0, 50) + "..."
      );
      dumpText.value = dumpData.content;

      // Update word count manually
      if (wordCountSpan) {
        const count = window.electronAPI.updateWordCount(dumpText.value);
        wordCountSpan.textContent = count;
        console.log("Initial word count:", count);
      }
    }
  } else {
    // This is a new file, make sure form fields are empty and editable
    console.log("Creating a new file - ensuring fields are empty and editable");
    if (dumpName) dumpName.value = "";
    if (dumpText) dumpText.value = "";
    if (wordCountSpan) wordCountSpan.textContent = "0";

    // Clear any existing localStorage data to prevent confusion
    localStorage.removeItem("fileContent");
  }

  // Load available bins
  try {
    if (chooseOldBin) {
      // Clear existing options to avoid duplicates
      while (chooseOldBin.firstChild) {
        chooseOldBin.removeChild(chooseOldBin.firstChild);
      }

      const bins = await window.electronAPI.getBins();
      console.log("Available bins:", bins);

      // Add "other" option
      const otherOption = document.createElement("option");
      otherOption.value = "other";
      otherOption.textContent = "Other";
      chooseOldBin.appendChild(otherOption);

      // Add bin options if there are any
      if (bins && bins.length > 0) {
        bins.forEach((bin) => {
          const binOpt = document.createElement("option");
          binOpt.value = bin;
          binOpt.textContent = bin;
          chooseOldBin.insertBefore(binOpt, chooseOldBin.firstChild);
        });
      }
    }
  } catch (error) {
    console.error("Couldn't display bins:", error);
  }
}

document.addEventListener("DOMContentLoaded", init);
