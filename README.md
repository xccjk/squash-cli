# squash-cli

基于tinify的图片压缩cli工具

## Install

```javascript
  npm install -g img-squash-cli
```

## API

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
