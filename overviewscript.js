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

// Sorts bookings based on date
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

    return a;
}

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

// This function runs when the database is changed and populates the page with customised user data
function populate() {
    // The 'found' var is used to ensure that the file for the logged in patient was found.
    // If its not found, then an issue has occured and the user is prompted to log in again
    document.getElementById("loadingElement").style = "display:block;"
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
                    document.getElementById("bookingsRow").innerHTML = "<br><br><p style='font-weight: 400;'><i>You Haven't Made Any Bookings Yet.</i><p>"
                }
                else {
                    var newArr = []
                    arr.forEach((item,id) => {
                        newArr[id]=arr[id].split("//")
                    })
                    console.log(newArr)
                    newArr = bubbleSort(newArr)
                    console.log(newArr)
                document.getElementById("bookingsRow").innerHTML = "";
                newArr.forEach(function (doc) {
                    let spl = doc
                    let count = 0;
                    let splitDate = spl[0].split("-")

                    if(isBeforeNow(splitDate[0],splitDate[1],splitDate[2])) {
                        console.log("Booking on " + spl[0] + " was hidden because because it is in the past...")
                    }
                    else {
                    count ++
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

                    if(count ==0) {
                        document.getElementById("bookingsRow").innerHTML = "<br><br><p style='font-weight: 400;'><i>You Do Not Have Any Upcoming Bookings.</i><p>"
                    }
                }})
            } }
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
    setTimeout(() => {
        document.getElementById("loadingElement").style = "display:none;"  
    }, 300);
    
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

    // text boxes are made for each input element
    var x1 = document.createElement("INPUT");
    var x2 = document.createElement("INPUT");
    var x3 = document.createElement("INPUT");
    var x4s = document.createElement("SELECT");
    // The type and id of each input element is assigned
    x1.setAttribute("type", "text");
    x1.setAttribute("id", "x1");
    x2.setAttribute("type", "text");
    x2.setAttribute("id", "x2");
    x3.setAttribute("type", "text");
    x3.setAttribute("id", "x3");
    x4s.setAttribute("name", "sex");
    x4s.setAttribute("id", "x4");
    // The value stored in DB is now placed into the box
    x1.setAttribute("value", uName);
    x2.setAttribute("value", fName);
    x3.setAttribute("value", lName);
    // Inner elements of the dropdown box are now created
    let child1 = document.createElement("option");
    let child2 = document.createElement("option");
    let child3 = document.createElement("option");
    child1.setAttribute("value", "Male")
    child2.setAttribute("value", "Female")
    child3.setAttribute("value", "Other")
    child1.innerHTML = "Male"
    child2.innerHTML = "Female"
    child3.innerHTML = "Other"
    // The inner elements are appended to the dropdown box
    x4s.appendChild(child1)
    x4s.appendChild(child2)
    x4s.appendChild(child3)
    // The dropdown is given the appropriate width
    x4s.setAttribute("style", "width:205px")

    // The buttons are placed in the DOM
    document.getElementById("details_uName").innerHTML = "";
    document.getElementById("uName").appendChild(x1);

    document.getElementById("details_fName").innerHTML = "";
    document.getElementById("fName").appendChild(x2);

    document.getElementById("details_lName").innerHTML = "";
    document.getElementById("lName").appendChild(x3);

    document.getElementById("details_sex").innerHTML = "";
    document.getElementById("sex").appendChild(x4s);


    // The button is finally changed
    document.getElementById("updateButton").onclick = toggleDetailsInput_toDisplay;
    document.getElementById("updateButton").innerHTML = "Submit Changes";
    document.getElementById("updateButton").setAttribute("class", "btn btn-outline-danger");

    document.getElementById("x4").value = sex
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
                    location.reload()                        
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

    // Structures the date nicely for use with the DB
    
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

                // Push the booking into the patient's record
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

