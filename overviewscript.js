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

// This checks whether the user is logged in. If they are not, the login page is opened.
if(sessionStorage.getItem("cUser") == null){
    window.open("login.html", "_self")
}
else{
// This listens for a change in the database, and calls the populate() function upon update
db.collection("patients").doc(sessionStorage.getItem("cUser")).onSnapshot(function () {
    populate();
})
}

function bubbleSort(a) {
    var swapped;
    do {
        swapped = false;
        for (var i=0; i < a.length-1; i++) {
            if (a[i][0] > a[i+1][0]) {
                var temp = a[i];
                a[i] = a[i+1];
                a[i+1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
}

// This function runs when the database is changed and populates the page with customised user data
function populate() {
    // The 'found' var is used to ensure that the file for the logged in patient was found.
    // If its not found, then an issue has occured and the user is prompted to log in again
    let found = false;
    db.collection("patients").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc, ind) {
            if (doc.id == sessionStorage.getItem("cUser")) {
                // The file is marked as found
                found = true;

                // If the user has blank entries (i.e. has not entered their name), then a "no data" entry is made
                if(doc.data().userName == ""){
                    document.getElementById("details_uName").innerHTML = "<i style='color:red'>No Data</i>";
                }
                else {document.getElementById("details_uName").innerHTML = doc.data().userName;}
                
                if(doc.data().firstName == ""){
                    document.getElementById("details_fName").innerHTML = "<i style='color:red'>No Data</i>";
                }
                else { document.getElementById("details_fName").innerHTML = doc.data().firstName } ;

                if(doc.data().lastName == "") {
                    document.getElementById("details_lName").innerHTML = "<i style='color:red'>No Data</i>";
                }
                else { document.getElementById("details_lName").innerHTML = doc.data().lastName } ;

                if(doc.data().sex == ""){
                    document.getElementById("details_sex").innerHTML = "<i style='color:red'>No Data</i>";
                }
                else { document.getElementById("details_sex").innerHTML = doc.data().sex } ;

                // This chunk deals with making graphics for each booking
                var arr = doc.data().appts;
                if(arr.length == 0) {
                    document.getElementById("bookingsRow").innerHTML = "<br><br><p style='font-weight: 400;'><i>No Bookings Found</i><p>"
                }
                else {
                    var newArr = []
                    arr.forEach((item,id) => {
                        newArr[id]=arr[id].split("//")
                    })
                    bubbleSort(newArr)
                }
                document.getElementById("bookingsRow").innerHTML = "";
                newArr.forEach(function (doc) {
                    let spl = doc

                    // The main <div> is made with attr. ID -> bookingObj
                    let x = document.createElement("DIV");
                    x.setAttribute("id", "bookingObj");

                    // The row is made for the columns to sit within
                    let y1 = document.createElement("DIV");
                    y1.setAttribute("class", "row");

                    // The individual <div> elements are created
                    let z1 = document.createElement("DIV");
                    let z2 = document.createElement("DIV");
                    let z3 = document.createElement("DIV");
                    let z4 = document.createElement("DIV")

                    // The <div> elements are given attr. CLASS -> col-sm 
                    // This makes them act as column containers
                    z1.setAttribute("class", "col-sm");
                    z2.setAttribute("class", "col-sm");
                    z3.setAttribute("class", "col-sm");
                    z4.setAttribute("class", "col-sm");

                    // The button is made, with:
                    //      attr. ID -> cancelBtn
                    //      attr. onclick -> deleteBooking function
                    let b = document.createElement("BUTTON");
                    b.setAttribute("id", "cancelBtn");
                    b.onclick = function () { deleteBooking(spl[1], spl[2], spl[0]) }

                    let timeF = (Number(spl[1]) + 16) / 2;
                    if (!Number.isInteger(timeF)) {
                        timeF = Math.floor(timeF) + ":30";
                    }
                    else {
                        timeF = timeF + ":00"
                    }
                    // The text values of each item are updated
                    z1.innerHTML = spl[2];
                    z2.innerHTML = timeF
                    z3.innerHTML = spl[0];
                    b.innerHTML = "Cancel";

                    // The button is pushed into its DIV
                    z4.appendChild(b)

                    // The DIVs are pushed into the row DIV
                    y1.appendChild(z1)
                    y1.appendChild(z2)
                    y1.appendChild(z3)
                    y1.appendChild(z4)

                    // The row DIV is pushed into the parent DIV
                    x.appendChild(y1)

                    // The entire thing is pushed onto the document, with a break following to space the elements
                    document.getElementById("bookingsRow").appendChild(x)
                    document.getElementById("bookingsRow").appendChild(document.createElement("BR"))
                })
            }
        })
        // If the relevant document was not found, then an error is thrown!
        if (found != true) {
            console.error("Document not found.")
            swal({
                title: "Error",
                text: "No account with username: '" + sessionStorage.getItem("cUser") + "' was found. You may need to log in again.",
                icon: "error"
            }).then(function () {
                window.open("login.html", "_self")
            })
        }
    })
}

