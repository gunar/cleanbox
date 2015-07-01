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
var FULLDATE_REGEX = /([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})/m;

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
    // TODO clearEmptyInvalidLabels();
}

/**
 * Checks if an label belogs to the snoozer.
 * @args labelName
 * @returns Boolean
 */
function isSnoozerLabel ( labelName )
{
    if ( labelName.substring( 0, SNOOZER_PREFIX.length+1 ) == SNOOZER_PREFIX.concat('/'))
    {
        return true;
    }
    return false;
}

/**
 * Checks if an array has any valid snoozer labels.
 * @param Array of labels.
 * @return Boolean
 */
function hasSnoozerLabel ( labels )
{
    for (k = 0; k < labels.length; k++)
    {
        labelName = labels[k].getName();
        if (  isSnoozerLabel( labelName ) )
        {
            return true;
        }
    }
    return false;
}

/**
 * Archives read threads -- only threads in inbox because moveUnreadToInbox will
 * move them there anyway, so we save computational time ;-)
 * @return null
 */
function archiveAllReadThreads ()
{
    var searchString = 'in:inbox is:read';
    threads = GmailApp.search(searchString);
    GmailApp.moveThreadsToArchive(threads);
}

/**
 * Marks all snoozed mail as unread so the number of messages is shown on the left.
  * @returns null
 */
function markSnoozedUnread ()
{
    var userlabels = GmailApp.getUserLabels();
    for (k = 0; k < userlabels.length; k++)
    {
        labelName = userlabels[k].getName();

        /* Ignore non-snoozer related labels */
        if ( !isSnoozerLabel( labelName ) )
        {
            continue;
        }

        var searchString = 'label:' + labelName;
        threads = GmailApp.search( searchString );
        GmailApp.markThreadsUnread( threads );

    }
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
    aliases = GmailApp.getAliases();
    for (i=0; i < aliases.length; i++)
    {
        if (aliases[i] == addr)
        {
            return true;
        }
    }
    return false;
}

/**
 * Marks sent messages to come back to inbox after DAYS_TO_WAIT days.
 * @returns null
 */
function snoozeAllSentMail()
{
    /* GmailApp.createLabel creates a new label only if it doesn't exist. */
    var newLabel = GmailApp.createLabel(SNOOZER_PREFIX + '/' + DAYS_TO_WAIT);
    var snoozerLabel = GmailApp.createLabel(SNOOZER_PREFIX);

    /* All sent messages from initialDate on will me marked. */
    var initialDate = new Date();
    initialDate.setDate(initialDate.getDate() - DAYS_TO_SEARCH);
    var dateString = initialDate.getFullYear() + "/" + (initialDate.getMonth() + 1) + "/" + initialDate.getDate();

    var searchString = "in:Sent -label:"+SNOOZER_PREFIX+" after:" + dateString;
    threads = GmailApp.search(searchString);

    for (var i = 0; i < threads.length; i++)
    {
        var thread = threads[i];
        if (!(SINGLE_MESSAGE_ONLY && thread.getMessageCount() > 1))
        {
            var messages = thread.getMessages();
            var lastMessage = messages[messages.length-1];
            senderOfLastMessage = lastMessage.getFrom().match(EMAIL_REGEX)[0];
            if (isThisEmailAddressMine(senderOfLastMessage))
            {
                if (!hasSnoozerLabel(thread.getLabels()))
                {
                    newLabel.addToThread(thread);
                    snoozerLabel.addToThread(thread);
                }
            }
        }
    }
}

/**
 * Translates YYYY-mm-dd to the number of days.
 * @return null
 */
