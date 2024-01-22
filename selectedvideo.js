const base_url = "https://www.googleapis.com/youtube/v3";
const api_key = "AIzaSyAKJl_BIuNBOerBYJ-inxLN2_Ynahh8sOw";
// const api_key="";
const mainCurrentVideo = document.getElementById("main-current-video");
const currentVideoInfo = document.getElementById("current-playing");
const current_Url = new URLSearchParams(window.location.search);
const videoID = current_Url.get("videoId");
const commentsection = document.getElementsByClassName("comment-section-base")[0];
const suggestion=document.getElementById("suggestion");
const commentcount=document.getElementsByClassName("comment-count")[0];
const videoDesc=document.getElementsByClassName("description")[0];
const search = document.getElementById("search-btn");
let videos = document.getElementById("videos");

 
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.addEventListener("load", () => {
    new YT.Player(mainCurrentVideo, {
        height: "400",
        width: "700",
        videoId: videoID,
    });
});
function calculateLikes(likeCount) {
    let displayViews;
    let count;
    if (likeCount < 1000) {
        displayViews = likeCount;
    } else if (likeCount >= 1000 && likeCount <= 999999) {
        displayViews = (likeCount / 1000).toFixed(1) + "" + "K";
    } else if (likeCount >= 1000000) {
        displayViews = (likeCount / 1000000).toFixed(1) + "" + "M";
    }

    return displayViews;
}
function countcomment(){
    let allComment=document.getElementsByClassName("comment");
    let count=0;
    for(let el of allComment){
        count++;
    }
    return count;
}
function replycomments(div,el){
    for(let item of el){
        const replydiv = document.createElement("div");
        replydiv.className = "reply-comment";
        replydiv.innerHTML += `
        <img src="${item.snippet.authorProfileImageUrl}">
        <div class="reply-comment-content">
            <div class="reply-comment-title-section">
                <p class="reply-comment-title">${item.snippet.authorDisplayName}</p>
            </div>
            <div class="reply-comment-desc">
            ${item.snippet.textDisplay}
            </div>
            <div class="reply-comment-detail">
                <div class="reply-like">
                    <span class="material-symbols-outlined">
                        thumb_up
                        </span>
                        <p>${item.snippet.likeCount}</p>
                </div>
                <div class="reply-dislike">
                    <span class="material-symbols-outlined">
                        thumb_down
                        </span>
                </div>
                <div class="reply-reply">
                    <p>Reply</p>
                </div>
            </div>
        </div>`
        div.appendChild(replydiv);
    }
}
function displaycomments(items) {
    let count=0;
    console.log(items);
    for (let el of items) {
        count++;
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `
        <div>
        <img src="${el.snippet.topLevelComment.snippet.authorProfileImageUrl}">
        <div class="comment-content">
            <div class="comment-title-section">
                <p class="comment-title">${el.snippet.topLevelComment.snippet.authorDisplayName}</p>
            </div>
            <div class="comment-desc">
            ${el.snippet.topLevelComment.snippet.textDisplay}
            </div>
            <div class="comment-detail">
                <div class="like">
                    <span class="material-symbols-outlined">
                        thumb_up
                        </span>
                        <p>${el.snippet.topLevelComment.snippet.likeCount}</p>
                </div>
                <div class="dislike">
                    <span class="material-symbols-outlined">
                        thumb_down
                        </span>
                </div>
                <div class="reply">
                    <p>Reply</p>
                </div>
            </div>
        </div>
        </div>`
        commentsection.appendChild(div);
        // console.log(el);
        if(el.replies!=undefined && el.replies.comments){
            replycomments(div,el.replies.comments);
        }
    }
    commentcount.innerHTML=`${count} Comments`
}
async function videostate(videoid) {
    const response = await fetch(`${base_url}/videos?key=${api_key}&part=statistics&id=${videoid}`);
    const data = await response.json();
    return data.items;
}
async function channellogo(channelid) {
    const response = await fetch(`${base_url}/channels?key=${api_key}&part=snippet&id=${channelid}`);
    const data = await response.json();
    return data.items;
}
async function getsubscription(channelid){
    let response= await fetch(`${base_url}/channels?key=${api_key}&id=${channelid}&part=statistics`);
    let data= await response.json();
    return data.items;
}
async function commentinfo(videoid,channelId){
    let response= await fetch(`${base_url}/commentThreads?part=snippet%2Creplies&videoId=${videoid}&key=${api_key}`);
    let data= await response.json();
    displaycomments(data.items);
    // console.log(data);
}
async function calduration(publisheddate){
    let displaytime;
    let publishedat=new Date(publisheddate);
    let miliSecFromPublished=publishedat.getTime();
    let currenttime=new Date();
    let currentTimeInMiliSec=currenttime.getTime();
    let duration=currentTimeInMiliSec-miliSecFromPublished;
    let days=parseInt(duration/86400000);
    if(days<1){
        let hours=parseInt(duration/3600000);
        displaytime=hours+" "+"hours";
    }
    else if(days>6 && days<=29){
        let weeks=parseInt(days/7);
        displaytime=weeks+" "+"weeks";
    }
    else if(days>29 && days<=364){
        let months=parseInt(days/30);
        displaytime=months+" "+"months";
    }
    else if(days>364){
        let years=parseInt(days/365);
        displaytime=years+" "+"years";
    }
    else{
        displaytime=days+" "+"days";
    }
    return displaytime;
}
async function displayRecommendedVideo(items){
    for(let el of items){
        el.viewObject=await videostate(el.id.videoId);
        el.channelObject=await channellogo(el.snippet.channelId);
        let duration=await calduration(el.snippet.publishedAt);
        el.subscriberCount=await getsubscription(el.snippet.channelId);
        const div=document.createElement("div");
        div.className="suggestion-card";
        div.innerHTML=`
        <div class="thumbnail">
            <img src="${el.snippet.thumbnails.high.url}">
        </div>
        <div class="content">
            <p class="card-title">${el.snippet.title}</p>
            <p class="card-channelName">${el.snippet.channelTitle}</p>
            <div class="card-videoDetail">
                <p class="card-views">0 views</p>
                <p class="card-date">${duration} ago</p>
            </div>
        </div>`
        suggestion.appendChild(div);
        if(el.viewObject[0] && el.viewObject[0].statistics && el.viewObject[0].statistics.viewCount){
            const card_views=document.getElementsByClassName("card-views");
            card_views[card_views.length-1].innerHTML=`${calculateLikes(el.viewObject[0].statistics.viewCount)} views`
        }
        div.addEventListener("click", () => {
            const InfoSelectedVideo = {
              videoTitle: `${el.snippet.title}`,
              channelLogo: `${el.snippet.thumbnails.high.url}`,
              channelName: `${el.snippet.channelTitle}`,
              likeCount: `${el.viewObject[0].statistics.likeCount}`,
              channelID: `${el.snippet.channelId}`,
              subscribers: `${el.subscriberCount[0].statistics.subscriberCount}`,
            };
            sessionStorage.setItem(
              "selectedVideoInformation",
              JSON.stringify(InfoSelectedVideo)
            );
            window.location.href=`./SelectedVideo.html?videoId=${el.id.videoId}`;
          });
    }
}
async function getcomments(videoid) {
    try {
        const response = await fetch(`${base_url}/commentThreads?key=${api_key}&videoId=${videoid}&maxResults=20&part=snippet`);
        const data = await response.json();
        console.log(data);
        displaycomments(data.items);
    } catch (error) {
        console.log(error);
    }
}
async function recommendedVideo(videoTitle){
    try {
        const response = await fetch(`${base_url}/search?key=${api_key}&q=${videoTitle}&maxResults=16&part=snippet`);
        const data = await response.json();
        displayRecommendedVideo(data.items);
    } catch (error) {
        console.log(error);
    }
}
let selectedVideoInfo;
const videoinfostr = sessionStorage.getItem("selectedVideoInformation");
if (videoinfostr) {
    selectedVideoInfo = JSON.parse(videoinfostr);
}
currentVideoInfo.innerHTML = `<p class="title">${selectedVideoInfo.videoTitle}</p>
<div class="channel-info">
    <div class="main-info">
        <img src="${selectedVideoInfo.channelLogo}">
        <div class="name-subs">
            <p class="channel-name">${selectedVideoInfo.channelName}</p>
            <p class="subs">${calculateLikes(selectedVideoInfo.subscribers)} subscribers</p>
        </div>
    </div>
    <div class="video-info">
        <div class="dislike">
            <div class="like">
            <span>
            <i class="fa-regular fa-thumbs-up fa-lg"></i>
        </span>
                <p>${calculateLikes(selectedVideoInfo.likeCount)}</p>
            </div>
            <div>
            <span>
            <i class="fa-regular fa-thumbs-down fa-lg"></i>
        </span>
            </div>
        </div>
        <div>
        <span>
        <i class="fa-solid fa-share-nodes"></i>
    </span>
            <p>Share</p>
        </div>
        <div>
        <span>
        <i class="fa-solid fa-ellipsis fa-lg"></i>
    </span>
        </div>
    </div>
</div>`
async function displayVideoDesc(){
    let myobj = await videostate(videoID);
    let obj = await channellogo(selectedVideoInfo.channelID);
    let duration = await calduration(obj[0].snippet.publishedAt);
    // let duration=await calduration();
    videoDesc.innerHTML=`
        <div class="video-detail">
            <p class="views">${calculateLikes(myobj[0].statistics.viewCount)} views</p>
            <p class="date">${duration} ago</p>
        </div>
        <div class="videos-desc">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero distinctio nostrum fugit nam
                        voluptatum autem dignissimos fugiat non praesentium deserunt! Nostrum odio autem ipsa fugit
                        mollitia. Repudiandae veritatis corrupti earum.
                        Recusandae distinctio vero unde cupiditate, laboriosam eligendi. Perspiciatis repellendus
                        consequuntur odio asperiores neque eos suscipit ducimus eligendi! Laborum eius veniam ipsa
                        mollitia quos vel, accusantium incidunt numquam a molestiae non.
                    </div>
`   
}
displayVideoDesc();
recommendedVideo(selectedVideoInfo.videoTitle);
commentinfo(videoID,selectedVideoInfo.channelID);

search.addEventListener("click", () => {
    const searchquery = document.getElementById("search-query");
    window.location.href=`./index.html?search_query=${searchquery.value}`;
})
function navToChannel(){
    const mainInfo=document.getElementsByClassName("main-info")[0];
    mainInfo.addEventListener("click",()=>{
        window.location.href=`./channel.html`;
    })
}
navToChannel();
// async function subscribeinfo(channelid){
//     try {
//         const response = await fetch(`https://youtube.googleapis.com/youtube/v3/channelSections?part=snippet%2CcontentDetails&channelId=${channelid}&key=${api_key}`);
//         const data = await response.json();
//         playlistinfo(channelid,data.items);
//     } catch (error) {
//         console.log(error);
//     }
// }
// async function playlistinfo(channelid,data){
//     // console.log(data);
//     for(let el of data){
//         try {
//             const response = await fetch(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet%2CcontentDetails&channelId=${channelid}&maxResults=25&key=${api_key}`);
//             const data = await response.json();
//             // console.log(data);
//         } catch (error) {
//             console.log(error);
//         }
//     }
// }
// subscribeinfo(selectedVideoInfo.channelID);