# squash-cli

基于tinify的图片压缩cli工具

**该项目是用来学习使用的，主要为了减少工作中重复的图片压缩操作，不做商业化使用。因此，如果要商用，请购买正版服务[tinypng](https://tinypng.com/developers)**

## 开发环境

- Node.js 14.17.0
- npm 6.14.13

## Install

```javascript
  npm install -g img-squash-cli
```

## Api

```javascript
  npx squash-cli
```

如果需要指定图片压缩的文件，请添加folder参数，默认为项目目录下的src文件夹

```javascript
  // 修改为处理config文件夹下内容
  npx squash-cli --folder=config
```

如果要生成图片压缩比等信息，请添加md参数，默认不开启

```javascript
  npx suqash-cli --md=true
```

完整命令：

```javascript
  npx suqash-cli --folder=src --md=true
```

## Examples

使用方式可以查看[examples/app](https://github.com/xccjk/squash-cli/tree/master/examples/app)这个项目
