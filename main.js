let coins = [];
let cardContent = "";
let myCheckedArray = [];
let coinsArrayForLiveChart = {};
let limitCoinsObject;

let coinsData = [];
let coinsPriceGraphArray = [[], [], [], [], []];
let chart;
let myInterval;

let moreDataOBJ;

let filter = {
  searchText: "",
};

let allCoinsURL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`;

let MoreInfoURL = `https://api.coingecko.com/api/v3/coins/`;


function navigationClicked(index) {
  navHome.className = index === 0 ? "nav-link active" : "nav-link";
  navLive.className = index === 1 ? "nav-link active" : "nav-link";
  navAbout.className = index === 2 ? "nav-link active" : "nav-link";

  if (index == 1) {
    $("#coinsSec").hide();
    $("#aboutMeSec").hide();
    $("#LiveReportsSec").css("visibility", "visible");
  } else {
    $("#coinsSec").hide();
    $("#LiveReportsSec").css("visibility", "hidden");
    $("#aboutMeSec").hide();
    index == 0 ? $("#coinsSec").show() : $("#aboutMeSec").show();
  }
}

function localStorageFavoriteCoins() {
  let favorites = localStorage.getItem("favorite Coins");
  favorites = JSON.parse(favorites);
  if (favorites != undefined) {
    myCheckedArray = favorites;
  }
}


function getByAjax(url, type_data, myCallback) {
  $.ajax({
    type: "GET",
    datatype: "json",
    async: type_data == 1 ? true : false,
    url: url,
    beforeSend: function () {
      if (type_data == 1) {
        $("#progressBar").css("display", "block");
      }
    },
    success: function (result) {
      switch (type_data) {
        case 1:
          localStorageFavoriteCoins();
          createDataChart();
          myCallback(result, myCheckedArray);
          break;
        case 2:
            coinsArrayForLiveChart = { ...result };
            myCallback == fillForLoop ? myCallback(result) : null;
          break;
      }
    },
    complete: function () {
      if (type_data == 1) {
        $("#progressBar").css("display", "none");
      }
    },

    error: function (error) {
      console.log("error : ", error);
      $("#needToReload").css("display", "block");
    },
  });
}

getByAjax(allCoinsURL, 1, printCoins);

const renderCoins = function (coins, filters) {
  const filteredCoins = coins.filter(function (coin) {
    return coin.symbol.toLowerCase().includes(filters.searchText.toLowerCase());
  });

  document.getElementById("cardDV").innerHTML = "";
  cardContent = "";
  filteredCoins.map((coin, i) => printSingleCoin(coins, coin, i, myCheckedArray));
  cardDV.innerHTML = cardContent;
};

document.getElementById("searchFields").addEventListener("input", function (e) {
  filter.searchText = e.target.value;

  renderCoins(coins, filter);
});

function printCoins(result, myCheckedArray) {
  coins = [...result];
  console.log("Coins Array: ", coins);
  cardContent = "";

  coins.map((coin, i) => printSingleCoin(coins, coin, i, myCheckedArray));

  cardDV.innerHTML = cardContent;
}


function printSingleCoin(coins, singleCoin, i, myCheckedArray) {
  let isChecked = myCheckedArray.some((item) => item.name === singleCoin.name) ? "checked" : "unchecked";
  cardContent += `
   <div id="theCoinCol" class="col-lg-4 col-md-4 col-sm-6 col-12">
        <div class="container p-2 m-2 container p-2 mx-auto rounded coins-cards">
            <div class="row">
                <div class="col-7 col-md-7 col-lg-8">
                    <h6>${singleCoin.name}</h6>
                </div>
                <div class="col-5 col-md-5 col-lg-4">
                    <div class="form-check form-switch">
                    
                        <label class="form-check-label" for="my-switch">
                            <input class="form-check-label" id="my-switch" type="checkbox" name="favCheck"  ${isChecked} onclick="onlyFiveCheckBox(coins[${i}],${i})" />
                          
                        </label>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <p>${singleCoin.symbol}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-7 col-md-7 col-lg-8">
                    <p>
                      <a onclick="moreInfo('${singleCoin.id}')" class="btn btn-dark" data-bs-toggle="collapse" href="#${singleCoin.symbol}" role="button" aria-expanded="false" aria-controls="${singleCoin.symbol}">More Info</a>
                    </p>
                    
                </div>
                <div class="col-5 col-md-5 col-lg-4">
                    <img src="${singleCoin.image}" id="img${singleCoin.symbol}" class="currencyImg  mx-auto" alt="${singleCoin.id}-img">
                </div>
            </div>
            <div class="row">
                <div class="collapse" id="${singleCoin.symbol}">
                    <div class="card card-body" id="${singleCoin.name}">
                                
                    </div>
                </div>
            </div>
        </div>
    </div> `;
}

