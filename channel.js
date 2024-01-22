const base_url = "https://www.googleapis.com/youtube/v3";
const api_key = "AIzaSyAKJl_BIuNBOerBYJ-inxLN2_Ynahh8sOw";
const playlistArea = document.getElementById("playlist-area");
const menuOptions = document.getElementsByClassName("channel-toolbar-options");
const search = document.getElementById("search-btn");
let channelSection;
let selectedVideoInfo;
const videoinfostr = sessionStorage.getItem("selectedVideoInformation");
if (videoinfostr) {
    selectedVideoInfo = JSON.parse(videoinfostr);
}
function displaychannelInfo(data) {
    const bannerImg = document.getElementById("banner-img");
    const channel_logo = document.getElementById("channel-logo");
    const channel_name = document.getElementById("channel-name");
    const subs = document.getElementById("subs-count");
    channel_logo.src = `${data[0].snippet.thumbnails.high.url}`
    channel_name.innerHTML = `${data[0].snippet.title}`;
    subs.innerHTML = `${calculateLikes(data[0].statistics.subscriberCount)} subscribers`;
}
async function playlist(channelid) {
    try {
        const response = await fetch(`${base_url}/channelSections?part=snippet%2CcontentDetails&channelId=${channelid}&key=${api_key}`);
        const data = await response.json();
        return data.items;
        // playlistinfo(channelid, data.items);
    } catch (error) {
        console.log(error);
    }
}
async function channelSectionInfo() {
    channelSection = await playlist(selectedVideoInfo.channelID);
}
async function playlistinfo(channelid) {
    // console.log(data);
    const data = await playlist(channelid);
    for (let el of data) {
        if (el.contentDetails && el.contentDetails.playlists) {
            const div = document.createElement("div");
            div.className = "playlist";
            div.innerHTML = `
            <div class="playlist-header">
                <p class="playlist-head">Playlists</p>
            </div>
            <div class="playlist-videos"> 
            </div>`
            playlistArea.appendChild(div);
            try {
                const response = await fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&playlistId=${el.contentDetails.playlists[0]}&key=${api_key}`);
                const data = await response.json();
                let playlistVideos = document.getElementsByClassName("playlist-videos");
                let parent = playlistVideos[playlistVideos.length - 1];
                displayplaylist(parent,data.items);
                // console.log(data);
            } catch (error) {
                console.log(error);
            }
        }
    }
}
async function displayplaylist(parent,data) {
    // console.log(data);
    for (let el of data) {
        let temp_videoid;
        if(el.snippet && el.snippet.resourceId && el.snippet.resourceId.videoId){
            temp_videoid=el.snippet.resourceId.videoId;
        }
        else if(el.id && el.id.videoId){
            temp_videoid=el.id.videoId;
        }
        el.viewObject = await videostate(temp_videoid);
        el.channelObject = await channellogo(el.snippet.channelId);
        let duration = await calduration(el.snippet.publishedAt);
        el.subscriberCount = await getsubscription(el.snippet.channelId);
        let curr_views=0;
        let img_src;
        if (el.viewObject[0] && el.viewObject[0].statistics && el.viewObject[0].statistics.viewCount) {  
            curr_views =calculateLikes(el.viewObject[0].statistics.viewCount)
        }
        if(el.snippet && el.snippet.thumbnails && el.snippet.thumbnails.high && el.snippet.thumbnails.high.url){
            img_src=el.snippet.thumbnails.high.url;
        }
        // let playlistVideos = document.getElementsByClassName("playlist-videos");
        // let parent = playlistVideos[playlistVideos.length - 1];
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
        <img src="${img_src}">
        <div class="card-info">
            <p class="card-title">${el.snippet.title}</p>
            <div>
                <p class="card-channel-name">${el.snippet.channelTitle}</p>
                    <div class="card-status">
                        <p class="card-views">${curr_views} views</p>
                        <p class="card-duration">${duration} ago</p>
                    </div>
            </div>
        </div>`;
        parent.appendChild(div);
    }
}

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
async function calduration(publisheddate) {
    let displaytime;
    let publishedat = new Date(publisheddate);
    let miliSecFromPublished = publishedat.getTime();
    let currenttime = new Date();
    let currentTimeInMiliSec = currenttime.getTime();
    let duration = currentTimeInMiliSec - miliSecFromPublished;
    let days = parseInt(duration / 86400000);
    if (days < 1) {
        let hours = parseInt(duration / 3600000);
        displaytime = hours + " " + "hours";
    }
    else if (days > 6 && days <= 29) {
        let weeks = parseInt(days / 7);
        displaytime = weeks + " " + "weeks";
    }
    else if (days > 29 && days <= 364) {
        let months = parseInt(days / 30);
        displaytime = months + " " + "months";
    }
    else if (days > 364) {
        let years = parseInt(days / 365);
        displaytime = years + " " + "years";
    }
    else {
        displaytime = days + " " + "days";
    }
    return displaytime;
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
async function getsubscription(channelid) {
    let response = await fetch(`${base_url}/channels?key=${api_key}&id=${channelid}&part=statistics`);
    let data = await response.json();
    return data.items;
}
async function channelInfo(channelid) {
    let response = await fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${channelid}&key=${api_key}`);
    let data = await response.json();
    displaychannelInfo(data.items);
}
async function channelVideos(channelid){
    let response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelid}&maxResults=50&key=${api_key}`);
    let data = await response.json();
    console.log(data.items);
    displayplaylist(playlistArea,data.items);
}
// playlist(selectedVideoInfo.channelID);
// channelSectionInfo();
channelInfo(selectedVideoInfo.channelID);
playlistinfo(selectedVideoInfo.channelID);
channelSectionInfo();
for (let el of menuOptions) {
    el.addEventListener("click", optionDisplay)
}
function optionDisplay() {
    let active_el=document.getElementsByClassName("active");
    active_el[0].classList.remove("active");
    this.classList.add("active");
    if (event.target.innerHTML == "HOME") {
        playlistArea.innerHTML = ``;
        playlistinfo(selectedVideoInfo.channelID);
    }
    else if (event.target.innerHTML == "CHANNELS") {
        playlistArea.innerHTML = ``;
        findOtherchannels();
    }
    else if(event.target.innerHTML == "VIDEOS"){
        playlistArea.innerHTML=``;
        playlistArea.id="videos-area";
        channelVideos(selectedVideoInfo.channelID);
    }
    else if(event.target.innerHTML == "ABOUT"){
        playlistArea.innerHTML=``;
        playlistArea.id="about";
        displayChannelAbout(selectedVideoInfo.channelID);
    }
}
function findOtherchannels(){
    const div=document.createElement("div");
    div.className="other-channel-area";
    // console.log(div);
    playlistArea.appendChild(div);
    for(let el of channelSection){
        if(el.contentDetails && el.contentDetails.channels){
            displayOtherChannels(div,el.contentDetails.channels);
        }
    }
}
async function displayOtherChannels(parent,data){
    for(let el of data){
        let channelObject = await channellogo(`${el}`);
        let subsObject = await getsubscription(`${el}`);
        // console.log(channelObject);
        // console.log(subsObject);
        const div=document.createElement("div");
        div.className="other-channel";
        div.channelObject = await channellogo(`${el}`);
        let subs_count=0;
        subs_count = calculateLikes(subsObject[0].statistics.subscriberCount);
        console.log(div);
        div.innerHTML=`
        <img src="${channelObject[0].snippet.thumbnails.high.url}">
            <div class="other-channel-detail">
                <p class="other-channel-name">${channelObject[0].snippet.title}</p>
                <p class="other-channel-subs">${subs_count} subscribers</p>
            </div>
            <p class="other-channel-subscribe-btn">Subscribe</p>
        `;
        parent.appendChild(div);
    }
}
function joindate(date){
    let res="";
    const month = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
    const joindate = new Date(date);
    const joinyear = joindate.getFullYear();
    const joinmonth = month[joindate.getMonth()];
    const joinday = joindate.getDate();
    res=joinmonth+" "+joinday+","+joinyear;
    return res;
}
async function displayChannelAbout(channelid){
    let channelObj = await channellogo(channelid);
    let subsObj = await getsubscription(channelid);
    let parent=document.getElementById("about");
    let date = joindate(channelObj[0].snippet.publishedAt);
    console.log(channelObj);
    console.log(subsObj);
    parent.innerHTML=`
    <div class="desc">
        <div class="desc-header">Description</div>
        <div class="desc-contain">
            ${channelObj[0].snippet.description}
        </div>
    </div>
    <div class="stats">
        <p class="stats-header">Stats</p>
        <p class="join-date">Joined ${date}</p>
        <p class="views-count">${subsObj[0].statistics.viewCount} views</p>
    </div>`
}

search.addEventListener("click", () => {
    const searchquery = document.getElementById("search-query");
    window.location.href=`./index.html?search_query=${searchquery.value}`;
})