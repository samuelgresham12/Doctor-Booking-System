/*
--     Doctor Script     --
 - Doctor Booking System -

Contains all scripting for the doctor module of Doctor Booking System.
*/



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

// Fetch the date
let d = new Date();

// If the date's length is <2, then concat a 0 to the start
if (String(d.getDate()).length != 2) {
        var day = d.getDate()
        day = "0" + day;
    }
else { var day = d.getDate() }

// Make the month number 1-based rather than 0-based
let month = Number(d.getMonth()) + 1;

// If the month's length is <2, then concat a 0 to the start
if (String(month).length != 2) {
        month = "0" + month;
    }

// Create the correct date format for database access.
// Stores it as a global var so that it can be accessed inside following modules.
var todayDate = d.getFullYear() + "-" + month + "-" + day

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.collection("patients").doc(document.getElementById("DBREFCODE").value).onSnapshot(function () {
    loadPatientData(document.getElementById("DBREFCODE").value,0)
})

// Clears the session storage when the page is loaded
function clearSS() {
    sessionStorage.removeItem('doctor');
}

db.collection("bookings").doc(todayDate).onSnapshot(function (doc) { 
    if(sessionStorage.getItem("doctor") == "Dr Smith") {
        loadBookings("bookingsSmith");
    }
    else if (sessionStorage.getItem("doctor") == "Dr Scott") {
        loadBookings("bookingsScott");
    }
 })

// Is run upon doctor name selection
function loadDoctorData() {
    $("loginPage").style = "display:none;"
    $("mainPage").style = "display:block;"
    let dName = document.getElementById("docs").value;
    if(dName == "sm") {
        document.getElementById("mainTitle").innerHTML += " - Dr Smith"
        sessionStorage.setItem("doctor", "Dr Smith") // Store the name of the doctor in session storage
        loadBookings("bookingsSmith");
    }
    else {
        document.getElementById("mainTitle").innerHTML += " - Dr Scott"
        sessionStorage.setItem("doctor", "Dr Scott")
        loadBookings("bookingsScott");
    }
}

// Takes the doctor's DB reference and loads their respective bookings into the HTML body.
function loadBookings(dbReference) {

    db.collection("bookings").doc(todayDate).get().then((doc)=>{
        // For each booking, place a button down
        for(let i=0;i<doc.data()[dbReference].length;i++){
            document.getElementById(i).innerHTML = "loading...";
            let button = document.createElement("button");
            button.innerHTML = structureTime(i) + " " + createButtonContent(doc.data()[dbReference][i])
            button.style='width:100%;' + colourButton(doc.data()[dbReference][i])
            button.onclick = function() {loadPatientData(doc.data()[dbReference][i], i)}
            document.getElementById(i).innerHTML = "";
            document.getElementById(i).appendChild(button);
        }
    }).then(()=>{document.getElementById("selArea").innerHTML = "Logged In!"})
}

// A quick function which generates the button content. Can be changed if the patient name is to be displayed (will add lots of latency!)
function createButtonContent(booking){
    if(booking=="false"){
        return "No Booking"
    } else {
        return "Booked"
    }
}

// Determines the button CSS based on the booking status at that time.
function colourButton (booking) {
    if(booking=="false"){
        return 'color: red'
    } else {
        return "color: green"
    }
}

// Takes an array index and turns it into the correct time
// i.e. 0 --> 8:00
//     17 --> 4:30 
function structureTime (rawTime) {
    rawTime = (rawTime+16)/2
    if(parseInt(rawTime)!=rawTime){ // If it isnt an integer, then it is at half past the hour
        rawTime = parseInt(rawTime) + ":30";
    }else{rawTime = rawTime + ":00"} // Otherwise, it is on the hour
    return rawTime
}

// jQuery-like shorthand function 
function $ (x) {return document.getElementById(x)}

// Takes the patient's DB id code and their position in the list and loads their data into the fields
function loadPatientData (patientID, listPos) {

    if(patientID == "none") {
        return;
    }

    // If the selected booking is empty (i.e. no booking exists), make everything blank
    if(patientID == "false"){
        $("bookingTime").value = structureTime(listPos);
        $("bookingDoctor").value = ""

        $("DBREFCODE").value = "none"
        $("patientFirst").value = ""
        $("patientLast").value = ""
        $("patientSex").value = ""
        $("privateHealthStatus").value = ""
        $("bookingPresent").style = ""
        $("bookingPresent").value = ""


        $("medNotesContainer").innerHTML = ""
    }
    // If a legitimate booking is selected, load the data
    else {
            // Fetch the data from the DB and load into the DOM
            db.collection("patients").doc(patientID).get().then((doc)=>{
                $("bookingTime").value = structureTime(listPos);
                $("bookingDoctor").value = sessionStorage.getItem("doctor")

                $("DBREFCODE").value = doc.id;
                $("patientFirst").value = doc.data().firstName
                $("patientLast").value = doc.data().lastName
                $("patientSex").value = doc.data().sex
            
            // Quickly format the sex input (blue=male, pink=female, green=other/notstated)
                if($("patientSex").value.toLowerCase() == "male") {
                    $("patientSex").style = 'color: blue;'
                } else if ($("patientSex").value.toLowerCase() == "female") {
                    $("patientSex").style = 'color: pink;'
                } else {
                    $("patientSex").style = 'color: green;'
                }

                // Quickly format for private health status. 
                if(doc.data().privateHealthProvider == "") {
                    $("privateHealthStatus").value = "No Provider"
                    $("privateHealthStatus").style = "color: red"
                } else {
                    $("privateHealthStatus").value = "Has Private Health (" + doc.data().privateHealthProvider + ")"
                    $("privateHealthStatus").style = "color: green"
                }

            
    }).then(()=>{
        // The below code checks whether the patient is present in the clinic
            // Another DB call is required, since another collection needs to be called
            db.collection("patients").doc("presentClients").get().then((doc) => {
                if(doc) {
                    let dLen = doc.data().list.length;
                    found = false;
                    for(let a = 0; a < dLen; a++) {
                        if(doc.data().list[a] == $("DBREFCODE").value) {
                            found = true;
                        }
                    }
                }
            }).then(() => { // Once the data is fetched, then formatting can be applied
                $("bookingPresent").value = found;
                if(found){ // If they are present:
                    $("bookingPresent").style += ";border-color:green;color:green;"
                } else { // Otherwise:
                    $("bookingPresent").style += ";border-color:red;color:red;"
                }
            })
        // Once the data is loaded into the body, then load the patient's past medical notes
        loadMedicalNotes(patientID)
    })}
}