function onlyFiveCheckBox(singleCoin, indexFromAll) {
  let favoriteCheck = document.getElementsByName("favCheck");
  favoriteCheck[indexFromAll].onchange = function () {
    if ($(this).prop("checked") == true) {
      if (myCheckedArray.length < 5) {
        myCheckedArray.push(singleCoin);
        localStorage.setItem("favorite Coins", JSON.stringify(myCheckedArray));
        createDataChart();
      } else {
        limitCoinsObject = singleCoin;
        openModal(myCheckedArray);
        this.checked = false;
      }
    } else if ($(this).prop("checked") == false) {
        myCheckedArray.splice(
            myCheckedArray.findIndex((item) => item.name === singleCoin.name),
        1
      );
      localStorage.setItem("favorite Coins", JSON.stringify(myCheckedArray));
      createDataChart();
    }
  };
}

function openModal(myCheckedArray) {
  let theModal = "";
  cardContent = "";
  theModal = `
  <div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Select a currency to delete </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
             <div class="row" id="dropDiv"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="updateModal" disabled  onclick="updateFavorites(myCheckedArray, limitCoinsObject)" data-bs-dismiss="modal">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  `;
  modalDIV.innerHTML = theModal;
  myCheckedArray.map((singleCoin, i) => printSingleFavoriteToModal(singleCoin, i));
  dropDiv.innerHTML = cardContent;
  var myModal = new bootstrap.Modal(document.getElementById("myModal"), focus);
  myModal.show();
}

function printSingleFavoriteToModal(singleCoin, i) {
  cardContent += `
        <div class="col-6">
          <div class="container p-2 m-2 rounded coins-cards">
            <div class="row">
                <div class="col-7 col-md-7 col-lg-8">
                  <h6>${singleCoin.name}</h6>
                </div>
                <div class="col-5 col-md-5 col-lg-4">   
                  <input type="radio" onclick="countChecked();" value="${singleCoin.name}" name="favCheck-modal"/>
                </div>
            </div>
            <div class="row">
                <div class="col-7 col-md-7 col-lg-8">
                  <p>${singleCoin.symbol}</p>  
                </div>
                <div class="col-5 col-md-5 col-lg-4">
                    <img src="${singleCoin.image}" class="currencyImgModal  mx-auto d-block" alt="${singleCoin.id}-img">
                </div>
            </div>  
          </div>
        </div>
        `;
}

function countChecked() {
  document.getElementById("updateModal").removeAttribute("disabled");
}

function updateFavorites(myCheckedArray, limitCoinsObject) {
  let allRadio = document.getElementsByName("favCheck-modal");

  let unfavoriteCoinToDelete;
  for (let i = 0; i < allRadio.length; i++) {
    if (allRadio[i].checked) {
      unfavoriteCoinToDelete = allRadio[i].value;
    }
  }
  myCheckedArray.splice(
    myCheckedArray.findIndex((item) => item.name === unfavoriteCoinToDelete),
    1
  );
  myCheckedArray.push(limitCoinsObject);
  localStorage.setItem("favorite Coins", JSON.stringify(myCheckedArray));

  document.getElementById("cardDV").innerHTML = "";
  cardContent = "";
  coins.map((coin, i) => printSingleCoin(coins, coin, i, myCheckedArray));
  cardDV.innerHTML = cardContent;
  createDataChart();
}

function moreInfo(id) {
  let moreInfoFromLocal = localStorage.getItem(`${id}-prices`);
  moreInfoFromLocal = JSON.parse(moreInfoFromLocal);
  if (moreInfoFromLocal != undefined) {
    printMoreDetails(moreInfoFromLocal);
  } else {
    getByAjax(MoreInfoURL + id, 1, printMoreDetails);
  }
}

