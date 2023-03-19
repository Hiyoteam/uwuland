// 在底部添加<br>标签=>滚动到底部
function nextLine() {
    let atBottom=(window.innerHeight+window.scrollY)>=(document.body.scrollHeight-1);
    document.getElementById('main-content').appendChild(document.createElement('br'));
    if (atBottom) window.scrollTo(0,document.body.scrollHeight);
}


// 播放音效
function playMusic(play,volu=0.4) {
    if (document.getElementById('turn-sound').checked) {
        window.music[play].volume=volu;
        window.music[play].play();
    }
}


// 输出当前时间
function getTime() {
    let today=new Date();
    return `${today.getFullYear()}.${zfill(today.getMonth()+1)}.${zfill(today.getDate())} ${zfill(today.getHours())}:${zfill(today.getMinutes())}:${zfill(today.getSeconds())}`
}


// 更新存读档界面<=这屎山代码看着真头疼
function fileSaveLoad(code) {
    changeState('file-page',false)
    let boxs=document.getElementsByClassName('box');

    for (let i=0;i<boxs.length;i++) {
        let id=boxs[i].getAttribute('id');
        let el=document.querySelector(`#${id}-save`);
        let record=load(id);

        el.innerHTML=record.TAG?`<p><u>Data</u>: ${record.TITLE}</br><u>Pace</u>: ${zfill(record.TAG,3)}</br><u>Time</u>: ${record.TIME}</p>`:`<p class='oops'>Not Data</p>`;

        if (record.TAG&&!code) {
            document.getElementById(id).onclick=()=>{
                window.data=record;
                parseLine(`!head ${record.HEAD}`);
                loadText(drama[record.TITLE],record.TITLE,record.TAG);
                changeState('home',true);
                changeState('file-page',true);
            }
        } else if (code) {
            if (i) {
                document.getElementById(id).onclick=()=>{
                    save([...Object.values(window.data).slice(0,3),getTime()],id);

                    let record=load(id);
                    el.innerHTML=`<p><u>Data</u>: ${record.TITLE}</br><u>Pace</u>: ${zfill(record.TAG,3)}</br><u>Time</u>: ${record.TIME}</p>`;
                }
            } else {
                boxs[i].style.display='none';
            }
        }
    }
}


/**
 * 把一个文本显示在网页上，并且有动画
 * @param {String} text 要显示的文本
 * @param {Number} interval 显示每个字时间隔的时间
 * @returns {Promise}
 */

function pushText(text) {
    let el=document.createElement('p');
    let mark=['*','^','&'];
    let name=['small','big','italic'];

    el.classList.add('normal');

    for (let i=0;i<mark.length;i++) {
        if (text.startsWith(mark[i])) {
            el.classList.add(name[i]);
            text=text.slice(1);
            break
        }
    }

    let atBottom=(window.innerHeight+window.scrollY)>=(document.body.scrollHeight-1);
    document.getElementById('main-content').appendChild(el);
    if (atBottom) window.scrollTo(0,document.body.scrollHeight);

    if (window.interval!=0) {
        el.textContent+=text[0]||'';

        return new Promise(async(res)=>{
            let i=1;
            let s=setInterval(()=>{
                if (typeof text[i]!=='string') {
                    clearInterval(s);
                    res();
                    return
                }
                el.textContent+=text[i];
                i++;
            },window.interval)
        })
    } else {
        el.textContent=text;
    }
}


/**
 * 在页面上显示一些按钮
 * @param {Array} answers 按钮
 * @returns {Promise}
 */

function pushQuestion(answers) {
    let buttons=[]

    answers.forEach(async (s)=>{
        let el=document.createElement('button');
        el.textContent=s;

        let atBottom=(window.innerHeight+window.scrollY)>=(document.body.scrollHeight-1);
        document.getElementById('main-content').appendChild(el);
        if (atBottom) window.scrollTo(0,document.body.scrollHeight);

        buttons.push(el);
        nextLine();
    })

    return new Promise((res)=>buttons.forEach((b)=>b.onclick=()=>res(b.textContent)))
}


/**
 * 等待用户点击网页
 * @returns {Promise}
 */

function waitClick() {
    return new Promise((res)=>document.getElementById('main-content').onclick=res)
}


/**
 * 显示“请单击网页以继续游戏”的信息
 * @param {String} msg 自定义提示
 */

async function pause() {
    await waitClick();
    await playMusic('button01a');
    document.getElementById('main-content').innerHTML='';
}


/**
 * 解析 .zhang-game 文件（zhang-game 脚本）并执行
 * @param {String} text 
 */

// MrZhang365：你6，这都改了……
// MrZhang365：故意增加难度啊……
// ee：新版我改回来了（被打

