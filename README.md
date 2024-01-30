# fated-sky

An evolving side-project-level Astrology library and set of scripts that I find personally useful or interesting.

## Requirements

- You have the ephemeris files downloaded and stored somewhere accessible by this code.
  - [See this note at the sweph docs](https://github.com/timotejroiko/sweph?tab=readme-ov-file#ephemeris-files)
  - It points here: https://github.com/aloistr/swisseph/tree/master where you can grab what you need.

## Scripts

### moonprompt.ts

![moonprompt](./doc/img/moonprompt-example.png)


To your `~/.zshrc` add something along the lines of:

```sh
function precmd() {
    /path/to/moonprompt.js -l /path/to/locations.json -n myhouse -e /path/to/ephe
}
```

Build the `JS` via `npm run build`.