function printMoreDetails(result) {
  moreDataOBJ = { ...result };

  let doesItExist = localStorage.getItem(`${moreDataOBJ.id}-prices`);

  doesItExist == undefined ? localStorage.setItem(`${moreDataOBJ.id}-prices`, JSON.stringify(moreDataOBJ)) : doesItExist;
  var logoutTimer = setTimeout(function () {
    localStorage.removeItem(`${moreDataOBJ.id}-prices`);
  }, 15000);

  var myCollapsible = document.getElementById(`${moreDataOBJ.symbol}`);
  myCollapsible.addEventListener("hide.bs.collapse", function () {
    document.getElementById(`img${moreDataOBJ.symbol}`).style.display = "none";
  });

  myCollapsible.addEventListener("show.bs.collapse", function () {
    document.getElementById(`img${moreDataOBJ.symbol}`).style.display = "block";
  });
  let moreData = "";
  moreData = `
    <div> EUR: ${moreDataOBJ.market_data.current_price.eur}&#8364;</div>
    <div> USD: ${moreDataOBJ.market_data.current_price.usd}&dollar; </div>
    <div> ILS: ${moreDataOBJ.market_data.current_price.ils}&#8362; </div>
        `;
  document.getElementById(`${moreDataOBJ.name}`).innerHTML = moreData;
}

function createChart() {
  console.log("coins results");

  chart = new CanvasJS.Chart("chartContainer", {
    exportEnabled: true,
    animationEnabled: true,
    title: {
      text: "Live Reports of Favorite",
    },
    subtitles: [
      {
        text: "Click Legend to Hide or Unhide Data Series",
        fontFamily: "verdana",
      },
    ],
    axisX: {
      title: "Time",
    },
    axisY: {
      title: "Profit in USD",
      titleFontColor: "#4F81BC",
      lineColor: "#4F81BC",
      labelFontColor: "#4F81BC",
      tickColor: "#4F81BC",
    },
    toolTip: {
      shared: true,
    },
    legend: {
      cursor: "pointer",
      itemclick: function (e) {
        if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
      },
    },

    data: coinsData,
  });

  createDataChart();
  chart.render();
}

createChart();

function createDataChart() {
  let infoOfCoin = {};
  coinsData.length = 0;
  coinsPriceGraphArray.map((coin_num) => (coin_num.length = 0));
  clearInterval(myInterval);

  if (myCheckedArray.length > 0) {
    $(".empty-chart").css("display", "none");
    $(".isCoinExist").css("display", "block");
    fillFirstFive();
    myCheckedArray.map((coin, index) => {
      infoOfCoin = {
        type: "spline",
        name: coin.symbol,
        showInLegend: true,
        xValueFormatString: "HH mm ss",
        yValueFormatString: "#,##0 Units",
        dataPoints: coinsPriceGraphArray[index],
      };
      coinsData.push(infoOfCoin);
    });
    getValueOfCoin();
  } else {
    $(".empty-chart").css("display", "block");
    $(".isCoinExist").css("display", "none");
  }

  chart.render();
}

function fillFirstFive() {
  let strCoins = "";
  strCoins += myCheckedArray.map((coin) => coin.symbol.toUpperCase()) + ",";
  let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${strCoins}&tsyms=USD`;
  getByAjax(url, 2, fillForLoop);
}

function fillForLoop() {
  for (let i = 5; i >= 0; i--) {
    myCheckedArray.map((coin, index) => {
      val = {
        x: new Date(Date.now() - i * 2000),
        y: coinsArrayForLiveChart[coin.symbol.toUpperCase()].USD,
      };
      coinsPriceGraphArray[index].push(val);
    });
  }
}

function getValueOfCoin() {
  let val = {};
  myInterval = setInterval(function () {
    let strCoins = "";
    strCoins += myCheckedArray.map((coin) => coin.symbol.toUpperCase()) + ",";
    let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${strCoins}&tsyms=USD`;
    getByAjax(url, 2);

    myCheckedArray.map((coin, index) => {
      val = {
        x: new Date(),
        y: coinsArrayForLiveChart[coin.symbol.toUpperCase()].USD,
      };
      if (coinsPriceGraphArray[index].length > 10) {
        coinsPriceGraphArray[index].shift();
      }
      coinsPriceGraphArray[index].push(val);
    });

    chart.render();
  }, 2000);
}

function updatePageURL() {
  let url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`;

  getByAjax(url, 1, printCoins);
}