#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require('https')
const chalk = require('chalk');
const md5 = require('md5');
const args = require('minimist')(process.argv.slice(2))

/**
 * args参数
 * @param {*} md
 * 默认不生成md文件
 * 如果需要生成md文件，传入参数md
 * node index.js --md=true
 * @returns 是否生成md文件
 *
 * @param {*} folder
 * 图片压缩文件范围，默认src文件夹
 * node index.js --folder=src
 * @returns
 */

// 需要处理的文件类型
const imgsInclude = ['.png', '.jpg'];
// 不进行处理的文件夹
const filesExclude = ['dist', 'build', 'node_modules', 'config'];

const urls = [
	"tinyjpg.com",
	"tinypng.com"
];

const config = {
  // 图片最大限制5M
  max: 5242880,
  // 每次最多处理20张，默认处理10张
  maxLength: 10,
};

const Log = console.log

const Success = chalk.green
const Error = chalk.bold.red;
const Warning = chalk.keyword('orange');

// 历史文件压缩后生成的md5
let keys = []

// 读取指定文件夹下所有文件
let filesList = []

// 压缩后文件列表
const squashList = []

// 请求头
function header() {
	const ip = new Array(4).fill(0).map(() => parseInt(Math.random() * 255)).join(".");
	const index = Math.round(Math.random(0, 1));
	return {
		headers: {
			"Cache-Control": "no-cache",
			"Content-Type": "application/x-www-form-urlencoded",
			"Postman-Token": Date.now(),
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
			"X-Forwarded-For": ip
		},
		hostname: urls[index],
		method: "POST",
		path: "/web/shrink",
		rejectUnauthorized: false
	};
}

// 判断文件是否存在
function access(dir) {
  return new Promise((resolve, reject) => {
    fs.access(dir, fs.constants.F_OK, async err => {
      if (!err) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

// 读取文件
function read(dir) {
  return new Promise((resolve, reject) => {
    fs.readFile(dir, 'utf-8', (err, data) => {
      if (!err) {
        keys = JSON.parse(data.toString()).list
        Log(Success('文件指纹读取成功'))
        resolve(keys)
      }
    })
  })
}

// 上传文件
function upload(file) {
  const options = header()
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => res.on('data', data => {
      const obj = JSON.parse(data.toString());
			obj.error ? reject(obj.message) : resolve(obj);
		}));
    req.on('error', error => {
      Error('upload', file)
      reject(error)
    })
    req.write(file, 'binary')
    req.end()
  })
}

// 下载文件
function download(url) {
  const options = new URL(url);
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
			let file = '';
			res.setEncoding('binary');
      res.on('data', chunk => {
        file += chunk;
      });
			res.on('end', () => resolve(file));
		});
    req.on('error', error => {
      Error('download', url)
      reject(error)
    })
		req.end();
	});
}

// 遍历指定类型文件
function readFile(filePath, filesList) {
  const files = fs.readdirSync(filePath);
  files.forEach((file) => {
    const fPath = path.join(filePath, file);
    const states = fs.statSync(fPath);
    // 获取文件后缀
    const extname = path.extname(file);
    if (states.isFile()) {
      const obj = {
        size: states.size,
        name: file,
        path: fPath,
      };
      const key = md5(fPath + states.size)
      if (states.size > config.max) {
        Warning(fPath)
        Log(`文件${file}超出5M的压缩限制`);
      }
      if (states.size < config.max && imgsInclude.includes(extname) && !keys.includes(key)) {
        filesList.push(obj);
      }
    } else {
      if (!filesExclude.includes(file)) {
        readFile(fPath, filesList);
      }
    }
  });
}

function getFileList(filePath) {
  const filesList = [];
  readFile(filePath, filesList);
  return filesList;
}

function writeFile(fileName, data) {
  fs.writeFile(fileName, data, 'utf-8', () => {
    Log(Success('文件生成成功'))
  });
}

function transformSize(size) {
  return size > 1024 ? (size / 1024).toFixed(2) + 'KB' : size + 'B'
}

let str = `# 项目原始图片对比\n
## 图片压缩信息\n
| 文件名 | 文件体积 | 压缩后体积 | 压缩比 | 文件路径 |\n| -- | -- | -- | -- | -- |\n`;

function output(list) {
  for (let i = 0; i < list.length; i++) {
    const { name, path: _path, size, miniSize } = list[i];
    const fileSize = `${transformSize(size)}`;
    const compressionSize = `${transformSize(miniSize)}`;
    const compressionRatio = `${(100 * (size - miniSize) / size).toFixed(2) + '%'}`;
    const desc = `| ${name} | ${fileSize} | ${compressionSize} | ${compressionRatio} | ${_path} |\n`;
    str += desc;
  }
  let size = 0, miniSize = 0
  list.forEach(item => {
    size += item.size
    miniSize += item.miniSize
  })
  const s = `
## 体积变化信息\n
| 原始体积 | 压缩后提交 | 压缩比 |\n| -- | -- | -- |\n| ${transformSize(size)} | ${transformSize(miniSize)} | ${(100 * (size - miniSize) / size).toFixed(2) + '%'} |
  `
  str = str + s
  writeFile('图片压缩比.md', str);
}

// 生成文件指纹
function fingerprint() {
  const list = []
  squashList.forEach(item => {
    const { miniSize, path } = item
    const md5s = md5(path + miniSize)
    list.push(md5s)
  })
  fs.writeFile('squash.json', JSON.stringify({ list: keys.concat(list) }, null, '\t'), err => {
    if (err) throw err
    Log(Success('文件指纹生成成功'))
  })
}

function squash() {
  try {
    Promise.all(
      filesList.map(async item => {
        Log(Success(item.path))
        const fpath = fs.readFileSync(item.path, 'binary')
        const { output = {} } = await upload(fpath)
        if (!output.url) return
        const data = await download(output.url)
        if (!data) return
        fs.writeFileSync(item.path, data, 'binary')
        return new Promise(async (resolve, reject) => {
          const miniSize = fs.statSync(item.path).size;
          squashList.push({ ...item, miniSize });
          resolve();
        });
      })
    ).then(() => {
      if (args['md']) {
        output(squashList);
      }
      fingerprint()
      console.timeEnd('squash time')
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

async function start() {
  try {
    const files = args['folder'] || 'src'
    const check = await access(files)
    if (!check) {
      Log(Error('当前文件或者文件夹不存在，请更换压缩目录'))
      return
    }
    const res = await access('squash.json')
    if (res) {
      await read('squash.json')
    }
    new Promise((resolve, reject) => {
      filesList = getFileList(files)
      resolve()
    }).then(() => {
      squash()
    })
  } catch (error) {
    Log(error)
  }
}

console.time('squash time')
start()
