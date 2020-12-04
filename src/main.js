var prevCount = 0;
const Nightmare = require('nightmare')
var {ipcRenderer, remote} = require('electron');
//var parseURL = 'https://booking.uz.gov.ua/?from=2218400&to=2210800&date=2018-05-27&time=00%3A00&url=train-list';

function currentTime() {
  var currentdate = new Date();
  var datetime = currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/"
                  + currentdate.getFullYear() + " @ "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
  return datetime;
}

function go(url) {
  var parseURL = url;
  var time = currentTime();
  ipcRenderer.send('dataUpdate', {time:time,updating:true});
  var nightmare = Nightmare({
          electronPath: require('../node_modules/nightmare/node_modules/electron'),
        })
  nightmare
    .goto(parseURL)
    //.type('#search_form_input_homepage', 'github nightmare')
    //.click('#search_button_homepage')
    .wait('.place .place-count')
    .evaluate(() => {
        return document.querySelectorAll('.place .place-count')[1].innerText;
      })
    .end()
    .then((result) => {
      if (parseInt(result)>parseInt(prevCount)) {
        ipcRenderer.send('hasEvents', {hasEvents:true,url:parseURL,prev:prevCount,cur:result});
        document.getElementById("logs").value += "["+String(currentTime())+"] Новые билеты! Было: "+String(prevCount)+". Стало: "+String(result)+".\r\n--------\r\n";
        prevCount = parseInt(result);
        document.getElementById('freeSpace').classList.add("show");
        document.getElementById('freeSpace').classList.remove("hide");
        document.getElementById('freeSpace').innerText = "Свободных мест: "+prevCount;
      }
      else if (parseInt(result)<parseInt(prevCount)){
        ipcRenderer.send('hasEvents', {hasEvents:false});
        document.getElementById("logs").value += "["+String(currentTime())+"] Билетов стало меньше. Было: "+String(prevCount)+". Стало: "+String(result)+".\r\n--------\r\n";
        prevCount = parseInt(result);
        document.getElementById('freeSpace').classList.add("show");
        document.getElementById('freeSpace').classList.remove("hide");
        document.getElementById('freeSpace').innerText = "Свободных мест: "+prevCount;
      }
      else {
        ipcRenderer.send('hasEvents', {hasEvents:false});
        prevCount = parseInt(result);
        document.getElementById("logs").value += "["+String(currentTime())+"] Без изменений - "+String(prevCount)+". \r\n--------\r\n";
      }
    })
    .catch(error => {
      ipcRenderer.send('hasEvents', {hasEvents:false});
      document.getElementById("logs").value += 'Search failed:'+error;
    })
}
/*
window.onload = function(){
  go();
  var siteRegCheck;
  siteRegCheck = setInterval( go, 900000 );
}*/
