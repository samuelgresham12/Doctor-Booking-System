// -- This script is run when a messaging instance is loaded -- //

function $(x) {return document.getElementById(x)};

// The messager is reception
$("mID").value = "Reception";
// The "recipient" is <doctor>: <patient>
// This seperates conversations about different patients
$("rID").value = sessionStorage.getItem("doctorToMessage")+ ": " +sessionStorage.getItem("patientToMessageAbout");

// Adds a line to the top of the message to denote the patient in question.
$("messageContent").value = "Re: " + sessionStorage.getItem("patientToMessageAbout") + "\n";

// Essentially presses the button for the receptionist. Loads conversation and initiates the chat.
establishCommunication();

