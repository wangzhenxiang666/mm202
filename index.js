/*
  瀑布流的业务逻辑

  分析:
    + 代理请求数据
      => 使用 nginx 配置代理, 确保可以拿到数据
    + 有一个方法来确认所有 ul 里面最短的那一个
      => 因为我的每一个 li 都要填充到最短的 ul 里面
    + 使用获取到的数据渲染页面
      => 拿到数据, 把每一个数据组装成一个 li
      => 放到最短的 ul 里面
    + 实现瀑布流
      => 当页面滚动到底部的时候, 继续加载下一页数据

  代码实现
    1. 准备一个方法, 拿到最短的 ul
      => 获取到所有 ul 的集合
      => 需要不需要每次都获取 ? 不需要, 全局获取一次
      => 循环遍历每一个 ul
      => 假设 [0] 的 ul 高度最短
      => 依次遍历, 如果某一个 ul 的高度比我假设的还短
      => 那么进行替换
    2. 请求数据, 去渲染页面
      => 因为参数 start 表示开始索引
      => 每次请求, 其他内容都一样
      2-1. 把 start 定义为全局变量
      2-2. 准备一个发送请求的函数
        -> 因为下一页的时候, 执行的是一模一样得操作, 只是 start 值不一样
      2-3. 发送请求
        -> 注意代理地址
      2-4. 修改 start 的值
        -> 每次请求成功以后把 start 修改为下一次使用需要用到的内容
      2-5. 执行渲染页面的函数
        -> 结构写在一起, 太长了,
        -> 单独拿一个函数出来
    3. 渲染页面
      3-1. 循环遍历数组
        -> 里面的每一项生成一个 li 标签
      3-2. 把生成的每一个 li 放在 ul 里面
        -> 放在 最短的 ul 里面
*/

// 1.
// 1-1. 全局获取 ul
const uls = document.querySelectorAll('.content > ul')

// 1-2. 准备方法, 拿到最短的 ul
function getMinUl() {
  // 1-3. 假设索引 [0] 的 ul 高度最短
  let minUl = uls[0]

  // 1-4. 遍历 uls, 拿到每一个 ul
  for (let i = 0; i < uls.length; i++) {
    // 1-5. 进行条件判断
    // 元素.offsetHeight 获取元素的页面占地高度(内容 + padding + border)
    if (uls[i].offsetHeight < minUl.offsetHeight) {
      minUl = uls[i]
    }
  }

  // 1-6. 循环结束以后, minUl 就是所有 ul 里面最短的哪一个
  return minUl
}

// 2.
// 2-1. 准备一个全局变量, 当做开始索引
let start = 0

// 2-2. 准备一个发送请求的函数
getData()
function getData() {
  // 2-3. 发送 ajax 请求
  ajax({
    url: '/dt',
    data: `include_fields=top_comments%2Cis_root%2Csource_link%2Citem%2Cbuyable%2Croot_id%2Cstatus%2Clike_count%2Csender%2Calbum%2Creply_count&filter_id=美食菜谱&start=${start}&_=1605836626673`,
    success (res) {
      // 2-4. 每次请求回来以后, 直接把 start += 24
      // 为下一次请求做好准备
      start += 24
      res = JSON.parse(res)
      bindHtml(res.data.object_list)
    }
  })
}

// 3. 渲染页面的函数
function bindHtml(arr) {
  // console.log(arr[0])
  // 3-1. 循环遍历数组
  for (let i = 0; i < arr.length; i++) {
    const height = 280 * arr[i].photo.height / arr[i].photo.width
    // 3-2. 生成一个 li
    const str = `
      <li>
        <div class="top" style="height: ${ height }px">
          <img src="${ arr[i].photo.path }" alt="">
        </div>
        <div class="bottom">
          <div class="desc">${ arr[i].msg }</div>
          <div class="info">
            <i></i>
            <span>${ arr[i].like_count }</span>
            <i></i>
            <span>${ arr[i].favorite_count }</span>
          </div>
          <div class="userInfo">
            <div class="left">
              <p>
                <img src="${ arr[i].sender.avatar }" alt="">
              </p>
            </div>
            <div class="right">
              ${ arr[i].sender.username }
            </div>
          </div>
        </div>
      </li>
    `

    // 3-3. 找到一个最短的 ul
    const minUl = getMinUl()

    // 3-4. 把 str 添加到 这个 ul 里面
    minUl.innerHTML += str
  }
}


/*
  最开始没有加载过的时候
    + 每一个图片都需要从新加载
    + 等到所有标签都放在页面里面以后再开始加载
    + 没有加载来图片的时候是没有高度的
    + 一开始所有的图片都没有高度
    + 表示每一个 li 其实一边高
    + 向 ul 里面插入的时候, 就会均匀的插入六个
    + 但是当图片加载完毕以后, 不一定多高
    + 在每次加载之前, 只要计算出图片的高度
      => 给 div 一个高度, 虽然图片没有加载回来
      => 但是 div 已经把高度撑开了

  盒子宽度       图片宽度
  -------   =   --------
  盒子高度       图片高度
  盒子高度 = 盒子宽度 * 图片高度 / 图片宽度
*/
