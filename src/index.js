const request = require('superagent')
const superagent = require('superagent-charset')(request)
const cheerio = require('cheerio');
const fs = require('fs')
const xlsx = require('node-xlsx');
import {
  remote
} from 'electron';

var titleStr = ''
var keyStr = ''

const btnSubmit = document.getElementById('btn_submit');
btnSubmit.addEventListener('click', (e) => {
  const url = document.getElementById('inputUrl').value
  let codeCookie = ''

  superagent.get(url).charset().set({
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
  }).end((err, res) => {
    if (res.headers['set-cookie']) {
      codeCookie = res.headers['set-cookie'].join(';')
      superagent.get(url).charset().set('Cookie', codeCookie).set({
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
      }).end((err, res) => {
        // console.log(res)
        const $ = cheerio.load(res.text);
        titleStr = $("title").eq(0).text()
        keyStr = $("meta[name='keywords']").eq(0).attr('content')
        // document.getElementById('title_area').innerHTML = titleStr ? titleStr.replace(/[,，]/g, '&#10;') : '解析失败';
        document.getElementById('keywords_area').innerHTML = keyStr ? keyStr.replace(/[,，]/g, '&#10;') : '解析失败';
      });
    } else {
      const $ = cheerio.load(res.text);
      titleStr = $("title").eq(0).text()
      keyStr = $("meta[name='keywords']").eq(0).attr('content')
      // document.getElementById('title_area').innerHTML = titleStr ? titleStr.replace(/[,，]/g, '&#10;') : '解析失败';
      document.getElementById('keywords_area').innerHTML = keyStr ? keyStr.replace(/[,，]/g, '&#10;') : '解析失败';
    }
  })
});


const btnClear = document.getElementById('btn_clear');
btnClear.addEventListener('click', (e) => {
  document.getElementById('inputUrl').value = ''
  // document.getElementById('title_area').innerHTML = ''
  document.getElementById('keywords_area').innerHTML = ''
  titleStr = ''
  keyStr = ''
})


const btnExport = document.getElementById('btn_export');
btnExport.addEventListener('click', (e) => {
  if (!!!keyStr) {
    remote.dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message: 'keywords无数据，输入链接查询后获取！'
    })
    return
  }
  remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
    // 过滤文件类型
    filters: [{
        name: "xls Files",
        extensions: ['xlsx']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ]
  }).then(res => {
    let data = [{
      name: 'sheet1',
      data: [
        // ['Title', 'Keywords', ],
        // [titleStr, keyStr]
        ['Keywords'],
        [keyStr]
      ]
    }]
    // console.log(res.filePath)
    fs.writeFileSync(res.filePath, xlsx.build(data))
    remote.dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message: '保存完成'
    })
  });

})