const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  ipcRenderer,
} = require("electron");
const path = require("path");
const fs = require("fs");

//auto reloads electron.js app
try {
  require("electron-reloader")(module);
} catch (_) {}

//create window
const createWindow = () => {
  const win = new BrowserWindow({
    width: 700,
    height: 1100,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("src/index.html");
};

//load window
app.whenReady().then(() => {
  createWindow();
});

//quit app when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

//save form data to a file
ipcMain.handle("save-dump-to-file", async (event, formData) => {
  const { dumpName, dumpText, chooseOldBin, chooseNewBin } = formData;

  //default path in app's data directory
  const userDataPath = app.getPath("userData");
  const bin0Path = path.join(userDataPath, "bin0");
  const dumpsFolder = path.join(
    bin0Path,
    chooseOldBin === "other" ? chooseNewBin : chooseOldBin
  );

  //create folder if it doesn't exist
  if (!fs.existsSync(dumpsFolder)) {
    fs.mkdirSync(dumpsFolder, { recursive: true });
  }

  //safe file name
  const safeFileName =
    dumpName.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".txt";
  const filePath = path.join(dumpsFolder, safeFileName);

  //add some kind of functionality to add them data
  try {
    //write form data to file
    fs.writeFileSync(filePath, dumpText, "utf8");

    //succeed?
    return {
      success: true,
      path: filePath,
      lastMod: new Date().toLocaleString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});
//file dialog
ipcMain.handle("open-file-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });

  if (canceled) {
    return { canceled: true };
  }

  return { canceled: false, filePath: filePaths[0] };
});

//read the items in a selected file and display it in read.html

//to display bin list in viewbins.html
ipcMain.handle("get-user-data-path", async () => {
  const userDataPath = app.getPath("userData");
  const bin0Path = path.join(userDataPath, "bin0");
  try {
    const bins = fs
      .readdirSync(bin0Path, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    console.log("Bins found:", bins);

    return bins;
  } catch (err) {
    console.error("Failed to read bins: ", err);
    return [];
  }
});

//to display dump list from specific bin in viewbins.html
ipcMain.handle("return-dump-path", async (event, binName) => {
  const userDataPath = app.getPath("userData");
  const bin0Path = path.join(userDataPath, "bin0");
  const chosenBinPath = path.join(bin0Path, binName);
  try {
    const dumps = fs
      .readdirSync(chosenBinPath, { withFileTypes: true })
      .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.txt'))
      .map((dirent) => dirent.name);
    console.log(chosenBinPath);

    console.log("Dumps found: ", dumps, " ", chosenBinPath);

    return dumps;
  } catch (err) {
    console.error("Failed to read dumps: ", err);
    return [];
  }
});
