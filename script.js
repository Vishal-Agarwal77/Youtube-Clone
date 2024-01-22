const api_key = "AIzaSyAKJl_BIuNBOerBYJ-inxLN2_Ynahh8sOw";
const base_url = "https://www.googleapis.com/youtube/v3";
const search = document.getElementById("search-btn");
const videos = document.getElementById("videos");
const searchquery = document.getElementById("search-query");

async function fetchvideo(searchquery, maxresults) {
    const response = await fetch(`${base_url}/search?key=${api_key}&q=${searchquery}&maxResults=${maxresults}&part=snippet`);
    const data = await response.json();
    return data.items;
}

async function searchfn() {
    const searchquery = document.getElementById("search-query");
    let result = await fetchvideo(searchquery.value, 50);
    return result;
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
function calculateviews(viewcount){
    let displayviews;
    let count;
    if(viewcount<1000){
        displayviews=viewcount;
    }
    else if(viewcount>=1000 && viewcount<=999999){
        displayviews=(viewcount/1000).toFixed(1)+""+"K";
    }
    else if(viewcount>=1000000){
        displayviews=(viewcount/1000000).toFixed(1)+""+"M";
    }
    return displayviews;
}
async function displaycards(items){
    videos.innerHTML = ``;
    for (let el of items) {
        let channelinfo=await channellogo(el.snippet.channelId);
        el.channelObject=channelinfo;
        let viewcount= await videostate(el.id.videoId);
        el.viewObject=viewcount;
        let subscribers=await getsubscription(el.snippet.channelId);
        el.subscriberCount=subscribers;
        let duration=await calduration(el.snippet.publishedAt);
        const div = document.createElement("div");
        div.className = "card";
        div.href=`./SelectedVideo.html?videoId=${el.id.videoId}`;
        div.innerHTML = `<img src="${el.snippet.thumbnails.high.url}">
            <div>
                <img src="${el.channelObject[0].snippet.thumbnails.high.url}" class="channel-logo">
                <div>
                    <p class="title">${el.snippet.title}</p>
                    <p class="channel-name">${el.snippet.channelTitle}</p>
                    <div>
                        <p class="views">${calculateviews(el.viewObject[0].statistics.viewCount)} views</p>
                        <p class="publish-time">${duration} ago</p>
                    </div>
                </div>
            </div>`
        videos.appendChild(div);
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
search.addEventListener("click", () => {
    videos.innerHTML = ``;
    searchfn().then((items) => {
        displaycards(items);
    })
})
const current_Url = new URLSearchParams(window.location.search);
const query = current_Url.get("search_query");
if(query!=" "){
    let q=query.replace("%"," ");
    videos.innerHTML = ``;
    fetchvideo(q, 5).then((items) => {
        console.log(items);
        displaycards(items);
    })
}
else{
    fetchvideo("", 5).then((items) => {
        displaycards(items);
    })
}

// videos.addEventListener("click",(event)=>{
//     console.log(event.target);
// })