// This function manipulates the DOM to enable the user to change their personal details.
function toggleDetailsInput_toInput() {
    // The values of the p fields are stored
    let uName = document.getElementById("details_uName").innerText;
    let fName = document.getElementById("details_fName").innerText;
    let lName = document.getElementById("details_lName").innerText;
    let sex = document.getElementById("details_sex").innerText;

    if(uName == "No Data"){uName = ""}
    if(fName == "No Data"){fName = ""}
    if(lName == "No Data"){lName = ""}
    if(sex == "No Data"){sex = ""}

    // Text boxes are made and given their values and IDs
    var x1 = document.createElement("INPUT");
    var x2 = document.createElement("INPUT");
    var x3 = document.createElement("INPUT");
    var x4 = document.createElement("INPUT");
    var x5 = document.createElement("INPUT");
    x1.setAttribute("type", "text");
    x1.setAttribute("id", "x1");
    x2.setAttribute("type", "text");
    x2.setAttribute("id", "x2");
    x3.setAttribute("type", "text");
    x3.setAttribute("id", "x3");
    x4.setAttribute("type", "text");
    x4.setAttribute("id", "x4");
    x5.setAttribute("type", "text");
    x5.setAttribute("id", "x5");
    x1.setAttribute("value", uName);
    x2.setAttribute("value", fName);
    x3.setAttribute("value", lName);
    x4.setAttribute("value", sex);

    // The buttons are placed in the DOM
    document.getElementById("details_uName").innerHTML = "";
    document.getElementById("uName").appendChild(x1);

    document.getElementById("details_fName").innerHTML = "";
    document.getElementById("fName").appendChild(x2);

    document.getElementById("details_lName").innerHTML = "";
    document.getElementById("lName").appendChild(x3);

    document.getElementById("details_sex").innerHTML = "";
    document.getElementById("sex").appendChild(x4);


    // The button is finally changed
    document.getElementById("updateButton").onclick = toggleDetailsInput_toDisplay;
    document.getElementById("updateButton").innerHTML = "Submit Changes";
    document.getElementById("updateButton").setAttribute("class", "btn btn-outline-danger");

}

