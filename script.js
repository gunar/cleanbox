/*

   Copyright (c) 2015, Gunar Cassiano Gessner
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 * Neither the name of Cleanbox nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

/**
 * 
 *                         USER DEFINITIONS
 *
 */

/*
 * SNOOZER_PREFIX (category) for snooze labels.
 * E.g.: _/1, _/2
 */
SNOOZER_PREFIX = '_';

/* Label defined as mute. It's going to be something like _/mute */
MUTE_LABEL = 'mute';

/* How many days back should the script search for sent mails to be labeled. */  
var DAYS_TO_SEARCH = 2;

/* Snooze (boomerang) sent mail only if it's not a thread. */
var SINGLE_MESSAGE_ONLY = false; 

/* How many days to wait for a response before coming back to inbox. */
var DAYS_TO_WAIT = 7;

/* How many labels should we keep (represents number of days) */
var MAX_LABELS = 10;

/**
 * 
 *                            CONSTANT
 *
 */

/* Construct mute label */
SNOOZER_MUTE_LABEL = SNOOZER_PREFIX+'/' + MUTE_LABEL;

/* This is used to parse the sender's mail address. Should be okay like this. */
var EMAIL_REGEX = /[a-zA-Z0-9\._\-]+@[a-zA-Z0-9\.\-]+\.[a-z\.A-Z]+/g;

/* Checks for valid "in x days" label. */
var DAY_REGEX = /[0-9]+/;

/* Check of valid full date label. */
var FULL_DATE_REGEX = /^([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})$/;

/**
 * 
 *                            FUNCTIONS
 *
 */


/**
 * Executes functions every minute.
 * @returns null
 */
function minuteTimer()
{
    archiveAllReadThreads();
    unsnoozeThreadsWithResponse();
    markSnoozedUnread();
}

/**
 * Execute functions every days (midnight).
 * @returns null
 */
function dailyTimer() {
    snoozeAllSentMail();
    updateSnoozerLabels();
}

/**
 * Checks if an label belogs to the snoozer.
 * @args labelName
 * @returns Boolean
 */
function isSnoozerLabel ( labelName )
{
    return ( labelName.substring( 0, SNOOZER_PREFIX.length+1 ) == SNOOZER_PREFIX.concat('/') );
}

/**
 * Checks if an array has any valid snoozer labels.
 * @param Array of labels.
 * @return Boolean
 */
function hasSnoozerLabel ( labels )
{
    return labels.some(function (e, i, a){
        return isSnoozerLabel(e.getName());
    });
}

/**
 * Archives read threads -- only threads in inbox because moveUnreadToInbox will
 * move them there anyway, so we save computational time ;-)
 * @return null
 */
function archiveAllReadThreads ()
{
    var searchString = 'in:inbox is:read';
    var threads = GmailApp.search(searchString);
    GmailApp.moveThreadsToArchive(threads);
}

/**
 * Marks all snoozed mail as unread so the number of messages is shown on the left.
 * @returns null
 */
function markSnoozedUnread ()
{
    GmailApp.getUserLabels().forEach(function (e, i, a){
        var labelName = e.getName();
        if ( isSnoozerLabel( labelName ))
        {
            var searchString = 'label:' + labelName;
            var threads = GmailApp.search( searchString );
            GmailApp.markThreadsUnread( threads );
        }
    });
}

/**
 * Checks if an email address belogs to the current user.
 * @return Bolean
 */
function isThisEmailAddressMine ( addr )
{
    if (Session.getActiveUser().getEmail() == addr)
    {
        return true;
    }
    return GmailApp.getAliases().some(function (e, i, a){
        return e == addr;
    });
}

/**
 * Marks sent messages to come back to inbox after DAYS_TO_WAIT days.
 * @returns null
 */
function snoozeAllSentMail()
{
    /* GmailApp.createLabel creates a new label only if it doesn't exist. */
    var newLabel = GmailApp.createLabel(SNOOZER_PREFIX + '/' + DAYS_TO_WAIT);

    var searchString = 'in:Sent -label:'+SNOOZER_PREFIX+' newer_than:' + DAYS_TO_SEARCH + 'd';

    GmailApp.search( searchString ).forEach(function (thread, i, a){
        if (SINGLE_MESSAGE_ONLY && thread.getMessageCount() > 1)
        {
            return;
        }
        var lastMessage = thread.getMessages().pop();
        var senderOfLastMessage = lastMessage.getFrom().match(EMAIL_REGEX)[0];
        if (isThisEmailAddressMine(senderOfLastMessage))
        {
            /* Snooze only if it hasn't a snooze already. */
            if (!hasSnoozerLabel(thread.getLabels()))
            {
                newLabel.addToThread(thread);
            }
        }
    });
}

