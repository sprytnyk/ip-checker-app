---
name: release
description: Ship a new version of What's My IP (ip-checker-app). Bumps the version, makes a signed version commit and tag, pushes, builds the APK on this machine with `eas build --local`, writes and signs SHA256SUMS in dist/, writes the release notes there too, and publishes the GitHub release with gh. Use when the user asks to release, ship, or "ship it as usual".
argument-hint: '[version, e.g. 1.2.2; derived from commits if omitted]'
disable-model-invocation: true
---

# Release

Running this skill is the user's request to commit, push, build and sign. Their global
rules still apply. Never force-push, retag or rewrite pushed history without asking first,
never add AI attribution to commits, never bypass hooks, and keep IPs and secrets out of
release notes.

Stop and report back if any step fails. Don't work around a failure.

The project uses npm (`package-lock.json`) and Node.js 26 (`.nvmrc`), so run tools with
`npx`. Every commit in this repo is GPG-signed, but git config doesn't sign them on its own.
Pass `-S` to every `git commit`. Before pushing, `git log --format='%h %G? %s' <last-tag>..HEAD`
must show `G` for each commit.

`gh` is installed and logged in. Use it to publish the GitHub release.

## 1. Pre-flight

- You must be on `main`. Run `git fetch origin`. `main` must not be behind `origin/main` or
  have diverged from it.
- `node --version` must print `v26.x`.
- **Outdated Expo packages.** Before anything else, run `npx expo-doctor`. If it reports
  packages that don't match the versions the installed SDK expects, list them (package,
  installed, expected) and ask the user whether to update them now. Don't continue the
  release until they answer.
  - **Yes:** run `npx expo install --fix`. `git diff --stat` should show only `package.json`
    and `package-lock.json`. Run `npx expo-doctor` again, then commit (signed, hook runs) as
    `build(deps): update expo sdk <major> patch versions`. The update ships in this release
    and goes under Other in the notes.
  - **No:** keep the current versions and list the outdated packages in the report.
- `gh repo view --json nameWithOwner --jq .nameWithOwner` must print
  `sprytnyk/ip-checker-app`. If `gh` is missing or not logged in, stop and ask the user to
  fix it before you tag anything.
- **Uncommitted work** gets committed first. Make one Conventional Commit per logical change
  and let the husky pre-commit hook run. It runs eslint and prettier on the staged files, then
  `tsc --noEmit`. Never stage secret files, `dist/` or scratch files. If you're not sure a
  change belongs in the release, ask. Ask about untracked files under `.claude/` too.
- Run the checks. All three must pass, except for version mismatches the user chose to keep:
  ```bash
  npm run lint
  npm run typecheck
  npx expo-doctor
  ```
  Never run `npx expo install --fix` without the user's OK.
- **README.** Compare `git log <last-tag>..HEAD` with `README.md` (the intro, Privacy, Develop
  and Checks sections). If a user-visible change is missing from the README, add it in a
  `docs(readme): ...` commit. Changes to what the app sends, stores or asks permission for go
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
- Don't touch `android.versionCode`. EAS stores it (`appVersionSource: remote`) and raises it
  by one on every build, local or cloud (`autoIncrement` in `eas.json`). Releases up to v1.2.2
  all have versionCode 1.
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
since the last tag, as in `git cat-file -p v1.2.1`:

```
vX.Y.Z

- Fix the DNS resolver network badge losing part of its text on Android.
- Update Expo SDK 57 patch versions (expo, @expo/ui, expo-router).
```

If gpg pinentry times out, ask the user to run the command themselves with a `!` prefix.

## 4. Push

```bash
git push origin main
git push origin vX.Y.Z
```

If either push is rejected, stop and ask. Never force-push.

## 5. Local EAS build

`eas build --local` builds the APK on this machine. It runs the same steps as an EAS cloud
build, from the committed tree, and doesn't use the gitignored `android/` folder. EAS still
signs it with the keystore it manages, downloaded just for the build, and still raises
`versionCode` remotely. The only traffic to EAS is checking the project and fetching that
keystore. EAS built releases up to v1.2.1 in its cloud, with the same keystore.

**Toolchain.** It isn't in the shell profile, so pass it on the command line:

- JDK 17: `/usr/lib/jvm/java-17-openjdk-amd64`
- Android SDK: `~/Android/Sdk`, with `platforms;android-<compileSdk>`,
  `build-tools;<buildTools>` and `ndk;<ndkVersion>`. Read those three values from
  `node_modules/react-native/gradle/libs.versions.toml`, since they change with the SDK. If one
  is missing from `~/Android/Sdk`, stop and give the user the
  `~/Android/Sdk/cmdline-tools/latest/bin/sdkmanager "<package>"` command to install it.

**Build.** `dist/vX.Y.Z` must not exist yet. The build copies the APK there. `dist/` holds
the files of earlier releases. `npx expo export` deletes `dist/` before it writes, so never
run it without `--output-dir`.

