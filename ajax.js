/*
  封装 ajax

  手动抛出异常
    + 让代码报错
    + 语法: throw new Error('错误提示信息')

  1. 验证参数是不是符合规则
    1-1. url 是不是传递了, 是不是一个字符串类型
    1-2. method 可以不传递, 但是只要传递了, 必须是 GET 或者 POST
    1-3. data 可以不传递, 但是只要传递了, 必须是 'a=100&b=200'
    1-4. async 可以不传递, 但是只要传递了, 必须是 布尔类型
    1-5. success 可以不传递, 但是只要传递了, 必须是一个 函数类型

  2. 准备一套默认值
    + 按照我们的设定准备默认值
    + 使用 options 里面传递进来的数据, 去吧默认值里面的数据替换掉
    + 判断一下, 如果是 get 请求, 我们直接把 data 拼接在 url 的后面

  3. 开始发送请求
    + 使用 _default 里面的一套内容去操作
    + 把需要参数的位置替换成 _default 里面的内容
*/

function ajax(options) {
  // options 配置项, 使用这个方法的人传递过来的内容
  // console.log(options)
  // options 里面的 success 是一个函数数据类型

  // 1. 参数验证
  // 1-1. 验证 url 必须传递, 并且是一个字符串类型
  // 当 url 为 undefined 表示没有传递
  // 当 url 的数据类型不是 string 的时候, 表示格式错误
  if (options.url === undefined || typeof(options.url) !== 'string') {
    throw new Error('您的 url 不对')
  }

  // 1-2. 验证 method
  // method 可以为 undefined
  // method 可以为 get GET post POST
  if (!(options.method === undefined || /^(get|post)$/i.test(options.method))) {
    // 手动抛出异常
    throw new Error('目前只支持 GET 和 POST 方式, 请期待更新!')
  }

  // 1-3. 验证 data
  // data 可以为 undefined
  // data 可以为 'key=value&key=value'
  if (!(options.data === undefined || /^(.+=.+&?)*$/i.test(options.data))) {
    throw new Error('请按照格式传递参数')
  }

  // 1-4. 验证 async
  // async 可以为 undefined
  // async 可以为 布尔类型
  if (!(options.async === undefined || typeof(options.async) === 'boolean')) {
    throw new Error('async 只接受布尔类型')
  }

  // 1-5. 验证 success
  // success 可以为 undefined
  // success 可以为 函数类型
  if (!(options.success === undefined || typeof(options.success) === 'function')) {
    throw new Error('success 必须是一个函数数据类型')
  }

  // 2. 处理默认值
  // 2-1. 准备一套默认值
  const _default = {
    // 因为 url 如果没有值, 那么代码执行不到这个位置
    url: options.url,
    // 代码能到来这里, 说明 options.method 只能是 undefined 或者 get 或者 post
    // undefined 为 false
    // 'get' 'post' 都是 true
    method: options.method || 'GET',
    // 代码能到来这里, 说明 options.data 只能是 undefined 或者 符合规则的字符串
    data: options.data || '',
    // 代码能到来这里, 说明 options.async 只能是 undefined 或者 false 或者 true
    // 三元表达式, 如果你是一个布尔值, 那么直接使用, 如果不是布尔值, 那么就用 true
    async: typeof(options.async) === 'boolean' ? options.async : true,
    // 代码能到来这里, 说明 options.success 只能是 undefined 或者 function
    success: options.success || function () {}
  }

  // 2-2. 判断如果是一个 get 请求, 那么直接把 data 拼接在 url 的后面
  if (_default.method.toUpperCase() === 'GET' && _default.data !== '') {
    // 表示是一个 GET 请求
    _default.url = _default.url + '?' + _default.data
  }

  // 3. 发送请求
  // 3-1. 创建对象
  const xhr = new XMLHttpRequest()

  // 3-2. 配置请求信息
  xhr.open(_default.method, _default.url, _default.async)

  // 3-3. 接受结果
  xhr.onload = function () {
    // 当 ajax 完成的时候
    // 调用你传递进来的函数
    _default.success(xhr.responseText)
  }

  // 3-4. 发送请求
  // 如果是 post 请求, 需要设置请求头, 并且在 send 的时候填写请求体
  // 如果不是 post 请求, 那么直接发送
  if (_default.method.toUpperCase() === 'POST') {
    // 设置请求头
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded')
    // 携带请求体
    xhr.send(_default.data)
  } else {
    xhr.send()
  }
}