/**
 * Deletes label if exceeding limit.
 * @returns null
 */
function deleteLabel( numOfDays, label )
{
    if (numOfDays > MAX_LABELS)
    {
        label.deleteLabel();
    }
}

/**
 * Translate YYYY-mm-dd labels to a number of days and decreases the number
 * (representing days) in each label of the snoozer.
 * @returns null
 */
function updateSnoozerLabels()
{
    var labelMute = GmailApp.createLabel(SNOOZER_MUTE_LABEL);

    GmailApp.getUserLabels().forEach(function (label, i, a){
        var labelName = label.getName();
        var threads = label.getThreads();

        /* Ignore mute and non-snoozer related labels */
        if  ((!isSnoozerLabel( labelName )) || (labelName == SNOOZER_MUTE_LABEL))
        {
            return;
        }

        var dateStr = labelName.substring(SNOOZER_PREFIX.length +1);
        var fullDate = dateStr.match(FULL_DATE_REGEX);
        var numOfDays = dateStr.match(DAY_REGEX);

        /* Parse YYYY-mm-dd and YY-mm-dd date pattern. */
        if (!!fullDate)
        {
            var d = fullDate[3];
            var m = parseInt(fullDate[2], 10)-1;
            var y = fullDate[1];
            if (fullDate[1].length == 2)
            {
                /* WARNING: "20" will break in year 2100 ;-) */
                y = "20" + y;
            }

            var date = new Date(y, m, d);
            var inDays = Math.ceil((date - new Date())/(24*60*60*1000));
            if (inDays <= 1)
            {
                GmailApp.markThreadsUnread(threads).moveThreadsToInbox(threads);
            }
            /* Keep the YYYY-mm-dd pattern */
            else if (inDays > MAX_LABELS)
            {
                date.setDate(date.getDate() - 1);
                var newLabelName = SNOOZER_PREFIX + '/' + date.toISOString().substring(0, 10);
                GmailApp.createLabel( newLabelName ).addToThreads(threads);
            }
            /* Translate into the numOfDays pattern */
            else
            {
                var newLabelName = SNOOZER_PREFIX + '/' + ( inDays );
                GmailApp.createLabel(newLabelName).addToThreads(threads);
            }

            label.deleteLabel();
        }
        /* Parse a number-only label */
        else if (!!numOfDays)
        {
            numOfDays = numOfDays[1];
            if (threads.length == 0)
            {
                deleteLabel( numOfDays, label );
                return;
            }

            label.removeFromThreads(threads);

            /**
             * Here we decrease the label number. When it reaches zero it's time
             * to move the threads back into Inbox and mark it unread.
             */
            if (numOfDays == 1)
            {
                /* Unmute if it was muted. */
                labelMute.removeFromThreads(threads);
                GmailApp.markThreadsUnread(threads).moveThreadsToInbox(threads);
            }
            else
            {
                var newLabelName = SNOOZER_PREFIX + '/' + (numOfDays-1)
                    GmailApp.createLabel(newLabelName).addToThreads(threads);
            }

            deleteLabel( numOfDays, label );

        }
        /* Invalid snoozer-related label. */
        else
        {

            if (threads.length == 0)
            {
                label.deleteLabel();
            }
            else
            {
                GmailApp.createLabel(SNOOZER_PREFIX + '/invalidLabel').addToThreads(threads);
                GmailApp.markThreadsUnread(threads).moveThreadsToInbox(threads);
            }
        }
    });
}

/**
 * Removes snooze label if someone responded in the thread.
 * @returns null
 */
function unsnoozeThreadsWithResponse ()
{
    GmailApp.search('is:unread in:inbox').forEach(function (thread, i, a){
        var labels = thread.getLabels();

        /* Check if thread is muted. */
        var muted = labels.some(function (e, i, a){
            return e.getName() == SNOOZER_MUTE_LABEL;
        });

        /* Remove any snoozer related thread. */
        labels.forEach(function (label, i, a){
            var labelName = label.getName();

            /* Skip label "mute" */
            if (labelName == SNOOZER_MUTE_LABEL)
            {
                return;
            }

            if (isSnoozerLabel( labelName ))
            {
                if (muted)
                {
                    thread.moveToArchive();
                    thread.markRead();
                }
                else
                {
                    label.removeFromThread(thread);
                }
            }
        });
    });
}
