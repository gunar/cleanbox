CleanBox for Gmail
==================

## Please don't try to use this yet as I haven't finished cleaning the code and testing.

Inbox zero script and methodology. This is a Google Apps Script.
This has kept me sane.

But now Google Inbox has it? Well, I don't like Inbox. I'm a power user and
I want to do with my mail whatever I want. That being:

- Auto-snoozing (boomerang) sent mail
- Mute threads
- Auto-archiving read mail
- ...

## Installation

- Create a new script in your GDrive
- Copy and paste the contents of script.js
- Set timers
 - minuteTimer every minute;
 - dailyTimer at midnight.
- Enjoy ;-)

## Methodology (unfinished)

Once you open an email, that's it. You have to take action, for it will be lost
forever. All read mail are automagically archived.

All sent mail is marked to come back to inbox after 10 days, unless marked with
a different snooze date.

All snoozed mail are marked unread so you can see them on the labels list.

Having two snoozers on the same email should work okay. You'll get the email
back to your inbox on both dates.

Muted and snoozed threads are kept muted until end of snooze time.
Muted threads without snooze are muted forever.

### Sketch

- Mute
 - Forever
 - Until snooze
- Valid snoozer labels:
 - YYYY-mm-dd
 - YY-mm-dd
 - d

## Inspired by

- Leo Babauta's [Empty Gmail Hack](http://leobatauta.com/gm);
- Inbox zero;
- [Gmail Snooze](http://googleappsdeveloper.blogspot.com.br/2011/07/gmail-snooze-with-apps-script.html);
- [Boomerang4Gmail](http://www.boomeranggmail.com).

## To do

Not in any specific order.

- Create useful labels on first run
- Get threads in "pages" (100 at a time)
- Finish README.md
 - Finish methodology
- Optional to delete empty labels

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
