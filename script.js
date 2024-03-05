var processId;
var arrivalTime;
var burstTime;
var timeQuantum;
let avgTAT = 0;
let avgWT = 0;
let processCount = 0;
let processes = [];

document.getElementById("addProcess")?.addEventListener("click", function () {

    processId = document.getElementById("pIDInpField").value;
    arrivalTime = document.getElementById("aTInpField").value;
    burstTime = document.getElementById("bTInpField").value;

    var newRow = document.createElement("tr");
    newRow.innerHTML = "<td>" + processId + "</td><td>" + arrivalTime + "</td><td>" + burstTime + "</td><td></td><td></td><td></td>";

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

    document.getElementById('go').disabled = true;
    document.getElementById('addProcess').disabled = true;

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

            if(processes[0].arrivalTime <= currTime) {
                queue.push(processes.shift());
            }

            else {
                break;
            }
        }

        if (queue.length > 0) {

            let currProcess = queue.shift();

            if (currProcess.remainingBurstTime <= timeQuantum) {

                addEntry("Time: " + currTime + " units. Process " + currProcess.processId + " is going to run for " + currProcess.remainingBurstTime + " units.", list);
            
                let temp2 = currTime + currProcess.remainingBurstTime;
            
                while (currTime != temp2) {

                    currTime++;

                    while (processes.length > 0) {

                        if (processes[0].arrivalTime <= currTime) {
                            queue.push(processes.shift());
                        } 
                    
                        else {
                            break;
                        }
                    }
                }
            
                currProcess.remainingBurstTime = 0;
                currProcess.completionTime = currTime;
                currProcess.turnAroundTime = currProcess.completionTime - currProcess.arrivalTime;
                currProcess.waitingTime = currProcess.turnAroundTime - currProcess.burstTime;

                avgTAT += parseInt(currProcess.turnAroundTime);
                avgWT += parseInt(currProcess.waitingTime);

                currProcess.row.innerHTML = "<td>" + currProcess.processId + "</td><td>" + currProcess.arrivalTime + "</td><td>" + currProcess.burstTime + "</td><td>" + currProcess.completionTime + "</td><td>" + currProcess.turnAroundTime + "</td><td>" + currProcess.waitingTime + "</td>";

                addEntry("Time: " + currTime + " units. Process " + currProcess.processId + " completly executed." + " Completion Time: " + currProcess.completionTime + " units, Turn Around Time: " + currProcess.turnAroundTime + " units, Waiting Time: " + currProcess.waitingTime + " units.", list);

            }

            else {
                
                addEntry("Time: " + currTime + " units. Process " + currProcess.processId + " is going to run for " + timeQuantum + " units.", list);

                let temp = currTime + timeQuantum;

                while (currTime != temp) {
                
                    currTime++;

                    while (processes.length > 0) {

                        if (processes[0].arrivalTime <= currTime) {
                            queue.push(processes.shift());
                        } 
                        
                        else {
                            break;
                        }
                    }
                }

                currProcess.remainingBurstTime -= timeQuantum;
                queue.push(currProcess);

                addEntry("Time: " + currTime + " units. Process " + currProcess.processId + " with remaining burst time " + currProcess.remainingBurstTime + " units. is going to be added to the queue.", list);

            }
        } 
    
        else {
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

});

function addEntry(cont, list) {
    var entry = document.createElement("li");
    entry.textContent = cont;
    list.appendChild(entry);
}

document.getElementById("reset")?.addEventListener("click", function () {
    location.reload();
});