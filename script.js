var processId;
var arrivalTime;
var burstTime;
var timeQuantum;
let processes = [];

document.getElementById("addProcess")?.addEventListener("click", function () {
    
    // Get input values

    processId = document.getElementById("pIDInpField").value;
    arrivalTime = document.getElementById("aTInpField").value;
    burstTime = document.getElementById("bTInpField").value;


    // Create new row

    var newRow = document.createElement("tr");
    newRow.innerHTML = "<td>" + processId + "</td><td>" + arrivalTime + "</td><td>" + burstTime + "</td><td></td><td></td><td></td>";

    // Append new row to the table body
    document.querySelector(".tableBody")?.appendChild(newRow);

    // Clear input fields
    document.getElementById("pIDInpField").value = "";
    document.getElementById("aTInpField").value = "";
    document.getElementById("bTInpField").value = "";

    // Add process to the processes array

    processes.push({
        processId: processId,
        arrivalTime: arrivalTime,
        burstTime: burstTime,
        remainingBurstTime: burstTime,
        completionTime: 0,
        turnAroundTime: 0,
        waitingTime: 0,
        row: newRow
    });

});

document.getElementById("go")?.addEventListener("click", function () {

    timeQuantum = document.getElementById("tQInpField").value;

    // Sort processes by arrival time

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);


    // Initialize variables
    let currTime = 0;
    let queue = processes.slice();

    while(queue.length > 0) {

        let currProcess = queue.shift();
        let goingToBeRemTime = currProcess.remainingBurstTime - timeQuantum;

        if (goingToBeRemTime <= 0) {

            currTime += currProcess.remainingBurstTime;
            currProcess.remainingBurstTime = 0;

            currProcess.completionTime = currTime;

            currProcess.turnAroundTime = currTime - currProcess.arrivalTime;

            currProcess.waitingTime = currProcess.turnAroundTime - currProcess.burstTime;

            currProcess.row.innerHTML = "<td>" + currProcess.processId + "</td><td>" + currProcess.arrivalTime + "</td><td>" + currProcess.burstTime + "</td><td>" + currProcess.completionTime + "</td><td>" + currProcess.turnAroundTime + "</td><td>" + currProcess.waitingTime + "</td>";
        } 
        
        else {

            currTime += parseInt(timeQuantum);
            currProcess.remainingBurstTime -= parseInt(timeQuantum);
            queue.push(currProcess);

        }

    }

});