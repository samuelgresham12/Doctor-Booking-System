// This variable holds information relating to the database
var firebaseConfig = {
    apiKey: "AIzaSyBU8BvuWIwGDZGkJi-YSonTnIrKKmv1FE0",
    authDomain: "doctor-booking-system.firebaseapp.com",
    databaseURL: "https://doctor-booking-system.firebaseio.com",
    projectId: "doctor-booking-system",
    storageBucket: "doctor-booking-system.appspot.com",
    messagingSenderId: "152039725858",
    appId: "1:152039725858:web:69e765bfc0caae93f3637b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let d = new Date();

if (d.getDate().length != 2) {
        var day = d.getDate()
        day = "0" + day;
    }
else { var day = d.getDate() }

let month = Number(d.getMonth()) + 1;

if (String(month).length != 2) {
        month = "0" + month;
    }

var todayDate = d.getFullYear() + "-" + month + "-" + day

db.collection("bookings").doc(todayDate).onSnapshot(function () {
    let t = new Date();
    document.getElementById("lastUpdated").innerHTML = "Last Updated " + parseNum(t.getHours()) + ":" + parseNum(t.getMinutes()) + ":" + parseNum(t.getSeconds());
    update();
})

function parseNum(num){
    if(num<10) num = "0" + num;
    return num;
}

// Updates the information on the page
function update () {
    //Wipe the existing data from session storage
    sessionStorage.setItem("bSc",JSON.stringify([]));
    sessionStorage.setItem("bSm",JSON.stringify([]));

    // Store the IDs and locations of each booker into session storage for future use
    db.collection("bookings").doc(todayDate).get().then((doc)=>{
        // Run through each booking for Dr Scott, and save it to Session Storage
        doc.data().bookingsScott.forEach((el,ref) => {
            let id = "bookingsScott" + ref;
            ssAdd("bSc", el)
        });
        // Run through each booking for Dr Smith, and save it to Session Storage
        doc.data().bookingsSmith.forEach((el,ref) => {
            let id = "bookingsSmith" + ref;
            ssAdd("bSm", el)
        });
        

        // Display the patient data!
        let bSm = JSON.parse(sessionStorage.getItem("bSm"));
        let bSc = JSON.parse(sessionStorage.getItem("bSc"));

        // Set a memory location for the patients
        sessionStorage.setItem("bScPat",JSON.stringify([]));
        sessionStorage.setItem("bSmPat",JSON.stringify([]))

        // Now, the patient list is loaded
        db.collection("patients").get().then((querySnapshot) => {
            // The patient list is iterated, and any patients that have a booking that day are added to SessionStorage
             querySnapshot.forEach((doc) => {
                let result = checkIfIsIn(bSm.indexOf(doc.id), bSm, doc.id)
                if(result != false){
                    for(i=0;i<result.length; i++){
                        ssAdd("bSmPat",JSON.stringify({
                            data: doc.data(),
                            index: result[i]}));
                    }
                }
                let result2 = checkIfIsIn(bSc.indexOf(doc.id), bSc, doc.id)
                if(result2 != false){
                    for(i=0;i<result2.length; i++){
                        ssAdd("bScPat",JSON.stringify({
                            data: doc.data(),
                            index: result2[i]}));
                    }
                }
             })
             display()
        })
    })
}

function checkIfIsIn(index, list, id){
    if(index == -1){
        return false
    }
    
    let matches = [];

    for(i=0;i<list.length;i++){
        if(list[i] == id){
            matches.push(i)
        }
    }
    return matches
}

// Add an item to an array in session storage
function ssAdd(loc, newEl){
    let temp = JSON.parse(sessionStorage.getItem(loc));
    temp.push(newEl);
    sessionStorage.setItem(loc, JSON.stringify(temp));
}

// Updates the page once all the data has been collected
function display () {
    for(i=0;i<18;i++){
        let pData = findPatientData(i, "scott")
        placeBookingButton("scottBookings" + i,pData);
    }
    for(i=0;i<18;i++){
        let pData = findPatientData(i, "smith")
        placeBookingButton("smithBookings" + i,pData);
    }
}

// Just a shorthand JQuery-like function
function $(x){return document.getElementById(x)}

// Physically places the button on the page.
function placeBookingButton (idToPlace, idOfPatient){
    if(idOfPatient === "false"){
        idOfPatient = "No Booking"
    }
    let x = document.createElement("button")

    x.style = "width: 100%; "
    x.onclick = function () {loadData(idOfPatient)}
    x.innerHTML = idOfPatient
    $(idToPlace).appendChild(x)
} 

// Finds patient data
function findPatientData(time, doctor) {

    if(doctor == "smith"){
        // I honestly don't know why, but it needs to be JSON parsed twice, but only sometimes
        var patients = doubleParse(sessionStorage.getItem("bSmPat"));
    } else if (doctor == "scott") {
        var patients = doubleParse(sessionStorage.getItem("bScPat"));
    }

    let found = false;

    patients = makeArray(patients)

    patients.forEach(item => {
        if (item.index == time) {
            found = item.data;
            //return (item.data.firstName + " " + item.data.lastName)
        }
    });
    if (found == false) {
        var output = structureTime(time) + ": No Booking"
    }
    else {
        var output = structureTime(time) + ": " + found.firstName + " " + found.lastName
    }

    return output
}

// Sometimes the data needs to be parsed once, sometimes twice. I guess some things we will never know about this universe. Are we alone?
function doubleParse (JSONstring) {
    JSONstring = JSON.parse(JSONstring);

    try {
        // If it works and doesnt throw an error, then it's parsed again!
        JSONstring = JSON.parse(JSONstring);
        return JSONstring;
    } catch {
        // Otherwise, we just return the once-parsed string!
        if(Array.isArray(JSONstring) && JSONstring.length>0) {
            for(var i=0;i<JSONstring.length;i++){
                JSONstring[i] = JSON.parse(JSONstring[i])
            }
        } return JSONstring;
    }

}

// If something isnt an array because JS hates me, then its made into one. I know, this is terrible code but it works ok.
function makeArray (item) {
    if(Array.isArray(item)){
        return item;
    }
    else {
        return [item, ""]
    }
}

function structureTime (rawTime) {
    rawTime = (rawTime+16)/2
    if(parseInt(rawTime)!=rawTime){
        rawTime = parseInt(rawTime) + ":30";
    }else{rawTime = rawTime + ":00"}
    return rawTime
}

function loadData (name) {
    alert(name)
} 