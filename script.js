// rare: room: points
const requiredPoints = {
  SSR: {
    1: 18000,
    2: 36000,
    3: 71500,
    4: 106000,
    5: 177000 },

  SR: {
    1: 16000,
    2: 32000,
    3: 62500,
    4: 62500,
    5: 96000 },

  R: {
    1: 8000,
    2: 15000,
    3: 30500,
    4: 30500,
    5: 46000 } };



const perQuestPoint = 1600;

function generateTimeString(intimicyAP) {
  let day = Math.floor(intimicyAP / 144);
  let hour = Math.floor(intimicyAP % 144 / 6);
  let min = intimicyAP % 6 * 10;

  let string = "";

  if (day > 0) {
    string += `${day}天`;
  }
  if (hour > 0) {
    string += `${hour}小時`;
  }
  string += `${min}分`;

  return string;
}

function calNeedPoints(rare, room, percentage) {
  if (!rare in requiredPoints) {
    return {};
  }

  let result = {};
  for (let key in requiredPoints[rare]) {
    // for room1, 100%
    if (key < room || key == room && percentage == 100) {
      continue;
    } else if (key == room) {
      // round to 100
      let currentPoints =
      Math.round(requiredPoints[rare][key] * percentage / 10000) * 100;
      result[key] = requiredPoints[rare][key] - currentPoints;
    } else {
      result[key] = requiredPoints[rare][key];
    }
  }
  return result;
}

document.querySelector("#cal-button").addEventListener("click", function () {
  let rare = document.querySelector("#rare").value;
  let room = document.querySelector("#room").value;
  let percentage = Math.min(
  Math.max(document.querySelector("#percentage").value, 0),
  100);


  let needPoints = calNeedPoints(rare, room, percentage);

  let gifts = Array.from(document.querySelectorAll(".gift")).map(x => {
    return {
      point: parseInt(x.getAttribute("data-point")),
      amount: Math.max(parseInt(x.value) || 0, 0) };

  });
  let total = gifts.reduce((a, x) => a + x.point * x.amount, 0);

  // calculate after needPoints and used points.
  let predictNeedPoints = {};
  let predictUsedPoints = 0;
  for (const [key, value] of Object.entries(needPoints)) {
    if (total >= value) {
      total = total - value;
      predictUsedPoints += value;
    } else {
      predictNeedPoints[key] = value - total;
      predictUsedPoints += total;
      total = 0;
    }
  }

  // resultA
  let resultA = document.querySelector("#result-a");
  if (predictUsedPoints > 0 && Object.keys(needPoints).length > 0) {
    resultA.classList.remove("none");

    let finalRoom = 5;
    let finalPercentage = 100;
    let keys = Object.keys(predictNeedPoints);
    if (keys.length > 0) {
      finalRoom = keys[0];
      finalPercentage =
      Math.round(
      (requiredPoints[rare][finalRoom] - predictNeedPoints[finalRoom]) *
      10000 /
      requiredPoints[rare][finalRoom]) /
      100;
    }

    let usedPoints = predictUsedPoints;
    let intimicyAP = 0;
    for (const value of gifts.slice().reverse()) {
      let needCount = Math.floor(usedPoints / value.point);
      let usedCount = Math.min(needCount, value.amount);
      usedPoints -= usedCount * value.point;

      if (value.point != 2000) {
        intimicyAP += usedCount;
      }
    }

    let time = generateTimeString(intimicyAP);

    document.querySelector("#result-a-room").innerText = finalRoom;
    document.querySelector("#result-a-percentage").innerText = finalPercentage;
    document.querySelector("#result-a-time").innerText = time;
  } else if (resultA.classList.contains("none") == false) {
    resultA.classList.add("none");
  }

  // resultB
  let resultB = document.querySelector("#result-b");
  if (Object.keys(predictNeedPoints).length > 0) {
    resultB.classList.remove("none");

    // clear all
    while (resultB.rows.length > 1) {
      resultB.deleteRow(-1);
    }

    for (const [key, value] of Object.entries(predictNeedPoints)) {
      let newRow = resultB.insertRow();
      newRow.insertCell().innerText = key;
      newRow.insertCell().innerText = value;
      newRow.insertCell().innerText = Math.ceil(value / perQuestPoint);
    }
  } else {
    resultB.classList.add("none");
  }
});