// 元素是否显示的初始值
let state={
    'window':true,
    'state':false,
};

// 获取显示文字速度的ID
let num=document.getElementById('interval-num');

// 所有勾选框ID的列表=>方便后续快速更新本地存储
let tempList=['dock-window','turn-sound','turn-auto'];

// 更改鼠标移动到标题栏上的样式
function moveWindow() {
    let id=document.getElementById('window-header');
    id.style.cursor=document.getElementById('dock-window').checked?'default':'move';
}

// 为勾选框添加点击事件
function changeSwitch(id,bool=false) {
    let id2=document.getElementById(id);
    id2.onchange=(e)=>{
        localStorageSet(id,!!e.target.checked);
        if (id=='dock-window') moveWindow();
    }

    if (localStorageGet(id)==bool.toString()) id2.checked=bool;
}

// 时刻更新文字速度值=>显示并存储到本地
function changeInterval() {
    window.interval=document.getElementById('interval-range').value;
    num.textContent=window.interval;
    localStorageSet("interval-num",window.interval);
}

// 拖动标题栏时更新盒子的位置=>存储到本地
function dragWindow() {
    let pos1=0,pos2=0,pos3=0,pos4=0;
    let el=document.getElementById("window");
    let id=document.getElementById(`${el.id}-header`);

    if (localStorageGet("save-position")) {
        let position=localStorageGet("save-position").split(" ");
        el.style.top=`${position[0]||0}px`;
        el.style.left=`${position[1]||0}px`;
    }

    (id||el).onmousedown=dragMouseDown;

    function dragMouseDown(e) {
        e=e||window.event;
        e.preventDefault();
        pos3=e.clientX;
        pos4=e.clientY;
        document.onmouseup=closeDragWindow;
        document.onmousemove=windowDrag;
    }

    function windowDrag(e) {
        if (!document.getElementById('dock-window').checked) {
            e=e||window.event;
            e.preventDefault();
            pos1=pos3-e.clientX;
            pos2=pos4-e.clientY;
            pos3=e.clientX;
            pos4=e.clientY;
            newY=Math.max(0,Math.min(el.offsetTop-pos2,window.innerHeight-el.offsetHeight-41));
            newX=Math.max(0,Math.min(el.offsetLeft-pos1,window.innerWidth-el.offsetWidth));
            el.style.top=`${newY}px`;
            el.style.left=`${newX}px`;
            localStorageSet("save-position",`${newY} ${newX}`)
        }
    }

    function closeDragWindow() {
        document.onmouseup=null;
        document.onmousemove=null;
    }
}

// 模拟Python的zfill()函数=>使用0填充缺少的位数
function zfill(str,width=2) {
    while (str.toString().length<width) str=`0${str}`;
    return str
}

// 时刻更新底部时间
function startTime() {
    document.getElementById('time').firstChild.textContent=getTime();
    setTimeout(()=>startTime(),1000);
}

// 改变ID的显隐状态
function changeState(id,bool=false) {
    playMusic('button05',1);
    document.querySelector(`#${id}`).style.display=(bool||state[id])?"none":"block";

    if (id=='file-page') {
        let boxs=document.getElementsByClassName('box');
        
        for (let i=0;i<boxs.length;i++) {
            boxs[i].onclick=null;
            boxs[i].style.display='block';
        }
    }

    state[id]=!state[id];
}

// 点击⊗时添加class值=>晃动窗口1s
function shake() {
    playMusic('button05',1);
    let body=document.getElementById("window");
    body.classList.add("shake-window");
    setTimeout(()=>body.classList.remove("shake-window"),1000);
}

// 批量更新本地存储的勾选框值
for (let i=0;i<tempList.length;i++) {
    changeSwitch(tempList[i],i==0?true:false);
}

// 从本地存储恢复文字速度
if (localStorageGet("interval-num")) {
    let localNum=localStorageGet("interval-num");
    num.textContent=localNum;
    window.interval=localNum;
    document.getElementById('interval-range').value=localNum;
}

// 离开页面=>触发标题彩蛋
document.addEventListener('visibilitychange',()=>{
    document.title=(document.visibilityState=='hidden'?'BUGLAND｜PAPEREE':'UWULAND｜PAPEREE')
});

// 开始更新时间
startTime();

// 判断是否固定窗口
moveWindow();

// 绘制窗口位置
dragWindow();