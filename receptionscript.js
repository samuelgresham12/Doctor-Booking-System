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

}

// Gets the personal details of the booker for display
function getBookerDetails (key) {
    db.collection("patients").doc(key).get().then( (doc) => {
        sessionStorage.setItem(key, JSON.stringify(doc.data()))
    })
}
