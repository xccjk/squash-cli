# squash-cli使用示例

## 使用及调试方式

- clone项目，到examples/app目录下

```javascript
  git clone git@github.com:xccjk/squash-cli.git
  cd squash-cli/examples/app
```

- 安装依赖

```javascript
  npm install
```

- 运行批量处理命令，压缩图片并且生成压缩比等信息

```javascript
  node index.js --md=true --folder=src
```

## 注意事项

项目本身是用来处理具体的文件夹下所有的图片的，因此在使用时，尽量压缩根目录.

假设项目目录为下面这样：

```javascript
- app
  - config
    - a.js
    - ...
  - src
    - assets
      - 1.png
      - 2.png
    - pages
      - home
        - img
          - 3.png
          - 4.png
        - index.js
        - index.html
      - mine
      - ...
```

假设你想压缩项目下所有图片资源，在项目根目录下(package.json同级)运行下面命令：

```javascript
  node index.js
  // or
  node index.js --folder=src --md=true
```

假设你想压缩pages下面的图片资源，就到与pages同级目录下运行下面命令：

```javascript
  node index.js --folder=pages --md=true
```
