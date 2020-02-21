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

sessionStorage.setItem("busy", false);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.collection("messaging").onSnapshot(function (doc) {
    try{
            loadConversation(sessionStorage.getItem("ID"), sessionStorage.getItem("me"), sessionStorage.getItem("nme"))
    } catch{
        console.error("Not Working, Idiot")
    }
})

function establishCommunication() {
    let initiatorID = document.getElementById("mID").value;
    let recipientID = document.getElementById("rID").value;

    let commFound = false;
    let searchID = initiatorID + "-" + recipientID;

    db.collection("messaging").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if(doc.id == searchID){
                commFound = true;
            }
        })
    }).then(()=>{
        if(commFound == true){
            loadConversation(searchID, initiatorID, recipientID);
        }
        else {
            establishBackwardConnection();
        }
    })
} 

function establishBackwardConnection() {
    initiatorID = document.getElementById("mID").value;
    recipientID = document.getElementById("rID").value;

    let commFound = false;
    let searchID = recipientID + "-" + initiatorID;

    db.collection("messaging").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if(doc.id == searchID){
                commFound = true;
            }
        })
    }).then(()=>{
        if(commFound == true){
            loadConversation(searchID, initiatorID, recipientID);
        }
        else {
            createChat()
        }
    })
}

function loadConversation(ID, i, r){
    $("messages").value = "";
    sessionStorage.setItem("ID", ID)
    sessionStorage.setItem("me", i)
    sessionStorage.setItem("nme", r)

    db.collection("messaging").doc(ID).get().then((doc) => {
        let j = 0;
        $("messages").value = "";
        while(true){
            if(doc.data()[j] != undefined){
                $("messages").value+="\n" + doc.data()[j].sender + ": " + doc.data()[j].content;
                j++
            }
            else{
                break;
            }
        }
    })
}

function send() {
    let c = $("messageContent").value;
    if(c){
        db.collection("messaging").doc(sessionStorage.getItem("ID")).get().then((doc) => {
            let index = doc.data().currentID + 1;
            db.collection("messaging").doc(sessionStorage.getItem("ID")).set({
                [index]: {
                    content: c,
                    sender: sessionStorage.getItem("me"),
                    timeSent: Date.now()
                }
            }, {merge: true}).then(() => {
                db.collection("messaging").doc(sessionStorage.getItem("ID")).set({
                    currentID: index
                },{merge: true}).then(() => {$("messageContent").value = "";})
            })
        })
    }
}

function createChat() {
    let initiatorID = document.getElementById("mID").value;
    let recipientID = document.getElementById("rID").value;

    db.collection("messaging").doc(initiatorID + "-" + recipientID).set({
        [0]: {
            sender: "Admin",
            content: "Messaging Started!",
            timeSent: Date.now()
        },
        currentID: 0
    }).then(()=>{
        establishCommunication()
    })
}

    
function $(x){return document.getElementById(x)}