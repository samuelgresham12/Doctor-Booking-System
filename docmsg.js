function $(x) {return document.getElementById(x)};

$("mID").value = "Reception";
$("rID").value = sessionStorage.getItem("doctorToMessage");

$("messageContent").value = "Re: " + sessionStorage.getItem("patientToMessageAbout") + "\n";

establishCommunication();

