const {ipcRenderer, remote} = require('electron');
const {Menu, MenuItem} = remote;

riot.mount('grid-events', {ipcRenderer: ipcRenderer} )

/*
let menuTemplate = [
  {
    label: "Application",
    submenu:[
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { ipcRenderer.send('close-main-window'); }
      }
    ]
  }
];

let menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
*/