// Deletes a booking from the DBS database
function deleteBooking(time, doctor, date) {
    if (time == "" || doctor == "" || date == "") {
        console.error("Error: parameters undefined.");
        return;
    }

    // The user is prompted to confirm their intent
    swal({
        title: "Are you sure?",
        text: "Are you sure you would like to cancel this booking?",
        icon: "warning",
        buttons: {
            cancel: "No",
            Yes: true
        }
    }).then((value) => { 
        if(value == "Yes") {
            db.collection("bookings").doc(date).get().then(function (doc) {
                if (doctor == "Dr Scott") {
                    var arr = doc.data().bookingsScott;
                    // Set the booking status to false
                    arr[time] = "false";
                    // Update within the database
                    db.collection("bookings").doc(date).update({
                        bookingsScott: arr
                    })
                }
                else {
                    var arr = doc.data().bookingsSmith;
                    // Set the booking status to false
                    arr[time] = "false";
                    // Update within the database
                    db.collection("bookings").doc(date).update({
                        bookingsSmith: arr
                    })
                }
        
                // This section removes the booking from the PATIENT file
                db.collection("patients").doc(sessionStorage.getItem("cUser")).get().then(function (doc) {
                    let appointments = doc.data().appts;
        
                    var obj = date + "//" + time + "//" + doctor
        
                    appointments.forEach(function (item, index) {
                        // If it matches the booking which is being deleted, remove it from the database
                        if (obj == item) {
                            appointments.splice(index, 1);
                            db.collection("patients").doc(sessionStorage.getItem("cUser")).update({
                                appts: appointments
                            })
                        }
                    })
                })
            })
        }
        else {}
     })
    
}

// This function logs the user out of their session
function logOut() {
    // The user key is removed from storage
    sessionStorage.removeItem("cUser");
    // Login page is opened
    window.open("login.html", "_self")
}

// Searches the user's bookings for a specific date using both a bubble sort and a binary search 
function searchBookings() {
    db.collection("patients").doc(sessionStorage.getItem("cUser")).get().then((doc) => {
        bookings = doc.data().appts;

        for(let i=0; i<bookings.length; i++){ 
            bookings[i] = bookings[i].split("//")
        }

        // Sort the bookings
        bookings = bubbleSort(bookings);
        let target = document.getElementById("searchCriteria_date").value;
        let length = bookings.length

        // Find the indices for which the criterion is satisfied
        let index = binarySearch(bookings,target,0,length)

        let list = [];
        
        for(let i=0; i<index.length;i++) {
            list[i]= bookings[index[i]]
        }

        populate_forSearch(list)
        
        
    })
}

// A binary search algorithm which is used in the appointment search function
// It is adapted to allow for return of multiple records
function binarySearch(array, target, low, high) {
    if(high-low<0) {
        return -1;
    }

    let mid = Math.floor((low+high)/2);

    if(array[mid][0] == target) {
        return checkBoundaries(mid,target, array);
    } else if(target < array[mid][0]) {
        return binarySearch(array, target, low, mid-1);
    } else if(target > array[mid][0]) {
        return binarySearch(array, target, mid+1, high);
    }
}

// this function checks above and below the found record to see if there are multiple instances of the same thing in the array
// This allows for the binary search to return multile indices!
function checkBoundaries (initial, target, array) {
    let highExhausted = false;
    let lowExhausted = false; 

    let indexList = [initial]

    let counter = 1;

    // Look ABOVE the record and see if there are any more matches
    while(!highExhausted) {
        if(array[initial+counter][0] == target) {
            indexList.push(initial+counter);
            counter ++
        } else {highExhausted=true};
    }
    counter = 1
    // Look BELOW the record now
    while(!lowExhausted) {
        if(array[initial-counter][0] == target) {
            indexList.push(initial-counter);
            counter ++
        } else {lowExhausted=true};
    }

    return indexList;
}

// Populates the booking area after a search has been performed
function populate_forSearch(listOfIndexes) {
    document.getElementById("bookingsRow").innerHTML = "<i>Search Results...</i>"
    listOfIndexes.forEach(function (doc) {
        let spl = doc
        let count = 0;

        if(false) {
        //    console.log("Booking on " + spl[0] + " was hidden because because it is in the past...")
        }
        else {
        count ++
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

        if(count ==0) {
            document.getElementById("bookingsRow").innerHTML = "<br><br><p style='font-weight: 400;'><i>You Do Not Have Any Upcoming Bookings.</i><p>"
        }
    }})
}