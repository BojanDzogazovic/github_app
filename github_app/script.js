//variables
let input = document.getElementById("profilesearch");
let form = document.getElementById("form");
let searchBtn = document.getElementById("searchbtn");
let outputSection = document.getElementById("outputsection");
let favouriteBtn = document.getElementById("favouritebtn");
let favouritesArea = document.getElementById("badgesarea");
let newValue;
let currentStoredArray = [];
let paginationSection = document.getElementById("pagination");


//event listeners
document.addEventListener("DOMContentLoaded", () => {
    let storedFavourites = JSON.parse(localStorage.getItem("favourites"));
    if(storedFavourites !== null){
    storedFavourites.forEach(fav => {
        favouritesArea.innerHTML += 
        `
        <div class="chip">
            ${fav}
            <i class="close material-icons">close</i>
        </div>
        `;
    });
}}, true);


form.addEventListener("submit", (e) => {
    e.preventDefault();
    searchRepos(); 
}, true);

input.addEventListener("keyup", () => { 
    if(input.value != "") {
        searchBtn.disabled = false;
        favouriteBtn.disabled = false;
    } else {
        searchBtn.disabled = true;
        favouriteBtn.disabled = true;
    }
}, true);

favouriteBtn.addEventListener("click", addToFavourite, true);

favouritesArea.addEventListener("click", selectFavourite, true);
favouritesArea.addEventListener("mouseover", (e) => {
    if(e.target.classList.contains("chip")){
        e.target.style.cursor = "pointer";
    }
}, true);




//functions
async function searchRepos(url = `https://api.github.com/search/repositories?q=${input.value}`){
    outputSection.innerHTML = 
    `
    <div class="preloader-wrapper big active">
        <div class="spinner-layer spinner-blue-only">
        <div class="circle-clipper left">
            <div class="circle"></div>
        </div><div class="gap-patch">
            <div class="circle"></div>
        </div><div class="circle-clipper right">
            <div class="circle"></div>
        </div>
        </div>
    </div>
    `;

    let headers = {
        "Accept": "application/vnd.github.mercy-preview+json"
    };
    let response = await fetch(url, {
        "method": "GET",
        "headers": headers
    });

    let link = response.headers.get("link");
    let links = link.split(",");
    let paginations = links.map(link => {
        return {
            url: link.split(";")[0].replace(">", "").replace("<", ""),
            title: link.split(";")[1]
        }
    })
    let result = await response.json();
    console.log(result);

    let data = result.items;
    console.log(data);

    paginationSection.innerHTML = "";
   
    outputSection.innerHTML = "";
    data.forEach(element => {
        outputSection.innerHTML += 
           `<div class="card row">
                <div class="col m3 s12 center-align">
                    <img class="avatar" src="${element.owner.avatar_url}">
                </div>
                <div class="col m9 s12">
                    <h3 class="card-title left-align">${element.full_name}</h3> 
                    <div class="badgesgroup left-align">
                        <span class="badge amber">Forks: ${element.forks}</span>
                        <span class="badge indigo">Score: ${element.score}</span>
                        <span class="badge cyan accent-4">Language: ${element.language}</span><br>
                    </div>
                    <p class="left-align">${element.description}</p>   
                    <div class="gotos left-align">
                        <a class="gotobtn waves-effect btn red" href="${element.svn_url}" target="_blank">Go to repository <i class="small material-icons linkicon">send</i></a>
                        <a class="gotobtn waves-effect btn blue" href="${element.homepage}" target="_blank">Go to homepage <i class="medium material-icons linkicon">send</i></a>
                    </div>
                </div>
            </div>
            `;
        })  

        paginations.forEach(page => {
            let pageBtn = document.createElement("a");
            pageBtn.classList.add("waves-effect");
            pageBtn.classList.add("waves-light");
            pageBtn.classList.add("btn");
            pageBtn.classList.add("pagebutton");
            pageBtn.textContent = page.title.match(/"(\w+)"/)[1];
            pageBtn.addEventListener("click", (e) => searchRepos(page.url));
            paginationSection.appendChild(pageBtn);
        });

}

function addToFavourite() {
    if(favouriteBtn.disabled == false){
        newValue = input.value;
        let storedFavourites = JSON.parse(localStorage.getItem("favourites"));
        if(!(storedFavourites.indexOf(newValue) > -1)) {
            favouritesArea.innerHTML += 
            `
            <div class="chip">
                ${input.value}
                <i class="close material-icons">close</i>
            </div>
            `;
            M.toast({html: 'Added to favourites<i class="small material-icons">check</i>', classes: 'rounded addedtoast'});
        } else {
            M.toast({html: 'Already added<i class="small material-icons">done_all</i>', classes: 'rounded alreadytoast'});
        }
        storeFavourite("favourites", newValue);
    }

}

function selectFavourite(e){
    if(e.target.classList.contains("close")){
        let favouriteToDelete = e.target.parentElement.childNodes[0].nodeValue.trim();
        deleteFavourite("favourites", favouriteToDelete); 
        M.toast({html: 'Deleted from favourites<i class="small material-icons">check</i>', classes: 'rounded deletedtoast'});
    } else if(e.target.classList.contains("chip")){
        console.log(e.target);
        input.value = e.target.childNodes[0].nodeValue.trim();
        outputSection.innerHTML = "";
        searchRepos();
    }
    
}


//storage functions
function storeFavourite(key, newValue){
    let currentContent = localStorage.getItem(key);
    if(currentContent === null){
        currentStoredArray.push(newValue);
        localStorage.setItem(key, JSON.stringify(currentStoredArray));
    } else if(currentContent !== null) {
        currentStoredArray = JSON.parse(currentContent);
            if(!(currentStoredArray.indexOf(newValue) > -1)) {
                currentStoredArray.push(newValue);
            }
        localStorage.setItem(key, JSON.stringify(currentStoredArray));
    }
}

function deleteFavourite(key,value){
    let currentStoredArray = JSON.parse(localStorage.getItem(key));
    currentStoredArray.forEach(element => {
        if(value === element){
            currentStoredArray.splice(currentStoredArray.indexOf(element),1);
            let newArrayToStore = JSON.stringify(currentStoredArray);
            localStorage.setItem(key, newArrayToStore);
        }
    });
}