```bash
mkdir -p dist && mkdir dist/vX.Y.Z
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ANDROID_HOME=$HOME/Android/Sdk \
  EAS_LOCAL_BUILD_ARTIFACTS_DIR=$PWD/dist/vX.Y.Z \
  npx eas-cli@latest build -p android --profile preview --local --non-interactive
```

The `preview` profile builds an APK for direct install. The user may want to watch the
build. If so, give them the command to run in their own terminal and continue once they say
it finished. Otherwise run it yourself with `run_in_background`, sending its output to a log
file in the scratchpad, and wait for the notification. It takes about 10 to 20 minutes.
Don't poll.

If the build fails, report the error from the end of the log (Gradle's "What went wrong"
block) and stop.

## 6. Artifacts in dist/

`dist/` is gitignored. The build leaves one APK with a generated name in `dist/vX.Y.Z`.
Rename it:

```bash
ls dist/vX.Y.Z/*.apk   # exactly one
mv dist/vX.Y.Z/<generated>.apk dist/vX.Y.Z/ip-checker-app-vX.Y.Z.apk
```

**Same signing key as before.** Android only installs an update signed with the same key as
the installed app. Compare the certificate with the previous release's APK. If
`dist/<previous>/ip-checker-app-<previous>.apk` isn't there, download it from the GitHub
release into the scratchpad with
`gh release download <previous> -p '*.apk' -D <scratchpad>/<previous>`.

```bash
APKSIGNER="$HOME/Android/Sdk/build-tools/<buildTools>/apksigner"
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 "$APKSIGNER" verify --print-certs dist/vX.Y.Z/ip-checker-app-vX.Y.Z.apk | grep 'SHA-256'
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 "$APKSIGNER" verify --print-certs <previous-apk> | grep 'SHA-256'
```

The two digests must match. If they don't, stop. Users couldn't update without uninstalling.

Then, from `dist/vX.Y.Z`, write, sign and verify the checksums:

```bash
sha256sum ip-checker-app-vX.Y.Z.apk > SHA256SUMS
gpg --batch --yes --local-user F66E1C2EAED3905AEEB3323B5CAFBA6459067347 --armor --detach-sign SHA256SUMS
gpg --verify SHA256SUMS.asc SHA256SUMS
sha256sum -c SHA256SUMS
```

The signature must say Good, from `5CAFBA6459067347`, the key that signed the earlier tags
and checksums.

## 7. Release notes

Write them from the commits since the previous tag, in plain words, and say why a change
matters when it isn't obvious. Follow the style of the v1.2.1 notes
(`gh release view v1.2.1`): start with one or two sentences on what the release is about,
then the sections. Use a Privacy section for changes to what the app sends, stores, backs up
or asks permission for. Leave out sections that would be empty. Never put an IP address in
the notes, except well-known public resolvers such as `1.1.1.1` used as an example lookup.

Save them to `dist/vX.Y.Z/release-notes.md` (the content below, without the fence), so they
sit next to the APK and checksums. Leave the notes out of `SHA256SUMS`. In the Full Changelog
link, `<last-tag>` is the previous tag from step 2, so the link shows the diff between the
two tags.

````markdown
One or two sentences on what this release is about.

### Features

- **Short title.** What changed and why it helps.

### Privacy

- **Short title.** What the app now sends, stores or asks for, and what that means for the user.

### Fixed

- **Short title.** What was broken and what happens now.

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

**Full Changelog**: https://github.com/sprytnyk/ip-checker-app/compare/<last-tag>...vX.Y.Z
````

## 8. Publish the GitHub release

Anyone can see a published release, so ask first with a pop-up: publish now, publish as a
draft, or leave it to the user. The title is `IP Checker App vX.Y.Z`.

```bash
gh release create vX.Y.Z --verify-tag --title "IP Checker App vX.Y.Z" \
  --notes-file dist/vX.Y.Z/release-notes.md \
  dist/vX.Y.Z/ip-checker-app-vX.Y.Z.apk dist/vX.Y.Z/SHA256SUMS dist/vX.Y.Z/SHA256SUMS.asc
gh release view vX.Y.Z --json url,isDraft,assets
```

Add `--draft` when the user picks a draft. The release must list 3 files: the APK,
`SHA256SUMS` and `SHA256SUMS.asc`.

## 9. Report

Report briefly:

- the version and tag
- the commits that went in
- outdated Expo packages the user chose to keep, if any
- that the build ran locally, and that its signing certificate matches the previous release
- the four files in `dist/vX.Y.Z/` (APK, `SHA256SUMS`, `SHA256SUMS.asc`, `release-notes.md`)
  and the verification result
- the release link, or the release notes in one fenced `markdown` block if the user publishes
  it themselves
- leftovers, such as a running `npx expo start` dev server or `adb reverse`

Don't install or test on the phone yourself unless the user asks.
