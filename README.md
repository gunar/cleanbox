CleanBox for Gmail
==================

## Please don't try to use this yet as I haven't finished cleaning the code and testing.

Inbox zero script and methodology. This is a Google Apps Script.
This has kept me sane.

But Google Inbox already has it? Well

## Installation

- Set timers
 - snoozeAllSentMail every six hours;
 - moveUnreadToInbox every 5 minutes;
 - archiveAllReadThreads every minute;
 - updateSnoozerLabels at midnight;
 - unsnoozeThreadsWithResponse every minute.

## Features

- Snooze
- Mute

## Methodology

- To be written.
All sent mail is marked to come back to inbox after 10 days, unless marked with
a different snooze date.

Muted and snoozed threads are kept muted until end of snooze time.
Muted threads without snooze are muted forever.

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

Not in any specific order.

- Test!
- Unite moveUnreadToInbox and clearSnoozeFromRespondedThread
- Get threads in "pages" (100 at a time)
- Write methodology
- Optional autoSnoozeLabel
- Optional to delete empty labels
 - Not done this way today for easiness of typing

### Version 2.0

- Do the installation like Gmail Delay Send does
 - https://developers.google.com/apps-script/guides/triggers/installable
- Allow custom timespans
 - We could use PropertiesService to save last run time and update labels with
 the time passed
  - There could be a timer running every minute just to update "x days" labels
to it's absolute correspondent value
  - https://developers.google.com/apps-script/reference/properties/properties-service
- Send later (?)
