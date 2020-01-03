// This script checks the integrity of the DB links between patients and their bookings
// First, it checks to P to B relationships. In other words, it checks that for every booking a patient has made, there is a relevant reservation made in that doctor's timetable.
// Second,it check the B to P relationships. In other words, it checks that for every reservation in the doctor's timetable there is a relevant booking in a patient file.

// Firebase object ((ignore))
var firebaseConfig = {
    apiKey: "AIzaSyBU8BvuWIwGDZGkJi-YSonTnIrKKmv1FE0",
    authDomain: "doctor-booking-system.firebaseapp.com",
    databaseURL: "https://doctor-booking-system.firebaseio.com",
    projectId: "doctor-booking-system",
    storageBucket: "doctor-booking-system.appspot.com",
    messagingSenderId: "152039725858",
    appId: "1:152039725858:web:69e765bfc0caae93f3637b"
};


// Initialize Firebase ((ignore))
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function checkPtoB () {
    // Check the link between patients and bookings

    db.collection("patients").get().then(function(querySnapshot) {
        querySnapshot.forEach((doc) => {
            doc.data().appts.forEach((bcode) => {
                let splStr = bcode.split("//");
                let bookings = getDayBookings();
            })
        })
    })
}

function getDayBookings(date,doc) {
    // Convert the doctor names into the right format
    if(doc=="Dr Smith"){doc = 'bookingsSmith'}
    else{doc = 'bookingsScott'}

    //Fetch the data from the database 
    var data = db.collection("bookings").doc(date).get()
    data.then(snapshot => {
        if(doc=='bookingsSmith'){return snapshot.get("bookingsSmith")}
        else{return snapshot.get("bookingsScott")}
    })
    
    

}