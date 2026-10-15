---
name: release
description: Ship a new version of What's My IP (ip-checker-app). Bumps the version, makes a signed version commit and tag, pushes, builds the APK on EAS, writes and signs SHA256SUMS in dist/, and drafts release notes. Use when the user asks to release, ship, or "ship it as usual".
argument-hint: '[version, e.g. 1.0.3; derived from commits if omitted]'
disable-model-invocation: true
---

# Release

Running this skill is the user's request to commit, push, build on EAS and sign. Their global
rules still apply. Never force-push, retag or rewrite pushed history without asking first,
never add AI attribution to commits, never bypass hooks, and keep IPs and secrets out of
release notes.

Stop and report back if any step fails. Don't work around a failure.

The project uses npm (`package-lock.json`), so run tools with `npx`. Commits in this repo are
GPG-signed by the user's git config. Leave that as it is.

## 1. Pre-flight

- You must be on `main`, and `git fetch origin` must show `main` neither behind nor diverged.
- **Uncommitted work** gets committed first. Make one Conventional Commit per logical change
  and let the husky pre-commit hook (lint-staged: eslint, prettier, `tsc --noEmit`) run. Never
  stage secret files, `dist/` or scratch files. If it's unclear whether a change belongs in
  the release, ask. That includes untracked files under `.claude/`.
- Run the checks. All three must pass:
  ```bash
  npm run lint
  npm run typecheck
  npx expo-doctor
  ```
  If expo-doctor reports patch-version mismatches, tell the user. Don't run
  `npx expo install --fix` without their OK.
- **README.** Compare `git log <last-tag>..HEAD` with `README.md` (the intro, Privacy, Develop
  and Checks sections). Update anything user-visible that's missing in a `docs(readme): ...`
  commit. Anything that changes what the app sends, stores or asks permission for belongs
  in Privacy. Only refresh `docs/screenshots/home.png` if the user asks.

## 2. Version

- Last tag: `git describe --tags --abbrev=0`.
- Use the version given in `$ARGUMENTS`. If there is none, derive it with semver from the
  commits since the last tag: a `!` or `BREAKING CHANGE` means major, any `feat` means
  minor, anything else means patch. Say which version you picked and why, in one line.
- Bump the version in exactly these four spots (no other changes):
  - `app.json`: `expo.version`
  - `package.json`: `version`
  - `package-lock.json`: the top-level `version` and `packages[""].version`
- Don't touch `android.versionCode`. EAS increments it remotely (`appVersionSource: remote`).
- Check the bump: `git diff --stat` should show only those three files, with 4 insertions
  and 4 deletions.

## 3. Version commit and signed tag

```bash
git add app.json package.json package-lock.json
git commit -S -m "chore: bump version to X.Y.Z"
git tag -s vX.Y.Z -F <scratchpad>/tag-message.txt
git verify-commit HEAD && git tag -v vX.Y.Z
```

The commit message is just `chore: bump version to X.Y.Z`, with no body and no trailers.

The tag message is the tag name, a blank line, then one short line per user-visible change
since the last tag, as in `git cat-file -p v1.0.2`:

```
vX.Y.Z

- Turn off Android auto backup so lookup history stays on the device.
- Remove unused permissions: SYSTEM_ALERT_WINDOW, READ/WRITE_EXTERNAL_STORAGE, VIBRATE.
```

If gpg pinentry times out, ask the user to run the command themselves with a `!` prefix.

## 4. Push

```bash
git push origin main
git push origin vX.Y.Z
```

If either push is rejected, stop and ask. Never force-push.

## 5. EAS build

```bash
npx eas-cli@latest build -p android --profile preview --non-interactive --no-wait
```

The `preview` profile builds an APK for direct install. Take the build ID from the output,
then wait in the background with one poll every 2 minutes. Don't poll any other way:

```bash
for i in $(seq 1 20); do sleep 120; st=$(npx eas-cli@latest build:view <BUILD_ID> --json 2>/dev/null | python3 -I -c 'import json,sys; d=json.load(sys.stdin); print(d["status"], (d.get("artifacts") or {}).get("buildUrl") or "", d.get("appBuildVersion") or "")'); echo "$st"; case "$st" in FINISHED*|ERRORED*|CANCELED*) break;; esac; done
```

Run it with `run_in_background` and wait for the notification. If the build errors, read its
logs (`npx eas-cli@latest build:view <BUILD_ID>`) and report back.

## 6. Artifacts in dist/

`dist/` is gitignored and holds the files of earlier releases. Never run `npx expo export`
without `--output-dir`, because it deletes `dist/` first. Each release gets its own folder,
so nothing from an earlier release is overwritten. Download the APK:

```bash
mkdir -p dist/vX.Y.Z
curl -sSfL -o dist/vX.Y.Z/ip-checker-app-vX.Y.Z.apk <buildUrl>
```

Then, from `dist/vX.Y.Z`, write, sign and verify the checksums:

```bash
sha256sum ip-checker-app-vX.Y.Z.apk > SHA256SUMS
gpg --batch --yes --local-user F66E1C2EAED3905AEEB3323B5CAFBA6459067347 --armor --detach-sign SHA256SUMS
gpg --verify SHA256SUMS.asc SHA256SUMS
sha256sum -c SHA256SUMS
```

The signature must say Good, from `5CAFBA6459067347`, the key that signed the v1.0.2 tag and
checksums.

## 7. Release notes

Write them from the commits since the previous tag, in plain words, and say why a change
matters when it isn't obvious. Follow the style of the v1.0.2 notes: start with one or two
sentences on what the release is about, then the sections. Use a Privacy section for changes
to what the app sends, stores, backs up or asks permission for. Leave out sections that would
be empty. Never put an IP address in the notes, except well-known public resolvers such as
`1.1.1.1` used as an example lookup.

Save them to `dist/vX.Y.Z/release-notes.md`, and also give them in one fenced `markdown`
block, ready to paste into the GitHub release:

````markdown
One or two sentences on what this release is about.

### Features

- **Short title.** What changed and why it helps.

### Privacy

- **Short title.** What the app now sends, stores or asks for, and what that means for the user.

### Fixed

- What was broken and what happens now.

### Other

- Dependency updates, README and screenshot changes.

### Install

Download `ip-checker-app-vX.Y.Z.apk` and open it on your Android phone. You may need to allow
installs from your browser or file manager. It installs over earlier versions and keeps your
history.

### Verify

```bash
gpg --verify SHA256SUMS.asc SHA256SUMS
sha256sum -c SHA256SUMS
```

Signing key: `F66E1C2EAED3905AEEB3323B5CAFBA6459067347`

**Full changelog**: https://github.com/sprytnyk/ip-checker-app/compare/vPREV...vX.Y.Z
````

## 8. Report

Report briefly:

- the version and tag
- the commits that went in
- the EAS build URL
- the files in `dist/vX.Y.Z/` (APK, `SHA256SUMS`, `SHA256SUMS.asc`, `release-notes.md`) and
  their verification result
- the release notes block
- leftovers, such as a running `npx expo start` dev server

Don't install or test on the phone yourself unless the user asks.
