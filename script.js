/*
// TODO  Get threads in "pages" of 100 at a time
// Send later?

Based on
Leo Babauta's Empty Gmail Hack (http://leobabauta.com/gm)
Inbox Zero 
Gmail Snooze  (http://googleappsdeveloper.blogspot.com.br/2011/07/gmail-snooze-with-apps-script.html)
Boomerang4Gmail


Copyright (c) 2015, Gunar Cassiano Gessner
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of [project] nor the names of its
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

/***************************** VARIABLES *****************************/
/*
 * SNOOZER_PREFIX (category) for snooze labels.
 * E.g.: _snooze/1d, _snooze/2d
 */
var SNOOZER_PREFIX = '_snooze';
// TODO
// ---------------- BOOMERANG ALL SENT MAIL -----------------------
  
var DAYS_TO_SEARCH = 10;
// exclude multi-message conversations where I sent the last message? 
var SINGLE_MESSAGE_ONLY = false; 
var DAYS_TO_WAIT = 7;




/************************* HELPER FUNCTIONS **************************/

/**
 * Checks if a label belogs to the snoozer.
 * @param Array of labels.
 * @return Boolean
 */
function hasSnoozerPrefix ( labels )
{
    for (k = 0; k < labels.length; k++)
    {
        labelName = labels[k].getName();
        if ( labelName.substring( 0, SNOOZER_PREFIX.length+1 ) == SNOOZER_PREFIX+'/')
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
    var readThreads = GmailApp.search('label:inbox is:read');
    for (var i = 0; i < readThreads.length; i++) {
        readThreads[i].moveToArchive();
    }
}

/**
 * Move all unread threads to inbox. Why? This script archives the message while
 * you are reading it, so this way if you mark it unread it'll stay in inbox.
 * @return null
 */
function moveUnreadToInbox()
{
    var searchString = "is:unread";
    threads = GmailApp.search(searchString);
    for (var i = 0; i < threads.length; i++)
    {
        var thread = threads[i];
        GmailApp.markThreadUnread(thread);
        GmailApp.moveThreadToInbox(thread);
    }
}

/**
 * Checks if an email address belogs to the current user.
 * @return Bolean
 */
function isThisEmailAddressMine ( addr )
{
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
 * Marks sent messages to come back to inbox after  DAYS_TO_WAIT days.
 * @returns null
 */
function boomerangAllSentMails()
{
  var newLabel = GmailApp.createLabel(SNOOZER_PREFIX + '/' + DAYS_TO_WAIT + 'd')
  var snoozeLabel = GmailApp.createLabel(SNOOZER_PREFIX);
  var autoSnoozeLabel = GmailApp.createLabel('autoSnooze');
  var EMAIL_REGEX = /[a-zA-Z0-9\._\-]+@[a-zA-Z0-9\.\-]+\.[a-z\.A-Z]+/g;
  var d = new Date();
  d.setDate(d.getDate() - DAYS_TO_SEARCH);
  var dateString = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
  var searchString = "in:Sent -label:"+SNOOZER_PREFIX+" after:" + dateString;
  threads = GmailApp.search(searchString);
  Logger.log(searchString);
  for (var i = 0; i < threads.length; i++)
  {
    var thread = threads[i];
    if (!(SINGLE_MESSAGE_ONLY && thread.getMessageCount() > 1))
    {
      var messages = thread.getMessages();
      var lastMessage = messages[messages.length-1];
      lastMessageSender = lastMessage.getFrom().match(EMAIL_REGEX)[0];
      if (isThisEmailAddressMine(lastMessageSender))
      {
        /* Verifica se já tem label snooze */
        if (!hasSnoozerPrefix(thread.getLabels()))
        {
          Logger.log('Adding label to '+lastMessage.getSubject());
          newLabel.addToThread(thread);
          snoozeLabel.addToThread(thread);
          autoSnoozeLabel.addToThread(thread);
        }
      }
    }
  }
}






/*

Substitui labels YYYY-mm-dd ou YY-mm-dd pelo nro de dias

                                                            */
function updateLabels()
{
var now = new Date();
    var userlabels = GmailApp.getUserLabels();
  // loop por todas labels
  for (var k = 0; k < userlabels.length; k++)
  {
     name = userlabels[k].getName();
    // não começa com SNOOZER_PREFIXo => nao eh de nosso interesse
    if (name.substring(0,SNOOZER_PREFIX.length+1) != SNOOZER_PREFIX+'/')
    {
      continue;
    }
    /* Ignore mute label */
    if (name == SNOOZER_PREFIX+'/mute')
    {
      continue;
    }
    label = name.substring(SNOOZER_PREFIX.length);
    // pega data
    var matched = label.match(/([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})/m);
    if (!matched)
    {
      continue;
    }
    d = matched[3];
    m = parseInt(matched[2] -1);
    if (matched[1].length == 2)
    {
      y = 20 + matched[1];
    }
    else
    {
      y = matched[1];
    }
    
    date = new Date(y, m, d);

    
    inDays = parseInt((date - now)/(24*3600*1000));
    var newLabelName = SNOOZER_PREFIX + '/' + inDays + 'd';
    newLabel = GmailApp.createLabel(newLabelName);
    
    var messages = userlabels[k].getThreads();
    
    userlabels[k].removeFromThreads(messages);
    userlabels[k].deleteLabel();
    newLabel.addToThreads(messages);
  }
}



// -------------------------- DAILY UPDATE SNOOZES -----------------------
function updateSnoozes()
{
  /*
   * Roda função que atualiza datas para número de dias
   */
  updateLabels();
  
  var userlabels = GmailApp.getUserLabels();
  SNOOZER_PREFIXlabel = GmailApp.getUserLabelByName(SNOOZER_PREFIX);
  labelMute = GmailApp.getUserLabelByName(SNOOZER_PREFIX+'/mute');
  Logger.clear();
  /*************** loop pelas labels ***************/
  for (k = 0; k < userlabels.length; k++)
  {
    
    // não começa com SNOOZER_PREFIXo => nao eh de nosso interesse
    name = userlabels[k].getName();
    if (name.substring(0,SNOOZER_PREFIX.length+1) != SNOOZER_PREFIX+'/')
    {
      continue;
    }
    
    /* Ignore mute label */
    if (name == SNOOZER_PREFIX+'/mute')
    {
      continue;
    }
    
    
    label = name.substring(SNOOZER_PREFIX.length);
    var matched = label.match(/([0-9]+)d/m);
    if (matched)
    {
      var threads = userlabels[k].getThreads();
      // aqui poderia deletar a label, pois não tem mais nenhum e-mail com essa label
      if (threads.length == 0)
      {
        continue;
      }
      // devolve ao inbox
      if (matched[1] <= 1)
      {
        labelMute.removeFromThreads(threads);
        GmailApp.markThreadsUnread(threads);
        //GmailApp.moveThreadsToInbox(threads);
        SNOOZER_PREFIXlabel.addToThreads(threads);
      }
      //troca label
      else
      {
        var newLabelName = SNOOZER_PREFIX + '/' + (matched[1]-1) + 'd';
        GmailApp.createLabel(newLabelName).addToThreads(threads);
      }
      userlabels[k].removeFromThreads(threads);
        /* Remove label */
        //userlabels[k].deleteLabel(); não remove para ser mais fácil o dropdown na hora de colocar label
    }
  }
}

// ---------------------- CLEAR HEARD BACKS ----------------------------
function clearHeardBacks()
{
  threads = GmailApp.search('is:unread -in:sent -in:trash');
  //threads = GmailApp.getInboxThreads();
  
  // Loop inbox threads
  for (i = 0; i < threads.length; i++)
  {
    thread = threads[i];
    labels = thread.getLabels();
    /* Check for muted thread */
    muted = false;
    moved = false;
    
    
    /************** CHECK FOR MUTE LABEL ***************/
    for (k = 0; k < labels.length; k++)
    {
      label = labels[k];
      name = label.getName();
      if (name == SNOOZER_PREFIX+'/mute')
      {
        muted = true;
        break;
      }
    }
    
    // loop thread labels
    for (k = 0; k < labels.length; k++)
    {
      label = labels[k];
      name = label.getName();
      if (name == SNOOZER_PREFIX+'/mute')
      {
        continue;
      }
      if (name.substring(0,SNOOZER_PREFIX.length+1) == SNOOZER_PREFIX+'/')
      {
        moved = true;
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
    /************** FOREVER MUTED THREADS ************/
    if (muted && !moved)
    {
       thread.moveToArchive();
       thread.markRead();
    }
  }
}
