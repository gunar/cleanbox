CleanBox for Gmail
==================

## Please don't try to use this yet as I haven't finished cleaning the code and testing.

Inbox zero script and methodology. This is a Google Apps Script.

## Installation

- Set timers
 - snoozeAllSentMail every six hours;
 - moveUnreadToInbox every 5 minutes;
 - archiveAllReadThreads every minute;
 - updateSnoozerLabels at midnight;
 - clearSnoozeFromRespondedThreads every minute.

## Methodology

- To be written.

### Sketch

- Mute
 - Forever
 - Until snooze
- Valid snoozer labels:
 - YYYY-mm-dd
 - YY-mm-dd
 - d + "d"

## Inspired by

- Leo Babauta's [Empty Gmail Hack](http://leobatauta.com/gm);
- Inbox zero;
- [Gmail Snooze](http://googleappsdeveloper.blogspot.com.br/2011/07/gmail-snooze-with-apps-script.html);
- [Boomerang4Gmail](http://www.boomeranggmail.com).

## To do

- Unite moveUnreadToInbox and clearSnoozeFromRespondedThread;
- Get threads in "pages" (100 at a time);
- Write methodology;
- Send later (?);
- Optional autoSnoozeLabel;
- Optional to delete empty labels;
 - Not done this way today for easiness of typing.
