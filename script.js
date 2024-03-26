var processId;
var arrivalTime;
var burstTime;
var timeQuantum;
let avgTAT = 0;
let avgWT = 0;
let processCount = 0;
let processes = [];
let processLog = [];

document.getElementById("addProcess")?.addEventListener("click", function () {
  processId = document.getElementById("pIDInpField").value;
  arrivalTime = document.getElementById("aTInpField").value;
  burstTime = document.getElementById("bTInpField").value;

  var newRow = document.createElement("tr");
  newRow.innerHTML =
    "<td>" +
    processId +
    "</td><td>" +
    arrivalTime +
    "</td><td>" +
    burstTime +
    "</td><td></td><td></td><td></td>";

  document.querySelector(".tableBody")?.appendChild(newRow);

  document.getElementById("pIDInpField").value = "";
  document.getElementById("aTInpField").value = "";
  document.getElementById("bTInpField").value = "";

  processes.push({
    processId: processId,
    arrivalTime: arrivalTime,
    burstTime: burstTime,
    remainingBurstTime: burstTime,
    completionTime: 0,
    turnAroundTime: 0,
    waitingTime: 0,
    row: newRow,
  });

  processCount++;
});

document.getElementById("go")?.addEventListener("click", function () {
  document.getElementById("go").disabled = true;
  document.getElementById("addProcess").disabled = true;

  let tq = document.getElementById("tQInpField")?.value;
  timeQuantum = parseInt(tq);

  document.getElementById("tQInpField").value = "";

  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let list = document.getElementById("logList");

  addEntry("Process Scheduling Using Round Robin Started.", list);

  let currTime = 0;
  let queue = [];

  while (processes.length > 0 || queue.length > 0) {
    while (processes.length > 0) {
      if (processes[0].arrivalTime <= currTime) {
        queue.push(processes.shift());
      } else {
        break;
      }
    }

    if (queue.length > 0) {
      let currProcess = queue.shift();

      if (currProcess.remainingBurstTime <= timeQuantum) {
        addEntry(
          "Time: " +
            currTime +
            " units. Process " +
            currProcess.processId +
            " is going to run for " +
            currProcess.remainingBurstTime +
            " units.",
          list
        );
        let startTime = currTime;

        let temp2 = currTime + parseInt(currProcess.remainingBurstTime);

        while (currTime != temp2) {
          currTime++;

          while (processes.length > 0) {
            if (processes[0].arrivalTime <= currTime) {
              queue.push(processes.shift());
            } else {
              break;
            }
          }
        }

        currProcess.remainingBurstTime = 0;
        currProcess.completionTime = currTime;
        currProcess.turnAroundTime =
          parseInt(currProcess.completionTime) -
          parseInt(currProcess.arrivalTime);
        currProcess.waitingTime =
          parseInt(currProcess.turnAroundTime) -
          parseInt(currProcess.burstTime);

        avgTAT += parseInt(currProcess.turnAroundTime);
        avgWT += parseInt(currProcess.waitingTime);

        currProcess.row.innerHTML =
          "<td>" +
          currProcess.processId +
          "</td><td>" +
          currProcess.arrivalTime +
          "</td><td>" +
          currProcess.burstTime +
          "</td><td>" +
          currProcess.completionTime +
          "</td><td>" +
          currProcess.turnAroundTime +
          "</td><td>" +
          currProcess.waitingTime +
          "</td>";

        addEntry(
          "Time: " +
            currTime +
            " units. Process " +
            currProcess.processId +
            " completly executed." +
            " Completion Time: " +
            currProcess.completionTime +
            " units, Turn Around Time: " +
            currProcess.turnAroundTime +
            " units, Waiting Time: " +
            currProcess.waitingTime +
            " units.",
          list
        );
        let endTime = currTime;

        let obj = {
          process: currProcess.processId,
          startTime: startTime,
          endTime: endTime,
        };

        processLog.push(obj);

      } else {
        addEntry(
          "Time: " +
            currTime +
            " units. Process " +
            currProcess.processId +
            " is going to run for " +
            timeQuantum +
            " units.",
          list
        );

        let startTime = currTime;

        let temp = currTime + timeQuantum;

        while (currTime != temp) {
          currTime++;

          while (processes.length > 0) {
            if (processes[0].arrivalTime <= currTime) {
              queue.push(processes.shift());
            } else {
              break;
            }
          }
        }

        currProcess.remainingBurstTime =
          parseInt(currProcess.remainingBurstTime) - timeQuantum;
        queue.push(currProcess);

        addEntry(
          "Time: " +
            currTime +
            " units. Process " +
            currProcess.processId +
            " with remaining burst time " +
            currProcess.remainingBurstTime +
            " units. is going to be added to the queue.",
          list
        );

        let endTime = currTime;

        let obj = {
          process: currProcess.processId,
          startTime: startTime,
          endTime: endTime,
        };

        processLog.push(obj);
        
      }
    } else {
      currTime++;
      continue;
    }
  }

  avgTAT /= processCount;
  avgWT /= processCount;

  avgTAT = Number(avgTAT.toFixed(2));
  avgWT = Number(avgWT.toFixed(2));

  var statList = document.getElementById("statList");

  var schedulingStatDiv = document.getElementById("schedulingStat");
  schedulingStatDiv.style.display = "block";

  addEntry("Time Quantum: " + timeQuantum + " units.", statList);
  addEntry("Average Turn Around Time: " + avgTAT + " units.", statList);
  addEntry("Average Waiting Time: " + avgWT + " units.", statList);

  addEntry("Process Scheduling Using Round Robin Ended.", list);

  const canvas = document.getElementById("ganttChartCanvas");
  const ctx = canvas.getContext("2d");

  let maxEndTime = 0;
  processLog.forEach((entry) => {
    if (entry.endTime > maxEndTime) {
      maxEndTime = entry.endTime;
    }
  });

  const numProcesses = Math.max(...processLog.map((entry) => entry.process));

  const barHeight = 50;
  const textMargin = 5;
  const canvasWidth = (maxEndTime + 1) * 20; // add extra space for the last process
  const canvasHeight = numProcesses * barHeight;
  const timeUnitWidth = 20; // Width of each time unit on the time axis

  canvas.width = canvasWidth;
  canvas.height = canvasHeight + 30; // Added extra height for the time axis

  ctx.fillStyle = "#f7f7f7"; // Light gray background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Draw time axis
  ctx.beginPath();
  ctx.moveTo(0, canvasHeight);
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.stroke();

  // Mark time units
  for (let time = 0; time <= maxEndTime; time++) {
    const x = time * timeUnitWidth;
    ctx.fillStyle = "black";
    ctx.fillText(time, x, canvasHeight + 20);
  }

  processLog.forEach((entry, index) => {
    const barWidth = entry.endTime - entry.startTime;
    const y = (entry.process - 1) * barHeight; // Adjusted y position based on process number
    const x = entry.startTime * timeUnitWidth; // scale factor

    ctx.fillStyle = entry.process % 2 === 1 ? "#cce5ff" : "#99ccff"; // light blue for odd processes, darker blue for even processes
    ctx.fillRect(x, y, barWidth * timeUnitWidth, barHeight);

    ctx.fillStyle = "black";
    ctx.fillText(
      `P${entry.process}`,
      x + textMargin,
      y + barHeight - textMargin
    );
  });
});

function addEntry(cont, list) {
  var entry = document.createElement("li");
  entry.textContent = cont;
  list.appendChild(entry);
}

document.getElementById("reset")?.addEventListener("click", function () {
  location.reload();
});
