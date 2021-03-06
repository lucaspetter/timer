/*
Copyright © 2015 Lucas Bleackley Petter.
<https://www.lucaspetter.com/>

This file is part of Timer.

Timer is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Timer is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Timer.  If not, see <http://www.gnu.org/licenses/>.
*/

/* 
 This file was generated by Dashcode.  
 You may edit this file to customize your widget or web page 
 according to the license.txt file included in the project.
 */

// Declare initial variable names for the widget's textboxes and other elements. These get defined in function prepareVariables().
var textboxHours;
var textboxMinutes;
var textboxSeconds;
var buttonStart;
var buttonStop;
var updateIcon;
var timerRunning;
var countdown;
var timedHours;
var timedMinutes;
var timedSeconds;
var alarmSoundArea;
var soundFileMenu;
var checkboxPreventSleep;
var checkboxNotifications;
var checkboxRaiseVolume;
var checkboxCheckUpdates;

var preventSleepObject;
var systemVolumeQuery;
var systemMutedQuery;
var osXVersion;
var osXLionOrGreater;

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    // Keep these functions in this order. Variables need to be prepared first so everything else can function. Textboxes need to be filled second so the user knows the widget is ready. Update checking should come last, due to the potential time delay associated with connecting to the update server.
    dashcode.setupParts();
    prepareVariables();
    resetTextboxes();
    loadPreferences();
    checkUpdates();
}

