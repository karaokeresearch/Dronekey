# Emojidrone

A browser-based musical instrument that also makes silly emoji graphics. A soundboard where all samples play in harmony. Emojidrone uses a regular computer keyboard for input. 

**LIVE DEMO: [Click here to play the most recent release at http://emojidrone.party!](http://emojidrone.party)**

## Instructions

Once the page is loaded, type in the chord, select your options, and click "Go!" to use options and launch into fullscreen. 

The keyboard is broken into ten columns, each representing a single instrument broken into four of the individual notes of the active chord. In the case of chords with three notes, the bottom row plays one octave over the root note.

```
1   2   3   4   5   6   7   8   9   0
Q   W   E   R   T   Y   U   I   O   P
A   S   D   F   G   H   J   K   L   ;
Z   X   C   V   B   N   M   ,   .   /
```

### Why?
I designed Emojidrone for playing improvised music where some or all of the performers are playing in the same key, ideally when an insane simulataneous visual component is desired as well. 

### Uses
Even if you don't consider yourself a musician, you can learn to play Emojidrone in a matter of seconds. Emojidrone is fun to play in your living room with a friend on guitar or piano, or even by yourself on lunch break. Change the background color to black, hook it up to a projector, and use it on stage. Switch the background color to lime (#00FF00), chromakey it out, and use it to generate live insane overlays for your TV show!


## Installation 
Download, place everything on a web server, visit the URL. Why the web server? Well, in Chrome, it doesn't work right when loaded from the local file system, although Firefox and Safari seem to not care!


### Options
Emoji category, background color, and emojiset can be configured via the browser. 

Categories are pretty self-explanatory. We use the unicode consortium categories for now.

For background color, lime (#00FF00) is the default so that chromakey works right away for use as a visual overlay. Switch to black for projecting over performers, or another color if you're just playing for fun.

For emojiset, twemoji is the default since it's the most lightweight. Noto is the most resource-intensive.

Edit emojidrone.js to change pitch, turn on effects, switch stereo/mono, etc. 