// This function saves the changes the user has made to their personal data
// Then, it resets the webpage.
function toggleDetailsInput_toDisplay() {
    let uName = document.getElementById("x1").value;
    let fName = document.getElementById("x2").value;
    let lName = document.getElementById("x3").value;
    let sex = document.getElementById("x4").value;

    document.getElementById("uName").innerHTML = "";
    document.getElementById("fName").innerHTML = "";
    document.getElementById("lName").innerHTML = "";
    document.getElementById("sex").innerHTML = "";

    var exists = false;

    // Gets all the existing users, and searches to see if the username is already in use.
    db.collection("patients").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            if (doc.data().userName == uName && doc.id != sessionStorage.getItem("cUser")) {
                exists = true;
            }
        });

        // If it does exist, an error is thrown, and the program stops running
        if (exists == true) {
            swal({
                title: "Whoops!",
                text: "Sorry, that username is taken. Try again with another username.",
                icon: "error"
            })
                .then(function () {
                    location.reload()
                })
        }
        // If the username is not taken, the details are changed
        else {
            db.collection("patients").doc(sessionStorage.getItem("cUser")).update({
                userName: uName,
                firstName: fName,
                lastName: lName,
                sex: sex
            })
                // If firebase accepts the values, this is run.
                .then(function (docRef) {
                    console.log("Document successfuly updated!");
                    swal({
                        title: "Success!",
                        text: "Account details successfuly updated.",
                        icon: "success"
                    }).then(function () {
                        location.reload();
                    });
                })
                // Else, this error message is run.
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                    swal({
                        title: "Damn!",
                        text: "Something went wrong with updating your account. Please try again.",
                        icon: "error"
                    })
                });
        }
    })
}

// Finds available times given a date and doctor
function findAvailableTimes() {

    let doctor = document.getElementById("drName").value;
    let date = document.getElementById("dateSel").value;
    
    // Simple data validation makes sure a date is entered
    if (date == "") {
            swal({
                title: 'Whoops!',
                text: "Please enter a date into the date field.",
                icon: "error"
            })
    }
    
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
    
        splDate = date.split("-");
    
        // The isBeforeNow() function is called with the day, month and year
        let preNow = isBeforeNow(splDate[0], splDate[1], splDate[2])
    
        // If the date selected is in the past, an error is thrown
        if (preNow == true) {
            swal({
                title: "Whoops!",
                text: "The date you entered is before today. Please input a date in the future.",
                icon: "error"
            }).then(function () { location.reload() });
        }
        else {
    
            var docRef = db.collection("bookings").doc(date);
    
            let freeTimes = []
    
            // The bookings document is fetched 
            docRef.get().then(function (doc) {
                // If a document exists for that date, this is run
                if (doc.exists) {
                    if (doctor == "Dr Smith") {
                        let arr = doc.data().bookingsSmith
                        arr.forEach(function (t, i) {
                            if (t == "false") {
                                freeTimes.push(i);
                            }
                        })
                    }
                    else {
                        let arr = doc.data().bookingsScott
                        arr.forEach(function (t, i) {
                            if (t == "false") {
                                freeTimes.push(i);
                            }
                        })
                    }
    
                    // The function is run to display the times, given the free times found,
                    // The doctor and the date given.
                    displayAvailTimes(freeTimes, doctor, date)
    
                    // If the date has no bookings, a record is created full of free timeslots
                } else {
                    db.collection("bookings").doc(date).set({
                        bookingsSmith: Array(18).fill("false"),
                        bookingsScott: Array(18).fill("false")
                    })
                }
            })
    
            //let nowDate = d.getFullYear() + "-" + month + "-" + day;
        }
    }

// Checks if a given date is in the past
function isBeforeNow(y, m, d) {
    // Fetches the date
    let nD = new Date()
    // If the year is greater than the current year, it must be in the future
    if (y > nD.getFullYear()) {
        return false;
    }
    // If the year is the same as the current year, we need to investigate more
    else if (y == nD.getFullYear()) {
        // If the month is greater, it must be in the future.
        if (m > nD.getMonth() + 1) {
            return false;
        }
        // If the month is the same, we need to investigate more
        else if (m == nD.getMonth() + 1) {
            // If the day is greater, it must be in the future
            if (d > nD.getDate()) {
                return false;
            }
            // If the day is the same, it is ok
            else if (d == nD.getDate()) {
                return false;
            }
            // If the day is less, it is in the past
            else { return true }
        }
        // If the month is less, it is in the past
        else { return true }
    }
    // If the year is less, it is in the past
    else { return true }
}