async function parseText(text,tag=false) {
    const LINES=text.split('\n');
    let num=0;

    if (tag) {
        pushText('&读档成功');
        pushText('点击对话框继续游戏');
    }

    for (let i=0;i in LINES;i++) {
        if (LINES[i]=='!pause') num++;
        if (tag&&num<Number(tag)) continue
        let code=await parseLine(LINES[i],LINES[i]=='!pause'?num:'');
        if (code===window.EXIT) return code
    }
}


/**
 * 从目标URL获取并解析、执行 zhang-game 脚本
 * @param {String} url zhang-game 脚本地址
 */

async function loadText(text,title=false,tag=false) {
    if (title) {
        let e=document.getElementById('title');
        e.firstChild.textContent=title;
        e.classList.add('title');
        e.style.display='block';
        window.data.title=title;
        setTimeout(()=>{
            e.style.display='none';
            e.classList.remove('title');
        },3000);
    }

    document.getElementById('main-content').innerHTML='';
    await parseText(text,tag||'');
}


/**
 * 执行 .zhang-game 文件里面的一行
 * @param {String} text 
 */

async function parseLine(text,parseIndex=false) {
    if (text.endsWith('\r')) text=text.slice(0,text.length-1)

    if (text.startsWith('\\!')) {
        await pushText(text.slice(1));
    } else if (!text.startsWith('!')) {
        await pushText(text);
    } else {
        const COMMAND=text.slice(1).split(' ')[0].toLocaleLowerCase();
        const ARGS=text.slice(1).split(' ').slice(1).join(' ')||'';
        const ALLOWED_COMMANDS=['pause','load','exit','pick','head'];

        if (!ALLOWED_COMMANDS.includes(COMMAND)) throw new Error(`${COMMAND} 4n0n4me Not Found`)

        if (COMMAND==='pause') {
            if (parseIndex) {
                window.data.TAG=parseIndex;
                window.data.TIME=getTime();
                if (document.getElementById('turn-auto').checked) save(Object.values(window.data).slice(0,4),'auto');
            }
            await pause()
        } else if (COMMAND==='load') {
            window.data.TITLE=ARGS;
            loadText(window.drama[ARGS],ARGS);
            return window.EXIT
        } else if (COMMAND==='exit') {
            return window.EXIT
        } else if (COMMAND==='pick') {
            let temp=ARGS.split(' ');
            const OPTIONS=temp[0].split('|');
            const ACTIONS=temp[1].split('|');
            const USER_CHOICE=await pushQuestion(OPTIONS);
            let temp2=ACTIONS[OPTIONS.indexOf(USER_CHOICE)];
            window.data.TITLE=temp2;
            loadText(window.drama[temp2],temp2);
            return window.EXIT
        } else if (COMMAND==='head'&&ARGS) {
            let e=document.getElementById('head');
            window.data.HEAD=ARGS;
            localStorageSet('auto-head',ARGS);
            e.style.backgroundColor=(ARGS[0]=='#')?ARGS:'';
            e.style.backgroundImage=(ARGS.startsWith('url'))?`url('${ARGS}')`:'';
        }
    }
}


/**
 * 返回 localStorage 中指定的键值
 * @param {String} key 目标键
 * @returns {any}
 */

function localStorageGet(key) {
    return localStorage.getItem(key)
}


/**
 * 修改 localStorage 中指定的键值
 * @param {String} key 目标键
 * @param {any} value 值
 */

function localStorageSet(key,value) {
    localStorage.setItem(key,value)
}


/**
 * 保存存档
 * PS：这个是UWULAND专用版，不可直接移植
 * @param {Array} list 数据
 * @param {String} mark 档位
 */

function save(list,mark) {
    let name=['title','tag','head','time'];

    for (let i=0;i<list.length;i++) {
        localStorageSet(`${mark}-${name[i]}`,list[i]);
    }
}


/**
 * 读取存档
 * PS：这个是UWULAND专用版，不可直接移植
 * @param {String} mark 档位
 * @returns {Object|null}
 */

function load(mark) {
    const re={
        TITLE:localStorageGet(`${mark}-title`),
        TAG:localStorageGet(`${mark}-tag`),
        HEAD:localStorageGet(`${mark}-head`),
        TIME:localStorageGet(`${mark}-time`),
    }

    return re
}


// 主函数<=删掉了init()
async function main() {
    await loadText(drama[window.data.TITLE],window.data.TITLE)
}


// MrZhang365：？？？我main函数捏？？？
// MrZhang365：@ee 我建议你把JS代码全部放在一个或多个JS文件里，而不是放在HTML里面，这样显得非常凌乱。。。
// MrZhang365：嗯？parseZhangGameFile怎么丢了。。。
// ee：@MrZhang365 我魔改过（被打
// ee：好吧……我会把文件分开放的 顺便谢谢你的自动存档 uwu！