// Loads the medical notes for the patient in chronological order, unfiltered
function loadMedicalNotes(ID) {
    // If the booking is empty, do leave blank
    if(ID=="false") {
        $("medNotesContainer").innerHTML = ""
    }
    else {
    // Fetch the notes
    db.collection("patients").doc(ID).get().then((doc) => {
        $("medNotesContainer").innerHTML = ""
        // If the length of the array is 0 (hence, no notes exist), display a message
        if(doc.data().medicalNotes.length == 0) {
            $("medNotesContainer").innerHTML = "<i>No Prior Medical Notes Found...</i>"
        } else {
            // Otherwise, go through each medical note and place it in the DOM
            doc.data().medicalNotes.forEach((element, index) => {
                let x = document.createElement("div");
                let title = document.createElement("h4");
                let symptoms = document.createElement("p");
                let diagnosis = document.createElement("p");
                let treatments = document.createElement("p");
                title.innerHTML = doc.data().medicalNotes[index].datetime + "<br>"
                symptoms.innerHTML = "<b>Symptoms: </b>"+doc.data().medicalNotes[index].symptoms
                diagnosis.innerHTML = "<b>Diagnosis: </b>"+doc.data().medicalNotes[index].diagnosis
                treatments.innerHTML = "<b>Treatment: </b>"+doc.data().medicalNotes[index].treatments
                x.style.border = "thin solid black"
                x.appendChild(title)
                x.appendChild(symptoms)
                x.appendChild(diagnosis)
                x.appendChild(treatments)
                $("medNotesContainer").appendChild(x)
            });
        }
    })
}
}

// This routine is run when 
function saveNotes () {
    let d = new Date;
    let dateTime = todayDate + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
    let symptoms = $("patientNotesArea-Symptoms").value;
    let diagnosis = $("patientNotesArea-Diagnosis").value;
    let treatments = $("patientNotesArea-Treatments").value;

    db.collection("patients").doc($("DBREFCODE").value).get().then((doc)=>{
        let arr = doc.data().medicalNotes
        arr.push({
            datetime: dateTime,
            symptoms: symptoms,
            diagnosis: diagnosis,
            treatments: treatments
        })

        db.collection("patients").doc($("DBREFCODE").value).update({
            medicalNotes: arr
        }).then (() => {
            $("patientNotesArea-Symptoms").value = "";
            $("patientNotesArea-Diagnosis").value = "";
            $("patientNotesArea-Treatments").value = "";
            loadMedicalNotes($("DBREFCODE").value)
        })
    })
}

function searchInPatientRecords() {
    var searchTerm = $("sTermInput").value.toLowerCase()
    var listOfTrueRecords = []

    if(searchTerm == ""){
        loadMedicalNotes($("DBREFCODE").value);
    }

    else {
        db.collection("patients").doc($("DBREFCODE").value).get().then((doc)=>{
            let patientRecords = doc.data().medicalNotes
            let searchArea = $("searchIn").value;
            

            patientRecords.forEach((val, index) => {
                let contentsToSearch = val[searchArea]
                contentsToSearch = contentsToSearch.split(" ");

                //contentsToSearch.forEach((word) => {
                for(i=0;i<contentsToSearch.length;i++){
                    if(removePunctuation(contentsToSearch[i].toLowerCase()) == searchTerm) {
                        listOfTrueRecords.push(val)
                        break;
                    }
                }
            })
            $("medNotesContainer").innerHTML = ""

            if(listOfTrueRecords.length == 0){
                $("medNotesContainer").innerHTML = "<i>No Records Contain that Word. Make sure you are searching for ONE word only, and check your spelling.</i>"
            }
        listOfTrueRecords.forEach((element, index) => {
            let x = document.createElement("div");
            let title = document.createElement("h4");
            let symptoms = document.createElement("p");
            let diagnosis = document.createElement("p");
            let treatments = document.createElement("p");
            title.innerHTML = String(listOfTrueRecords[index].datetime)
            symptoms.innerHTML = "<b>Symptoms: </b>"+listOfTrueRecords[index].symptoms
            diagnosis.innerHTML = "<b>Diagnosis: </b>"+listOfTrueRecords[index].diagnosis
            treatments.innerHTML = "<b>Treatment: </b>"+listOfTrueRecords[index].treatments
            x.style.border = "thin solid black"
            x.appendChild(title)
            x.appendChild(symptoms)
            x.appendChild(diagnosis)
            x.appendChild(treatments)
            $("medNotesContainer").appendChild(x)
        });
        
        })
    }
}

function removePunctuation(word) {
    word = word.replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,"")
    return word
}