// Displays available times when the user selects a doctor and date
function displayAvailTimes(times, dr, date) {
    document.getElementById("booking_show2").innerHTML = "";
    document.getElementById("booking_show1").style = "display: none";
    document.getElementById("booking_show2").style = "display: block";

    // For each available time, a button is created
    times.forEach(function (t) {
        let x = document.createElement("BUTTON");

        let time;

        if (Number.isInteger((t + 16) / 2) != true) {
            time = Math.floor((t + 16) / 2) + ":30"
        }
        else {
            time = Math.floor((t + 16) / 2) + ":00"
        }

        x.innerHTML = dr + ": " + time
        x.setAttribute("class", "bookingButton");
        x.onclick = function () { selectBooking(t, dr, date) }
        document.getElementById("booking_show2").appendChild(x);
        let br = document.createElement("br");
        document.getElementById("booking_show2").appendChild(br)
    })
}

// When one of the buttons are clicked, this function runs
// It confirms and places a booking in the database
function selectBooking(time, doctor, date) {
    // The user is asked whether they want this to happen
    swal({
        title: "Are you sure?",
        text: "Do you want to make a booking with " + doctor + " at " + time + ", " + date + "?",
        icon: "info",
        buttons: {
            cancel: "No",
            Yes: true
        }
    }).then((value) => {
        // If the user says 'yes', then the following runs:
        if (value == "Yes") {
            // The bookings are updated
            db.collection("bookings").doc(date).get().then((doc) => {
                if (doctor == "Dr Smith") {
                    var initArr = doc.data().bookingsSmith
                    initArr[time] = sessionStorage.getItem("cUser")
                    db.collection("bookings").doc(date).update({
                        bookingsSmith: initArr
                    })
                }
                else {
                    var initArr = doc.data().bookingsScott
                    initArr[time] = sessionStorage.getItem("cUser")
                    db.collection("bookings").doc(date).update({
                        bookingsScott: initArr
                    })
                }

                db.collection("patients").doc(sessionStorage.getItem("cUser")).get().then((doc) => {
                    var arr = doc.data().appts
                    arr.push(date + "//" + time + "//" + doctor)
                    db.collection("patients").doc(sessionStorage.getItem("cUser")).update({
                        appts: arr
                    })
                    document.getElementById("booking_show1").style = "display: block";
                    document.getElementById("booking_show2").style = "display: none";
                })

            })
        }
        else {
            return;
        }
    })
}

function deleteBooking(time, doctor, date) {
    if (time == "" || doctor == "" || date == "") {
        console.error("Error: parameters undefined.");
        return;
    }

    db.collection("bookings").doc(date).get().then(function (doc) {
        if (doctor == "Dr Scott") {
            var arr = doc.data().bookingsScott;
            arr[time] = "false";
            db.collection("bookings").doc(date).update({
                bookingsScott: arr
            })
        }
        else {
            var arr = doc.data().bookingsSmith;
            arr[time] = "false";
            db.collection("bookings").doc(date).update({
                bookingsSmith: arr
            })
        }

        db.collection("patients").doc(sessionStorage.getItem("cUser")).get().then(function (doc) {
            let appointments = doc.data().appts;

            var obj = date + "//" + time + "//" + doctor

            appointments.forEach(function (item, index) {
                if (obj == item) {
                    appointments.splice(index, 1);
                    db.collection("patients").doc(sessionStorage.getItem("cUser")).update({
                        appts: appointments
                    })
                }
            })
        })

        swal({
            title: "All Done",
            text: "Your booking has been cancelled.",
            icon: "success"
        }).then(function () { location.reload() })
    })
}

// This function logs the user out of their session
function logOut() {
    // The user key is removed from storage
    sessionStorage.removeItem("cUser");
    // Login page is opened
    window.open("login.html", "_self")
}
