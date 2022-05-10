// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const sslCertificate = require('get-ssl-certificate');
const util = require('util')
const exec = util.promisify(require('child_process').exec);

let mainWindow;
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 900,
    minWidth: 500,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: !app.isPackaged
    },
    icon: __dirname + '/src/assets/icons/wasabi.png'
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./src/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


let currentRegions = [];

function buildRegionsLoadedEventHandler() {
  ipcMain.on("onRegionsLoaded", (event, args) => {
    currentRegions = args;
  })
}

function buildGetRegionCertificateEventHandler() {
  ipcMain.on("getRegionCert", (event, args) => {
    let regionCode = args;

    selectedRegion = currentRegions.find(region => region.Region == regionCode)

    // lunching ping call
    pingRegion(selectedRegion.Endpoint).then(result => {
      //console.log(result);
      if (result) {
        mainWindow.webContents.send("pingMeasured", {
          region: regionCode,
          resolved: true,
          ping: result
        });
      } else {
        mainWindow.webContents.send("pingMeasured", {
          region: regionCode,
          resolved: false,
          ping: result
        });
      }

    })

    // getting certificate
    sslCertificate.get(selectedRegion.Endpoint).then(function (certificate) {
      mainWindow.webContents.send("getRegionCert", {
        region: regionCode,
        cert: certificate
      });
    });
  })
}

async function pingRegion(url) {

  // let result = await pingDefault(url);
  return exec(`ping ${url}`).then(result =>
    result)
    .catch(err => {
      console.log(err)
      return false;
    })

  // let result = await exec(`ping ${url}`);
  // return result;
}

async function buildEventsHandlers() {
  buildRegionsLoadedEventHandler();
  buildGetRegionCertificateEventHandler();
}

buildEventsHandlers();

//Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit()
        }
      }
    ]
  }
];

// if mac, add empty object to menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({
    label: 'Wasabi - Connectivity Test'
  });
}



