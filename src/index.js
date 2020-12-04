import { app, BrowserWindow, Menu, Tray, globalShortcut,ipcMain,shell } from 'electron';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const powerSaveBlocker = require('electron').powerSaveBlocker;
powerSaveBlocker.start('prevent-app-suspension');
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


//const {app, Menu, Tray} = require('electron')
function trayAnim(tray,iconArr,delay)
{
  var key = 0;
  var interVal = setInterval(function(){
  if(key<iconArr.length){
    tray.setImage(iconArr[key]);
    key++;
  }
  else{
    key=0;
  }
},delay);
return interVal;
}
function toogleWindo(window) {
  if (window.isVisible()){
    window.hide();
  }
  else {
    window.show();
  }
}
//var trayLoading = new trayAnim();
//setTimeout(trayLoading.Loop.bind(trayLoading), 0);
//setTimeout(trayLoading.Stop.bind(trayLoading), 3000);

var loadingAnim = [app.getAppPath()+"\\src\\media\\loading1.png",app.getAppPath()+"\\src\\media\\loading2.png",app.getAppPath()+"\\src\\media\\loading3.png",app.getAppPath()+"\\src\\media\\loading4.png",app.getAppPath()+"\\src\\media\\loading5.png",app.getAppPath()+"\\src\\media\\loading6.png",app.getAppPath()+"\\src\\media\\loading7.png"];
let tray = null
app.on('ready', () => {
  tray = new Tray(app.getAppPath()+'\\src\\media\\icon.png')
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Item1', type: 'radio'},
    {label: 'Item2', type: 'radio'},
    {label: 'Item3', type: 'radio', checked: true},
    {label: 'Exit', type: 'normal',click: () => {app.isQuiting = true;app.quit();}}
  ])
  tray.setContextMenu(contextMenu);

var TrayloadingInterval;
  ipcMain.on('dataUpdate', (event, arg) => {
    tray.setToolTip('UkrTrainWatcher - Last update was at '+arg.time+'.');
    if (arg.updating) {
      clearInterval(TrayloadingInterval);
      TrayloadingInterval = trayAnim(tray,loadingAnim,600);
    }
  });
  ipcMain.on('hasEvents', (event, arg) => {
    if (arg.hasEvents) {
      clearInterval(TrayloadingInterval);
      tray.setImage(app.getAppPath()+'\\src\\media\\icon-attention.png');
      tray.on("balloon-click",function(){
            shell.openExternal(arg.url);
            tray.setImage(app.getAppPath()+'\\src\\media\\icon.png');
      },false);
      tray.displayBalloon({
        icon:app.getAppPath()+'\\src\\media\\icon.png',
        title:"Доступны новые билеты!",
        content:"Было: "+String(arg.prev)+" =>  Стало: "+String(arg.cur)+" @ "+"Нажмите чтобы открыть сайт"
      });
    }
    else {
      clearInterval(TrayloadingInterval);
      tray.setImage(app.getAppPath()+'\\src\\media\\icon.png');
    }
  });
  // Reset tray icon on any action
  tray.on("click",function(){clearInterval(TrayloadingInterval);tray.setImage(app.getAppPath()+'\\src\\media\\icon.png');toogleWindo(mainWindow);},false);
  tray.on("right-click",function(){clearInterval(TrayloadingInterval);tray.setImage(app.getAppPath()+'\\src\\media\\icon.png');},false);
  tray.on("double-click",function(){clearInterval(TrayloadingInterval);tray.setImage(app.getAppPath()+'\\src\\media\\icon.png');toogleWindo(mainWindow);},false);

mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.hide();
});

mainWindow.on('close', function (event) {
    if(!app.isQuiting){
        event.preventDefault();
        mainWindow.hide();
    }
    return false;
});
})