//
// Function: remove()
// Called when the widget has been removed from the Dashboard
//
function remove()
{
    // Stop any timers to prevent CPU usage
    // Remove any preferences as needed
    // widget.setPreferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
    
    // Remove all preferences by passing null to the preference keys.
    // widget.identifier indicates this particular instance of the widget and allows for multiple instances with different preferences.
    widget.setPreferenceForKey(null, widget.identifier + "-soundfile");
    widget.setPreferenceForKey(null, widget.identifier + "-preventsleep");
    widget.setPreferenceForKey(null, widget.identifier + "-notifications");
    widget.setPreferenceForKey(null, widget.identifier + "-raisevolume");
    widget.setPreferenceForKey(null, widget.identifier + "-checkupdates");
    widget.setPreferenceForKey(null, widget.identifier + "-hours");
    widget.setPreferenceForKey(null, widget.identifier + "-minutes");
    widget.setPreferenceForKey(null, widget.identifier + "-seconds");
    
    // If any "caffeinate" or "pmset" processes are running, cancel them to prevent them from keeping the computer awake.
    if (preventSleepObject) {
        preventSleepObject.cancel();
    }
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide()
{
    // Stop any timers to prevent CPU usage
}

//
// Function: show()
// Called when the widget has been shown
//
function show()
{
    // Restart any timers that were stopped on hide
}

//
// Function: sync()
// Called when the widget has been synchronized with .Mac
//
function sync()
{
    // Retrieve any preference values that you need to be synchronized here
    // Use this for an instance key's value:
    // instancePreferenceValue = widget.preferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
    //
    // Or this for global key's value:
    // globalPreferenceValue = widget.preferenceForKey(null, "your-key");
}

//
// Function: showBack(event)
// Called when the info button is clicked to show the back of the widget
//
// event: onClick event from the info button
//
function showBack(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

//
// Function: showFront(event)
// Called when the done button is clicked from the back of the widget
//
// event: onClick event from the done button
//
function showFront(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
    
    // Save preferences and check for updates upon flipping to the front.
    savePreferences();
    checkUpdates();
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}

function prepareVariables() {
    // This function pre-defines the widget's textboxes and other elements with variables to make coding simpler and reduce file size.
    textboxHours = document.getElementById("textboxHours");
    textboxMinutes = document.getElementById("textboxMinutes");
    textboxSeconds = document.getElementById("textboxSeconds");
    buttonStart = document.getElementById("buttonStart");
    buttonStop = document.getElementById("buttonStop");
    updateIcon = document.getElementById("updateIcon");
    timerRunning = false;
    timedHours = "";
    timedMinutes = "";
    timedSeconds = "";
    alarmSoundArea = document.getElementById("alarmSoundArea");
    soundFileMenu = document.getElementById("soundFileMenu");
    checkboxPreventSleep = document.getElementById("checkboxPreventSleep");
    checkboxNotifications = document.getElementById("checkboxNotifications");
    checkboxRaiseVolume = document.getElementById("checkboxRaiseVolume");
    checkboxCheckUpdates = document.getElementById("checkboxCheckUpdates");
    
    // Use terminal to set osXVersion as the OS X version number, then call the function checkOSXVersionLion() to set osXLionOrGreater as true or false.
    osXVersion = widget.system('/usr/bin/sw_vers -productVersion', function(){
        osXLionOrGreater = checkOSXVersionLion();
    });
}

function resetTextboxes() {
    //This function resets the textboxes to their default state with placeholder text.

    // Test if Mac OS' WebKit version supports HTML5 placeholder text in regular textboxes (eg. OS 10.4's WebKit does not support this). The OS' WebKit is different from Safari's WebKit.
    var supportsPlaceholder = (function(){
        var i = document.createElement("input");
        return "placeholder" in i; // Returns true or false if WebKit supports placeholders.
    })();

    if(supportsPlaceholder == true) {
        // Placeholder text is preferred because it relieves the user from having to delete the default text themselves.
        textboxHours.setAttribute("placeholder", "00");
        textboxMinutes.setAttribute("placeholder", "00");
        textboxSeconds.setAttribute("placeholder", "00");
    } else {
        // If WebKit doesn't support placeholders, leave the textboxes blank.
        textboxHours.value = "";
        textboxMinutes.value = "";
        textboxSeconds.value = "";
    }
}

function savePreferences() {
    // This function saves the user's preferences from the back of the widget into a preference file.
	if (window.widget) {
        // widget.identifier indicates this particular instance of the widget and allows for multiple instances with different preferences.
		widget.setPreferenceForKey(soundFileMenu.value, widget.identifier + "-soundfile");
		widget.setPreferenceForKey(checkboxPreventSleep.checked, widget.identifier + "-preventsleep");
        widget.setPreferenceForKey(checkboxNotifications.checked, widget.identifier + "-notifications");
        widget.setPreferenceForKey(checkboxRaiseVolume.checked, widget.identifier + "-raisevolume");
        widget.setPreferenceForKey(checkboxCheckUpdates.checked, widget.identifier + "-checkupdates");
        widget.setPreferenceForKey(textboxHours.value, widget.identifier + "-hours");
        widget.setPreferenceForKey(textboxMinutes.value, widget.identifier + "-minutes");
        widget.setPreferenceForKey(textboxSeconds.value, widget.identifier + "-seconds");
	}
}

function loadPreferences() {
    // This function loads the user's preferences into the back of the widget from a preference file.
	if (window.widget) {
        // widget.identifier indicates this particular instance of the widget and allows for multiple instances with different preferences.
		var savedSoundFile = widget.preferenceForKey(widget.identifier + "-soundfile");
		var savedPreventSleep = widget.preferenceForKey(widget.identifier + "-preventsleep");
        var savedNotifications = widget.preferenceForKey(widget.identifier + "-notifications");
        var savedRaiseVolume = widget.preferenceForKey(widget.identifier + "-raisevolume");
		var savedCheckUpdates = widget.preferenceForKey(widget.identifier + "-checkupdates");
        var savedHours = widget.preferenceForKey(widget.identifier + "-hours");
        var savedMinutes = widget.preferenceForKey(widget.identifier + "-minutes");
        var savedSeconds = widget.preferenceForKey(widget.identifier + "-seconds");
        
		if (savedSoundFile != undefined && savedPreventSleep != undefined && savedNotifications != undefined && savedRaiseVolume != undefined && savedCheckUpdates != undefined && savedHours != undefined && savedMinutes != undefined && savedSeconds != undefined) {
            // If there are saved settings, load them into the widget.
            soundFileMenu.value = savedSoundFile;
            checkboxPreventSleep.checked = savedPreventSleep;
            checkboxNotifications.checked = savedNotifications;
            checkboxRaiseVolume.checked = savedRaiseVolume;
            checkboxCheckUpdates.checked = savedCheckUpdates;
            textboxHours.value = savedHours;
            textboxMinutes.value = savedMinutes;
            textboxSeconds.value = savedSeconds;
		}
	}
}

function timerStartStop() {
    if (timerRunning == false) {
        // If timer isn't already running, start it.
        timerRunning = true;
        timerCountdown();
        alert("Timer started");
        // Hide the "Start" button and show the "Stop" button.
        buttonStart.style.display = "none";
        buttonStop.style.display = "block";
        // If checkbox on widget back is checked, prevent the computer from sleeping while the timer runs.
        if (checkboxPreventSleep.checked == true) {
            if (osXLionOrGreater == true) {
                // If the computer is running OS X 10.7 Lion or greater, use the "caffeinate" command to prevent sleep (caffeinate is OS X 10.7+ only). The "-i" flag prevents the computer from sleeing but allows the display to sleep. The "-d" flag prevents the display from sleeping too. The "-s" flag saves laptop battery life by preventing sleep only while on AC power, but not preventing sleep while on battery power. The caffeiante command is preferred because of its laptop battery benefits.
                preventSleepObject = widget.system("/usr/bin/caffeinate -i", nullFunction);
            } else {
                // If the computer is not running OS X 10.7 Lion or greater, use the "pmset" command to prevent sleep (works on all versions of OS X). The pmset command is not preferred because it has no battery benefits.
                preventSleepObject = widget.system("/usr/bin/pmset noidle", nullFunction);
            }
        }
        // Round textbox numbers up to prevent decimal values.
        textboxHours.value = Math.ceil(textboxHours.value);
        textboxMinutes.value = Math.ceil(textboxMinutes.value);
        textboxSeconds.value = Math.ceil(textboxSeconds.value);
        // Add preceding "0" to textbox values that are less than 10.
        textboxHours.value = addLeadingZero(textboxHours.value, true);
        textboxMinutes.value = addLeadingZero(textboxMinutes.value, true);
        textboxSeconds.value = addLeadingZero(textboxSeconds.value, true);
        // Save the user's timer settings to display them after the timer finishes. Also save the timer settings for when the widget is reloaded.
        timedHours = textboxHours.value;
        timedMinutes = textboxMinutes.value;
        timedSeconds = textboxSeconds.value;
        savePreferences();
        // Remove text selection focus from the textboxes.
        textboxSeconds.focus();
        textboxSeconds.blur();
        // Disable the textboxes from user input.
        textboxHours.disabled = true;
        textboxMinutes.disabled = true;
        textboxSeconds.disabled = true;
    } else {
        // If timer is already running, stop it.
        timerRunning = false;
        timerStop();
        alert("Timer stopped");
        // Hide the "Stop" button and show the "Start" button.
        buttonStart.style.display = "block";
        buttonStop.style.display = "none";
        // Enable the textboxes for user input.
        textboxHours.disabled = false;
        textboxMinutes.disabled = false;
        textboxSeconds.disabled = false;
        // If any "caffeinate" or "pmset" processes are running, cancel them to allow the computer to sleep.
        if (preventSleepObject) {
            preventSleepObject.cancel();
        }
    }
}

function timerCountdown() {
    countdown = setInterval(function(){
        // Subtract time from textbox values.
        if (textboxHours.value > 0 && textboxMinutes.value == 0 && textboxSeconds.value == 0) {
            textboxHours.value--;
            textboxMinutes.value = 60;
        }
        if (textboxMinutes.value > 0 && textboxSeconds.value == 0) {
            textboxMinutes.value--;
            textboxSeconds.value = 60;
        }
        if (textboxSeconds.value > 0) {
            textboxSeconds.value--;
        }
        // Add preceding "0" to textbox values that are less than 10.
        textboxHours.value = addLeadingZero(textboxHours.value, false);
        textboxMinutes.value = addLeadingZero(textboxMinutes.value, false);
        textboxSeconds.value = addLeadingZero(textboxSeconds.value, false);
        // Set textbox values that are "0" to be blank as "".
        if (textboxHours.value == 0 && textboxMinutes.value == 0 && textboxSeconds.value > 0) {
            textboxHours.value = "";
            textboxMinutes.value = "";
        }
        if (textboxHours.value == 0 && textboxMinutes.value > 0) {
            textboxHours.value = "";
        }
        // When the time reaches zero, alert the user.
        if (textboxHours.value == 0 && textboxMinutes.value == 0 & textboxSeconds.value == 0){
            timerStop();
            timerRunning = false;
            alert("Timer done");
            // Display a Notification Center message if the setting is checked on the back of the widget. The notification is displayed using a version of terminal-notifier.app (https://github.com/alloy/terminal-notifier), which has been modified slightly with a different icon and name (timer-notifier) to better match this widget.
            if (checkboxNotifications.checked == true) {
                widget.system('timer-notifier.app/Contents/MacOS/timer-notifier -group "Timer Widget" -title "Timer" -message "Timer is done." -execute "open /Applications/Dashboard.app"', nullFunction);
            }
            // Play alarm sound.
            if (soundFileMenu.value != "null") {
                playAlarmSound("Sounds/" + soundFileMenu.value);
            }
            // Revert textboxes to user's original timer setting after a brief delay, and enable the textboxes for user input.
            setTimeout(function(){
                textboxHours.value = timedHours;
                textboxMinutes.value = timedMinutes;
                textboxSeconds.value = timedSeconds;
                textboxHours.disabled = false;
                textboxMinutes.disabled = false;
                textboxSeconds.disabled = false;
                // Hide the "Stop" button and show the "Start" button.
                buttonStart.style.display = "block";
                buttonStop.style.display = "none";
                // If the user has chosen "None" as their alert sound on the back of the widget, and therefore no sound file plays that can activate the function endAlarmSound and cancel the caffeinate process, then cancel the caffeinate process now.
                if (soundFileMenu.value == "null") {
                    if (preventSleepObject) {
                        preventSleepObject.cancel();
                    }
                }
            }, 2000);
        }
    }, 1000);
}

function timerStop() {
    clearInterval(countdown);
}

function addLeadingZero(number, blankzero) {
    if (number < 10 && number.substring(0,1) != 0) {
        // If the number is less than 10 and doesn't already have a leading 0, add one.
        return "0" + number;
    } else if (number == 0 && blankzero == false) {
        // If the number is 0, add a leading zero so the result is "00".
        return "00";
    } else if (number == 0 && blankzero == true) {
        // If the number is 0 and blankzero is true, make the number "" to show the placeholder zeroes.
        return "";
    } else {
        // If the number is greater than 9 and not 0, leave it as is.
        return number;
    }
}

function typeOnlyNumbers(event) {
    // Allow only numbers 0-9 to be typed into text boxes, blocking all other characters.
    // To use this function, add 'onkeypress="return typeOnlyNumbers(event)"' to all textboxes.
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 57 && (charCode < 91 || charCode > 92) && (charCode < 144 || charCode > 145)) {
        alert("Blocked character " + charCode);
        return false;
    } else {
        alert("Allowed character " + charCode);
        return true;
    }
}

function playAlarmSound(file) {
    // If the user has checked the checkbox for Raise System Volume, save the current system volume and mute states in variables, then unmute and raise the volume. (Uses AppleScript via the command line osascript tool)
    if (checkboxRaiseVolume.checked == true) {
        systemVolumeQuery = widget.system('osascript -e "output volume of (get volume settings)"', nullFunction).replace(/[\n\r]/g, '');
        systemMutedQuery = widget.system('osascript -e "output muted of (get volume settings)"', nullFunction).replace(/[\n\r]/g, '');
        widget.system('osascript -e "set volume output volume 75 output muted false"', nullFunction);
    }
    // Add the sound HTML to the widget to make the sound play.
    alarmSoundArea.innerHTML = '<audio autoplay id=\"alarmSound\" onended="endAlarmSound();"><source src=\"' + file + '\" type=\"audio/wav\"></audio>';
}

function endAlarmSound() {
    // After the sound has finished playing, restore the system volume and mute to their original states if this setting is enabled on the back of the widget.
    if (checkboxRaiseVolume.checked == true) {
        // Prepare the terminal command for restoring volume and mute to their prior states by removing all \n and \r line-break characters (terminal outputs line breaks at the end of systemVolumeQuery.outputString and systemMutedQuery.outputString).
        alert("systemVolumeQuery " + systemVolumeQuery.outputString + "systemMutedQuery " + systemMutedQuery.outputString + ".");
        var terminalCommand = ('osascript -e "set volume output volume ' + systemVolumeQuery.outputString + ' output muted ' + systemMutedQuery.outputString + '"').replace(/[\n\r]/g, '');
        widget.system(terminalCommand, nullFunction);
    }
    // Allow computer to sleep by cancelling the caffeinate process.
    if (preventSleepObject) {
        preventSleepObject.cancel();
    }
}

function checkOSXVersionLion() {
    // If the OS X version number (parsed to remove the last "." for ease of math) is greater than or equal to 10.7 Lion, return true, otherwise return false.
    if (osXVersion.outputString.substring(0, osXVersion.outputString.lastIndexOf(".")) >= 10.7) {
        // OS is greater than or equal to 10.7 Lion.
        return true;
    } else {
        // OS is not greater than or equal to 10.7 Lion.
        return false;
    }
}

function nullFunction() {
    //This empty function exists to allow asynchronous widget.system terminal commands. Without a function to call when using widget.system, the command would run synchronously and could cause the widget to hang until the the command line process exits. For this widget, no functions are really needed after the widget.system commands finish, but asynchronous execution is very useful, thus this nullFunction.
}

function checkUpdates() {
	// Hide the updateIcon in case there's no update available or if checkbox on widget back is not checked,.
	updateIcon.style.display = "none";
    // If checkbox on widget back is checked, begin checking for updates.
    if (checkboxCheckUpdates.checked == true) {
		var xmlHttp = new XMLHttpRequest();
		// Before connecting, plan out what will happen once the connection is made. (ie. if there is or isn't an update available.) Some checks should be made here to verify that there truly is a later version available before informing the user.
		xmlHttp.onreadystatechange = function() {
            // If the connection is successful...
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                // And if there is resposeText, and not just a blank file...
				if (xmlHttp.responseText != undefined) {
                    // And if the responseText is a valid number only... (the isNaN function limits the version number format so versions like "1.1a", "1.0.1", or "null" aren't possible)
                    if (!isNaN(xmlHttp.responseText)) {
                        // Compare the version number of the currently-running widget to the number found online.
                        var currentVersion = "1.0";
                        var onlineVersion = xmlHttp.responseText;
                        // If the online version is greater than the currently-running one, notify the user, otherwise do nothing.
                        if (currentVersion < onlineVersion) {
                            // Display a Notification Center message (regardless of whether the "notification messages" setting is checked on the back of the widget). The notification is displayed using a version of terminal-notifier.app (https://github.com/alloy/terminal-notifier), which has been modified slightly with a different icon and name (timer-notifier) to better match this widget.
                            widget.system('timer-notifier.app/Contents/MacOS/timer-notifier -group "Timer Widget Update" -title "Timer" -subtitle "Software update available" -message "Download the latest Timer widget update at www.lucaspetter.com" -open "https://www.lucaspetter.com/software/timer"', nullFunction);
                            // Display the updateIcon on the front of the widget, which links to the page for downloading the new version.
                            updateIcon.style.display = "block";
                            // Output the update info to the Console.
                            alert("Software update available for this widget at www.lucaspetter.com. Current version is " + currentVersion + ", available version is " + onlineVersion + ".");
						}
					}
				}
			}
		}
        // Connect to this URL, where a text file is located that contains the latest version number for the widget. This file's number will be increased whenever a new widget version is released. The file contents will be a number only, such as "1.0" or "1.1", etc, allowing for easy comparison.
		xmlHttp.open("GET", "https://raw.githubusercontent.com/lucaspetter/timer/master/latest_version_number.txt", true);
        // Set a header to prevent caching, just in case.
		xmlHttp.setRequestHeader("Cache-Control", "no-cache");
        xmlHttp.send(null);
	}
}
