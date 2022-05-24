// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const sslCertificate = require('get-ssl-certificate');
const util = require('util')
const exec = util.promisify(require('child_process').exec);
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let settingsWindows;
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

// Handle settings window:
function createSettingsWindow() {
  settingsWindows = new BrowserWindow({
    width: 500,
    height: 205,
    // minHeight: 205,
    // maxHeight: 205,
    // minWidth: 500,
    // maxWidth: 500,
    // resizable: false,
    title: 'Settings',
    parent: mainWindow,
    modal: true
  });

  settingsWindows.loadFile('./src/settings.html')

  settingsWindows.on('close', function () {
    settingsWindows = null;
  })

  settingsWindows.webContents.openDevTools();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


let currentRegions = [];

function buildRegionsLoadedEventHandler() {
  ipcMain.on("onRegionsLoaded", (event, args) => {
    currentRegions = args;
  })
}

function saveRefreshTime(refreshTime) {
  store.set('refresh-time', refreshTime);
}

function buildSettingsChangedEventHandler() {
  ipcMain.on("settingsChanged", (event, args) => {
    settingsValue = args;
    saveRefreshTime(settingsValue);
    notifyRefreshTimeChange(settingsValue);
  });

  ipcMain.on("renderer-ready", loadDefaultConfig);
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
          ping: result,
          platform: process.platform
        });
      } else {
        mainWindow.webContents.send("pingMeasured", {
          region: regionCode,
          resolved: false,
          ping: result,
          platform: process.platform
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
  let command = process.platform == 'darwin' || process.platform == 'linux' ? `ping ${url} -c 5` : `ping ${url}`;

  return exec(command).then(result => {
    return result
  })
    .catch(err => {
      return false;
    })
}

async function buildEventsHandlers() {
  buildRegionsLoadedEventHandler();
  buildGetRegionCertificateEventHandler();
  buildSettingsChangedEventHandler();
}

buildEventsHandlers();

//Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Settings',
        click() {
          createSettingsWindow()
        }
      },
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

function loadDefaultConfig() {
  let refreshTime = store.get('refresh-time');

  if (!refreshTime) {
    refreshTime = 60;
    saveRefreshTime(refreshTime)
  }

  notifyRefreshTimeChange(refreshTime);
}

function notifyRefreshTimeChange(time) {
  mainWindow.webContents.send("settingsChanged", time);
}