function translateLabels()
{
    var today = new Date();
    var userlabels = GmailApp.getUserLabels();

    for (var k = 0; k < userlabels.length; k++)
    {
        var label = userlabels[k];
        var labelName = label.getName();
        var threads = label.getThreads();
      
        if (!isSnoozerLabel(labelName))
        {
            continue;
        }
      
        if (labelName == SNOOZER_MUTE_LABEL)
        {
            continue;
        }

        var dateStr = labelName.substring(SNOOZER_PREFIX.length);
        /* Parse YYYY-mm-dd and YY-mm-dd date formats. */
        var matches = dateStr.match(FULLDATE_REGEX);

        // Ignore unmatched label. Mark invalid labels.
        if (!!!matches)
        {
            if (!DAY_REGEX.test(dateStr))
            {
                GmailApp.createLabel(SNOOZER_PREFIX + '/invalidLabel').addToThreads(threads);
                GmailApp.markThreadsUnread(threads).moveThreadsToInbox(threads);
            }
            continue;
        }

        d = matches[3];
        m = parseInt(matches[2])-1;
        if (matches[1].length == 2)
        {
            y = "20" + matches[1];
        }
        else
        {
            y = matches[1];
        }

        date = new Date(y, m, d);
      
        // Move back to inbox if date in the past
        if (today > date)
        {
            GmailApp.markThreadsUnread(threads).moveThreadsToInbox(threads);
            label.deleteLabel();
            continue;
        }

        var inDays = Math.ceil((date - today)/(24*3600*1000));
      
        var newLabelName = SNOOZER_PREFIX + '/' + inDays;
        GmailApp.createLabel(newLabelName).addToThreads(threads);

        label.deleteLabel();

    }
}

/**
 * Decreases the number (representing days) in each label of the snoozer.
 * @returns null
 */
function updateSnoozerLabels()
{
    translateLabels();

    var userlabels = GmailApp.getUserLabels();
    snoozerLabel = GmailApp.createLabel(SNOOZER_PREFIX);
    labelMute = GmailApp.createLabel(SNOOZER_MUTE_LABEL);

    for (k = 0; k < userlabels.length; k++)
    {

        labelName = userlabels[k].getName();

        /* Ignore non-snoozer related labels */
        if (!isSnoozerLabel( labelName ))
        {
            continue;
        }

        /* Ignore mute label */
        if (labelName == SNOOZER_MUTE_LABEL)
        {
            continue;
        }

        label = labelName.substring(SNOOZER_PREFIX.length);
        /* If label matches a number of days */
        numOfDays = label.match(/([0-9]+)/m);
        if (numOfDays)
        {
            var threads = userlabels[k].getThreads();
            if (threads.length == 0)
            {
                /* We could delete the label here. No threads left. */
                continue;
            }

            /**
             * Here we decrease the label number. When it reaches zero it's time
             * to move the threads back into Inbox and mark it unread.
             */
            if (numOfDays[1] == 1)
            {
                /* Unmute if it was muted. */
                labelMute.removeFromThreads(threads);
                GmailApp.markThreadsUnread(threads).moveThreadsToInbox(threads);
                snoozerLabel.addToThreads(threads);
            }
            else
            {
                var newLabelName = SNOOZER_PREFIX + '/' + (numOfDays[1]-1)
                GmailApp.createLabel(newLabelName).addToThreads(threads);
            }
            /* Remove old label from threads with new label. */
            userlabels[k].removeFromThreads(threads);

            /* We could delete old label here. */
            //userlabels[k].deleteLabel(); 
        }
        else
        {
          // todo invalid label
        }
    }
}

/**
 * Removes snooze label if someone responded in the thread.
 * @returns null
 */
function unsnoozeThreadsWithResponse ()
{
    threads = GmailApp.search('is:unread in:inbox');

    for (i = 0; i < threads.length; i++)
    {
        thread = threads[i];
        labels = thread.getLabels();

        /* Check if thread is muted. */
        muted = false;
        for (k = 0; k < labels.length; k++)
        {
            labelName = labels[k].getName();
            if (labelName == SNOOZER_MUTE_LABEL)
            {
                muted = true;
                break;
            }
        }

        /* Remove any snoozer related thread. */
        for (k = 0; k < labels.length; k++)
        {
            label = labels[k];
            labelName = label.getName();

            /* Skip label "mute" */
            if (labelName == SNOOZER_MUTE_LABEL)
            {
                continue;
            }

            if (isSnoozerLabel(labelName))
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
        }
    }
}
