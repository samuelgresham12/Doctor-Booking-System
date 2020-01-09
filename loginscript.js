/* 
LOGIN SCRIPT FOR DOCTOR BOOKING SYSTEM
By Samuel Gresham

LIBRARIES/ASSETS USED:  
    1. Firebase (google)
    2. Twitter Bootstrap (twitter)
    3. SweetAlert
*/

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


// This function coordinates the login process.
function login() {
    let fName = document.getElementById("lName").value;
    let pWord = document.getElementById("pWord").value;

    let valid = validate(fName, pWord);
    if (valid == false) {
        return;
    }

    let found = false;

    // All the patients are fetched
    db.collection("patients").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc, ind) {
            if (doc.data().userName == fName) {
                if (doc.data().password == btoa(pWord)) {
                    sessionStorage.setItem("cUser", doc.id);
                    found = true
                    swal({
                        title: "Success!",
                        text: "Login successful.",
                        icon: "success"
                    }).then(function (){
                        window.open("overview.html", "_self")
                    })
                }
            }
        })
        // If the account does not exist, an swal error is thrown.
        if(found == false){
            swal({
                title: "Error",
                text: "That username/password is incorrect!",
                icon: "error"
            })
        }
    })
}


// This function validates the login (ensures that all fields contain legal strings)
function validate(u, p) {
    var val = true;
    // Checks to see if the username is blank.
    if (u == "") {
        document.getElementById("lName").placeholder = "Please enter your full name here. Eg. John Smith";
        document.getElementById("lName").style = "border: 2px solid red;"
        val = false;
    }
    else {
        document.getElementById("lName").style = "border: 2px solid green;"
    }
    // Checks to see if the password is blank.
    if (p == "") {
        document.getElementById("pWord").placeholder = "Please enter your password here.";
        document.getElementById("pWord").style = "border: 2px solid red;"
        val = false;
    }
    else {
        document.getElementById("pWord").style = "border: 2px solid green;"
    }
    // Returns whether the input is valid.
    return val;
}

function makeAcct() {
    let fName = document.getElementById("lName").value;
    let pWord = document.getElementById("pWord").value;

    // Validates the input
    let valid = validate(fName, pWord);
    if (valid == false) {
        return;
    }

    var exists = false;

    // Gets all the existing users, and searches to see if the username is already in use.
    db.collection("patients").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            if (doc.data().userName == fName) {
                exists = true;
            }
        });

        // If it does not exist, the account is written
        if (exists != true) {
            writeNewAccount(fName, pWord);
        }
        // If it does exist, a random number is concatenated onto the end of the string.
        else {
            fName = fName + "-" + Math.floor(Math.random() * 10000)
            swal({
                title: "Name Already Exists",
                text: "That name already exists, so your new username will be " + fName + ".",
                icon: "info"
            }).then((result) => {
                writeNewAccount(fName, pWord);
            })
        }
    })
}

// Redirects the user to make an account
function redir_makeAcct() {
    document.getElementById("title").innerHTML = "Make Account";
    document.getElementById("loginButton").innerHTML = "Make Account";
    document.getElementById("loginButton").onclick = makeAcct;
    document.getElementById("changeAcctMode").innerHTML = "I Already Have an Account";
    document.getElementById("changeAcctMode").onclick = redir_loginAcct;
    document.getElementById("lName").value = "";
    document.getElementById("pWord").value = "";
}

// Redirects the user to sign in
function redir_loginAcct() {
    document.getElementById("title").innerHTML = "Log In";
    document.getElementById("loginButton").innerHTML = "Log In";
    document.getElementById("loginButton").onclick = login;
    document.getElementById("changeAcctMode").innerHTML = "I Don't Have an Account";
    document.getElementById("changeAcctMode").onclick = redir_makeAcct;
    document.getElementById("lName").value = "";
    document.getElementById("pWord").value = "";
}

// Physically writes new accounts.
// This is the main funciton which interfaces with firebase.
function writeNewAccount(n, p) {
    db.collection("patients").add({
        userName: n,
        password: btoa(p),
        medicalDescription: "",
        firstName: '',
        lastName: "",
        sex: "",
        appts: []
    })
        // If firebase accepts the values, this is run.
        .then(function (docRef) {
            console.log("Document successfuly written! Database reference is: " + docRef.id);
            swal({
                title: "Success!",
                text: "Account successfuly created with username: " + n + ". Please login now.",
                icon: "success"
            }).then(function () {
                redir_loginAcct()
            });
        })
        // Else, this error message is run.
        .catch(function (error) {
            console.error("Error adding document: ", error);
            swal({
                title: "Damn!",
                text: "Something went wrong with making that account. Please try again.",
                icon: "error"
            })

        });
}
