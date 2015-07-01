CleanBox for Gmail
==================

Inbox Zero methodology and Google Apps Script for Gmail.

This has kept me sane since 2013.

## Installation

Copy and paste the script into a Google Apps Script in your GDrive.
Create the following triggers:

- Run function "minuteTimer" every minute
- Run function "dailyTimer" once at midnight

Feeling lost? Follow the [complete guide].

## Methodology

> [...] your inbox will only have unread messages … which means, after you read
an email, if you do nothing with it, it'll disappear out of your inbox after a
few seconds. Zap it's gone!
> The power of this is that you know a message will disappear after you read
it, so you are motivated to act on it right away. You should therefore do one of
these things:

 - Reply or act/reply immediately if it takes a minute or less.
 - Put it on your todo list, and star it, if you need to act or write a longer reply later.
 - Put it on your calendar immediately if it's something you need to do on a certain date.

> Otherwise, just hit ~~archive~~ next, and it'll ~~auto-~~advance to the next
message. You can process a dozen messages like this in a minute or three, and
then your inbox is empty again! -- from Leo Babauta's [empty gmail hack].

### Follow-up on sent email

Sent mail is automagically labeled to come back to inbox after 7 days
(user-defined).

### Snooze email

You can snooze any message. Simply create/apply a label to it with the number
of days. This label should be nested under the "_" (user-defined) label.
The message will return to your inbox in the defined day.

You can even watch it go from one label to the other as the days go by
(e.g. _/5 to _/4) ;-).

Snoozed mail are marked unread so you can see them on the labels list.

#### Full date pattern

You can also snooze messages with the `YYYY-mm-dd` date pattern.
The script will comply to this pattern until the date is within 7 days
(user-defined), when it will be translated to the single digit pattern.

Valid patterns are:

- days: `dd` and `d`
- months: `mm` and `m`
- years: `YYYY` and `YY`

 The script prepends `20`, so `17` yelds `2017` and not `1917` like javascript
would so dearly like to do.

#### Multiple snooze dates

Having two snooze dates on the same email should work. You'll get the email
back to your inbox on both dates.

### Mute

You can mute any thread by applying the label "_/mute". Muted threads will not
appear in your inbox, no matter how many responses you get
<sup>[1](#footnote1)</sup>.

Muted and snoozed threads are kept muted until end of snooze time.
Muted threads without snooze are muted forever.

<a name="footnote1">1</a>: The timer runs once every minute, so there's a 60
second window where you might see that little obnoxious email.

## Inspired by

- Leo Babauta's [empty gmail hack]
- Inbox zero (pretty much everywhere)
- [Gmail Snooze]
- [Boomerang4Gmail]

## To do

Not in any specific order.

- Create _/0 to _/10 labels on first run
- Get threads in "pages" (100 at a time)

### Possible features for version 2.0

- Do the installation like Gmail Delay Send does, with [installable triggers]
- Allow custom timespans like hours
 - We could use [PropertiesService] to save last run time and update labels with
 the time passed
  - There could be a timer running every minute just to update "x days" labels
to it's absolute correspondent value

[empty gmail hack]: http://leobabauta.com/gm
[Gmail Snooze]: http://googleappsdeveloper.blogspot.com.br/2011/07/gmail-snooze-with-apps-script.html
[Boomerang4Gmail]: http://www.boomeranggmail.com
[installable triggers]: https://developers.google.com/apps-script/guides/triggers/installable
[PropertiesService]: https://developers.google.com/apps-script/reference/properties/properties-service
[complete guide]: INSTALLATION.md
