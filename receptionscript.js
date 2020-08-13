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
var todayDate = d.getFullYear() + "-" + month + "-" + day

// When the booking data is changed on the DB, then the following code is run
db.collection("bookings").doc(todayDate).onSnapshot(function (doc) {
    let t = new Date();
    document.getElementById("lastUpdated").innerHTML = "Last Updated " + parseNum(t.getHours()) + ":" + parseNum(t.getMinutes()) + ":" + parseNum(t.getSeconds());
    // If the document exists on the database, then call the update() function.
    if(doc.data()) { 
        update(doc.data());
    }
    // If the document does not exist on the database, then a warning is thrown and the user is notified
    else {
        console.warn("No Bookings Were Found Today (" + todayDate + ")")
        swal({
            title: "No Bookings Found...",
            text: "Looks like a quiet day today! I couldn't find any bookings for " + todayDate + ".",
            icon: "error"
        })
    }
})

// Parse a number so it is 0# rather than #
function parseNum(num){
    if(num<10) num = "0" + num;
    return num;
}

// This function handles updating the UI whenever:
//      (a) the page is loaded
//      (b) the database is updated
// It is called by the database listener
function update (data) {
    // Get the data that was passed and break it up based on each category
    let scottBookingIds = data.bookingsScott;
    let smithBookingIds = data.bookingsSmith;
    
    // Preset the length of the lists to speed up the loop
    let smListLen = smithBookingIds.length;
    let scListLen = scottBookingIds.length;

    // For each time slot, determine whether a booking has been made
    for(let i = 0; i < smListLen; i++) {
        // CASE where no booking: make a blank button
        if(smithBookingIds[i] == "false") {
            let HTMLid = "smithBookings" + i;
            createButton(HTMLid, i, "No Booking", smithBookingIds[i])
        }
        // CASE where there is a booking: make a button with "Booked" in it.
        else {
            let HTMLid = "smithBookings" + i;
            createButton(HTMLid, i, "Booked", smithBookingIds[i])
        }
    }
    // For each time slot, determine whether a booking has been made
    for(let i = 0; i < scListLen; i++) {
        if(scottBookingIds[i] == "false") {
            let HTMLid = "scottBookings" + i;
            createButton(HTMLid, i, "No Booking", scottBookingIds[i])
        }
        else {
            let HTMLid = "scottBookings" + i;
            createButton(HTMLid, i, "Booked", scottBookingIds[i])
        }
    }
    
}

// Manipulates the DOM to place a button on the page
// Is passed the full id, increment, text value and booker ID
function createButton (id, inc, value, bookerRef) {
    let childButton = document.createElement("button");
    let CSSstring = "width: 100%;"
    if(value == "Booked") {CSSstring =  CSSstring + "background-color: lightgreen; color: darkgreen"};
    childButton.style = CSSstring
    childButton.id = "btn_" + id;
    childButton.innerHTML = structureTime(inc) + ": " + value; 
    childButton.onclick = function () {displayData(id, inc, bookerRef)}
    document.getElementById(id).innerHTML = "";
    document.getElementById(id).appendChild(childButton);
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

// When a button is pressed, this runs to display patient and booking data
function displayData (id, increment, bRef) {
    // Fetch the document from the database
    db.collection("patients").doc(bRef).get().then((doc) => {
        if(doc.data()){ // If the data exists:
            let d = doc.data()
            // Fill in the fields with data from doc.data()
            $("field-dbref").value = doc.id;
            $("field-username").value = d.userName;
            $("field-first").value = d.firstName;
            $("field-last").value = d.lastName;
            $("field-sex").value = d.sex;
            $("field-medicarenumber").value = d.medicareNumber;
            $("field-medicarepoc").value = d.medicarePOC;
            $("field-privateprov").value = d.privateHealthProvider;
            $("field-privatenum").value = d.privateHealthNumber;
            $("field-privatepoc").value = d.privateHealthPOC;
            $("field-doctor").value = "Dr. " + id.charAt(0).toUpperCase() + id.substring(1,5);
            $("field-time").value = structureTime(increment);
            $("hereButton").onclick = function(){markHere(bRef)}
            $("awayButton").onclick = function(){checkOut(bRef)}

            // The below code checks whether the patient is present in the clinic
            // Another DB call is required, since another collection needs to be called
            db.collection("patients").doc("presentClients").get().then((doc) => {
                if(doc) {
                    let dLen = doc.data().list.length;
                    found = false;
                    for(let a = 0; a < dLen; a++) {
                        if(doc.data().list[a] == bRef) {
                            found = true;
                        }
                    }
                }
            }).then(() => { // Once the data is fetched, then formatting can be applied
                $("field-present").value = found;
                if(found){ // If they are present:
                    $("field-present").style += ";border-color:green;color:green;"
                } else { // Otherwise:
                    $("field-present").style += ";border-color:red;color:red;"
                }
            });


        }
        else { // If that timeslot is not booked, make everything empty.
            $("field-dbref").value = "";
            $("field-username").value = "";
            $("field-first").value = "";
            $("field-last").value = "";
            $("field-sex").value = "";
            $("field-medicarenumber").value = "";
            $("field-medicarepoc").value = "";
            $("field-privateprov").value = "";
            $("field-privatenum").value = "";
            $("field-privatepoc").value = "";
            $("field-doctor").value = "";
            $("field-time").value = "";
            $("field-present").value = "";
            $("hereButton").onclick = function(){}
            $("awayButton").onclick = function(){}
            $("field-present").style += ";border-color:grey;color:grey;"
        }
    })
} 


// Updates the patient data when the button is pressed
function updatePData() {
    // If no database reference exists, then no user is selected and the following error is thrown 
    if($("field-dbref").value==""){
        swal({
            title: "No User Selected",
            icon: "error"
        })
    } else { // Otherwise, the data is written to the database
        db.collection("patients").doc($("field-dbref").value).update({
            firstName: $("field-first").value,
            lastName: $("field-last").value,
            sex: $("field-sex").value,
            medicareNumber: $("field-medicarenumber").value,
            medicarePOC: $("field-medicarepoc").value,
            privateHealthProvider: $("field-privateprov").value,
            privateHealthNumber: $("field-privatenum").value,
            privateHealthPOC: $("field-privatepoc").value
        }).then(() => { // Once that's done, feedback is given to the user
            swal({
                title: "Success!",
                icon:"success"
            })
        })
    }
}

// Marks a patient 'here' at the clinic in the DB
// Called when the 'Mark as Here' button is pressed
function markHere(x) {
    db.collection("patients").doc("presentClients").get().then((doc) => {
        let newArr = doc.data().list;
        newArr.push(x);
        db.collection("patients").doc("presentClients").update({
            list: newArr
        })
    }).then(()=>{ //Imitate the contents of the DB until the db has been called
        $("field-present").value = "true";
        $("field-present").style += ";border-color:green;color:green;"
    })
}

// Removes the patient from the 'here' list
// Called when the 'Mark as Away' button is pressed
function checkOut (x) {
    db.collection("patients").doc("presentClients").get().then((doc) => {
        let contains = true;
        let arr = doc.data().list;
        while(contains) {
            let index = arr.indexOf(x);
            if(index > -1){
                arr.splice(index, 1);
            }
            else {
                contains = false;
            }
        }
        db.collection("patients").doc("presentClients").update({
            list: arr
        })
    }).then(()=>{
        $("field-present").value = "false";
        $("field-present").style += ";border-color:red;color:red;"
    })
}

// The only useful bit of JQuery
function $(x){return document.getElementById(x)}

