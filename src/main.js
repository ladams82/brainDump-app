const { app, BrowserWindow } = require("electron");

//create window
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 1100,
  });

  win.loadFile("index.html");
};

//load window
app.whenReady().then(() => {
  createWindow();
});

//quit app when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
